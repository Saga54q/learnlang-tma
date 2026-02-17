// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// ==================== КЛАССЫ ИГРЫ ====================

class GameManager {
    constructor() {
        this.currentLanguage = 'en';
        this.currentLevel = 1;
        this.wordsInLevel = 3;
        this.currentWordIndex = 0;
        this.words = [];
        this.testWords = [];
        this.correctAnswers = 0;
        this.coins = 0;
        this.xp = 0;
        this.level = 1;
        this.streak = 0;
        this.bonuses = {
            hints: 0,
            doubleCoins: false,
            shield: false
        };

        this.initUserData();
        this.loadLevels();
        this.updateUI();
    }

    initUserData() {
        // Загружаем данные из localStorage
        this.coins = parseInt(localStorage.getItem('coins') || '0');
        this.xp = parseInt(localStorage.getItem('xp') || '0');
        this.level = parseInt(localStorage.getItem('level') || '1');
        this.streak = parseInt(localStorage.getItem('streak') || '0');

        const savedBonuses = localStorage.getItem('bonuses');
        if (savedBonuses) {
            this.bonuses = JSON.parse(savedBonuses);
        }

        // Проверяем серию
        this.checkStreak();
    }

    checkStreak() {
        const lastActive = localStorage.getItem('lastActive');
        const today = new Date().toDateString();

        if (lastActive) {
            const lastDate = new Date(lastActive);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                this.streak++;
            } else if (diffDays > 1) {
                this.streak = 1;
            }
        } else {
            this.streak = 1;
        }

