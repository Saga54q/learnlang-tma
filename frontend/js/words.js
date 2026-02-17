const WORDS_DATABASE = {
    en: [
        // Уровень 1 (Приветствия)
        { id: 1, word: "Hello", translation: "Привет", category: "greetings", difficulty: 1, emoji: "👋" },
        { id: 2, word: "Goodbye", translation: "До свидания", category: "greetings", difficulty: 1, emoji: "👋" },
        { id: 3, word: "Good morning", translation: "Доброе утро", category: "greetings", difficulty: 1, emoji: "🌅" },

        // Уровень 2 (Основные фразы)
        { id: 4, word: "Thank you", translation: "Спасибо", category: "phrases", difficulty: 1, emoji: "🙏" },
        { id: 5, word: "Please", translation: "Пожалуйста", category: "phrases", difficulty: 1, emoji: "🤲" },
        { id: 6, word: "Sorry", translation: "Извините", category: "phrases", difficulty: 1, emoji: "😔" },

        // Уровень 3 (Семья)
        { id: 7, word: "Mother", translation: "Мама", category: "family", difficulty: 1, emoji: "👩" },
        { id: 8, word: "Father", translation: "Папа", category: "family", difficulty: 1, emoji: "👨" },
        { id: 9, word: "Brother", translation: "Брат", category: "family", difficulty: 1, emoji: "👦" },

        // Уровень 4 (Еда)
        { id: 10, word: "Apple", translation: "Яблоко", category: "food", difficulty: 1, emoji: "🍎" },
        { id: 11, word: "Bread", translation: "Хлеб", category: "food", difficulty: 1, emoji: "🍞" },
        { id: 12, word: "Water", translation: "Вода", category: "drinks", difficulty: 1, emoji: "💧" },

        // Уровень 5 (Животные)
        { id: 13, word: "Cat", translation: "Кошка", category: "animals", difficulty: 1, emoji: "🐱" },
        { id: 14, word: "Dog", translation: "Собака", category: "animals", difficulty: 1, emoji: "🐶" },
        { id: 15, word: "Bird", translation: "Птица", category: "animals", difficulty: 1, emoji: "🐦" },

        // Уровень 6 (Цвета)
        { id: 16, word: "Red", translation: "Красный", category: "colors", difficulty: 1, emoji: "🔴" },
        { id: 17, word: "Blue", translation: "Синий", category: "colors", difficulty: 1, emoji: "🔵" },
        { id: 18, word: "Green", translation: "Зеленый", category: "colors", difficulty: 1, emoji: "🟢" },

        // Уровень 7 (Числа)
        { id: 19, word: "One", translation: "Один", category: "numbers", difficulty: 1, emoji: "1️⃣" },
        { id: 20, word: "Two", translation: "Два", category: "numbers", difficulty: 1, emoji: "2️⃣" },
        { id: 21, word: "Three", translation: "Три", category: "numbers", difficulty: 1, emoji: "3️⃣" },

        // Уровень 8 (Глаголы)
        { id: 22, word: "Go", translation: "Идти", category: "verbs", difficulty: 2, emoji: "🚶" },
        { id: 23, word: "Eat", translation: "Есть", category: "verbs", difficulty: 2, emoji: "🍽️" },
        { id: 24, word: "Sleep", translation: "Спать", category: "verbs", difficulty: 2, emoji: "😴" },

        // Уровень 9 (Одежда)
        { id: 25, word: "Shirt", translation: "Рубашка", category: "clothes", difficulty: 2, emoji: "👕" },
        { id: 26, word: "Shoes", translation: "Обувь", category: "clothes", difficulty: 2, emoji: "👟" },
        { id: 27, word: "Hat", translation: "Шапка", category: "clothes", difficulty: 2, emoji: "🧢" },

        // Уровень 10 (Погода)
        { id: 28, word: "Sun", translation: "Солнце", category: "weather", difficulty: 2, emoji: "☀️" },
        { id: 29, word: "Rain", translation: "Дождь", category: "weather", difficulty: 2, emoji: "🌧️" },
        { id: 30, word: "Snow", translation: "Снег", category: "weather", difficulty: 2, emoji: "❄️" },
    ],

    es: [
        { id: 101, word: "Hola", translation: "Привет", category: "greetings", emoji: "👋" },
        { id: 102, word: "Adiós", translation: "До свидания", category: "greetings", emoji: "👋" },
        { id: 103, word: "Gracias", translation: "Спасибо", category: "phrases", emoji: "🙏" },
        // Добавьте остальные слова по аналогии...
    ]

    // Добавьте другие языки...
};