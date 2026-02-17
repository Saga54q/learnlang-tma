// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// ==================== КЛАСС ИГРЫ ====================

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

        // Привязываем методы к экземпляру
        this.initUserData = this.initUserData.bind(this);
        this.checkStreak = this.checkStreak.bind(this);
        this.loadLevels = this.loadLevels.bind(this);
        this.startLevel = this.startLevel.bind(this);
        this.showCurrentWord = this.showCurrentWord.bind(this);
        this.showTranslation = this.showTranslation.bind(this);
        this.nextWord = this.nextWord.bind(this);
        this.prepareTest = this.prepareTest.bind(this);
        this.checkTestAnswer = this.checkTestAnswer.bind(this);
        this.completeLevel = this.completeLevel.bind(this);
        this.nextLevel = this.nextLevel.bind(this);
        this.repeatLevel = this.repeatLevel.bind(this);
        this.addLearnedWord = this.addLearnedWord.bind(this);
        this.addCoins = this.addCoins.bind(this);
        this.addXP = this.addXP.bind(this);
        this.updateUI = this.updateUI.bind(this);
        this.updateProgressSteps = this.updateProgressSteps.bind(this);
        this.checkAchievements = this.checkAchievements.bind(this);
        this.showAchievements = this.showAchievements.bind(this);
        this.showNotification = this.showNotification.bind(this);
        this.playWordSound = this.playWordSound.bind(this);
        this.buyBonus = this.buyBonus.bind(this);
        this.showSection = this.showSection.bind(this);
        this.showStats = this.showStats.bind(this);
        this.showProfile = this.showProfile.bind(this);

        // Инициализация
        this.initUserData();
        this.loadLevels();
        this.updateUI();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Обработчики для кнопок языка
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.removeEventListener('click', this.handleLanguageClick);
            this.handleLanguageClick = (e) => {
                document.querySelectorAll('.lang-btn').forEach(b => {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                this.currentLanguage = btn.dataset.lang;
                this.loadLevels();
                tg.HapticFeedback.impactOccurred('soft');
            };
            btn.addEventListener('click', this.handleLanguageClick);
        });

        // Обработчики для навигации
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.removeEventListener('click', this.handleNavClick);
            this.handleNavClick = (e) => {
                const section = btn.textContent.trim().toLowerCase();
                this.showSection(section);
            };
            btn.addEventListener('click', this.handleNavClick);
        });
    }

    initUserData() {
        try {
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

            console.log('User data initialized:', {
                coins: this.coins,
                xp: this.xp,
                level: this.level,
                streak: this.streak
            });
        } catch (error) {
            console.error('Error initializing user data:', error);
        }
    }

    checkStreak() {
        try {
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
        } catch (error) {
            console.error('Error checking streak:', error);
        }
    }

    loadLevels() {
        try {
            const levelsContainer = document.getElementById('levelsGrid');
            if (!levelsContainer) return;

            levelsContainer.innerHTML = '';

            const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');

            for (let i = 1; i <= 10; i++) {
                const levelButton = document.createElement('button');
                levelButton.className = 'level-btn';
                levelButton.setAttribute('data-level', i);

                const isCompleted = completedLevels.includes(`${this.currentLanguage}_${i}`);
                const isUnlocked = i === 1 || completedLevels.includes(`${this.currentLanguage}_${i-1}`);

                if (isCompleted) {
                    levelButton.classList.add('completed');
                }
                if (!isUnlocked) {
                    levelButton.classList.add('locked');
                }
                if (this.currentLevel === i) {
                    levelButton.classList.add('active');
                }

                levelButton.innerHTML = `
                    <span class="level-number">${i}</span>
                    <span class="level-status">${isCompleted ? '✅' : isUnlocked ? '🔓' : '🔒'}</span>
                    <span class="level-reward">${i * 10} 🪙</span>
                `;

                if (isUnlocked) {
                    levelButton.onclick = () => this.startLevel(i);
                }

                levelsContainer.appendChild(levelButton);
            }
        } catch (error) {
            console.error('Error loading levels:', error);
        }
    }

    startLevel(level) {
        try {
            this.currentLevel = level;
            this.currentWordIndex = 0;
            this.correctAnswers = 0;
            this.words = this.getWordsForLevel(level);
            this.testWords = [...this.words];

            // Показываем урок
            const levelsSection = document.querySelector('.levels-section');
            const currentLesson = document.getElementById('currentLesson');
            const levelResult = document.getElementById('levelResult');

            if (levelsSection) levelsSection.style.display = 'none';
            if (currentLesson) {
                currentLesson.style.display = 'block';
                // Показываем слово дня (первое слово)
                document.querySelector('.daily-word').style.display = 'none';
            }
            if (levelResult) levelResult.style.display = 'none';

            const lessonTitle = document.getElementById('lessonTitle');
            if (lessonTitle) {
                lessonTitle.textContent = `Уровень ${level}`;
            }

            this.showCurrentWord();
            this.updateProgressSteps();

            tg.HapticFeedback.impactOccurred('medium');
        } catch (error) {
            console.error('Error starting level:', error);
        }
    }

    getWordsForLevel(level) {
        try {
            const allWords = WORDS_DATABASE[this.currentLanguage] || WORDS_DATABASE.en;
            const startIndex = (level - 1) * 3;
            return allWords.slice(startIndex, startIndex + 3);
        } catch (error) {
            console.error('Error getting words for level:', error);
            return [];
        }
    }

    showCurrentWord() {
        try {
            if (this.currentWordIndex < this.words.length) {
                const word = this.words[this.currentWordIndex];

                const currentWordEl = document.getElementById('currentWord');
                const currentTranslationEl = document.getElementById('currentTranslation');
                const translationDisplay = document.getElementById('translationDisplay');
                const nextWordBtn = document.getElementById('nextWordBtn');
                const startTestBtn = document.getElementById('startTestBtn');
                const quizOptions = document.getElementById('quizOptions');
                const wordCard = document.getElementById('wordCard');

                if (currentWordEl) currentWordEl.textContent = word.word;
                if (currentTranslationEl) currentTranslationEl.textContent = word.translation;
                if (translationDisplay) translationDisplay.style.display = 'none';
                if (nextWordBtn) nextWordBtn.style.display = 'none';
                if (startTestBtn) startTestBtn.style.display = 'none';
                if (quizOptions) quizOptions.style.display = 'none';
                if (wordCard) wordCard.style.display = 'block';

                // Обновляем эмодзи в зависимости от категории
                const wordEmoji = document.getElementById('wordEmoji');
                if (wordEmoji) {
                    const emojis = {
                        'greetings': '👋',
                        'phrases': '💬',
                        'family': '👨‍👩‍👧',
                        'food': '🍎',
                        'animals': '🐱',
                        'colors': '🎨',
                        'numbers': '🔢',
                        'verbs': '🏃',
                        'clothes': '👕',
                        'weather': '☀️',
                        'body': '👤',
                        'time': '⏰',
                        'transport': '🚗',
                        'house': '🏠',
                        'professions': '👨‍💼'
                    };
                    wordEmoji.textContent = emojis[word.category] || '📖';
                }

            } else {
                // Все слова изучены, показываем кнопку теста
                const wordCard = document.getElementById('wordCard');
                const startTestBtn = document.getElementById('startTestBtn');

                if (wordCard) wordCard.style.display = 'none';
                if (startTestBtn) {
                    startTestBtn.style.display = 'block';
                    startTestBtn.onclick = () => this.prepareTest();
                }
            }
        } catch (error) {
            console.error('Error showing current word:', error);
        }
    }

    showTranslation() {
        try {
            const translationDisplay = document.getElementById('translationDisplay');
            const nextWordBtn = document.getElementById('nextWordBtn');

            if (translationDisplay) translationDisplay.style.display = 'block';
            if (nextWordBtn) {
                nextWordBtn.style.display = 'block';
                nextWordBtn.onclick = () => this.nextWord();
            }

            // Добавляем монетки за просмотр
            this.addCoins(1);

            tg.HapticFeedback.impactOccurred('light');
        } catch (error) {
            console.error('Error showing translation:', error);
        }
    }

    nextWord() {
        try {
            // Отмечаем слово как изученное
            if (this.currentWordIndex < this.words.length) {
                this.addLearnedWord(this.words[this.currentWordIndex]);
            }

            this.currentWordIndex++;
            this.showCurrentWord();
            this.updateProgressSteps();
        } catch (error) {
            console.error('Error moving to next word:', error);
        }
    }

    prepareTest() {
        try {
            const testContainer = document.getElementById('quizOptions');
            const optionsGrid = document.getElementById('optionsGrid');

            if (!testContainer || !optionsGrid) return;

            optionsGrid.innerHTML = '';

            // Перемешиваем слова для теста
            const shuffled = [...this.testWords].sort(() => Math.random() - 0.5);

            shuffled.forEach(word => {
                const card = document.createElement('div');
                card.className = 'test-word-card';

                const optionsHtml = this.generateTranslationOptions(word);

                card.innerHTML = `
                    <div class="test-word">${word.word}</div>
                    <div class="test-options" id="options-${word.id}">
                        ${optionsHtml}
                    </div>
                `;
                optionsGrid.appendChild(card);
            });

            testContainer.style.display = 'block';

            const wordCard = document.getElementById('wordCard');
            if (wordCard) wordCard.style.display = 'none';

            const startTestBtn = document.getElementById('startTestBtn');
            if (startTestBtn) startTestBtn.style.display = 'none';

        } catch (error) {
            console.error('Error preparing test:', error);
        }
    }

    generateTranslationOptions(word) {
        try {
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
                `<button class="test-option" onclick="game.checkTestAnswer('${word.word}', '${opt}', '${word.translation}', this)">${opt}</button>`
            ).join('');
        } catch (error) {
            console.error('Error generating options:', error);
            return '';
        }
    }

    checkTestAnswer(word, selected, correct, button) {
        try {
            const isCorrect = selected === correct;

            if (isCorrect) {
                this.correctAnswers++;
                this.addCoins(5);
                this.addXP(10);

                // Визуальный эффект
                tg.HapticFeedback.notificationOccurred('success');

                // Отмечаем кнопку как правильную
                button.classList.add('correct');
                button.disabled = true;

                // Блокируем все кнопки в этой группе
                const buttons = button.parentElement.querySelectorAll('.test-option');
                buttons.forEach(btn => {
                    if (btn !== button) {
                        btn.disabled = true;
                        btn.style.opacity = '0.5';
                    }
                });

                // Проверяем, все ли слова угаданы
                if (this.correctAnswers === this.words.length) {
                    setTimeout(() => {
                        this.completeLevel();
                    }, 1000);
                }
            } else {
                tg.HapticFeedback.notificationOccurred('error');
                button.classList.add('wrong');

                // Показываем правильный ответ
                const buttons = button.parentElement.querySelectorAll('.test-option');
                buttons.forEach(btn => {
                    if (btn.textContent === correct) {
                        btn.classList.add('show-correct');
                    }
                });

                // Если есть защита, не отмечаем как ошибку
                if (this.bonuses.shield) {
                    this.bonuses.shield = false;
                    localStorage.setItem('bonuses', JSON.stringify(this.bonuses));
                    this.showNotification('🛡️ Защита сработала! Ошибка не засчитана');
                }
            }
        } catch (error) {
            console.error('Error checking test answer:', error);
        }
    }

    completeLevel() {
        try {
            // Начисляем награды
            const reward = this.currentLevel * 10;
            this.addCoins(reward);
            this.addXP(50);

            // Отмечаем уровень как пройденный
            const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
            const levelKey = `${this.currentLanguage}_${this.currentLevel}`;

            if (!completedLevels.includes(levelKey)) {
                completedLevels.push(levelKey);
                localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
            }

            // Показываем результаты
            const currentLesson = document.getElementById('currentLesson');
            const levelResult = document.getElementById('levelResult');

            if (currentLesson) currentLesson.style.display = 'none';
            if (levelResult) {
                levelResult.style.display = 'flex';

                const correctAnswersEl = document.getElementById('correctAnswers');
                const earnedCoinsEl = document.getElementById('earnedCoins');
                const earnedXpEl = document.getElementById('earnedXP');

                if (correctAnswersEl) correctAnswersEl.textContent = this.correctAnswers;
                if (earnedCoinsEl) earnedCoinsEl.textContent = reward;
                if (earnedXpEl) earnedXpEl.textContent = 50;
            }

            // Проверяем достижения
            this.checkAchievements();

            // Обновляем уровни
            this.loadLevels();

        } catch (error) {
            console.error('Error completing level:', error);
        }
    }

    nextLevel() {
        try {
            if (this.currentLevel < 10) {
                this.startLevel(this.currentLevel + 1);
            } else {
                this.showSection('levels');
            }
        } catch (error) {
            console.error('Error going to next level:', error);
        }
    }

    repeatLevel() {
        try {
            this.startLevel(this.currentLevel);
        } catch (error) {
            console.error('Error repeating level:', error);
        }
    }

    addLearnedWord(word) {
        try {
            let learnedWords = JSON.parse(localStorage.getItem('learnedWords') || '[]');

            if (!learnedWords.find(w => w.id === word.id && w.lang === this.currentLanguage)) {
                learnedWords.push({
                    id: word.id,
                    lang: this.currentLanguage,
                    word: word.word,
                    translation: word.translation,
                    category: word.category,
                    learnedAt: new Date().toISOString(),
                    level: this.currentLevel
                });

                localStorage.setItem('learnedWords', JSON.stringify(learnedWords));
                this.updateUI();
            }
        } catch (error) {
            console.error('Error adding learned word:', error);
        }
    }

    addCoins(amount) {
        try {
            if (this.bonuses.doubleCoins) {
                amount *= 2;
            }
            this.coins += amount;
            localStorage.setItem('coins', this.coins.toString());
            this.updateUI();
        } catch (error) {
            console.error('Error adding coins:', error);
        }
    }

    addXP(amount) {
        try {
            this.xp += amount;
            localStorage.setItem('xp', this.xp.toString());

            // Проверяем повышение уровня
            const xpNeeded = this.level * 100;
            if (this.xp >= xpNeeded) {
                this.level++;
                localStorage.setItem('level', this.level.toString());
                this.showNotification(`🎉 Уровень повышен! Теперь ${this.level} уровень!`);
                tg.HapticFeedback.notificationOccurred('success');
            }

            this.updateUI();
        } catch (error) {
            console.error('Error adding XP:', error);
        }
    }

    updateUI() {
        try {
            const streakEl = document.getElementById('streak');
            const levelEl = document.getElementById('level');
            const coinsEl = document.getElementById('coins');
            const wordsEl = document.getElementById('words');

            if (streakEl) streakEl.textContent = this.streak;
            if (levelEl) levelEl.textContent = this.level;
            if (coinsEl) coinsEl.textContent = this.coins;

            const learnedWords = JSON.parse(localStorage.getItem('learnedWords') || '[]');
            if (wordsEl) wordsEl.textContent = learnedWords.length;

            // Обновляем XP бар
            const xpBar = document.getElementById('xpBar');
            const xpText = document.getElementById('xpText');

            if (xpBar && xpText) {
                const xpNeeded = this.level * 100;
                const xpForCurrentLevel = (this.level - 1) * 100;
                const xpProgress = this.xp - xpForCurrentLevel;
                const xpNeededForNext = xpNeeded - xpForCurrentLevel;
                const percentage = (xpProgress / xpNeededForNext) * 100;

                xpBar.style.width = percentage + '%';
                xpText.textContent = `${xpProgress}/${xpNeededForNext} XP`;
            }
        } catch (error) {
            console.error('Error updating UI:', error);
        }
    }

    updateProgressSteps() {
        try {
            const stepsContainer = document.getElementById('progressSteps');
            if (!stepsContainer) return;

            stepsContainer.innerHTML = '';

            for (let i = 0; i < this.wordsInLevel; i++) {
                const step = document.createElement('div');
                step.className = 'progress-step';

                if (i < this.currentWordIndex) {
                    step.classList.add('completed');
                    step.innerHTML = '✅';
                } else if (i === this.currentWordIndex) {
                    step.classList.add('current');
                    step.innerHTML = '📖';
                } else {
                    step.innerHTML = '○';
                }

                stepsContainer.appendChild(step);
            }
        } catch (error) {
            console.error('Error updating progress steps:', error);
        }
    }

    checkAchievements() {
        try {
            const learnedWords = JSON.parse(localStorage.getItem('learnedWords') || '[]');
            const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
            const newAchievements = [];

            // Достижения за слова
            if (learnedWords.length >= 10 && !achievements.includes('word_novice')) {
                achievements.push('word_novice');
                newAchievements.push({
                    emoji: '🌱',
                    title: 'Новичок',
                    desc: 'Выучить 10 слов'
                });
                this.addCoins(50);
            }
            if (learnedWords.length >= 50 && !achievements.includes('word_enthusiast')) {
                achievements.push('word_enthusiast');
                newAchievements.push({
                    emoji: '📚',
                    title: 'Энтузиаст',
                    desc: 'Выучить 50 слов'
                });
                this.addCoins(100);
            }
            if (learnedWords.length >= 100 && !achievements.includes('word_master')) {
                achievements.push('word_master');
                newAchievements.push({
                    emoji: '👑',
                    title: 'Мастер слов',
                    desc: 'Выучить 100 слов'
                });
                this.addCoins(200);
            }

            // Достижения за серию
            if (this.streak >= 7 && !achievements.includes('streak_week')) {
                achievements.push('streak_week');
                newAchievements.push({
                    emoji: '🔥',
                    title: 'Неделя',
                    desc: 'Заниматься 7 дней подряд'
                });
                this.addCoins(70);
            }
            if (this.streak >= 30 && !achievements.includes('streak_month')) {
                achievements.push('streak_month');
                newAchievements.push({
                    emoji: '⚡',
                    title: 'Месяц',
                    desc: 'Заниматься 30 дней подряд'
                });
                this.addCoins(150);
            }

            // Достижения за уровни
            const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
            if (completedLevels.length >= 10 && !achievements.includes('level_beginner')) {
                achievements.push('level_beginner');
                newAchievements.push({
                    emoji: '🎯',
                    title: 'Начинающий',
                    desc: 'Пройдено 10 уровней'
                });
                this.addCoins(100);
            }

            if (newAchievements.length > 0) {
                localStorage.setItem('achievements', JSON.stringify(achievements));
                this.showAchievements(newAchievements);
            }
        } catch (error) {
            console.error('Error checking achievements:', error);
        }
    }

    showAchievements(achievements) {
        try {
            const container = document.getElementById('recentAchievements');
            if (!container) return;

            achievements.forEach(ach => {
                const div = document.createElement('div');
                div.className = 'achievement-badge';
                div.innerHTML = `
                    <div class="achievement-icon">${ach.emoji}</div>
                    <div class="achievement-info">
                        <div class="achievement-title">${ach.title}</div>
                        <div class="achievement-desc">${ach.desc}</div>
                    </div>
                `;
                container.appendChild(div);
            });

            this.showNotification(`🏆 Новые достижения: +${achievements.length}`);
        } catch (error) {
            console.error('Error showing achievements:', error);
        }
    }

    showNotification(message) {
        try {
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 3000);
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }

    playWordSound() {
        try {
            const word = document.getElementById('currentWord').textContent;
            const utterance = new SpeechSynthesisUtterance(word);

            const langCodes = {
                'en': 'en-US',
                'es': 'es-ES',
                'fr': 'fr-FR',
                'de': 'de-DE',
                'it': 'it-IT',
                'ja': 'ja-JP'
            };
            utterance.lang = langCodes[this.currentLanguage] || 'en-US';

            window.speechSynthesis.speak(utterance);
            tg.HapticFeedback.impactOccurred('light');
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }

    buyBonus(bonusType) {
        try {
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
                        this.showNotification('💡 Подсказка куплена!');
                        break;
                    case 'double':
                        this.bonuses.doubleCoins = true;
                        this.showNotification('2️⃣ Двойные монеты активированы на 24 часа!');
                        break;
                    case 'shield':
                        this.bonuses.shield = true;
                        this.showNotification('🛡️ Защита активирована на 1 ошибку!');
                        break;
                    case 'time':
                        this.showNotification('⏱️ Дополнительное время не реализовано в этой версии');
                        break;
                }

                localStorage.setItem('bonuses', JSON.stringify(this.bonuses));
                this.updateUI();
            } else {
                this.showNotification('❌ Недостаточно монет!');
            }
        } catch (error) {
            console.error('Error buying bonus:', error);
        }
    }

    showSection(section) {
        try {
            // Обновляем навигацию
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.textContent.toLowerCase().includes(section)) {
                    btn.classList.add('active');
                }
            });

            // Прячем все секции
            const levelsSection = document.querySelector('.levels-section');
            const currentLesson = document.getElementById('currentLesson');
            const levelResult = document.getElementById('levelResult');
            const shopSection = document.getElementById('shopSection');
            const dailyWord = document.querySelector('.daily-word');

            if (levelsSection) levelsSection.style.display = 'none';
            if (currentLesson) currentLesson.style.display = 'none';
            if (levelResult) levelResult.style.display = 'none';
            if (shopSection) shopSection.style.display = 'none';
            if (dailyWord) dailyWord.style.display = 'none';

            // Показываем нужную секцию
            switch(section) {
                case 'игра':
                case 'game':
                    if (levelsSection) levelsSection.style.display = 'block';
                    if (currentLesson && this.currentLevel) {
                        currentLesson.style.display = 'block';
                    }
                    break;

                case 'уровни':
                case 'levels':
                    if (levelsSection) {
                        levelsSection.style.display = 'block';
                        this.loadLevels();
                    }
                    break;

                case 'магазин':
                case 'shop':
                    if (shopSection) shopSection.style.display = 'block';
                    break;

                case 'статистика':
                case 'stats':
                    this.showStats();
                    break;

                case 'профиль':
                case 'profile':
                    this.showProfile();
                    break;
            }

            tg.HapticFeedback.selectionChanged();
        } catch (error) {
            console.error('Error showing section:', error);
        }
    }

    showStats() {
        try {
            const learnedWords = JSON.parse(localStorage.getItem('learnedWords') || '[]');
            const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
            const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');

            // Считаем статистику по языкам
            const languageStats = {};
            learnedWords.forEach(word => {
                if (!languageStats[word.lang]) {
                    languageStats[word.lang] = 0;
                }
                languageStats[word.lang]++;
            });

            const langNames = {
                'en': '🇬🇧 Английский',
                'es': '🇪🇸 Испанский',
                'fr': '🇫🇷 Французский',
                'de': '🇩🇪 Немецкий',
                'it': '🇮🇹 Итальянский',
                'ja': '🇯🇵 Японский'
            };

            let languageStatsText = '';
            for (let lang in languageStats) {
                languageStatsText += `<p>${langNames[lang] || lang}: ${languageStats[lang]} слов</p>`;
            }

            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
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
                        <h4>🌍 По языкам:</h4>
                        ${languageStatsText || '<p>Нет данных</p>'}
                    </div>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">Закрыть</button>
                </div>
            `;

            document.body.appendChild(modal);

            setTimeout(() => {
                modal.remove();
            }, 10000);
        } catch (error) {
            console.error('Error showing stats:', error);
        }
    }

    showProfile() {
        try {
            const user = tg.initDataUnsafe?.user;

            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="profile-modal">
                    <h3>👤 Профиль</h3>
                    <div class="profile-info">
                        <p><strong>Имя:</strong> ${user?.first_name || 'Гость'}</p>
                        <p><strong>Фамилия:</strong> ${user?.last_name || '—'}</p>
                        <p><strong>Username:</strong> @${user?.username || 'не указан'}</p>
                        <p><strong>ID:</strong> ${user?.id || 'local'}</p>
                        <p><strong>Язык интерфейса:</strong> ${user?.language_code || 'ru'}</p>
                    </div>
                    <div class="bonuses-info">
                        <h4>🎁 Бонусы:</h4>
                        <p>💡 Подсказки: ${this.bonuses.hints}</p>
                        <p>2️⃣ Двойные монеты: ${this.bonuses.doubleCoins ? '✅ Активен' : '❌ Не активен'}</p>
                        <p>🛡️ Защита: ${this.bonuses.shield ? '✅ Активна' : '❌ Не активна'}</p>
                    </div>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">Закрыть</button>
                </div>
            `;

            document.body.appendChild(modal);

            setTimeout(() => {
                modal.remove();
            }, 10000);
        } catch (error) {
            console.error('Error showing profile:', error);
        }
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

let game;

// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    try {
        game = new GameManager();

        // Делаем game глобальным
        window.game = game;

        // Глобальные функции для вызова из HTML
        window.playWordSound = () => game.playWordSound();
        window.showTranslation = () => game.showTranslation();
        window.nextWord = () => game.nextWord();
        window.startTest = () => game.prepareTest();
        window.showSection = (section) => game.showSection(section);
        window.buyBonus = (type) => game.buyBonus(type);
        window.nextLevel = () => game.nextLevel();
        window.repeatLevel = () => game.repeatLevel();

        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Error initializing game:', error);
    }
});