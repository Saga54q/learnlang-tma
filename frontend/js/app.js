// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand(); // Разворачиваем на весь экран
tg.enableClosingConfirmation(); // Подтверждение при закрытии

// Получаем данные пользователя
let user = tg.initDataUnsafe?.user;
if (user) {
    console.log('Пользователь:', user);
    // Здесь можно персонализировать приветствие
}

// Основные функции
function playPronunciation() {
    tg.HapticFeedback.impactOccurred('medium');
    alert('Воспроизведение звука (демо-режим)');
}

function startExercise(type) {
    tg.HapticFeedback.impactOccurred('light');
    alert(`Начинаем упражнение: ${type} (демо-режим)`);
}

function showTab(tabName) {
    // Обновляем активную кнопку
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    tg.HapticFeedback.selectionChanged();

    // Здесь можно добавить логику переключения вкладок
    console.log('Переключение на вкладку:', tabName);
}

// Обработка выбора языка
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.lang-btn').forEach(b => {
            b.classList.remove('active');
        });
        this.classList.add('active');

        const lang = this.dataset.lang;
        tg.HapticFeedback.impactOccurred('soft');
        console.log('Выбран язык:', lang);

        // Здесь можно загружать слова для выбранного языка
    });
});

// Главная кнопка Telegram
tg.MainButton.setText('Начать урок');
tg.MainButton.show();
tg.MainButton.onClick(function() {
    tg.HapticFeedback.notificationOccurred('success');
    alert('Начинаем ежедневный урок!');
});

// Закрытие приложения
tg.onEvent('popupClosed', function() {
    console.log('Popup closed');
});