// Класс для управления упражнениями
class ExerciseManager {
    constructor() {
        this.currentLanguage = 'en';
        this.currentExercise = null;
        this.exercisesDone = 0;
        this.correctAnswers = 0;
    }

    // Генерация упражнения на перевод (с вариантами)
    generateTranslationExercise() {
        const words = WORDS_DATABASE[this.currentLanguage];
        const randomWord = words[Math.floor(Math.random() * words.length)];

        // Генерируем неправильные варианты
        let options = [randomWord.translation];
        while (options.length < 4) {
            const randomWord2 = words[Math.floor(Math.random() * words.length)];
            if (!options.includes(randomWord2.translation)) {
                options.push(randomWord2.translation);
            }
        }

        // Перемешиваем варианты
        options = this.shuffleArray(options);

        return {
            type: 'translation',
            question: randomWord.word,
            correct: randomWord.translation,
            options: options,
            wordData: randomWord
        };
    }

    // Генерация упражнения-викторины
    generateQuizExercise() {
        const words = WORDS_DATABASE[this.currentLanguage];
        const randomWord = words[Math.floor(Math.random() * words.length)];

        // Генерируем неправильные варианты (слова на английском)
        let options = [randomWord.word];
        while (options.length < 4) {
            const randomWord2 = words[Math.floor(Math.random() * words.length)];
            if (!options.includes(randomWord2.word)) {
                options.push(randomWord2.word);
            }
        }

        options = this.shuffleArray(options);

        return {
            type: 'quiz',
            question: randomWord.translation,
            correct: randomWord.word,
            options: options,
            wordData: randomWord
        };
    }

    // Генерация упражнения на сопоставление
    generateMatchExercise() {
        const words = WORDS_DATABASE[this.currentLanguage];
        // Берем 4 случайных слова
        const selectedWords = [];
        while (selectedWords.length < 4) {
            const word = words[Math.floor(Math.random() * words.length)];
            if (!selectedWords.find(w => w.id === word.id)) {
                selectedWords.push(word);
            }
        }

        // Создаем пары для сопоставления
        const leftItems = selectedWords.map(w => ({ id: w.id, text: w.word }));
        const rightItems = this.shuffleArray(selectedWords.map(w => ({ id: w.id, text: w.translation })));

        return {
            type: 'match',
            leftItems: leftItems,
            rightItems: rightItems,
            pairs: selectedWords.map(w => ({ leftId: w.id, rightId: w.id }))
        };
    }

    // Проверка ответа в упражнении на перевод
    checkTranslationAnswer(selected, correct) {
        const isCorrect = selected === correct;
        if (isCorrect) {
            this.correctAnswers++;
            this.exercisesDone++;
            this.updateDailyTask('exercises');

            // Добавляем опыт за правильный ответ
            this.addXP(10);

            // Если это новое слово, добавляем в выученные
            if (this.currentExercise && this.currentExercise.wordData) {
                this.addLearnedWord(this.currentExercise.wordData);
            }
        }
        return isCorrect;
    }

    // Проверка ответа в викторине
    checkQuizAnswer(selected, correct) {
        const isCorrect = selected === correct;
        if (isCorrect) {
            this.correctAnswers++;
            this.exercisesDone++;
            this.updateDailyTask('exercises');
            this.addXP(15);

            if (this.currentExercise && this.currentExercise.wordData) {
                this.addLearnedWord(this.currentExercise.wordData);
            }
        }
        return isCorrect;
    }

    // Проверка сопоставления
    checkMatch(selectedLeft, selectedRight, pairs) {
        const pair = pairs.find(p => p.leftId === selectedLeft);
        const isCorrect = pair && pair.rightId === selectedRight;

        if (isCorrect) {
            this.addXP(5);
        }

        return isCorrect;
    }

