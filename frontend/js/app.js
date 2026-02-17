// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// Глобальные переменные
let currentTab = 'home';
let currentExerciseTab = 'daily';

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем данные пользователя
    exerciseManager.initUserData();

    // Загружаем статистику
    loadUserStats();

    // Загружаем слово дня
    loadWordOfTheDay();

    // Загружаем ежедневные задания
    loadDailyTasks();

    // Настраиваем обработчики для кнопок языков
    setupLanguageButtons();

    // Главная кнопка Telegram
    setupMainButton();
});

// Загрузка статистики пользователя
function loadUserStats() {
    const stats = userDataManager.getUserStats();

    document.getElementById('streak').textContent = stats.streak;
    document.getElementById('words').textContent = stats.learnedWords;
    document.getElementById('level').textContent = stats.level;

    exerciseManager.updateXpBar(stats.xp);
}

// Загрузка слова дня
function loadWordOfTheDay() {
    const word = exerciseManager.getWordOfTheDay();

    document.getElementById('dailyWord').textContent = `"${word.word}"`;
    document.getElementById('dailyTranslation').textContent = word.translation;
    document.getElementById('dailyCategory').textContent = word.category;
}

// Загрузка ежедневных заданий
function loadDailyTasks() {
    const today = new Date().toDateString();
    const tasks = JSON.parse(localStorage.getItem('dailyTasks') || '{}');
    const todayTasks = tasks[today] || { words: 0, exercises: 0, listening: 0 };

    exerciseManager.updateDailyTasksUI(todayTasks);
}

// Настройка кнопок выбора языка
function setupLanguageButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.lang-btn').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');

            const lang = this.dataset.lang;
            exerciseManager.setLanguage(lang);

            // Обновляем слово дня для выбранного языка
            loadWordOfTheDay();

            // Отправляем вибрацию
            tg.HapticFeedback.impactOccurred('soft');
        });
    });
}

// Настройка главной кнопки
function setupMainButton() {
    tg.MainButton.setText('Начать упражнение');
    tg.MainButton.show();
    tg.MainButton.onClick(() => {
        startNewExercise();
    });
}

// Переключение между вкладками
function switchTab(tabName) {
    // Обновляем активную кнопку в навигации
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    currentTab = tabName;

    // Обновляем контент в зависимости от вкладки
    switch(tabName) {
        case 'home':
            showHomeTab();
            break;
        case 'learn':
            showLearnTab();
            break;
        case 'exercises':
            showExercisesTab();
            break;
        case 'progress':
            showProgressTab();
            break;
        case 'profile':
            showProfileTab();
            break;
    }

    tg.HapticFeedback.selectionChanged();
}

// Переключение между вкладками упражнений
function switchExerciseTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    document.getElementById(tabName + 'Tab').classList.add('active');

    // Генерируем соответствующее упражнение
    switch(tabName) {
        case 'daily':
            // Уже загружено
            break;
        case 'translate':
            generateTranslateExercise();
            break;
        case 'quiz':
            generateQuizExercise();
            break;
        case 'match':
            generateMatchExercise();
            break;
    }
}

// Генерация упражнения на перевод
function generateTranslateExercise() {
    const exercise = exerciseManager.generateTranslationExercise();
    exerciseManager.currentExercise = exercise;

    document.getElementById('translateWord').textContent = exercise.question;

    const optionsContainer = document.getElementById('translateOptions');
    optionsContainer.innerHTML = '';

    exercise.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => checkTranslateAnswer(option, exercise.correct, exercise.wordData);
        optionsContainer.appendChild(btn);
    });

    document.getElementById('translateFeedback').innerHTML = '';
}

