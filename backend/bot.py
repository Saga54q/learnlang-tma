#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
LearnLang Telegram Bot
Полностью рабочая версия для Python 3.8-3.11
"""

import os
import logging
import sys
from typing import Optional, Dict, Any

# Проверка версии Python
if sys.version_info < (3, 7):
    print("❌ Требуется Python 3.7 или выше")
    sys.exit(1)

# Импорты telegram
try:
    from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
    from telegram.ext import Application, CommandHandler, ContextTypes, CallbackQueryHandler
    from telegram.constants import ParseMode
except ImportError as e:
    print(f"❌ Ошибка импорта telegram: {e}")
    print("Установите зависимости: pip install python-telegram-bot==20.3")
    sys.exit(1)

# Импорт dotenv
try:
    from dotenv import load_dotenv
except ImportError:
    print("❌ Установите python-dotenv: pip install python-dotenv")
    sys.exit(1)

# Загружаем переменные окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO,
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('bot.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

# Получаем токен и URL из .env
BOT_TOKEN = os.getenv('BOT_TOKEN')
WEBAPP_URL = os.getenv('WEBAPP_URL')

# Проверка наличия токена
if not BOT_TOKEN:
    logger.error("❌ BOT_TOKEN не найден в файле .env")
    print("\n❌ ОШИБКА: Не указан BOT_TOKEN")
    print("Создайте файл .env в папке backend со следующим содержимым:")
    print("BOT_TOKEN=ваш_токен_от_botfather")
    print("WEBAPP_URL=https://ваш-сайт.vercel.app")
    sys.exit(1)

if not WEBAPP_URL:
    logger.error("❌ WEBAPP_URL не найден в файле .env")
    print("\n❌ ОШИБКА: Не указан WEBAPP_URL")
    print("Добавьте WEBAPP_URL в файл .env")
    sys.exit(1)

logger.info(f"✅ Токен загружен: {BOT_TOKEN[:10]}...")
logger.info(f"✅ URL приложения: {WEBAPP_URL}")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Обработчик команды /start
    Показывает приветствие и кнопку для открытия Mini App
    """
    try:
        user = update.effective_user
        logger.info(f"Пользователь {user.id} ({user.first_name}) запустил бота")

        # Создаем клавиатуру с кнопкой для открытия Mini App
        keyboard = [
            [InlineKeyboardButton(
                "📱 ОТКРЫТЬ LEARNLANG",
                web_app=WebAppInfo(url=WEBAPP_URL)
            )],
            [
                InlineKeyboardButton("📚 О проекте", callback_data='about'),
                InlineKeyboardButton("❓ Помощь", callback_data='help')
            ]
        ]

        reply_markup = InlineKeyboardMarkup(keyboard)

        # Приветственное сообщение
        welcome_text = (
            f"👋 **Привет, {user.first_name}!**\n\n"
            "Добро пожаловать в **LearnLang** — ваше персональное приложение "
            "для изучения иностранных языков прямо в Telegram!\n\n"
            "📱 **Нажмите кнопку ниже**, чтобы открыть приложение и начать учиться.\n\n"
            "✨ **Что вас ждет:**\n"
            "• 6 языков для изучения\n"
            "• Слово дня\n"
            "• Интерактивные упражнения\n"
            "• Отслеживание прогресса"
        )

        await update.message.reply_text(
            welcome_text,
            reply_markup=reply_markup,
            parse_mode=ParseMode.MARKDOWN
        )

    except Exception as e:
        logger.error(f"Ошибка в start: {e}", exc_info=True)
        await update.message.reply_text(
            "❌ Произошла ошибка. Пожалуйста, попробуйте позже."
        )