    // Добавление выученного слова
    addLearnedWord(wordData) {
        let learnedWords = JSON.parse(localStorage.getItem('learnedWords') || '[]');

        // Проверяем, не выучено ли уже это слово
        if (!learnedWords.find(w => w.id === wordData.id && w.lang === this.currentLanguage)) {
            learnedWords.push({
                id: wordData.id,
                lang: this.currentLanguage,
                word: wordData.word,
                translation: wordData.translation,
                learnedAt: new Date().toISOString(),
                timesPracticed: 1
            });

            localStorage.setItem('learnedWords', JSON.stringify(learnedWords));

            // Обновляем счетчик слов
            this.updateWordCount();

            // Проверяем достижения
            this.checkWordAchievements(learnedWords.length);

            // Обновляем задание на слова
            this.updateDailyTask('words');
        } else {
            // Если слово уже выучено, увеличиваем счетчик практики
            const wordIndex = learnedWords.findIndex(w => w.id === wordData.id && w.lang === this.currentLanguage);
            learnedWords[wordIndex].timesPracticed++;
            localStorage.setItem('learnedWords', JSON.stringify(learnedWords));
        }
    }

    // Обновление счетчика слов в UI
    updateWordCount() {
        const learnedWords = JSON.parse(localStorage.getItem('learnedWords') || '[]');
        document.getElementById('words').textContent = learnedWords.length;
    }

    // Добавление опыта
    addXP(amount) {
        let xp = parseInt(localStorage.getItem('xp') || '0');
        xp += amount;
        localStorage.setItem('xp', xp.toString());

        // Проверяем повышение уровня
        this.checkLevelUp(xp);
        this.updateXpBar(xp);
    }

    // Проверка повышения уровня
    checkLevelUp(xp) {
        let level = parseInt(localStorage.getItem('level') || '1');
        const xpNeeded = level * 100;

        if (xp >= xpNeeded) {
            level++;
            localStorage.setItem('level', level.toString());
            document.getElementById('level').textContent = level;

            // Показываем уведомление о повышении уровня
            this.showNotification(`🎉 Поздравляем! Достигнут ${level} уровень!`);
        }
    }

    // Обновление прогресс-бара опыта
    updateXpBar(xp) {
        const level = parseInt(localStorage.getItem('level') || '1');
        const xpForCurrentLevel = (level - 1) * 100;
        const xpForNextLevel = level * 100;
        const xpProgress = xp - xpForCurrentLevel;
        const xpNeeded = xpForNextLevel - xpForCurrentLevel;
        const percentage = (xpProgress / xpNeeded) * 100;

        document.getElementById('xpBar').style.width = percentage + '%';
        document.getElementById('xpText').textContent = `${xpProgress}/${xpNeeded} XP`;
    }

    // Обновление ежедневных заданий
    updateDailyTask(taskType) {
        const today = new Date().toDateString();
        let tasks = JSON.parse(localStorage.getItem('dailyTasks') || '{}');

        if (!tasks[today]) {
            tasks = {
                [today]: {
                    words: 0,
                    exercises: 0,
                    listening: 0
                }
            };
        }

        tasks[today][taskType]++;
        localStorage.setItem('dailyTasks', JSON.stringify(tasks));

        this.updateDailyTasksUI(tasks[today]);
    }

    // Обновление UI ежедневных заданий
    updateDailyTasksUI(todayTasks) {
        const wordsProgress = (todayTasks.words / 5) * 100;
        const exercisesProgress = (todayTasks.exercises / 3) * 100;
        const listeningProgress = (todayTasks.listening / 2) * 100;

        document.getElementById('taskWordsProgress').style.width = Math.min(wordsProgress, 100) + '%';
        document.getElementById('taskExercisesProgress').style.width = Math.min(exercisesProgress, 100) + '%';
        document.getElementById('taskListeningProgress').style.width = Math.min(listeningProgress, 100) + '%';

        document.getElementById('taskWordsCount').textContent = `${todayTasks.words}/5`;
        document.getElementById('taskExercisesCount').textContent = `${todayTasks.exercises}/3`;
        document.getElementById('taskListeningCount').textContent = `${todayTasks.listening}/2`;
    }