// Проверка ответа в переводе
function checkTranslateAnswer(selected, correct, wordData) {
    const isCorrect = exerciseManager.checkTranslationAnswer(selected, correct);
    const feedback = document.getElementById('translateFeedback');

    if (isCorrect) {
        feedback.innerHTML = '✅ Правильно! +10 XP';
        feedback.style.color = '#4CAF50';

        // Добавляем слово в выученные
        exerciseManager.addLearnedWord(wordData);

        // Обновляем статистику
        userDataManager.updateStats('translation', true);

        // Генерируем новое упражнение через 2 секунды
        setTimeout(() => {
            generateTranslateExercise();
        }, 2000);
    } else {
        feedback.innerHTML = '❌ Неправильно. Попробуй еще!';
        feedback.style.color = '#f44336';
        userDataManager.updateStats('translation', false);
    }

    // Вибрация
    tg.HapticFeedback.notificationOccurred(isCorrect ? 'success' : 'error');
}

// Генерация упражнения-викторины
function generateQuizExercise() {
    const exercise = exerciseManager.generateQuizExercise();
    exerciseManager.currentExercise = exercise;

    document.getElementById('quizWord').textContent = exercise.question;

    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = '';

    exercise.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => checkQuizAnswer(option, exercise.correct, exercise.wordData);
        optionsContainer.appendChild(btn);
    });

    document.getElementById('quizFeedback').innerHTML = '';
}

// Проверка ответа в викторине
function checkQuizAnswer(selected, correct, wordData) {
    const isCorrect = exerciseManager.checkQuizAnswer(selected, correct);
    const feedback = document.getElementById('quizFeedback');

    if (isCorrect) {
        feedback.innerHTML = '✅ Правильно! +15 XP';
        feedback.style.color = '#4CAF50';

        exerciseManager.addLearnedWord(wordData);
        userDataManager.updateStats('quiz', true);

        setTimeout(() => {
            generateQuizExercise();
        }, 2000);
    } else {
        feedback.innerHTML = '❌ Неправильно. Попробуй еще!';
        feedback.style.color = '#f44336';
        userDataManager.updateStats('quiz', false);
    }

    tg.HapticFeedback.notificationOccurred(isCorrect ? 'success' : 'error');
}

// Генерация упражнения на сопоставление
function generateMatchExercise() {
    const exercise = exerciseManager.generateMatchExercise();
    exerciseManager.currentExercise = exercise;

    const gameContainer = document.getElementById('matchGame');
    gameContainer.innerHTML = '';

    // Создаем левую колонку
    const leftColumn = document.createElement('div');
    leftColumn.className = 'match-column';
    leftColumn.id = 'matchLeft';

    exercise.leftItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'match-card';
        card.setAttribute('data-id', item.id);
        card.textContent = item.text;
        card.onclick = () => selectMatchCard('left', item.id, card);
        leftColumn.appendChild(card);
    });

    // Создаем правую колонку
    const rightColumn = document.createElement('div');
    rightColumn.className = 'match-column';
    rightColumn.id = 'matchRight';

    exercise.rightItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'match-card';
        card.setAttribute('data-id', item.id);
        card.textContent = item.text;
        card.onclick = () => selectMatchCard('right', item.id, card);
        rightColumn.appendChild(card);
    });

    gameContainer.appendChild(leftColumn);
    gameContainer.appendChild(rightColumn);

    // Сохраняем пары для проверки
    gameContainer.dataset.pairs = JSON.stringify(exercise.pairs);

    // Сбрасываем выбранные элементы
    window.selectedLeft = null;
    window.selectedRight = null;
}

// Выбор карточки для сопоставления
function selectMatchCard(side, id, element) {
    // Убираем выделение с предыдущих
    document.querySelectorAll('.match-card.selected').forEach(card => {
        card.classList.remove('selected');
    });

    // Выделяем текущую карточку
    element.classList.add('selected');

    if (side === 'left') {
        window.selectedLeft = id;
    } else {
        window.selectedRight = id;
    }

    // Если выбраны обе карточки, проверяем пару
    if (window.selectedLeft && window.selectedRight) {
        checkMatchPair();
    }
}

