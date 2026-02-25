#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import logging
import sys
import json
import random
from datetime import datetime
from typing import Dict, Any, Optional

# Импорты telegram
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes, CallbackQueryHandler
from telegram.constants import ParseMode

# Импорты базы данных
from dotenv import load_dotenv
from database import db
from word_database import WORDS_DATABASE

# Загружаем переменные окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO,
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('learnlang.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

# Конфигурация
BOT_TOKEN = os.getenv('BOT_TOKEN')
WEBAPP_URL = os.getenv('WEBAPP_URL')

if not BOT_TOKEN or not WEBAPP_URL:
    logger.error("❌ Отсутствуют BOT_TOKEN или WEBAPP_URL в .env")
    sys.exit(1)

# Словарь достижений
ACHIEVEMENTS = {
    'word_novice': {'title': '📚 Новичок', 'desc': 'Выучил 10 слов', 'emoji': '🌱'},
    'word_enthusiast': {'title': '🌟 Энтузиаст', 'desc': 'Выучил 50 слов', 'emoji': '📚'},
    'word_master': {'title': '👑 Мастер слов', 'desc': 'Выучил 100 слов', 'emoji': '🏆'},
    'word_guru': {'title': '🧠 Гуру', 'desc': 'Выучил 500 слов', 'emoji': '🎓'},
    'streak_week': {'title': '📅 Неделя', 'desc': 'Занимался 7 дней подряд', 'emoji': '🔥'},
    'streak_month': {'title': '🗓️ Месяц', 'desc': 'Занимался 30 дней подряд', 'emoji': '⚡'},
    'streak_century': {'title': '🔥 Огненная серия', 'desc': 'Занимался 100 дней подряд', 'emoji': '💫'},
    'exercise_beginner': {'title': '💪 Начинающий', 'desc': 'Выполнил 10 упражнений', 'emoji': '🎯'},
    'exercise_expert': {'title': '🏅 Эксперт', 'desc': 'Выполнил 50 упражнений', 'emoji': '⭐'},
    'polyglot': {'title': '🗣️ Полиглот', 'desc': 'Начал изучение 3 языков', 'emoji': '🌍'},
}


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /start"""
    try:
        user = update.effective_user

        # Регистрируем пользователя в БД
        db.register_user(
            user_id=user.id,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            language_code=user.language_code
        )

        # Получаем статистику
        stats = db.get_user_stats(user.id)

        # Создаем клавиатуру
        keyboard = [
            [InlineKeyboardButton(
                "📱 ОТКРЫТЬ LEARNLANG",
                web_app=WebAppInfo(url=WEBAPP_URL)
            )],
            [
                InlineKeyboardButton("📚 Мои слова", callback_data='my_words'),
                InlineKeyboardButton("🏆 Достижения", callback_data='achievements')
            ],
            [
                InlineKeyboardButton("📊 Статистика", callback_data='stats'),
                InlineKeyboardButton("❓ Помощь", callback_data='help')
            ],
            [InlineKeyboardButton("🎯 Ежедневные задания", callback_data='daily_tasks')]
        ]

        reply_markup = InlineKeyboardMarkup(keyboard)

        # ИСПРАВЛЕНО: убраны символы Markdown, которые вызывают ошибку
        welcome_text = (
            f"👋 Приветствую, {user.first_name}!\n\n"
            f"📊 Твоя статистика:\n"
            f"• 🔥 Серия: {stats.get('streak', 0)} дней\n"
            f"• 📚 Слов выучено: {stats.get('total_words', 0)}\n"
            f"• ⭐ Уровень: {stats.get('level', 1)}\n"
            f"• ✨ Опыт: {stats.get('xp', 0)} XP\n\n"
            f"🎯 Продолжай в том же духе!"
        )

        await update.message.reply_text(
            welcome_text,
            reply_markup=reply_markup
            # Убрали parse_mode=ParseMode.MARKDOWN
        )

    except Exception as e:
        logger.error(f"Ошибка в start: {e}", exc_info=True)
        await update.message.reply_text("❌ Произошла ошибка. Попробуйте позже.")


async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик нажатий на кнопки"""
    try:
        query = update.callback_query
        await query.answer()

        user_id = update.effective_user.id
        data = query.data

        logger.info(f"Пользователь {user_id} нажал: {data}")

        if data == 'my_words':
            text = "📚 <b>Ваши слова</b>\n\nСкоро здесь появится список выученных слов!"
        elif data == 'achievements':
            text = "🏆 <b>Достижения</b>\n\nСкоро здесь появятся ваши достижения!"
        elif data == 'stats':
            text = "📊 <b>Статистика</b>\n\nСкоро здесь появится ваша статистика!"
        elif data == 'help':
            text = (
                "❓ <b>Помощь</b>\n\n"
                "📱 <b>Как пользоваться:</b>\n"
                "1. Нажмите 'ОТКРЫТЬ LEARNLANG'\n"
                "2. Выберите язык для изучения\n"
                "3. Проходите уровни и учите слова\n"
                "4. Получайте награды и бонусы\n\n"
                "💡 <b>Советы:</b>\n"
                "• Занимайтесь каждый день\n"
                "• Покупайте бонусы в магазине\n"
                "• Открывайте достижения"
            )
        elif data == 'daily_tasks':
            text = "🎯 <b>Ежедневные задания</b>\n\nСкоро здесь появятся ваши задания!"
        elif data == 'back':
            text = "👋 <b>Главное меню</b>"
        else:
            text = "Неизвестная команда"

        keyboard = [[InlineKeyboardButton("🔙 Назад", callback_data='back')]]

        await query.edit_message_text(
            text,
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode='HTML'  # Используем HTML
        )

    except Exception as e:
        logger.error(f"Ошибка в button_callback: {e}", exc_info=True)

async def show_my_words(query, user_id: int):
    """Показать выученные слова"""
    stats = db.get_user_stats(user_id)
    current_lang = stats.get('current_language', 'en')

    # Получаем слова для текущего языка
    lang_words = WORDS_DATABASE.get(current_lang, WORDS_DATABASE['en'])[:10]  # Первые 10 слов

    keyboard = []
    for word_data in lang_words[:5]:  # Показываем 5 слов
        keyboard.append([InlineKeyboardButton(
            f"📖 {word_data['word']} - {word_data['translation']}",
            callback_data=f"practice_{word_data['word']}"
        )])

    keyboard.append([InlineKeyboardButton("➕ Учить новые слова", callback_data=f"learn_{current_lang}")])
    keyboard.append([InlineKeyboardButton("🔙 Назад", callback_data='back_to_main')])

    await query.edit_message_text(
        f"📚 **Твои слова**\n\n"
        f"Всего выучено: {stats.get('total_words', 0)} слов\n\n"
        f"**Рекомендуемые слова:**",
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode=ParseMode.MARKDOWN
    )


async def show_achievements(query, user_id: int):
    """Показать достижения"""
    stats = db.get_user_stats(user_id)
    user_achievements = stats.get('achievements', [])

    text = "🏆 **Твои достижения**\n\n"

    for ach_id, ach_data in ACHIEVEMENTS.items():
        if ach_id in user_achievements:
            text += f"✅ {ach_data['emoji']} **{ach_data['title']}** - {ach_data['desc']}\n"
        else:
            text += f"⬜ {ach_data['emoji']} {ach_data['title']} - {ach_data['desc']}\n"

    keyboard = [[InlineKeyboardButton("🔙 Назад", callback_data='back_to_main')]]

    await query.edit_message_text(
        text,
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode=ParseMode.MARKDOWN
    )


async def show_stats(query, user_id: int):
    """Показать подробную статистику"""
    stats = db.get_user_stats(user_id)

    text = (
        f"📊 **Подробная статистика**\n\n"
        f"👤 **Пользователь:** {query.from_user.first_name}\n"
        f"📅 **Зарегистрирован:** {stats.get('registered_at', 'Неизвестно')}\n"
        f"🔥 **Текущая серия:** {stats.get('streak', 0)} дней\n"
        f"📚 **Всего слов:** {stats.get('total_words', 0)}\n"
        f"💪 **Выполнено упражнений:** {stats.get('total_exercises', 0)}\n"
        f"⭐ **Уровень:** {stats.get('level', 1)}\n"
        f"✨ **Опыт:** {stats.get('xp', 0)} XP\n\n"
        f"🌍 **Прогресс по языкам:**\n"
    )

    for lang, progress in stats.get('languages', {}).items():
        lang_names = {'en': '🇬🇧 Английский', 'es': '🇪🇸 Испанский',
                      'fr': '🇫🇷 Французский', 'de': '🇩🇪 Немецкий'}
        lang_name = lang_names.get(lang, lang)
        text += f"{lang_name}: {progress.get('words', 0)} слов\n"

    keyboard = [[InlineKeyboardButton("🔙 Назад", callback_data='back_to_main')]]

    await query.edit_message_text(
        text,
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode=ParseMode.MARKDOWN
    )


async def show_daily_tasks(query, user_id: int):
    """Показать ежедневные задания"""
    tasks = {
        'words': db.get_daily_task(user_id, 'words'),
        'exercises': db.get_daily_task(user_id, 'exercises'),
        'listening': db.get_daily_task(user_id, 'listening')
    }

    text = "🎯 **Ежедневные задания**\n\n"

    # Задание на слова
    words_task = tasks['words']
    progress_bar = "█" * words_task['progress'] + "░" * (words_task['target'] - words_task['progress'])
    text += f"📚 **Выучить слова:** {words_task['progress']}/{words_task['target']}\n"
    text += f"`{progress_bar}`\n\n"

    # Задание на упражнения
    ex_task = tasks['exercises']
    progress_bar = "█" * ex_task['progress'] + "░" * (ex_task['target'] - ex_task['progress'])
    text += f"💪 **Выполнить упражнения:** {ex_task['progress']}/{ex_task['target']}\n"
    text += f"`{progress_bar}`\n\n"

    # Награда за выполнение
    all_completed = all(t['completed'] for t in tasks.values())
    if all_completed:
        text += "🎉 **Поздравляю! Все задания выполнены!**\n"
        text += "✨ Бонус: +50 XP\n"

    keyboard = [[InlineKeyboardButton("🔙 Назад", callback_data='back_to_main')]]

    await query.edit_message_text(
        text,
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode=ParseMode.MARKDOWN
    )


async def start_learning(query, user_id: int, language: str):
    """Начать изучение новых слов"""
    # Получаем слова для языка
    words = WORDS_DATABASE.get(language, WORDS_DATABASE['en'])

    # Выбираем случайное слово
    word_data = random.choice(words)

    # Добавляем слово в БД как выученное
    db.add_learned_word(user_id, language, word_data['word'], word_data['translation'])

    # Обновляем задание
    db.update_daily_task(user_id, 'words')

    # Проверяем достижения
    achievements = db.check_achievements(user_id)

    text = (
        f"✅ **Новое слово выучено!**\n\n"
        f"📖 **{word_data['word']}**\n"
        f"🔄 **{word_data['translation']}**\n"
        f"📌 **Категория:** {word_data['category']}\n\n"
    )

    if achievements:
        text += "🎉 **Новые достижения!**\n"
        for ach_id, title, desc in achievements:
            text += f"• {title} - {desc}\n"

    keyboard = [
        [InlineKeyboardButton("📚 Ещё слово", callback_data=f"learn_{language}")],
        [InlineKeyboardButton("🔙 Назад", callback_data='my_words')]
    ]

    await query.edit_message_text(
        text,
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode=ParseMode.MARKDOWN
    )


async def practice_word(query, user_id: int, word: str):
    """Практика слова"""
    # Здесь можно добавить упражнения на слово
    # Например, перевод с выбором вариантов

    options = [
        {"text": "Вариант 1", "correct": False},
        {"text": "Вариант 2", "correct": True},
        {"text": "Вариант 3", "correct": False},
    ]
    random.shuffle(options)

    keyboard = []
    for opt in options:
        keyboard.append([InlineKeyboardButton(
            opt['text'],
            callback_data=f"answer_{'correct' if opt['correct'] else 'wrong'}"
        )])
    keyboard.append([InlineKeyboardButton("🔙 Назад", callback_data='my_words')])

    await query.edit_message_text(
        f"📝 **Практика слова**\n\n"
        f"Как переводится слово '{word}'?",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )


async def show_help(query):
    """Показать помощь"""
    help_text = (
        "❓ **Помощь по LearnLang**\n\n"
        "📱 **Как пользоваться приложением:**\n"
        "1. Нажмите 'ОТКРЫТЬ LEARNLANG' для запуска Mini App\n"
        "2. Выберите язык для изучения\n"
        "3. Учите слова и выполняйте упражнения\n\n"
        "🤖 **Команды бота:**\n"
        "• /start - главное меню\n"
        "• /daily - ежедневные задания\n"
        "• /stats - статистика\n"
        "• /achievements - достижения\n\n"
        "💡 **Советы:**\n"
        "• Занимайтесь каждый день для поддержания серии\n"
        "• Выполняйте ежедневные задания для бонусов\n"
        "• Открывайте достижения за прогресс"
    )

    keyboard = [[InlineKeyboardButton("🔙 Назад", callback_data='back_to_main')]]

    await query.edit_message_text(
        help_text,
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode=ParseMode.MARKDOWN
    )


async def back_to_main(query, user_id: int):
    """Вернуться в главное меню"""
    stats = db.get_user_stats(user_id)

    keyboard = [
        [InlineKeyboardButton(
            "📱 ОТКРЫТЬ LEARNLANG",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )],
        [
            InlineKeyboardButton("📚 Мои слова", callback_data='my_words'),
            InlineKeyboardButton("🏆 Достижения", callback_data='achievements')
        ],
        [
            InlineKeyboardButton("📊 Статистика", callback_data='stats'),
            InlineKeyboardButton("❓ Помощь", callback_data='help')
        ],
        [InlineKeyboardButton("🎯 Ежедневные задания", callback_data='daily_tasks')]
    ]

    await query.edit_message_text(
        f"👋 **Главное меню**\n\n"
        f"🔥 Серия: {stats.get('streak', 0)} дней\n"
        f"📚 Слов: {stats.get('total_words', 0)}\n"
        f"⭐ Уровень: {stats.get('level', 1)}",
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode=ParseMode.MARKDOWN
    )


async def daily_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /daily для показа ежедневных заданий"""
    user_id = update.effective_user.id
    tasks = {
        'words': db.get_daily_task(user_id, 'words'),
        'exercises': db.get_daily_task(user_id, 'exercises'),
        'listening': db.get_daily_task(user_id, 'listening')
    }

    text = "🎯 **Ежедневные задания**\n\n"

    for task_type, task in tasks.items():
        emoji = {'words': '📚', 'exercises': '💪', 'listening': '🎧'}[task_type]
        name = {'words': 'Слова', 'exercises': 'Упражнения', 'listening': 'Аудирование'}[task_type]
        progress_bar = "█" * task['progress'] + "░" * (task['target'] - task['progress'])
        text += f"{emoji} **{name}:** {task['progress']}/{task['target']}\n"
        text += f"`{progress_bar}`\n\n"

    await update.message.reply_text(text, parse_mode=ParseMode.MARKDOWN)


async def stats_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /stats для показа статистики"""
    user_id = update.effective_user.id
    stats = db.get_user_stats(user_id)

    text = (
        f"📊 **Статистика**\n\n"
        f"🔥 Серия: {stats.get('streak', 0)} дней\n"
        f"📚 Всего слов: {stats.get('total_words', 0)}\n"
        f"💪 Упражнений: {stats.get('total_exercises', 0)}\n"
        f"⭐ Уровень: {stats.get('level', 1)}\n"
        f"✨ Опыт: {stats.get('xp', 0)} XP\n"
        f"🏆 Достижений: {len(stats.get('achievements', []))}"
    )

    await update.message.reply_text(text, parse_mode=ParseMode.MARKDOWN)


def main():
    """Запуск бота"""
    print("\n" + "=" * 60)
    print("🚀 LEARNLANG BOT С ПОДДЕРЖКОЙ БД ЗАПУСКАЕТСЯ")
    print("=" * 60)
    print(f"📱 WebApp URL: {WEBAPP_URL}")
    print(f"💾 База данных: learnlang.db")
    print("=" * 60)

    # Создаем приложение
    application = Application.builder().token(BOT_TOKEN).build()

    # Добавляем обработчики
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("daily", daily_command))
    application.add_handler(CommandHandler("stats", stats_command))
    application.add_handler(CommandHandler("achievements", show_achievements))
    application.add_handler(CallbackQueryHandler(button_callback))

    print("✅ Бот готов к работе! Ожидание команд...\n")

    # Запускаем бота
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Бот остановлен")
    except Exception as e:
        logger.error(f"❌ Критическая ошибка: {e}", exc_info=True)
        print(f"\n❌ Ошибка: {e}")