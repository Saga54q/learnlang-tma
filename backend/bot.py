import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes
from config import BOT_TOKEN, WEBAPP_URL

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /start"""
    user = update.effective_user

    # Создаем клавиатуру с кнопкой для открытия Mini App
    keyboard = [
        [InlineKeyboardButton(
            "📱 Открыть LearnLang",
            web_app=WebAppInfo(url=f"{WEBAPP_URL}/frontend/index.html")
        )],
        [InlineKeyboardButton("📚 О проекте", callback_data='about')],
        [InlineKeyboardButton("❓ Помощь", callback_data='help')]
    ]

    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        f"👋 Привет, {user.first_name}!\n\n"
        "Добро пожаловать в LearnLang - ваше приложение для изучения иностранных языков!\n\n"
        "📱 Нажмите кнопку ниже, чтобы открыть приложение:",
        reply_markup=reply_markup
    )


async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик нажатий на кнопки"""
    query = update.callback_query
    await query.answer()

    if query.data == 'about':
        await query.edit_message_text(
            "📚 **О LearnLang**\n\n"
            "LearnLang - это современное приложение для изучения иностранных языков "
            "прямо в Telegram!\n\n"
            "🌟 **Возможности:**\n"
            "• Изучение 6 языков\n"
            "• Слово дня\n"
            "• Ежедневные упражнения\n"
            "• Отслеживание прогресса\n"
            "• Аудирование\n\n"
            "Начните учить языки уже сегодня!"
        )
    elif query.data == 'help':
        await query.edit_message_text(
            "❓ **Помощь**\n\n"
            "**Как пользоваться:**\n"
            "1. Нажмите 'Открыть LearnLang'\n"
            "2. Выберите язык для изучения\n"
            "3. Выполняйте ежедневные упражнения\n"
            "4. Следите за прогрессом\n\n"
            "Если у вас возникли проблемы, напишите @support"
        )


def main():
    """Запуск бота"""
    # Создаем приложение
    application = Application.builder().token(BOT_TOKEN).build()

    # Добавляем обработчики команд
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", button_callback))

    # Добавляем обработчик callback-запросов
    application.add_handler(CallbackQueryHandler(button_callback))

    # Запускаем бота
    print("Бот запущен...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == '__main__':
    main()