// Проверка пары в сопоставлении
function checkMatchPair() {
    const gameContainer = document.getElementById('matchGame');
    const pairs = JSON.parse(gameContainer.dataset.pairs);

    const isCorrect = exerciseManager.checkMatch(window.selectedLeft, window.selectedRight, pairs);
    const feedback = document.getElementById('matchFeedback');

    if (isCorrect) {
        feedback.innerHTML = '✅ Правильно! +5 XP';
        feedback.style.color = '#4CAF50';

        // Скрываем или отмечаем использованные карточки
        document.querySelectorAll(`.match-card[data-id="${window.selectedLeft}"], .match-card[data-id="${window.selectedRight}"]`).forEach(card => {
            card.style.opacity = '0.5';
            card.classList.add('matched');
            card.onclick = null;
        });

        tg.HapticFeedback.impactOccurred('light');

        // Проверяем, все ли карточки сопоставлены
        const matchedCards = document.querySelectorAll('.match-card.matched').length;
        if (matchedCards === 8) { // 4 пары * 2 карточки = 8
            setTimeout(() => {
                feedback.innerHTML = '🎉 Упражнение завершено! +20 XP';
                exerciseManager.addXP(20);
                exerciseManager.updateDailyTask('exercises');

                setTimeout(() => {
                    generateMatchExercise();
                }, 2000);
            }, 1000);
        }
    } else {
        feedback.innerHTML = '❌ Неправильная пара. Попробуй еще!';
        feedback.style.color = '#f44336';
        tg.HapticFeedback.notificationOccurred('error');
    }

    // Сбрасываем выделение
    document.querySelectorAll('.match-card.selected').forEach(card => {
        card.classList.remove('selected');
    });
    window.selectedLeft = null;
    window.selectedRight = null;
}

// Отметить слово как выученное
function markWordAsLearned() {
    const word = exerciseManager.getWordOfTheDay();
    exerciseManager.addLearnedWord(word);
    exerciseManager.addXP(5);

    document.getElementById('translateFeedback').innerHTML = '✅ Слово добавлено в словарь!';

    tg.HapticFeedback.notificationOccurred('success');
}