        localStorage.setItem('streak', this.streak.toString());
        localStorage.setItem('lastActive', today);
    }

    loadLevels() {
        // Создаем уровни для каждого языка
        const levelsContainer = document.getElementById('levelsGrid');
        levelsContainer.innerHTML = '';

        for (let i = 1; i <= 10; i++) {
            const levelButton = document.createElement('button');
            levelButton.className = `level-btn ${this.currentLevel === i ? 'active' : ''}`;
            levelButton.setAttribute('data-level', i);

            // Проверяем, пройден ли уровень
            const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
            const isCompleted = completedLevels.includes(`${this.currentLanguage}_${i}`);

            levelButton.innerHTML = `
                <span class="level-number">${i}</span>
                <span class="level-status">${isCompleted ? '✅' : '🔒'}</span>
                <span class="level-reward">${i * 10} 🪙</span>
            `;

            if (i === 1 || completedLevels.includes(`${this.currentLanguage}_${i-1}`)) {
                levelButton.onclick = () => this.startLevel(i);
            } else {
                levelButton.classList.add('locked');
            }

            levelsContainer.appendChild(levelButton);
        }
    }

    startLevel(level) {
        this.currentLevel = level;
        this.currentWordIndex = 0;
        this.correctAnswers = 0;
        this.words = this.getWordsForLevel(level);
        this.testWords = [...this.words];

        // Показываем урок
        document.querySelector('.levels-section').style.display = 'none';
        document.getElementById('currentLesson').style.display = 'block';
        document.getElementById('levelResult').style.display = 'none';

        document.getElementById('lessonTitle').textContent = `Уровень ${level}`;

        this.showCurrentWord();
        this.updateProgressSteps();
    }

    getWordsForLevel(level) {
        // Получаем слова для текущего языка и уровня
        const allWords = WORDS_DATABASE[this.currentLanguage] || WORDS_DATABASE.en;
        const startIndex = (level - 1) * 3;
        return allWords.slice(startIndex, startIndex + 3);
    }

    showCurrentWord() {
        if (this.currentWordIndex < this.words.length) {
            const word = this.words[this.currentWordIndex];

            document.getElementById('currentWord').textContent = word.word;
            document.getElementById('currentTranslation').textContent = word.translation;
            document.getElementById('translationDisplay').style.display = 'none';
            document.getElementById('nextWordBtn').style.display = 'none';
            document.getElementById('startTestBtn').style.display = 'none';
            document.getElementById('quizOptions').style.display = 'none';

            // Обновляем эмодзи в зависимости от категории
            const emojis = {
                'greetings': '👋',
                'phrases': '💬',
                'family': '👨‍👩‍👧',
                'food': '🍎',
                'animals': '🐱',
                'colors': '🎨',
                'numbers': '🔢',
                'verbs': '🏃'
            };
            document.getElementById('wordEmoji').textContent = emojis[word.category] || '📖';

        } else {
            // Все слова изучены, показываем кнопку теста
            document.getElementById('wordCard').style.display = 'none';
            document.getElementById('startTestBtn').style.display = 'block';
            this.prepareTest();
        }
    }

    showTranslation() {
        document.getElementById('translationDisplay').style.display = 'block';
        document.getElementById('nextWordBtn').style.display = 'block';

        // Добавляем монетки за просмотр
        this.addCoins(1);
    }

    nextWord() {
        // Отмечаем слово как изученное
        this.addLearnedWord(this.words[this.currentWordIndex]);

        this.currentWordIndex++;
        this.showCurrentWord();
        this.updateProgressSteps();
    }

    prepareTest() {
        const testContainer = document.getElementById('quizOptions');
        const optionsGrid = document.getElementById('optionsGrid');
        optionsGrid.innerHTML = '';

        // Перемешиваем слова для теста
        const shuffled = [...this.testWords].sort(() => Math.random() - 0.5);

        shuffled.forEach(word => {
            const card = document.createElement('div');
            card.className = 'test-word-card';
            card.innerHTML = `
                <div class="test-word">${word.word}</div>
                <div class="test-options">
                    ${this.generateTranslationOptions(word)}
                </div>
            `;
            optionsGrid.appendChild(card);
        });

        testContainer.style.display = 'block';
        document.getElementById('wordCard').style.display = 'none';
    }

    generateTranslationOptions(word) {
        // Генерируем 3 варианта перевода
        const allWords = WORDS_DATABASE[this.currentLanguage] || WORDS_DATABASE.en;
        let options = [word.translation];

        while (options.length < 3) {
            const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
            if (!options.includes(randomWord.translation) && randomWord.translation !== word.translation) {
                options.push(randomWord.translation);
            }
        }

        // Перемешиваем
        options = options.sort(() => Math.random() - 0.5);

        return options.map(opt =>
            `<button class="test-option" onclick="game.checkTestAnswer('${word.word}', '${opt}', '${word.translation}')">${opt}</button>`
        ).join('');
    }

    checkTestAnswer(word, selected, correct) {
        const isCorrect = selected === correct;

        if (isCorrect) {
            this.correctAnswers++;
            this.addCoins(5);
            this.addXP(10);

            // Визуальный эффект
            tg.HapticFeedback.notificationOccurred('success');

            // Отмечаем кнопку как правильную
            event.target.classList.add('correct');
            event.target.disabled = true;

            // Проверяем, все ли слова угаданы
            if (this.correctAnswers === this.words.length) {
                this.completeLevel();
            }
        } else {
            tg.HapticFeedback.notificationOccurred('error');
            event.target.classList.add('wrong');

            // Показываем правильный ответ
            const buttons = event.target.parentElement.querySelectorAll('.test-option');
            buttons.forEach(btn => {
                if (btn.textContent === correct) {
                    btn.classList.add('show-correct');
                }
            });
        }
    }

    completeLevel() {
        // Начисляем награды
        const reward = this.currentLevel * 10;
        this.addCoins(reward);
        this.addXP(50);

        // Отмечаем уровень как пройденный
        const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
        completedLevels.push(`${this.currentLanguage}_${this.currentLevel}`);
        localStorage.setItem('completedLevels', JSON.stringify(completedLevels));

        // Показываем результаты
        document.getElementById('currentLesson').style.display = 'none';
        document.getElementById('levelResult').style.display = 'block';

        document.getElementById('correctAnswers').textContent = this.correctAnswers;
        document.getElementById('earnedCoins').textContent = reward;
        document.getElementById('earnedXP').textContent = 50;

        // Проверяем достижения
        this.checkAchievements();
    }

    nextLevel() {
        if (this.currentLevel < 10) {
            this.startLevel(this.currentLevel + 1);
        } else {
            this.showSection('levels');
        }
    }

    repeatLevel() {
        this.startLevel(this.currentLevel);
    }

    addLearnedWord(word) {
        let learnedWords = JSON.parse(localStorage.getItem('learnedWords') || '[]');

        if (!learnedWords.find(w => w.id === word.id && w.lang === this.currentLanguage)) {
            learnedWords.push({
                id: word.id,
                lang: this.currentLanguage,
                word: word.word,
                translation: word.translation,
                learnedAt: new Date().toISOString(),
                level: this.currentLevel
            });

            localStorage.setItem('learnedWords', JSON.stringify(learnedWords));
            this.updateUI();
        }
    }

    addCoins(amount) {
        this.coins += amount;
        localStorage.setItem('coins', this.coins.toString());
        this.updateUI();
    }

    addXP(amount) {
        this.xp += amount;
        localStorage.setItem('xp', this.xp.toString());

        // Проверяем повышение уровня
        const xpNeeded = this.level * 100;
        if (this.xp >= xpNeeded) {
            this.level++;
            localStorage.setItem('level', this.level.toString());
            this.showNotification(`🎉 Уровень повышен! Теперь ${this.level} уровень!`);
        }

        this.updateUI();
    }

    updateUI() {
        document.getElementById('streak').textContent = this.streak;
        document.getElementById('level').textContent = this.level;
        document.getElementById('coins').textContent = this.coins;

        const learnedWords = JSON.parse(localStorage.getItem('learnedWords') || '[]');
        document.getElementById('words').textContent = learnedWords.length;

        // Обновляем XP бар
        const xpNeeded = this.level * 100;
        const xpForCurrentLevel = (this.level - 1) * 100;
        const xpProgress = this.xp - xpForCurrentLevel;
        const xpNeededForNext = xpNeeded - xpForCurrentLevel;
        const percentage = (xpProgress / xpNeededForNext) * 100;

        document.getElementById('xpBar').style.width = percentage + '%';
        document.getElementById('xpText').textContent = `${xpProgress}/${xpNeededForNext} XP`;
    }

    updateProgressSteps() {
        const stepsContainer = document.getElementById('progressSteps');
        stepsContainer.innerHTML = '';

        for (let i = 0; i < this.wordsInLevel; i++) {
            const step = document.createElement('div');
            step.className = `progress-step ${i < this.currentWordIndex ? 'completed' : ''} ${i === this.currentWordIndex ? 'current' : ''}`;

            if (i < this.currentWordIndex) {
                step.innerHTML = '✅';
            } else if (i === this.currentWordIndex) {
                step.innerHTML = '📖';
            } else {
                step.innerHTML = '○';
            }

            stepsContainer.appendChild(step);
        }
    }

    checkAchievements() {
        const learnedWords = JSON.parse(localStorage.getItem('learnedWords') || '[]');
        const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        const newAchievements = [];

        // Достижения за слова
        if (learnedWords.length >= 10 && !achievements.includes('word_novice')) {
            achievements.push('word_novice');
            newAchievements.push('🌱 Новичок - выучить 10 слов');
            this.addCoins(50);
        }
        if (learnedWords.length >= 50 && !achievements.includes('word_enthusiast')) {
            achievements.push('word_enthusiast');
            newAchievements.push('📚 Энтузиаст - выучить 50 слов');
            this.addCoins(100);
        }

        // Достижения за серию
        if (this.streak >= 7 && !achievements.includes('streak_week')) {
            achievements.push('streak_week');
            newAchievements.push('🔥 Неделя - заниматься 7 дней подряд');
            this.addCoins(70);
        }

        if (newAchievements.length > 0) {
            localStorage.setItem('achievements', JSON.stringify(achievements));
            this.showAchievements(newAchievements);
        }
    }

    showAchievements(achievements) {
        const message = achievements.map(ach => `🏆 ${ach}`).join('\n');
        this.showNotification(message);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    playWordSound() {
        const word = document.getElementById('currentWord').textContent;
        const utterance = new SpeechSynthesisUtterance(word);

        const langCodes = {
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE'
        };
        utterance.lang = langCodes[this.currentLanguage] || 'en-US';

        window.speechSynthesis.speak(utterance);
        tg.HapticFeedback.impactOccurred('light');
    }

    buyBonus(bonusType) {
        const prices = {
            'hint': 10,
            'double': 30,
            'shield': 25,
            'time': 15
        };

        if (this.coins >= prices[bonusType]) {
            this.coins -= prices[bonusType];
            localStorage.setItem('coins', this.coins.toString());

            switch(bonusType) {
                case 'hint':
                    this.bonuses.hints++;
                    break;
                case 'double':
                    this.bonuses.doubleCoins = true;
                    break;
                case 'shield':
                    this.bonuses.shield = true;
                    break;
            }

            localStorage.setItem('bonuses', JSON.stringify(this.bonuses));
            this.updateUI();
            this.showNotification(`✅ Бонус "${bonusType}" куплен!`);
        } else {
            this.showNotification('❌ Недостаточно монет!');
        }
    }

    showSection(section) {
        // Обновляем навигацию
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.currentTarget.classList.add('active');

        // Прячем все секции
        document.querySelector('.levels-section').style.display = 'none';
        document.getElementById('currentLesson').style.display = 'none';
        document.getElementById('levelResult').style.display = 'none';
        document.getElementById('shopSection').style.display = 'none';

        // Показываем нужную секцию
        switch(section) {
            case 'game':
                document.querySelector('.levels-section').style.display = 'block';
                document.getElementById('currentLesson').style.display = 'block';
                break;
            case 'levels':
                document.querySelector('.levels-section').style.display = 'block';
                this.loadLevels();
                break;
            case 'shop':
                document.getElementById('shopSection').style.display = 'block';
                break;
            case 'stats':
                this.showStats();
                break;
            case 'profile':
                this.showProfile();
                break;
        }
    }

    showStats() {
        const learnedWords = JSON.parse(localStorage.getItem('learnedWords') || '[]');
        const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');

        const statsHtml = `
            <div class="stats-modal">
                <h3>📊 Статистика</h3>
                <div class="stats-list">
                    <p>🔥 Серия: ${this.streak} дней</p>
                    <p>📚 Всего слов: ${learnedWords.length}</p>
                    <p>⭐ Уровень: ${this.level}</p>
                    <p>✨ Опыт: ${this.xp}</p>
                    <p>🪙 Монеты: ${this.coins}</p>
                    <p>🏆 Достижения: ${achievements.length}</p>
                    <p>🎮 Пройдено уровней: ${completedLevels.length}</p>
                </div>
                <button class="close-btn" onclick="game.showSection('game')">Закрыть</button>
            </div>
        `;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = statsHtml;
        document.body.appendChild(modal);

        setTimeout(() => {
            modal.remove();
        }, 5000);
    }

    showProfile() {
        const user = tg.initDataUnsafe?.user;

        const profileHtml = `
            <div class="profile-modal">
                <h3>👤 Профиль</h3>
                <div class="profile-info">
                    <p>Имя: ${user?.first_name || 'Гость'}</p>
                    <p>Username: @${user?.username || 'не указан'}</p>
                    <p>ID: ${user?.id || 'local'}</p>
                </div>
                <div class="bonuses-info">
                    <h4>🎁 Бонусы:</h4>
                    <p>💡 Подсказки: ${this.bonuses.hints}</p>
                    <p>2️⃣ Двойные монеты: ${this.bonuses.doubleCoins ? '✅' : '❌'}</p>
                    <p>🛡️ Защита: ${this.bonuses.shield ? '✅' : '❌'}</p>
                </div>
                <button class="close-btn" onclick="game.showSection('game')">Закрыть</button>
            </div>
        `;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = profileHtml;
        document.body.appendChild(modal);

        setTimeout(() => {
            modal.remove();
        }, 5000);
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

const game = new GameManager();

// Глобальные функции для вызова из HTML
function playWordSound() {
    game.playWordSound();
}

function showTranslation() {
    game.showTranslation();
}

function nextWord() {
    game.nextWord();
}

function startTest() {
    document.getElementById('startTestBtn').style.display = 'none';
    game.prepareTest();
}

function showSection(section) {
    game.showSection(section);
}

function buyBonus(type) {
    game.buyBonus(type);
}

function nextLevel() {
    game.nextLevel();
}

function repeatLevel() {
    game.repeatLevel();
}

// Обработчики для кнопок языка
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.lang-btn').forEach(b => {
            b.classList.remove('active');
        });
        this.classList.add('active');

        game.currentLanguage = this.dataset.lang;
        game.loadLevels();

        tg.HapticFeedback.impactOccurred('soft');
    });
});