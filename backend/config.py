import os
from dotenv import load_dotenv

load_dotenv()

# Токен бота от @BotFather
BOT_TOKEN = os.getenv('BOT_TOKEN', 'ВАШ_ТОКЕН_БОТА')

# URL вашего сайта (после загрузки на хостинг)
WEBAPP_URL = os.getenv('WEBAPP_URL', 'https://ваш-домен.ru')