    // Проверка достижений за слова
    checkWordAchievements(wordCount) {
        const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        const newAchievements = [];

        const wordMilestones = [
            { count: 10, id: 'word_novice', title: '🌱 Новичок', desc: 'Выучил 10 слов' },
            { count: 50, id: 'word_enthusiast', title: '📚 Энтузиаст', desc: 'Выучил 50 слов' },
            { count: 100, id: 'word_master', title: '👑 Мастер слов', desc: 'Выучил 100 слов' },
            { count: 500, id: 'word_guru', title: '🧠 Гуру', desc: 'Выучил 500 слов' }
        ];

        wordMilestones.forEach(milestone => {
            if (wordCount >= milestone.count && !achievements.includes(milestone.id)) {
                achievements.push(milestone.id);
                newAchievements.push(milestone);
                this.addXP(50); // Бонус за достижение
            }
        });

        if (newAchievements.length > 0) {
            localStorage.setItem('achievements', JSON.stringify(achievements));
            this.showAchievements(newAchievements);
        }
    }

    // Показ уведомления о достижениях
    showAchievements(achievements) {
        const container = document.getElementById('recentAchievements');
        container.innerHTML = '';

        achievements.forEach(ach => {
            const div = document.createElement('div');
            div.className = 'achievement-badge';
            div.innerHTML = `
                <div class="achievement-icon">${ach.title.split(' ')[0]}</div>
                <div class="achievement-info">
                    <div class="achievement-title">${ach.title}</div>
                    <div class="achievement-desc">${ach.desc}</div>
                </div>
            `;
            container.appendChild(div);
        });
    }

    // Показ уведомления
    showNotification(message) {
        // Создаем временное уведомление
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Перемешивание массива
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Установка текущего языка
    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('currentLanguage', lang);
    }

    // Получение слова дня
    getWordOfTheDay() {
        const words = WORDS_DATABASE[this.currentLanguage];
        const today = new Date().toDateString();
        const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const index = seed % words.length;
        return words[index];
    }

    // Инициализация данных пользователя
    initUserData() {
        if (!localStorage.getItem('userId')) {
            const userId = tg.initDataUnsafe?.user?.id || 'guest_' + Math.random();
            localStorage.setItem('userId', userId);
        }

        if (!localStorage.getItem('level')) {
            localStorage.setItem('level', '1');
        }

        if (!localStorage.getItem('xp')) {
            localStorage.setItem('xp', '0');
        }

        if (!localStorage.getItem('streak')) {
            localStorage.setItem('streak', '0');
        }

        this.updateWordCount();
        this.updateXpBar(parseInt(localStorage.getItem('xp') || '0'));

        // Проверяем и обновляем серию дней
        this.checkStreak();
    }

    // Проверка серии дней
    checkStreak() {
        const lastActive = localStorage.getItem('lastActive');
        const today = new Date().toDateString();

        if (lastActive) {
            const lastDate = new Date(lastActive);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

            let streak = parseInt(localStorage.getItem('streak') || '0');

            if (diffDays === 1) {
                streak++;
                this.checkStreakAchievements(streak);
            } else if (diffDays > 1) {
                streak = 1;
            }

            localStorage.setItem('streak', streak.toString());
            document.getElementById('streak').textContent = streak;
        }

        localStorage.setItem('lastActive', today);
    }

    // Проверка достижений за серию
    checkStreakAchievements(streak) {
        const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        const newAchievements = [];

        const streakMilestones = [
            { count: 7, id: 'streak_week', title: '📅 Неделя', desc: 'Занимался 7 дней подряд' },
            { count: 30, id: 'streak_month', title: '🗓️ Месяц', desc: 'Занимался 30 дней подряд' },
            { count: 100, id: 'streak_century', title: '🔥 Огненная серия', desc: 'Занимался 100 дней подряд' }
        ];

        streakMilestones.forEach(milestone => {
            if (streak >= milestone.count && !achievements.includes(milestone.id)) {
                achievements.push(milestone.id);
                newAchievements.push(milestone);
            }
        });

        if (newAchievements.length > 0) {
            localStorage.setItem('achievements', JSON.stringify(achievements));
            this.showAchievements(newAchievements);
        }
    }
}

// Создаем глобальный экземпляр
const exerciseManager = new ExerciseManager();