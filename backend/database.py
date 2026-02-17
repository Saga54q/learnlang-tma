import os
import sqlite3
from datetime import datetime, timedelta
import json
from typing import Dict, List, Optional


class Database:
    def __init__(self, db_path="learnlang.db"):
        self.db_path = os.path.join(os.path.dirname(__file__), db_path)
        self.init_db()

    def init_db(self):
        """Инициализация таблиц базы данных"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Таблица пользователей
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                last_name TEXT,
                language_code TEXT,
                registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                current_language TEXT DEFAULT 'en',
                streak INTEGER DEFAULT 0,
                total_words_learned INTEGER DEFAULT 0,
                total_exercises_done INTEGER DEFAULT 0,
                xp_points INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1
            )
        ''')

        # Таблица прогресса по языкам
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS language_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                language TEXT,
                words_learned INTEGER DEFAULT 0,
                exercises_completed INTEGER DEFAULT 0,
                last_study DATE,
                FOREIGN KEY (user_id) REFERENCES users (user_id),
                UNIQUE(user_id, language)
            )
        ''')

        # Таблица выученных слов
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS learned_words (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                language TEXT,
                word TEXT,
                translation TEXT,
                learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                times_practiced INTEGER DEFAULT 1,
                last_practiced TIMESTAMP,
                mastered BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (user_id) REFERENCES users (user_id),
                UNIQUE(user_id, language, word)
            )
        ''')

        # Таблица достижений
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                achievement_id TEXT,
                unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (user_id),
                UNIQUE(user_id, achievement_id)
            )
        ''')

        # Таблица ежедневных заданий
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS daily_tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                task_date DATE,
                task_type TEXT,
                completed BOOLEAN DEFAULT FALSE,
                progress INTEGER DEFAULT 0,
                target INTEGER DEFAULT 5,
                FOREIGN KEY (user_id) REFERENCES users (user_id),
                UNIQUE(user_id, task_date, task_type)
            )
        ''')

        conn.commit()
        conn.close()
        print("✅ База данных инициализирована")

    def get_connection(self):
        """Получить соединение с БД"""
        return sqlite3.connect(self.db_path)

    def register_user(self, user_id: int, username: str = None, first_name: str = None,
                      last_name: str = None, language_code: str = None):
        """Регистрация нового пользователя"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT OR IGNORE INTO users 
            (user_id, username, first_name, last_name, language_code) 
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, username, first_name, last_name, language_code))

        # Если пользователь уже есть, обновляем last_active
        cursor.execute('''
            UPDATE users SET last_active = CURRENT_TIMESTAMP 
            WHERE user_id = ?
        ''', (user_id,))

        conn.commit()
        conn.close()

    def update_user_language(self, user_id: int, language: str):
        """Обновить текущий язык пользователя"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            UPDATE users SET current_language = ? WHERE user_id = ?
        ''', (language, user_id))

        conn.commit()
        conn.close()

    def add_learned_word(self, user_id: int, language: str, word: str, translation: str):
        """Добавить выученное слово"""
        conn = self.get_connection()
        cursor = conn.cursor()

        today = datetime.now().date()

        # Проверяем, есть ли уже такое слово
        cursor.execute('''
            SELECT id, times_practiced FROM learned_words 
            WHERE user_id = ? AND language = ? AND word = ?
        ''', (user_id, language, word))

        result = cursor.fetchone()

        if result:
            # Обновляем существующее слово
            word_id, times_practiced = result
            cursor.execute('''
                UPDATE learned_words 
                SET times_practiced = ?, last_practiced = CURRENT_TIMESTAMP,
                    mastered = CASE WHEN ? >= 5 THEN TRUE ELSE FALSE END
                WHERE id = ?
            ''', (times_practiced + 1, times_practiced + 1, word_id))
        else:
            # Добавляем новое слово
            cursor.execute('''
                INSERT INTO learned_words (user_id, language, word, translation)
                VALUES (?, ?, ?, ?)
            ''', (user_id, language, word, translation))

            # Увеличиваем счетчик выученных слов у пользователя
            cursor.execute('''
                UPDATE users 
                SET total_words_learned = total_words_learned + 1,
                    xp_points = xp_points + 10
                WHERE user_id = ?
            ''', (user_id,))

            # Обновляем прогресс по языку
            cursor.execute('''
                INSERT INTO language_progress (user_id, language, words_learned, last_study)
                VALUES (?, ?, 1, ?)
                ON CONFLICT(user_id, language) DO UPDATE SET
                    words_learned = words_learned + 1,
                    last_study = ?
            ''', (user_id, language, today, today))

        # Обновляем streak (серию дней)
        self.update_streak(user_id)

        # Проверяем достижения
        self.check_achievements(user_id)

        conn.commit()
        conn.close()

    def update_streak(self, user_id: int):
        """Обновить серию дней"""
        conn = self.get_connection()
        cursor = conn.cursor()

        today = datetime.now().date()

        cursor.execute('''
            SELECT last_active, streak FROM users WHERE user_id = ?
        ''', (user_id,))

        result = cursor.fetchone()
        if result:
            last_active = datetime.fromisoformat(result[0]).date() if result[0] else None
            current_streak = result[1] or 0

            if last_active:
                if (today - last_active).days == 1:
                    # Следующий день подряд
                    current_streak += 1
                elif (today - last_active).days > 1:
                    # Пропустил день - сбрасываем
                    current_streak = 1
                # Если сегодня уже обновляли - оставляем как есть

            cursor.execute('''
                UPDATE users SET streak = ?, last_active = CURRENT_TIMESTAMP
                WHERE user_id = ?
            ''', (current_streak, user_id))

        conn.commit()
        conn.close()

    def check_achievements(self, user_id: int):
        """Проверить и разблокировать достижения"""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Получаем данные пользователя
        cursor.execute('''
            SELECT total_words_learned, streak, level FROM users WHERE user_id = ?
        ''', (user_id,))

        words, streak, level = cursor.fetchone()

        achievements_to_unlock = []

        # Достижения за слова
        word_achievements = [
            (10, "word_novice", "📚 Новичок", "Выучил 10 слов"),
            (50, "word_enthusiast", "🌟 Энтузиаст", "Выучил 50 слов"),
            (100, "word_master", "👑 Мастер слов", "Выучил 100 слов"),
            (500, "word_guru", "🧠 Гуру", "Выучил 500 слов")
        ]

        for threshold, ach_id, title, desc in word_achievements:
            if words >= threshold:
                achievements_to_unlock.append((ach_id, title, desc))

        # Достижения за streak
        streak_achievements = [
            (7, "streak_week", "📅 Неделя", "Занимался 7 дней подряд"),
            (30, "streak_month", "🗓️ Месяц", "Занимался 30 дней подряд"),
            (100, "streak_century", "🔥 Огненная серия", "Занимался 100 дней подряд")
        ]

        for threshold, ach_id, title, desc in streak_achievements:
            if streak >= threshold:
                achievements_to_unlock.append((ach_id, title, desc))

        # Добавляем достижения в БД
        for ach_id, title, desc in achievements_to_unlock:
            cursor.execute('''
                INSERT OR IGNORE INTO achievements (user_id, achievement_id)
                VALUES (?, ?)
            ''', (user_id, ach_id))

        conn.commit()
        conn.close()

        return achievements_to_unlock

    def get_user_stats(self, user_id: int) -> Dict:
        """Получить статистику пользователя"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT streak, total_words_learned, total_exercises_done, 
                   xp_points, level, current_language
            FROM users WHERE user_id = ?
        ''', (user_id,))

        user_data = cursor.fetchone()

        if not user_data:
            return {}

        stats = {
            'streak': user_data[0] or 0,
            'total_words': user_data[1] or 0,
            'total_exercises': user_data[2] or 0,
            'xp': user_data[3] or 0,
            'level': user_data[4] or 1,
            'current_language': user_data[5] or 'en'
        }

        # Получаем прогресс по языкам
        cursor.execute('''
            SELECT language, words_learned, exercises_completed 
            FROM language_progress WHERE user_id = ?
        ''', (user_id,))

        stats['languages'] = {}
        for lang, words, exercises in cursor.fetchall():
            stats['languages'][lang] = {
                'words': words,
                'exercises': exercises
            }

        # Получаем достижения
        cursor.execute('''
            SELECT achievement_id FROM achievements WHERE user_id = ?
        ''', (user_id,))

        stats['achievements'] = [row[0] for row in cursor.fetchall()]

        conn.close()
        return stats

    def get_daily_task(self, user_id: int, task_type: str) -> Dict:
        """Получить ежедневное задание"""
        conn = self.get_connection()
        cursor = conn.cursor()

        today = datetime.now().date()

        cursor.execute('''
            SELECT progress, target, completed FROM daily_tasks
            WHERE user_id = ? AND task_date = ? AND task_type = ?
        ''', (user_id, today, task_type))

        result = cursor.fetchone()

        if result:
            return {
                'progress': result[0],
                'target': result[1],
                'completed': result[2]
            }
        else:
            # Создаем новое задание
            targets = {
                'words': 10,
                'exercises': 5,
                'listening': 3
            }
            target = targets.get(task_type, 5)

            cursor.execute('''
                INSERT INTO daily_tasks (user_id, task_date, task_type, target)
                VALUES (?, ?, ?, ?)
            ''', (user_id, today, task_type, target))

            conn.commit()
            return {'progress': 0, 'target': target, 'completed': False}

    def update_daily_task(self, user_id: int, task_type: str, progress_increment: int = 1):
        """Обновить прогресс ежедневного задания"""
        conn = self.get_connection()
        cursor = conn.cursor()

        today = datetime.now().date()

        cursor.execute('''
            UPDATE daily_tasks 
            SET progress = MIN(progress + ?, target), 
                completed = CASE WHEN progress + ? >= target THEN TRUE ELSE FALSE END
            WHERE user_id = ? AND task_date = ? AND task_type = ?
        ''', (progress_increment, progress_increment, user_id, today, task_type))

        if cursor.rowcount == 0:
            # Если задания нет, создаем
            targets = {'words': 10, 'exercises': 5, 'listening': 3}
            target = targets.get(task_type, 5)
            cursor.execute('''
                INSERT INTO daily_tasks (user_id, task_date, task_type, progress, target)
                VALUES (?, ?, ?, ?, ?)
            ''', (user_id, today, task_type, progress_increment, target))

        conn.commit()
        conn.close()


# Создаем глобальный экземпляр БД
db = Database()