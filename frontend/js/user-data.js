// Класс для управления данными пользователя
class UserDataManager {
    constructor() {
        this.user = tg.initDataUnsafe?.user;
        this.initUserData();
    }

    initUserData() {
        if (!localStorage.getItem('userId')) {
            localStorage.setItem('userId', this.user?.id || 'guest_' + Date.now());
        }

        if (!localStorage.getItem('learnedWords')) {
            localStorage.setItem('learnedWords', '[]');
        }

        if (!localStorage.getItem('achievements')) {
            localStorage.setItem('achievements', '[]');
        }

        if (!localStorage.getItem('stats')) {
            const stats = {
                totalExercises: 0,
                correctAnswers: 0,
                totalTime: 0,
                favoriteLanguage: 'en'
            };
            localStorage.setItem('stats', JSON.stringify(stats));
        }

        if (!localStorage.getItem('settings')) {
            const settings = {
                soundEnabled: true,
                notificationsEnabled: true,
                darkMode: false,
                dailyReminder: true
            };
            localStorage.setItem('settings', JSON.stringify(settings));
        }
    }

    getUserStats() {
        return {
            userId: localStorage.getItem('userId'),
            level: parseInt(localStorage.getItem('level') || '1'),
            xp: parseInt(localStorage.getItem('xp') || '0'),
            streak: parseInt(localStorage.getItem('streak') || '0'),
            learnedWords: JSON.parse(localStorage.getItem('learnedWords') || '[]').length,
            achievements: JSON.parse(localStorage.getItem('achievements') || '[]').length,
            stats: JSON.parse(localStorage.getItem('stats') || '{}')
        };
    }

    updateStats(exerciseType, correct) {
        const stats = JSON.parse(localStorage.getItem('stats') || '{}');
        stats.totalExercises = (stats.totalExercises || 0) + 1;
        if (correct) {
            stats.correctAnswers = (stats.correctAnswers || 0) + 1;
        }
        localStorage.setItem('stats', JSON.stringify(stats));
    }

    getLearningProgress() {
        const learnedWords = JSON.parse(localStorage.getItem('learnedWords') || '[]');
        const wordsByLanguage = {};

        learnedWords.forEach(word => {
            if (!wordsByLanguage[word.lang]) {
                wordsByLanguage[word.lang] = [];
            }
            wordsByLanguage[word.lang].push(word);
        });

        return wordsByLanguage;
    }

    saveSettings(settings) {
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    getSettings() {
        return JSON.parse(localStorage.getItem('settings') || '{}');
    }
}

// Создаем глобальный экземпляр
const userDataManager = new UserDataManager();