// Воспроизведение произношения
function playPronunciation() {
    const word = document.getElementById('dailyWord').textContent.replace(/"/g, '');

    // Используем Web Speech API для произношения
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = exerciseManager.currentLanguage === 'en' ? 'en-US' :
                     exerciseManager.currentLanguage === 'es' ? 'es-ES' :
                     exerciseManager.currentLanguage === 'fr' ? 'fr-FR' : 'de-DE';

    window.speechSynthesis.speak(utterance);

    // Обновляем задание на аудирование
    exerciseManager.updateDailyTask('listening');

    tg.HapticFeedback.impactOccurred('light');
}

// Показать все достижения
function showAllAchievements() {
    // Переключаемся на вкладку прогресса
    document.querySelectorAll('.nav-btn')[3].click();
}

// Начать новое упражнение
function startNewExercise() {
    switchExerciseTab('translate');
}

// Показать главную вкладку
function showHomeTab() {
    loadWordOfTheDay();
}

// Показать вкладку обучения
function showLearnTab() {
    // Здесь можно показать список слов для изучения
}

// Показать вкладку упражнений
function showExercisesTab() {
    document.querySelector('.tabs').style.display = 'flex';
}

// Показать вкладку прогресса
function showProgressTab() {
    const stats = userDataManager.getUserStats();
    const progress = userDataManager.getLearningProgress();

    let html = '<div class="progress-detail">';
    html += `<h3>📊 Общая статистика</h3>`;
    html += `<p>🔥 Серия: ${stats.streak} дней</p>`;
    html += `<p>📚 Всего слов: ${stats.learnedWords}</p>`;
    html += `<p>💪 Упражнений: ${stats.stats.totalExercises || 0}</p>`;
    html += `<p>🎯 Точность: ${stats.stats.totalExercises ? Math.round((stats.stats.correctAnswers / stats.stats.totalExercises) * 100) : 0}%</p>`;

    html += `<h3>🌍 Прогресс по языкам</h3>`;
    for (let lang in progress) {
        const langNames = {'en': '🇬🇧', 'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪'};
        html += `<p>${langNames[lang] || '📌'} ${lang}: ${progress[lang].length} слов</p>`;
    }

    html += '</div>';

    // Здесь нужно создать или показать элемент с прогрессом
}

// Показать вкладку профиля
function showProfileTab() {
    const user = tg.initDataUnsafe?.user;
    const stats = userDataManager.getUserStats();

    let html = '<div class="profile-detail">';
    html += `<h3>👤 Профиль</h3>`;
    if (user) {
        html += `<p>Имя: ${user.first_name} ${user.last_name || ''}</p>`;
        html += `<p>Username: @${user.username || 'не указан'}</p>`;
    }
    html += `<p>⭐ Уровень: ${stats.level}</p>`;
    html += `<p>✨ Опыт: ${stats.xp}</p>`;
    html += `<p>🏆 Достижений: ${stats.achievements}</p>`;
    html += '</div>';

    // Здесь нужно создать или показать элемент с профилем
}

// Добавляем стили для уведомлений и новых элементов
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary-gradient);
        color: white;
        padding: 12px 24px;
        border-radius: 30px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
        from {
            top: -50px;
            opacity: 0;
        }
        to {
            top: 20px;
            opacity: 1;
        }
    }

    .xp-bar-container {
        background: #f0f0f0;
        height: 20px;
        border-radius: 10px;
        margin: 15px 0;
        position: relative;
        overflow: hidden;
    }

    .xp-bar {
        background: linear-gradient(90deg, #667eea, #764ba2);
        height: 100%;
        border-radius: 10px;
        transition: width 0.3s ease;
    }

    .xp-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #333;
        font-size: 12px;
        font-weight: bold;
        text-shadow: 0 0 5px white;
    }

    .tabs {
        display: flex;
        gap: 10px;
        margin: 20px 0;
        overflow-x: auto;
        padding: 5px 0;
    }

    .tab-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 25px;
        background: #f0f0f0;
        color: #666;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.3s ease;
    }

    .tab-btn.active {
        background: var(--primary-gradient);
        color: white;
    }

    .tab-content {
        display: none;
    }

    .tab-content.active {
        display: block;
    }

    .options-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        margin: 20px 0;
    }

    .option-btn {
        padding: 15px;
        border: 2px solid #e0e0e0;
        border-radius: 15px;
        background: white;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .option-btn:hover {
        border-color: #667eea;
        transform: scale(1.02);
    }

    .match-game {
        display: flex;
        justify-content: space-around;
        gap: 20px;
        margin: 20px 0;
    }

    .match-column {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .match-card {
        padding: 15px;
        background: white;
        border: 2px solid #e0e0e0;
        border-radius: 15px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .match-card.selected {
        border-color: #667eea;
        background: rgba(102, 126, 234, 0.1);
        transform: scale(1.02);
    }

    .match-card.matched {
        opacity: 0.5;
        cursor: default;
    }

    .feedback {
        text-align: center;
        font-size: 18px;
        font-weight: 600;
        margin: 20px 0;
        min-height: 30px;
    }

    .daily-tasks {
        background: white;
        border-radius: 20px;
        padding: 20px;
        margin: 20px 0;
        box-shadow: var(--card-shadow);
    }

    .task-item {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 15px 0;
    }

    .task-name {
        flex: 2;
        font-size: 14px;
    }

    .task-progress {
        flex: 3;
        height: 8px;
        background: #f0f0f0;
        border-radius: 4px;
        overflow: hidden;
    }

    .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        border-radius: 4px;
        transition: width 0.3s ease;
    }

    .task-count {
        flex: 1;
        font-size: 12px;
        color: #666;
    }

    .achievements-section {
        background: white;
        border-radius: 20px;
        padding: 20px;
        margin: 20px 0;
        box-shadow: var(--card-shadow);
    }

    .achievements-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin: 15px 0;
    }

    .achievement-badge {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        border-radius: 15px;
        min-width: 150px;
    }

    .view-all-btn {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 25px;
        background: var(--primary-gradient);
        color: white;
        font-weight: 600;
        cursor: pointer;
    }

    .learn-btn {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 25px;
        background: #4CAF50;
        color: white;
        font-weight: 600;
        margin-top: 10px;
        cursor: pointer;
    }
`;

document.head.appendChild(style);