import os
from dotenv import load_dotenv

# Загружаем переменные из .env файла
load_dotenv()

# Токен бота от @BotFather
BOT_TOKEN = os.getenv('BOT_TOKEN')

# URL вашего сайта на Vercel
WEBAPP_URL = os.getenv('WEBAPP_URL')

# Проверка, что переменные загружены
if not BOT_TOKEN:
    raise ValueError("Нет BOT_TOKEN! Проверьте файл .env")
if not WEBAPP_URL:
    raise ValueError("Нет WEBAPP_URL! Проверьте файл .env")