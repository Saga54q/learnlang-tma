// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// ==================== КЛАСС ИГРЫ ====================

class GameManager {
    constructor() {
        this.currentLanguage = 'en';
        this.currentLevel = 1;
        this.currentDifficulty = 'easy'; // easy, medium, hard
        this.wordsInLevel = {
            easy: 6,
            medium: 8,
            hard: 10
        };
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
            shield: false,
            time: 0
        };

        // Статистика
        this.stats = {
            totalWordsLearned: 0,
            totalExercisesDone: 0,
            totalCorrectAnswers: 0,
            totalWrongAnswers: 0,
            languagesProgress: {},
            levelsCompleted: 0,
            achievementsUnlocked: 0
        };

        // Привязываем методы
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
        this.changeDifficulty = this.changeDifficulty.bind(this);
        this.loadUserStats = this.loadUserStats.bind(this);
        this.saveUserStats = this.saveUserStats.bind(this);

        // Инициализация
        this.initUserData();
        this.loadUserStats();
        this.loadLevels();
        this.updateUI();
        this.setupEventListeners();

        console.log('Game initialized', {
            currentLanguage: this.currentLanguage,
            currentLevel: this.currentLevel,
            difficulty: this.currentDifficulty
        });
    }

    setupEventListeners() {
        // Удаляем старые обработчики
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.removeEventListener('click', this.handleLanguageClick);
        });

        // Обработчики для кнопок языка
        document.querySelectorAll('.lang-btn').forEach(btn => {
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();

                document.querySelectorAll('.lang-btn').forEach(b => {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                this.currentLanguage = btn.dataset.lang;
                localStorage.setItem('currentLanguage', this.currentLanguage);
                this.loadLevels();
                tg.HapticFeedback.impactOccurred('soft');
                console.log('Language changed to:', this.currentLanguage);
            };
            btn.addEventListener('click', handler);
            btn._handler = handler;
        });

        // Обработчики для сложности
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.removeEventListener('click', this.handleDifficultyClick);
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.changeDifficulty(btn.dataset.difficulty);
            };
            btn.addEventListener('click', handler);
            btn._handler = handler;
        });
    }

    changeDifficulty(difficulty) {
        this.currentDifficulty = difficulty;

        // Обновляем UI
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.difficulty === difficulty) {
                btn.classList.add('active');
            }
        });

        localStorage.setItem('currentDifficulty', difficulty);
        this.loadLevels();
        console.log('Difficulty changed to:', difficulty);
    }

    initUserData() {
        try {
            // Загружаем данные из localStorage
            this.coins = parseInt(localStorage.getItem('coins') || '0');
            this.xp = parseInt(localStorage.getItem('xp') || '0');
            this.level = parseInt(localStorage.getItem('level') || '1');
            this.streak = parseInt(localStorage.getItem('streak') || '0');
            this.currentLanguage = localStorage.getItem('currentLanguage') || 'en';
            this.currentDifficulty = localStorage.getItem('currentDifficulty') || 'easy';

            // Устанавливаем активный язык в UI
            document.querySelectorAll('.lang-btn').forEach(btn => {
                if (btn.dataset.lang === this.currentLanguage) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Устанавливаем активную сложность
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.difficulty === this.currentDifficulty) {
                    btn.classList.add('active');
                }
            });

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
                streak: this.streak,
                currentLanguage: this.currentLanguage,
                difficulty: this.currentDifficulty
            });
        } catch (error) {
            console.error('Error initializing user data:', error);
        }
    }

    loadUserStats() {
        try {
            const savedStats = localStorage.getItem('userStats');
            if (savedStats) {
                this.stats = JSON.parse(savedStats);
            } else {
                // Инициализируем статистику
                this.stats = {
                    totalWordsLearned: 0,
                    totalExercisesDone: 0,
                    totalCorrectAnswers: 0,
                    totalWrongAnswers: 0,
                    languagesProgress: {},
                    levelsCompleted: 0,
                    achievementsUnlocked: 0,
                    totalCoinsEarned: 0,
                    totalXPEarned: 0,
                    bestStreak: 0
                };
            }
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    }

    saveUserStats() {
        try {
            localStorage.setItem('userStats', JSON.stringify(this.stats));
        } catch (error) {
            console.error('Error saving user stats:', error);
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

            // Обновляем лучшую серию
            if (this.streak > this.stats.bestStreak) {
                this.stats.bestStreak = this.streak;
            }

            localStorage.setItem('streak', this.streak.toString());
            localStorage.setItem('lastActive', today);
            this.saveUserStats();
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
            const maxLevels = this.currentDifficulty === 'easy' ? 10 :
                             this.currentDifficulty === 'medium' ? 15 : 20;

            for (let i = 1; i <= maxLevels; i++) {
                const levelButton = document.createElement('button');
                levelButton.className = 'level-btn';
                levelButton.setAttribute('data-level', i);

                const isCompleted = completedLevels.includes(`${this.currentLanguage}_${this.currentDifficulty}_${i}`);
                const isUnlocked = i === 1 || completedLevels.includes(`${this.currentLanguage}_${this.currentDifficulty}_${i-1}`);

                if (isCompleted) {
                    levelButton.classList.add('completed');
                }
                if (!isUnlocked) {
                    levelButton.classList.add('locked');
                }
                if (this.currentLevel === i) {
                    levelButton.classList.add('active');
                }

                const reward = this.currentDifficulty === 'easy' ? i * 10 :
                              this.currentDifficulty === 'medium' ? i * 15 : i * 20;

                levelButton.innerHTML = `
                    <span class="level-number">${i}</span>
                    <span class="level-status">${isCompleted ? '✅' : isUnlocked ? '🔓' : '🔒'}</span>
                    <span class="level-reward">${reward} 🪙</span>
                `;

                if (isUnlocked) {
                    levelButton.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.startLevel(i);
                    };
                }

                levelsContainer.appendChild(levelButton);
            }
        } catch (error) {
            console.error('Error loading levels:', error);
        }
    }

    startLevel(level) {
        try {
            console.log('Starting level:', level, 'difficulty:', this.currentDifficulty);

            this.currentLevel = level;
            this.currentWordIndex = 0;
            this.correctAnswers = 0;
            this.words = this.getWordsForLevel(level);
            this.testWords = [...this.words];

            console.log('Words for level:', this.words);

            // Показываем урок
            const levelsSection = document.querySelector('.levels-section');
            const currentLesson = document.getElementById('currentLesson');
            const levelResult = document.getElementById('levelResult');

            if (levelsSection) levelsSection.style.display = 'none';
            if (currentLesson) {
                currentLesson.style.display = 'block';
            }
            if (levelResult) levelResult.style.display = 'none';

            const lessonTitle = document.getElementById('lessonTitle');
            if (lessonTitle) {
                lessonTitle.textContent = `Уровень ${level}`;
            }

            // Обновляем бейдж сложности
            const difficultyBadge = document.querySelector('.difficulty-badge');
            if (difficultyBadge) {
                difficultyBadge.className = `difficulty-badge ${this.currentDifficulty}`;
                difficultyBadge.textContent = this.currentDifficulty === 'easy' ? 'ЛЕГКИЙ' :
                                             this.currentDifficulty === 'medium' ? 'СРЕДНИЙ' : 'СЛОЖНЫЙ';
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
            const wordsPerLevel = this.wordsInLevel[this.currentDifficulty];
            const startIndex = ((level - 1) * wordsPerLevel) % allWords.length;

            let words = [];
            for (let i = 0; i < wordsPerLevel; i++) {
                const wordIndex = (startIndex + i) % allWords.length;
                words.push(allWords[wordIndex]);
            }

            return words;
        } catch (error) {
            console.error('Error getting words for level:', error);
            return [];
        }
    }

    showCurrentWord() {
        try {
            if (this.currentWordIndex < this.words.length) {
                const word = this.words[this.currentWordIndex];

                console.log('Showing word:', word);

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
                if (nextWordBtn) {
                    nextWordBtn.style.display = 'none';
                    nextWordBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.nextWord();
                    };
                }
                if (startTestBtn) {
                    startTestBtn.style.display = 'none';
                    startTestBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.prepareTest();
                    };
                }
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

                // Обновляем обработчики кнопок
                const soundBtn = document.querySelector('.sound-btn');
                const showBtn = document.querySelector('.show-btn');

                if (soundBtn) {
                    soundBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.playWordSound();
                    };
                }

                if (showBtn) {
                    showBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.showTranslation();
                    };
                }

            } else {
                // Все слова изучены, показываем кнопку теста
                const wordCard = document.getElementById('wordCard');
                const startTestBtn = document.getElementById('startTestBtn');

                if (wordCard) wordCard.style.display = 'none';
                if (startTestBtn) {
                    startTestBtn.style.display = 'block';
                    startTestBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.prepareTest();
                    };
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
                nextWordBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.nextWord();
                };
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
            console.log('Next word, current index:', this.currentWordIndex);

            // Отмечаем слово как изученное
            if (this.currentWordIndex < this.words.length) {
                this.addLearnedWord(this.words[this.currentWordIndex]);
            }

            this.currentWordIndex++;
            console.log('New index:', this.currentWordIndex);

            this.showCurrentWord();
            this.updateProgressSteps();
        } catch (error) {
            console.error('Error moving to next word:', error);
        }
    }

    prepareTest() {
        try {
            console.log('Preparing test');

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

            const optionsCount = this.currentDifficulty === 'easy' ? 3 :
                                this.currentDifficulty === 'medium' ? 4 : 5;

            while (options.length < optionsCount) {
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
                this.stats.totalCorrectAnswers++;

                const coinReward = this.currentDifficulty === 'easy' ? 5 :
                                  this.currentDifficulty === 'medium' ? 8 : 12;
                const xpReward = this.currentDifficulty === 'easy' ? 10 :
                                this.currentDifficulty === 'medium' ? 15 : 20;

                this.addCoins(coinReward);
                this.addXP(xpReward);

                // Визуальный эффект
                tg.HapticFeedback.notificationOccurred('success');

                // Отмечаем кнопку как правильную
                button.classList.add('correct');
                button.disabled = true;

                // Блокируем все кнопки в этой группе
                const buttons = button.parentElement.querySelectorAll('.test-option');
                buttons.forEach(btn => {
                    btn.disabled = true;
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
                this.stats.totalWrongAnswers++;

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
                    this.stats.totalWrongAnswers--; // Откатываем статистику ошибок
                }
            }

            this.stats.totalExercisesDone++;
            this.saveUserStats();
        } catch (error) {
            console.error('Error checking test answer:', error);
        }
    }

    completeLevel() {
        try {
            console.log('Completing level', this.currentLevel);

            // Начисляем награды
            const baseReward = this.currentLevel * 10;
            const difficultyMultiplier = this.currentDifficulty === 'easy' ? 1 :
                                        this.currentDifficulty === 'medium' ? 1.5 : 2;
            const reward = Math.floor(baseReward * difficultyMultiplier);

            this.addCoins(reward);
            this.addXP(50 * difficultyMultiplier);

            this.stats.totalCoinsEarned += reward;
            this.stats.totalXPEarned += 50 * difficultyMultiplier;
            this.stats.levelsCompleted++;

            // Отмечаем уровень как пройденный
            const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
            const levelKey = `${this.currentLanguage}_${this.currentDifficulty}_${this.currentLevel}`;

            if (!completedLevels.includes(levelKey)) {
                completedLevels.push(levelKey);
                localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
            }

            // Обновляем прогресс по языку
            if (!this.stats.languagesProgress[this.currentLanguage]) {
                this.stats.languagesProgress[this.currentLanguage] = {
                    wordsLearned: 0,
                    levelsCompleted: 0,
                    exercisesDone: 0
                };
            }
            this.stats.languagesProgress[this.currentLanguage].levelsCompleted++;
            this.stats.languagesProgress[this.currentLanguage].exercisesDone += this.words.length;

            this.saveUserStats();

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
                if (earnedXpEl) earnedXpEl.textContent = Math.floor(50 * difficultyMultiplier);
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
            console.log('Going to next level, current:', this.currentLevel);

            const maxLevels = this.currentDifficulty === 'easy' ? 10 :
                             this.currentDifficulty === 'medium' ? 15 : 20;

            if (this.currentLevel < maxLevels) {
                const nextLevel = this.currentLevel + 1;
                console.log('Starting next level:', nextLevel);

                // Скрываем результаты
                const levelResult = document.getElementById('levelResult');
                if (levelResult) levelResult.style.display = 'none';

                // Запускаем следующий уровень
                this.startLevel(nextLevel);
            } else {
                // Если достигнут максимум, показываем уровни
                this.showSection('levels');
            }
        } catch (error) {
            console.error('Error going to next level:', error);
        }
    }

    repeatLevel() {
        try {
            console.log('Repeating level:', this.currentLevel);

            // Скрываем результаты
            const levelResult = document.getElementById('levelResult');
            if (levelResult) levelResult.style.display = 'none';

            // Повторяем текущий уровень
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
                    level: this.currentLevel,
                    difficulty: this.currentDifficulty
                });

                localStorage.setItem('learnedWords', JSON.stringify(learnedWords));
                this.stats.totalWordsLearned++;

                // Обновляем прогресс по языку
                if (!this.stats.languagesProgress[this.currentLanguage]) {
                    this.stats.languagesProgress[this.currentLanguage] = {
                        wordsLearned: 0,
                        levelsCompleted: 0,
                        exercisesDone: 0
                    };
                }
                this.stats.languagesProgress[this.currentLanguage].wordsLearned++;

                this.saveUserStats();
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
                const percentage = xpNeededForNext > 0 ? (xpProgress / xpNeededForNext) * 100 : 0;

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

            const totalWords = this.wordsInLevel[this.currentDifficulty];

            for (let i = 0; i < totalWords; i++) {
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
                this.stats.achievementsUnlocked++;
            }
            if (learnedWords.length >= 50 && !achievements.includes('word_enthusiast')) {
                achievements.push('word_enthusiast');
                newAchievements.push({
                    emoji: '📚',
                    title: 'Энтузиаст',
                    desc: 'Выучить 50 слов'
                });
                this.addCoins(100);
                this.stats.achievementsUnlocked++;
            }
            if (learnedWords.length >= 100 && !achievements.includes('word_master')) {
                achievements.push('word_master');
                newAchievements.push({
                    emoji: '👑',
                    title: 'Мастер слов',
                    desc: 'Выучить 100 слов'
                });
                this.addCoins(200);
                this.stats.achievementsUnlocked++;
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
                this.stats.achievementsUnlocked++;
            }
            if (this.streak >= 30 && !achievements.includes('streak_month')) {
                achievements.push('streak_month');
                newAchievements.push({
                    emoji: '⚡',
                    title: 'Месяц',
                    desc: 'Заниматься 30 дней подряд'
                });
                this.addCoins(150);
                this.stats.achievementsUnlocked++;
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
                this.stats.achievementsUnlocked++;
            }

            if (newAchievements.length > 0) {
                localStorage.setItem('achievements', JSON.stringify(achievements));
                this.showAchievements(newAchievements);
            }

            this.saveUserStats();
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

            this.showNotification(`🏆 Новые достижения!`);
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
                        this.showNotification('💡 Подсказка куплена! Используйте её в тесте.');
                        break;
                    case 'double':
                        this.bonuses.doubleCoins = true;
                        // Действует 24 часа (можно добавить таймер)
                        localStorage.setItem('doubleCoinsUntil', Date.now() + 24*60*60*1000);
                        this.showNotification('2️⃣ Двойные монеты активированы на 24 часа!');
                        break;
                    case 'shield':
                        this.bonuses.shield = true;
                        this.showNotification('🛡️ Защита активирована! Одна ошибка не засчитывается.');
                        break;
                    case 'time':
                        this.bonuses.time++;
                        this.showNotification('⏱️ Дополнительное время куплено!');
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
            console.log('Showing section:', section);

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

            if (levelsSection) levelsSection.style.display = 'none';
            if (currentLesson) currentLesson.style.display = 'none';
            if (levelResult) levelResult.style.display = 'none';
            if (shopSection) shopSection.style.display = 'none';

            // Показываем нужную секцию
            switch(section) {
                case 'игра':
                case 'game':
                    if (levelsSection) {
                        levelsSection.style.display = 'block';
                        this.loadLevels();
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

            // Считаем точность
            const totalAnswers = this.stats.totalCorrectAnswers + this.stats.totalWrongAnswers;
            const accuracy = totalAnswers > 0 ?
                Math.round((this.stats.totalCorrectAnswers / totalAnswers) * 100) : 0;

            const langNames = {
                'en': '🇬🇧 Английский',
                'es': '🇪🇸 Испанский',
                'fr': '🇫🇷 Французский',
                'de': '🇩🇪 Немецкий',
                'it': '🇮🇹 Итальянский',
                'ja': '🇯🇵 Японский'
            };

            let languageStatsText = '';
            for (let lang in this.stats.languagesProgress) {
                const progress = this.stats.languagesProgress[lang];
                languageStatsText += `
                    <p>
                        <span>${langNames[lang] || lang}</span>
                        <strong>${progress.wordsLearned} слов | ${progress.levelsCompleted} ур.</strong>
                    </p>
                `;
            }

            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="stats-modal">
                    <h3>📊 Статистика</h3>
                    <div class="stats-list">
                        <p><span>🔥 Текущая серия:</span> <strong>${this.streak} дней</strong></p>
                        <p><span>🏆 Лучшая серия:</span> <strong>${this.stats.bestStreak || 0} дней</strong></p>
                        <p><span>📚 Всего слов:</span> <strong>${learnedWords.length}</strong></p>
                        <p><span>🎮 Пройдено уровней:</span> <strong>${completedLevels.length}</strong></p>
                        <p><span>💪 Упражнений:</span> <strong>${this.stats.totalExercisesDone || 0}</strong></p>
                        <p><span>🎯 Точность:</span> <strong>${accuracy}%</strong></p>
                        <p><span>✅ Правильно:</span> <strong>${this.stats.totalCorrectAnswers || 0}</strong></p>
                        <p><span>❌ Ошибок:</span> <strong>${this.stats.totalWrongAnswers || 0}</strong></p>
                        <p><span>⭐ Уровень:</span> <strong>${this.level}</strong></p>
                        <p><span>✨ Опыт:</span> <strong>${this.xp}</strong></p>
                        <p><span>🪙 Монеты всего:</span> <strong>${this.stats.totalCoinsEarned || 0}</strong></p>
                        <p><span>🏆 Достижений:</span> <strong>${achievements.length}</strong></p>
                    </div>

                    <h4 style="margin: 20px 0 10px;">🌍 Прогресс по языкам:</h4>
                    <div class="stats-list">
                        ${languageStatsText || '<p>Нет данных</p>'}
                    </div>

                    <button class="close-btn" onclick="this.closest('.modal').remove()">Закрыть</button>
                </div>
            `;

            document.body.appendChild(modal);
        } catch (error) {
            console.error('Error showing stats:', error);
        }
    }

    showProfile() {
        try {
            const user = tg.initDataUnsafe?.user;

            // Проверяем активные бонусы
            const doubleCoinsUntil = localStorage.getItem('doubleCoinsUntil');
            const doubleCoinsActive = doubleCoinsUntil && parseInt(doubleCoinsUntil) > Date.now();
            if (!doubleCoinsActive && this.bonuses.doubleCoins) {
                this.bonuses.doubleCoins = false;
                localStorage.setItem('bonuses', JSON.stringify(this.bonuses));
            }

            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="profile-modal">
                    <h3>👤 Профиль</h3>
                    <div class="profile-info">
                        <p><strong>👤 Имя:</strong> ${user?.first_name || 'Гость'}</p>
                        <p><strong>📝 Фамилия:</strong> ${user?.last_name || '—'}</p>
                        <p><strong>🔹 Username:</strong> @${user?.username || 'не указан'}</p>
                        <p><strong>🆔 ID:</strong> ${user?.id || 'local'}</p>
                        <p><strong>🌐 Язык:</strong> ${user?.language_code || 'ru'}</p>
                        <p><strong>📅 Регистрация:</strong> ${new Date().toLocaleDateString()}</p>
                    </div>

                    <div class="bonuses-info">
                        <h4>🎁 Активные бонусы:</h4>
                        <p>💡 Подсказки: <strong>${this.bonuses.hints}</strong></p>
                        <p>2️⃣ Двойные монеты: <strong>${this.bonuses.doubleCoins ? '✅ Активен' : '❌ Не активен'}</strong></p>
                        <p>🛡️ Защита: <strong>${this.bonuses.shield ? '✅ Активна' : '❌ Не активна'}</strong></p>
                        <p>⏱️ Доп. время: <strong>${this.bonuses.time || 0}</strong></p>
                    </div>

                    <div class="stats-list" style="margin: 20px 0;">
                        <h4>📊 Краткая статистика:</h4>
                        <p><span>📚 Всего слов:</span> <strong>${JSON.parse(localStorage.getItem('learnedWords') || '[]').length}</strong></p>
                        <p><span>🔥 Серия:</span> <strong>${this.streak} дней</strong></p>
                        <p><span>⭐ Уровень:</span> <strong>${this.level}</strong></p>
                        <p><span>🪙 Монеты:</span> <strong>${this.coins}</strong></p>
                    </div>

                    <button class="close-btn" onclick="this.closest('.modal').remove()">Закрыть</button>
                </div>
            `;

            document.body.appendChild(modal);
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