// База данных слов для изучения (50+ слов на каждый язык)
const WORDS_DATABASE = {
    en: [
        // Greetings (Приветствия)
        { id: 1, word: "Hello", translation: "Привет", category: "greetings", difficulty: 1 },
        { id: 2, word: "Goodbye", translation: "До свидания", category: "greetings", difficulty: 1 },
        { id: 3, word: "Good morning", translation: "Доброе утро", category: "greetings", difficulty: 1 },
        { id: 4, word: "Good night", translation: "Спокойной ночи", category: "greetings", difficulty: 1 },
        { id: 5, word: "How are you?", translation: "Как дела?", category: "phrases", difficulty: 1 },

        // Basic phrases (Основные фразы)
        { id: 6, word: "Thank you", translation: "Спасибо", category: "phrases", difficulty: 1 },
        { id: 7, word: "Please", translation: "Пожалуйста", category: "phrases", difficulty: 1 },
        { id: 8, word: "Sorry", translation: "Извините", category: "phrases", difficulty: 1 },
        { id: 9, word: "Yes", translation: "Да", category: "basics", difficulty: 1 },
        { id: 10, word: "No", translation: "Нет", category: "basics", difficulty: 1 },

        // Family (Семья)
        { id: 11, word: "Mother", translation: "Мама", category: "family", difficulty: 1 },
        { id: 12, word: "Father", translation: "Папа", category: "family", difficulty: 1 },
        { id: 13, word: "Brother", translation: "Брат", category: "family", difficulty: 1 },
        { id: 14, word: "Sister", translation: "Сестра", category: "family", difficulty: 1 },
        { id: 15, word: "Grandmother", translation: "Бабушка", category: "family", difficulty: 2 },
        { id: 16, word: "Grandfather", translation: "Дедушка", category: "family", difficulty: 2 },

        // Food (Еда)
        { id: 17, word: "Apple", translation: "Яблоко", category: "food", difficulty: 1 },
        { id: 18, word: "Banana", translation: "Банан", category: "food", difficulty: 1 },
        { id: 19, word: "Bread", translation: "Хлеб", category: "food", difficulty: 1 },
        { id: 20, word: "Water", translation: "Вода", category: "drinks", difficulty: 1 },
        { id: 21, word: "Milk", translation: "Молоко", category: "drinks", difficulty: 1 },
        { id: 22, word: "Coffee", translation: "Кофе", category: "drinks", difficulty: 1 },
        { id: 23, word: "Tea", translation: "Чай", category: "drinks", difficulty: 1 },

        // Animals (Животные)
        { id: 24, word: "Cat", translation: "Кошка", category: "animals", difficulty: 1 },
        { id: 25, word: "Dog", translation: "Собака", category: "animals", difficulty: 1 },
        { id: 26, word: "Bird", translation: "Птица", category: "animals", difficulty: 1 },
        { id: 27, word: "Fish", translation: "Рыба", category: "animals", difficulty: 1 },

        // Colors (Цвета)
        { id: 28, word: "Red", translation: "Красный", category: "colors", difficulty: 1 },
        { id: 29, word: "Blue", translation: "Синий", category: "colors", difficulty: 1 },
        { id: 30, word: "Green", translation: "Зеленый", category: "colors", difficulty: 1 },
        { id: 31, word: "Yellow", translation: "Желтый", category: "colors", difficulty: 1 },
        { id: 32, word: "Black", translation: "Черный", category: "colors", difficulty: 1 },
        { id: 33, word: "White", translation: "Белый", category: "colors", difficulty: 1 },

        // Numbers (Числа)
        { id: 34, word: "One", translation: "Один", category: "numbers", difficulty: 1 },
        { id: 35, word: "Two", translation: "Два", category: "numbers", difficulty: 1 },
        { id: 36, word: "Three", translation: "Три", category: "numbers", difficulty: 1 },
        { id: 37, word: "Four", translation: "Четыре", category: "numbers", difficulty: 1 },
        { id: 38, word: "Five", translation: "Пять", category: "numbers", difficulty: 1 },

        // Verbs (Глаголы)
        { id: 39, word: "Go", translation: "Идти", category: "verbs", difficulty: 2 },
        { id: 40, word: "Come", translation: "Приходить", category: "verbs", difficulty: 2 },
        { id: 41, word: "See", translation: "Видеть", category: "verbs", difficulty: 2 },
        { id: 42, word: "Look", translation: "Смотреть", category: "verbs", difficulty: 2 },
        { id: 43, word: "Eat", translation: "Есть", category: "verbs", difficulty: 2 },
        { id: 44, word: "Drink", translation: "Пить", category: "verbs", difficulty: 2 },
        { id: 45, word: "Sleep", translation: "Спать", category: "verbs", difficulty: 2 },
        { id: 46, word: "Read", translation: "Читать", category: "verbs", difficulty: 2 },
        { id: 47, word: "Write", translation: "Писать", category: "verbs", difficulty: 2 },
        { id: 48, word: "Speak", translation: "Говорить", category: "verbs", difficulty: 2 },
        { id: 49, word: "Listen", translation: "Слушать", category: "verbs", difficulty: 2 },
        { id: 50, word: "Learn", translation: "Учить", category: "verbs", difficulty: 2 },
    ],

    es: [
        { id: 101, word: "Hola", translation: "Привет", category: "greetings", difficulty: 1 },
        { id: 102, word: "Adiós", translation: "До свидания", category: "greetings", difficulty: 1 },
        { id: 103, word: "Buenos días", translation: "Доброе утро", category: "greetings", difficulty: 1 },
        { id: 104, word: "Buenas noches", translation: "Спокойной ночи", category: "greetings", difficulty: 1 },
        { id: 105, word: "Gracias", translation: "Спасибо", category: "phrases", difficulty: 1 },
        { id: 106, word: "Por favor", translation: "Пожалуйста", category: "phrases", difficulty: 1 },
        { id: 107, word: "Lo siento", translation: "Извините", category: "phrases", difficulty: 1 },
        { id: 108, word: "Sí", translation: "Да", category: "basics", difficulty: 1 },
        { id: 109, word: "No", translation: "Нет", category: "basics", difficulty: 1 },
        { id: 110, word: "Madre", translation: "Мама", category: "family", difficulty: 1 },
        { id: 111, word: "Padre", translation: "Папа", category: "family", difficulty: 1 },
        { id: 112, word: "Hermano", translation: "Брат", category: "family", difficulty: 1 },
        { id: 113, word: "Hermana", translation: "Сестра", category: "family", difficulty: 1 },
        { id: 114, word: "Agua", translation: "Вода", category: "drinks", difficulty: 1 },
        { id: 115, word: "Leche", translation: "Молоко", category: "drinks", difficulty: 1 },
        { id: 116, word: "Café", translation: "Кофе", category: "drinks", difficulty: 1 },
        { id: 117, word: "Té", translation: "Чай", category: "drinks", difficulty: 1 },
        { id: 118, word: "Manzana", translation: "Яблоко", category: "food", difficulty: 1 },
        { id: 119, word: "Pan", translation: "Хлеб", category: "food", difficulty: 1 },
        { id: 120, word: "Gato", translation: "Кошка", category: "animals", difficulty: 1 },
        { id: 121, word: "Perro", translation: "Собака", category: "animals", difficulty: 1 },
        // Добавьте остальные слова по аналогии...
    ],

    fr: [
        { id: 201, word: "Bonjour", translation: "Привет/Здравствуйте", category: "greetings", difficulty: 1 },
        { id: 202, word: "Au revoir", translation: "До свидания", category: "greetings", difficulty: 1 },
        { id: 203, word: "Bonne nuit", translation: "Спокойной ночи", category: "greetings", difficulty: 1 },
        { id: 204, word: "Merci", translation: "Спасибо", category: "phrases", difficulty: 1 },
        { id: 205, word: "S'il vous plaît", translation: "Пожалуйста", category: "phrases", difficulty: 1 },
        { id: 206, word: "Pardon", translation: "Извините", category: "phrases", difficulty: 1 },
        { id: 207, word: "Oui", translation: "Да", category: "basics", difficulty: 1 },
        { id: 208, word: "Non", translation: "Нет", category: "basics", difficulty: 1 },
        { id: 209, word: "Mère", translation: "Мама", category: "family", difficulty: 1 },
        { id: 210, word: "Père", translation: "Папа", category: "family", difficulty: 1 },
        // Добавьте остальные слова...
    ],

    de: [
        { id: 301, word: "Hallo", translation: "Привет", category: "greetings", difficulty: 1 },
        { id: 302, word: "Auf Wiedersehen", translation: "До свидания", category: "greetings", difficulty: 1 },
        { id: 303, word: "Guten Morgen", translation: "Доброе утро", category: "greetings", difficulty: 1 },
        { id: 304, word: "Gute Nacht", translation: "Спокойной ночи", category: "greetings", difficulty: 1 },
        { id: 305, word: "Danke", translation: "Спасибо", category: "phrases", difficulty: 1 },
        { id: 306, word: "Bitte", translation: "Пожалуйста", category: "phrases", difficulty: 1 },
        { id: 307, word: "Entschuldigung", translation: "Извините", category: "phrases", difficulty: 1 },
        { id: 308, word: "Ja", translation: "Да", category: "basics", difficulty: 1 },
        { id: 309, word: "Nein", translation: "Нет", category: "basics", difficulty: 1 },
        // Добавьте остальные слова...
    ],

    it: [
        { id: 401, word: "Ciao", translation: "Привет", category: "greetings", difficulty: 1 },
        { id: 402, word: "Arrivederci", translation: "До свидания", category: "greetings", difficulty: 1 },
        { id: 403, word: "Buongiorno", translation: "Доброе утро", category: "greetings", difficulty: 1 },
        { id: 404, word: "Buona notte", translation: "Спокойной ночи", category: "greetings", difficulty: 1 },
        { id: 405, word: "Grazie", translation: "Спасибо", category: "phrases", difficulty: 1 },
        { id: 406, word: "Per favore", translation: "Пожалуйста", category: "phrases", difficulty: 1 },
        { id: 407, word: "Scusa", translation: "Извините", category: "phrases", difficulty: 1 },
        { id: 408, word: "Sì", translation: "Да", category: "basics", difficulty: 1 },
        { id: 409, word: "No", translation: "Нет", category: "basics", difficulty: 1 },
        // Добавьте остальные слова...
    ],

    ja: [
        { id: 501, word: "Konnichiwa", translation: "Здравствуйте", category: "greetings", difficulty: 2 },
        { id: 502, word: "Sayonara", translation: "До свидания", category: "greetings", difficulty: 2 },
        { id: 503, word: "Ohayou", translation: "Доброе утро", category: "greetings", difficulty: 2 },
        { id: 504, word: "Oyasumi", translation: "Спокойной ночи", category: "greetings", difficulty: 2 },
        { id: 505, word: "Arigatou", translation: "Спасибо", category: "phrases", difficulty: 2 },
        { id: 506, word: "Onegaishimasu", translation: "Пожалуйста", category: "phrases", difficulty: 2 },
        { id: 507, word: "Gomennasai", translation: "Извините", category: "phrases", difficulty: 2 },
        { id: 508, word: "Hai", translation: "Да", category: "basics", difficulty: 2 },
        { id: 509, word: "Iie", translation: "Нет", category: "basics", difficulty: 2 },
        // Добавьте остальные слова...
    ]
};