async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Обработчик нажатий на инлайн-кнопки
    """
    try:
        query = update.callback_query
        await query.answer()

        user = update.effective_user
        logger.info(f"Пользователь {user.id} нажал кнопку: {query.data}")

        if query.data == 'about':
            about_text = (
                "📚 **О LearnLang**\n\n"
                "LearnLang — это современное приложение для изучения иностранных языков, "
                "созданное специально для Telegram Mini Apps.\n\n"
                "🌟 **Возможности:**\n"
                "• **6 языков:** английский, испанский, французский, немецкий, итальянский, японский\n"
                "• **Слово дня** — новое слово каждый день\n"
                "• **Ежедневные упражнения** на перевод, аудирование и грамматику\n"
                "• **Отслеживание прогресса** — статистика и достижения\n"
                "• **Адаптивный дизайн** — удобно на любом устройстве\n\n"
                "🚀 **Начните учить языки уже сегодня!**"
            )
            await query.edit_message_text(
                about_text,
                parse_mode=ParseMode.MARKDOWN,
                reply_markup=InlineKeyboardMarkup([[
                    InlineKeyboardButton("🔙 Назад", callback_data='back_to_main')
                ]])
            )

        elif query.data == 'help':
            help_text = (
                "❓ **Помощь и поддержка**\n\n"
                "**Как пользоваться приложением:**\n"
                "1. Нажмите кнопку **'ОТКРЫТЬ LEARNLANG'**\n"
                "2. Выберите язык для изучения\n"
                "3. Выполняйте ежедневные упражнения\n"
                "4. Следите за прогрессом\n\n"
                "**Команды бота:**\n"
                "• /start — начать работу\n"
                "• /help — показать эту справку\n\n"
                "**Техническая поддержка:**\n"
                "Если у вас возникли проблемы, напишите:\n"
                "📧 support@learnlang.com\n"
                "💬 @learnlang_support"
            )
            await query.edit_message_text(
                help_text,
                parse_mode=ParseMode.MARKDOWN,
                reply_markup=InlineKeyboardMarkup([[
                    InlineKeyboardButton("🔙 Назад", callback_data='back_to_main')
                ]])
            )

        elif query.data == 'back_to_main':
            # Возвращаем главное меню
            keyboard = [
                [InlineKeyboardButton(
                    "📱 ОТКРЫТЬ LEARNLANG",
                    web_app=WebAppInfo(url=WEBAPP_URL)
                )],
                [
                    InlineKeyboardButton("📚 О проекте", callback_data='about'),
                    InlineKeyboardButton("❓ Помощь", callback_data='help')
                ]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)

            await query.edit_message_text(
                f"👋 **С возвращением!**\n\n"
                "Нажмите кнопку, чтобы открыть приложение:",
                reply_markup=reply_markup,
                parse_mode=ParseMode.MARKDOWN
            )

    except Exception as e:
        logger.error(f"Ошибка в button_callback: {e}", exc_info=True)


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Обработчик команды /help
    """
    try:
        help_text = (
            "❓ **Справка по командам**\n\n"
            "/start — запустить бота и открыть главное меню\n"
            "/help — показать эту справку\n\n"
            "**Как открыть приложение:**\n"
            "1. Отправьте команду /start\n"
            "2. Нажмите кнопку 'ОТКРЫТЬ LEARNLANG'\n"
            "3. Приложение откроется прямо в Telegram!"
        )
        await update.message.reply_text(help_text, parse_mode=ParseMode.MARKDOWN)

    except Exception as e:
        logger.error(f"Ошибка в help: {e}", exc_info=True)


def main() -> None:
    """
    Главная функция запуска бота
    """
    try:
        logger.info("🚀 Запуск бота LearnLang...")

        # Создаем приложение
        application = Application.builder().token(BOT_TOKEN).build()

        # Добавляем обработчики команд
        application.add_handler(CommandHandler("start", start))
        application.add_handler(CommandHandler("help", help_command))
        application.add_handler(CallbackQueryHandler(button_callback))

        logger.info("✅ Обработчики команд зарегистрированы")

        # Вывод информации в консоль
        print("\n" + "=" * 50)
        print("🤖 LEARNLANG BOT ЗАПУЩЕН")
        print("=" * 50)
        print(f"📱 WebApp URL: {WEBAPP_URL}")
        print(f"🤖 Bot Token: {BOT_TOKEN[:10]}...{BOT_TOKEN[-5:]}")
        print(f"📝 Логи сохраняются в: bot.log")
        print("=" * 50)
        print("⏳ Ожидание команд... (нажмите Ctrl+C для остановки)\n")

        # Запускаем бота
        application.run_polling(allowed_updates=Update.ALL_TYPES)

    except Exception as e:
        logger.error(f"❌ Критическая ошибка при запуске: {e}", exc_info=True)
        print(f"\n❌ Ошибка запуска: {e}")
        sys.exit(1)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        logger.info("🛑 Бот остановлен пользователем")
        print("\n🛑 Бот остановлен")
    except Exception as e:
        logger.error(f"❌ Необработанная ошибка: {e}", exc_info=True)
        print(f"\n❌ Критическая ошибка: {e}")
        sys.exit(1)