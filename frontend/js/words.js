const WORDS_DATABASE = {
    // ==================== АНГЛИЙСКИЙ ====================
    en: [
        // Уровень 1 (Greetings - Приветствия)
        { id: 1, word: "Hello", translation: "Привет", category: "greetings", difficulty: 1, emoji: "👋" },
        { id: 2, word: "Goodbye", translation: "До свидания", category: "greetings", difficulty: 1, emoji: "👋" },
        { id: 3, word: "Good morning", translation: "Доброе утро", category: "greetings", difficulty: 1, emoji: "🌅" },

        // Уровень 2 (Basic phrases - Основные фразы)
        { id: 4, word: "Thank you", translation: "Спасибо", category: "phrases", difficulty: 1, emoji: "🙏" },
        { id: 5, word: "Please", translation: "Пожалуйста", category: "phrases", difficulty: 1, emoji: "🤲" },
        { id: 6, word: "Sorry", translation: "Извините", category: "phrases", difficulty: 1, emoji: "😔" },

        // Уровень 3 (Family - Семья)
        { id: 7, word: "Mother", translation: "Мама", category: "family", difficulty: 1, emoji: "👩" },
        { id: 8, word: "Father", translation: "Папа", category: "family", difficulty: 1, emoji: "👨" },
        { id: 9, word: "Brother", translation: "Брат", category: "family", difficulty: 1, emoji: "👦" },

        // Уровень 4 (Food - Еда)
        { id: 10, word: "Apple", translation: "Яблоко", category: "food", difficulty: 1, emoji: "🍎" },
        { id: 11, word: "Bread", translation: "Хлеб", category: "food", difficulty: 1, emoji: "🍞" },
        { id: 12, word: "Water", translation: "Вода", category: "drinks", difficulty: 1, emoji: "💧" },

        // Уровень 5 (Animals - Животные)
        { id: 13, word: "Cat", translation: "Кошка", category: "animals", difficulty: 1, emoji: "🐱" },
        { id: 14, word: "Dog", translation: "Собака", category: "animals", difficulty: 1, emoji: "🐶" },
        { id: 15, word: "Bird", translation: "Птица", category: "animals", difficulty: 1, emoji: "🐦" },

        // Уровень 6 (Colors - Цвета)
        { id: 16, word: "Red", translation: "Красный", category: "colors", difficulty: 1, emoji: "🔴" },
        { id: 17, word: "Blue", translation: "Синий", category: "colors", difficulty: 1, emoji: "🔵" },
        { id: 18, word: "Green", translation: "Зеленый", category: "colors", difficulty: 1, emoji: "🟢" },

        // Уровень 7 (Numbers - Числа)
        { id: 19, word: "One", translation: "Один", category: "numbers", difficulty: 1, emoji: "1️⃣" },
        { id: 20, word: "Two", translation: "Два", category: "numbers", difficulty: 1, emoji: "2️⃣" },
        { id: 21, word: "Three", translation: "Три", category: "numbers", difficulty: 1, emoji: "3️⃣" },

        // Уровень 8 (Verbs - Глаголы)
        { id: 22, word: "Go", translation: "Идти", category: "verbs", difficulty: 2, emoji: "🚶" },
        { id: 23, word: "Eat", translation: "Есть", category: "verbs", difficulty: 2, emoji: "🍽️" },
        { id: 24, word: "Sleep", translation: "Спать", category: "verbs", difficulty: 2, emoji: "😴" },

        // Уровень 9 (Clothes - Одежда)
        { id: 25, word: "Shirt", translation: "Рубашка", category: "clothes", difficulty: 2, emoji: "👕" },
        { id: 26, word: "Shoes", translation: "Обувь", category: "clothes", difficulty: 2, emoji: "👟" },
        { id: 27, word: "Hat", translation: "Шапка", category: "clothes", difficulty: 2, emoji: "🧢" },

        // Уровень 10 (Weather - Погода)
        { id: 28, word: "Sun", translation: "Солнце", category: "weather", difficulty: 2, emoji: "☀️" },
        { id: 29, word: "Rain", translation: "Дождь", category: "weather", difficulty: 2, emoji: "🌧️" },
        { id: 30, word: "Snow", translation: "Снег", category: "weather", difficulty: 2, emoji: "❄️" },

        // Уровень 11 (Body - Тело)
        { id: 31, word: "Head", translation: "Голова", category: "body", difficulty: 2, emoji: "👤" },
        { id: 32, word: "Hand", translation: "Рука", category: "body", difficulty: 2, emoji: "✋" },
        { id: 33, word: "Foot", translation: "Нога", category: "body", difficulty: 2, emoji: "🦶" },

        // Уровень 12 (Time - Время)
        { id: 34, word: "Day", translation: "День", category: "time", difficulty: 2, emoji: "☀️" },
        { id: 35, word: "Night", translation: "Ночь", category: "time", difficulty: 2, emoji: "🌙" },
        { id: 36, word: "Week", translation: "Неделя", category: "time", difficulty: 2, emoji: "📅" },
    ],

    // ==================== ИСПАНСКИЙ ====================
    es: [
        // Nivel 1 (Saludos - Приветствия)
        { id: 101, word: "Hola", translation: "Привет", category: "greetings", difficulty: 1, emoji: "👋" },
        { id: 102, word: "Adiós", translation: "До свидания", category: "greetings", difficulty: 1, emoji: "👋" },
        { id: 103, word: "Buenos días", translation: "Доброе утро", category: "greetings", difficulty: 1, emoji: "🌅" },

        // Nivel 2 (Frases básicas - Основные фразы)
        { id: 104, word: "Gracias", translation: "Спасибо", category: "phrases", difficulty: 1, emoji: "🙏" },
        { id: 105, word: "Por favor", translation: "Пожалуйста", category: "phrases", difficulty: 1, emoji: "🤲" },
        { id: 106, word: "Lo siento", translation: "Извините", category: "phrases", difficulty: 1, emoji: "😔" },

        // Nivel 3 (Familia - Семья)
        { id: 107, word: "Madre", translation: "Мама", category: "family", difficulty: 1, emoji: "👩" },
        { id: 108, word: "Padre", translation: "Папа", category: "family", difficulty: 1, emoji: "👨" },
        { id: 109, word: "Hermano", translation: "Брат", category: "family", difficulty: 1, emoji: "👦" },

        // Nivel 4 (Comida - Еда)
        { id: 110, word: "Manzana", translation: "Яблоко", category: "food", difficulty: 1, emoji: "🍎" },
        { id: 111, word: "Pan", translation: "Хлеб", category: "food", difficulty: 1, emoji: "🍞" },
        { id: 112, word: "Agua", translation: "Вода", category: "drinks", difficulty: 1, emoji: "💧" },

        // Nivel 5 (Animales - Животные)
        { id: 113, word: "Gato", translation: "Кошка", category: "animals", difficulty: 1, emoji: "🐱" },
        { id: 114, word: "Perro", translation: "Собака", category: "animals", difficulty: 1, emoji: "🐶" },
        { id: 115, word: "Pájaro", translation: "Птица", category: "animals", difficulty: 1, emoji: "🐦" },

        // Nivel 6 (Colores - Цвета)
        { id: 116, word: "Rojo", translation: "Красный", category: "colors", difficulty: 1, emoji: "🔴" },
        { id: 117, word: "Azul", translation: "Синий", category: "colors", difficulty: 1, emoji: "🔵" },
        { id: 118, word: "Verde", translation: "Зеленый", category: "colors", difficulty: 1, emoji: "🟢" },

        // Nivel 7 (Números - Числа)
        { id: 119, word: "Uno", translation: "Один", category: "numbers", difficulty: 1, emoji: "1️⃣" },
        { id: 120, word: "Dos", translation: "Два", category: "numbers", difficulty: 1, emoji: "2️⃣" },
        { id: 121, word: "Tres", translation: "Три", category: "numbers", difficulty: 1, emoji: "3️⃣" },

        // Nivel 8 (Verbos - Глаголы)
        { id: 122, word: "Ir", translation: "Идти", category: "verbs", difficulty: 2, emoji: "🚶" },
        { id: 123, word: "Comer", translation: "Есть", category: "verbs", difficulty: 2, emoji: "🍽️" },
        { id: 124, word: "Dormir", translation: "Спать", category: "verbs", difficulty: 2, emoji: "😴" },

        // Nivel 9 (Ropa - Одежда)
        { id: 125, word: "Camisa", translation: "Рубашка", category: "clothes", difficulty: 2, emoji: "👕" },
        { id: 126, word: "Zapatos", translation: "Обувь", category: "clothes", difficulty: 2, emoji: "👟" },
        { id: 127, word: "Sombrero", translation: "Шляпа", category: "clothes", difficulty: 2, emoji: "🧢" },

        // Nivel 10 (Clima - Погода)
        { id: 128, word: "Sol", translation: "Солнце", category: "weather", difficulty: 2, emoji: "☀️" },
        { id: 129, word: "Lluvia", translation: "Дождь", category: "weather", difficulty: 2, emoji: "🌧️" },
        { id: 130, word: "Nieve", translation: "Снег", category: "weather", difficulty: 2, emoji: "❄️" },
    ],

    // ==================== ФРАНЦУЗСКИЙ ====================
    fr: [
        // Niveau 1 (Salutations - Приветствия)
        { id: 201, word: "Bonjour", translation: "Привет", category: "greetings", difficulty: 1, emoji: "👋" },
        { id: 202, word: "Au revoir", translation: "До свидания", category: "greetings", difficulty: 1, emoji: "👋" },
        { id: 203, word: "Bonne nuit", translation: "Спокойной ночи", category: "greetings", difficulty: 1, emoji: "🌙" },

        // Niveau 2 (Phrases de base - Основные фразы)
        { id: 204, word: "Merci", translation: "Спасибо", category: "phrases", difficulty: 1, emoji: "🙏" },
        { id: 205, word: "S'il vous plaît", translation: "Пожалуйста", category: "phrases", difficulty: 1, emoji: "🤲" },
        { id: 206, word: "Pardon", translation: "Извините", category: "phrases", difficulty: 1, emoji: "😔" },

        // Niveau 3 (Famille - Семья)
        { id: 207, word: "Mère", translation: "Мама", category: "family", difficulty: 1, emoji: "👩" },
        { id: 208, word: "Père", translation: "Папа", category: "family", difficulty: 1, emoji: "👨" },
        { id: 209, word: "Frère", translation: "Брат", category: "family", difficulty: 1, emoji: "👦" },

        // Niveau 4 (Nourriture - Еда)
        { id: 210, word: "Pomme", translation: "Яблоко", category: "food", difficulty: 1, emoji: "🍎" },
        { id: 211, word: "Pain", translation: "Хлеб", category: "food", difficulty: 1, emoji: "🍞" },
        { id: 212, word: "Eau", translation: "Вода", category: "drinks", difficulty: 1, emoji: "💧" },

        // Niveau 5 (Animaux - Животные)
        { id: 213, word: "Chat", translation: "Кошка", category: "animals", difficulty: 1, emoji: "🐱" },
        { id: 214, word: "Chien", translation: "Собака", category: "animals", difficulty: 1, emoji: "🐶" },
        { id: 215, word: "Oiseau", translation: "Птица", category: "animals", difficulty: 1, emoji: "🐦" },

        // Niveau 6 (Couleurs - Цвета)
        { id: 216, word: "Rouge", translation: "Красный", category: "colors", difficulty: 1, emoji: "🔴" },
        { id: 217, word: "Bleu", translation: "Синий", category: "colors", difficulty: 1, emoji: "🔵" },
        { id: 218, word: "Vert", translation: "Зеленый", category: "colors", difficulty: 1, emoji: "🟢" },

        // Niveau 7 (Nombres - Числа)
        { id: 219, word: "Un", translation: "Один", category: "numbers", difficulty: 1, emoji: "1️⃣" },
        { id: 220, word: "Deux", translation: "Два", category: "numbers", difficulty: 1, emoji: "2️⃣" },
        { id: 221, word: "Trois", translation: "Три", category: "numbers", difficulty: 1, emoji: "3️⃣" },

        // Niveau 8 (Verbes - Глаголы)
        { id: 222, word: "Aller", translation: "Идти", category: "verbs", difficulty: 2, emoji: "🚶" },
        { id: 223, word: "Manger", translation: "Есть", category: "verbs", difficulty: 2, emoji: "🍽️" },
        { id: 224, word: "Dormir", translation: "Спать", category: "verbs", difficulty: 2, emoji: "😴" },
    ],

    // ==================== НЕМЕЦКИЙ ====================
    de: [
        // Level 1 (Begrüßungen - Приветствия)
        { id: 301, word: "Hallo", translation: "Привет", category: "greetings", difficulty: 1, emoji: "👋" },
        { id: 302, word: "Auf Wiedersehen", translation: "До свидания", category: "greetings", difficulty: 1, emoji: "👋" },
        { id: 303, word: "Guten Morgen", translation: "Доброе утро", category: "greetings", difficulty: 1, emoji: "🌅" },

        // Level 2 (Grundlegende Sätze - Основные фразы)
        { id: 304, word: "Danke", translation: "Спасибо", category: "phrases", difficulty: 1, emoji: "🙏" },
        { id: 305, word: "Bitte", translation: "Пожалуйста", category: "phrases", difficulty: 1, emoji: "🤲" },
        { id: 306, word: "Entschuldigung", translation: "Извините", category: "phrases", difficulty: 1, emoji: "😔" },

        // Level 3 (Familie - Семья)
        { id: 307, word: "Mutter", translation: "Мама", category: "family", difficulty: 1, emoji: "👩" },
        { id: 308, word: "Vater", translation: "Папа", category: "family", difficulty: 1, emoji: "👨" },
        { id: 309, word: "Bruder", translation: "Брат", category: "family", difficulty: 1, emoji: "👦" },

        // Level 4 (Essen - Еда)
        { id: 310, word: "Apfel", translation: "Яблоко", category: "food", difficulty: 1, emoji: "🍎" },
        { id: 311, word: "Brot", translation: "Хлеб", category: "food", difficulty: 1, emoji: "🍞" },
        { id: 312, word: "Wasser", translation: "Вода", category: "drinks", difficulty: 1, emoji: "💧" },

        // Level 5 (Tiere - Животные)
        { id: 313, word: "Katze", translation: "Кошка", category: "animals", difficulty: 1, emoji: "🐱" },
        { id: 314, word: "Hund", translation: "Собака", category: "animals", difficulty: 1, emoji: "🐶" },
        { id: 315, word: "Vogel", translation: "Птица", category: "animals", difficulty: 1, emoji: "🐦" },

        // Level 6 (Farben - Цвета)
        { id: 316, word: "Rot", translation: "Красный", category: "colors", difficulty: 1, emoji: "🔴" },
        { id: 317, word: "Blau", translation: "Синий", category: "colors", difficulty: 1, emoji: "🔵" },
        { id: 318, word: "Grün", translation: "Зеленый", category: "colors", difficulty: 1, emoji: "🟢" },

        // Level 7 (Zahlen - Числа)
        { id: 319, word: "Eins", translation: "Один", category: "numbers", difficulty: 1, emoji: "1️⃣" },
        { id: 320, word: "Zwei", translation: "Два", category: "numbers", difficulty: 1, emoji: "2️⃣" },
        { id: 321, word: "Drei", translation: "Три", category: "numbers", difficulty: 1, emoji: "3️⃣" },
    ],

    // ==================== ИТАЛЬЯНСКИЙ ====================
    it: [
        // Livello 1 (Saluti - Приветствия)
        { id: 401, word: "Ciao", translation: "Привет", category: "greetings", difficulty: 1, emoji: "👋" },
        { id: 402, word: "Arrivederci", translation: "До свидания", category: "greetings", difficulty: 1, emoji: "👋" },
        { id: 403, word: "Buongiorno", translation: "Доброе утро", category: "greetings", difficulty: 1, emoji: "🌅" },

        // Livello 2 (Frasi base - Основные фразы)
        { id: 404, word: "Grazie", translation: "Спасибо", category: "phrases", difficulty: 1, emoji: "🙏" },
        { id: 405, word: "Per favore", translation: "Пожалуйста", category: "phrases", difficulty: 1, emoji: "🤲" },
        { id: 406, word: "Scusa", translation: "Извините", category: "phrases", difficulty: 1, emoji: "😔" },

        // Livello 3 (Famiglia - Семья)
        { id: 407, word: "Madre", translation: "Мама", category: "family", difficulty: 1, emoji: "👩" },
        { id: 408, word: "Padre", translation: "Папа", category: "family", difficulty: 1, emoji: "👨" },
        { id: 409, word: "Fratello", translation: "Брат", category: "family", difficulty: 1, emoji: "👦" },

        // Livello 4 (Cibo - Еда)
        { id: 410, word: "Mela", translation: "Яблоко", category: "food", difficulty: 1, emoji: "🍎" },
        { id: 411, word: "Pane", translation: "Хлеб", category: "food", difficulty: 1, emoji: "🍞" },
        { id: 412, word: "Acqua", translation: "Вода", category: "drinks", difficulty: 1, emoji: "💧" },

        // Livello 5 (Animali - Животные)
        { id: 413, word: "Gatto", translation: "Кошка", category: "animals", difficulty: 1, emoji: "🐱" },
        { id: 414, word: "Cane", translation: "Собака", category: "animals", difficulty: 1, emoji: "🐶" },
        { id: 415, word: "Uccello", translation: "Птица", category: "animals", difficulty: 1, emoji: "🐦" },

        // Livello 6 (Colori - Цвета)
        { id: 416, word: "Rosso", translation: "Красный", category: "colors", difficulty: 1, emoji: "🔴" },
        { id: 417, word: "Blu", translation: "Синий", category: "colors", difficulty: 1, emoji: "🔵" },
        { id: 418, word: "Verde", translation: "Зеленый", category: "colors", difficulty: 1, emoji: "🟢" },
    ],

    // ==================== ЯПОНСКИЙ ====================
    ja: [
        // レベル1 (挨拶 - Приветствия)
        { id: 501, word: "Konnichiwa", translation: "Здравствуйте", category: "greetings", difficulty: 2, emoji: "👋" },
        { id: 502, word: "Sayonara", translation: "До свидания", category: "greetings", difficulty: 2, emoji: "👋" },
        { id: 503, word: "Ohayou", translation: "Доброе утро", category: "greetings", difficulty: 2, emoji: "🌅" },

        // レベル2 (基本的なフレーズ - Основные фразы)
        { id: 504, word: "Arigatou", translation: "Спасибо", category: "phrases", difficulty: 2, emoji: "🙏" },
        { id: 505, word: "Onegaishimasu", translation: "Пожалуйста", category: "phrases", difficulty: 2, emoji: "🤲" },
        { id: 506, word: "Gomennasai", translation: "Извините", category: "phrases", difficulty: 2, emoji: "😔" },

        // レベル3 (家族 - Семья)
        { id: 507, word: "Haha", translation: "Мама", category: "family", difficulty: 2, emoji: "👩" },
        { id: 508, word: "Chichi", translation: "Папа", category: "family", difficulty: 2, emoji: "👨" },
        { id: 509, word: "Ani", translation: "Брат", category: "family", difficulty: 2, emoji: "👦" },

        // レベル4 (食べ物 - Еда)
        { id: 510, word: "Ringo", translation: "Яблоко", category: "food", difficulty: 2, emoji: "🍎" },
        { id: 511, word: "Pan", translation: "Хлеб", category: "food", difficulty: 2, emoji: "🍞" },
        { id: 512, word: "Mizu", translation: "Вода", category: "drinks", difficulty: 2, emoji: "💧" },

        // レベル5 (動物 - Животные)
        { id: 513, word: "Neko", translation: "Кошка", category: "animals", difficulty: 2, emoji: "🐱" },
        { id: 514, word: "Inu", translation: "Собака", category: "animals", difficulty: 2, emoji: "🐶" },
        { id: 515, word: "Tori", translation: "Птица", category: "animals", difficulty: 2, emoji: "🐦" },

        // レベル6 (色 - Цвета)
        { id: 516, word: "Aka", translation: "Красный", category: "colors", difficulty: 2, emoji: "🔴" },
        { id: 517, word: "Ao", translation: "Синий", category: "colors", difficulty: 2, emoji: "🔵" },
        { id: 518, word: "Midori", translation: "Зеленый", category: "colors", difficulty: 2, emoji: "🟢" },
    ]
};