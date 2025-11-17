# Marketplace Tracker

Проект для отслеживания товаров на маркетплейсах Wildberries и Ozon с объединением одинаковых товаров и отображением общей статистики.

## Архитектура

- **Backend**: Go (Gin framework) с SQLite
- **Frontend**: React с Material UI
- **Аутентификация**: JWT токены
- **Шифрование**: AES для API-токенов
- **Контейнеризация**: Docker + Docker Compose

## Функциональность

- Регистрация/вход пользователей
- Добавление магазинов (WB и Ozon) по API-токенам
- Получение товаров из маркетплейсов
- Ручное сопоставление одинаковых товаров
- Объединенная статистика по сопоставленным товарам

## Установка и запуск

### Через Docker (рекомендуется)

```bash
# Клонирование репозитория
git clone git@github.com:Wladisl4W/kursovaya.git
cd kursovaya

# Запуск проекта
docker-compose up --build
```

Приложение будет доступно:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

### Без Docker

#### Backend

```bash
cd backend
go mod tidy
go run cmd/server/main.go
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

## Настройка

### Переменные окружения

В `docker-compose.yml` можно изменить:

- `JWT_SECRET` — секретный ключ для JWT
- `ENCRYPTION_KEY` — ключ для шифрования API-токенов
- `DB_PATH` — путь к SQLite файлу

## Структура проекта

```
project/
├── backend/                 # Go API
│   ├── cmd/
│   │   └── server/          # Точка входа
│   ├── internal/
│   │   ├── config/          # Конфигурация
│   │   ├── database/        # Подключение к БД
│   │   ├── models/          # Модели данных
│   │   ├── handlers/        # HTTP-хендлеры
│   │   ├── routes/          # Роуты
│   │   ├── service/         # Бизнес-логика
│   │   └── middleware/      # Middleware
│   └── pkg/
│       ├── api/             # API клиенты (WB, Ozon)
│       └── utils/           # Утилиты (шифрование, JWT)
├── frontend/                # React приложение
│   ├── src/
│   │   ├── components/      # Компоненты
│   │   ├── pages/           # Страницы
│   │   ├── utils/           # Утилиты
│   │   └── styles/          # Стили
└── docker-compose.yml       # Docker конфигурация
```

## API Эндпоинты

- `POST /api/auth/register` — регистрация
- `POST /api/auth/login` — вход
- `GET /api/stores` — получить магазины (требует токен)
- `POST /api/stores` — добавить магазин (требует токен)
- `GET /api/products` — получить товары (требует токен)
- `GET /api/mappings` — получить сопоставления (требует токен)
- `POST /api/mappings` — создать сопоставление (требует токен)

## Технологии

- **Go** — серверный язык
- **Gin** — веб-фреймворк
- **SQLite** — база данных
- **React** — фронтенд
- **Material UI** — компоненты
- **JWT** — аутентификация
- **AES** — шифрование токенов
- **Docker** — контейнеризация

## Особенности

- Все API-токены шифруются AES перед сохранением в БД
- Поддержка обоих маркетплейсов (WB и Ozon)
- Интуитивный интерфейс для сопоставления товаров
- Объединение статистики по сопоставленным товарам