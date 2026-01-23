# Korean Learning App - Backend API

REST API для мобильного приложения изучения корейского языка с системой интервального повторения (SRS).

## 🚀 Основные возможности

- 🔐 Аутентификация через Google OAuth 2.0
- 📚 CRUD операции для словарей и слов
- 🎴 Система интервального повторения (алгоритм SM-2)
- 📖 Публичная библиотека словарей
- 📊 Статистика обучения и система достижений
- 🎮 Различные типы упражнений (Multiple Choice, Typing, Matching)
- 📦 Официальные Starter Packs (TOPIK I, 50 most common words)
- 🔍 Поиск и фильтрация словарей
- ⚡ Rate limiting и пагинация

## 📋 Технологический стек

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript (ES Modules)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Passport.js + Google OAuth 2.0
- **Documentation**: Swagger/OpenAPI 3.0

## 📦 Установка

### Предварительные требования

- Node.js 20 или выше
- npm или yarn
- Supabase аккаунт
- Google Cloud Console проект (для OAuth)

### Шаги установки

1. **Клонировать репозиторий**
```bash
git clone https://github.com/Nikolanikol/korean-app-backend.git
cd korean-app-backend
```

2. **Установить зависимости**
```bash
npm install
```

3. **Настроить переменные окружения**

Создай файл `.env` в корне проекта:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=your_supabase_connection_string

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# JWT Secret
JWT_SECRET=your_jwt_secret_key
```

4. **Запустить сервер**
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## 📚 API Документация

После запуска сервера, Swagger документация доступна по адресу:
```
http://localhost:3000/api-docs
```

### Основные endpoints:

#### Authentication
- `GET /auth/google` - Начало OAuth flow
- `GET /auth/google/callback` - OAuth callback

#### Users
- `GET /users/me` - Текущий пользователь

#### Vocabularies
- `GET /vocabularies` - Список словарей
- `POST /vocabularies` - Создать словарь
- `GET /vocabularies/:id` - Получить словарь
- `PATCH /vocabularies/:id` - Обновить словарь
- `DELETE /vocabularies/:id` - Удалить словарь
- `PATCH /vocabularies/:id/share` - Изменить публичность
- `POST /vocabularies/:id/fork` - Скопировать словарь

#### Words
- `GET /vocabularies/:vocabularyId/words` - Список слов
- `POST /vocabularies/:vocabularyId/words` - Добавить слово
- `POST /vocabularies/:vocabularyId/words/bulk` - Массовое добавление
- `PATCH /words/:id` - Обновить слово
- `DELETE /words/:id` - Удалить слово
- `PATCH /vocabularies/:vocabularyId/words/reorder` - Изменить порядок

#### Study (SRS)
- `GET /study/due-words` - Слова на повторение
- `POST /study/answer` - Отправить результат
- `GET /study/stats` - Статистика обучения

#### Collections
- `GET /collections` - Список коллекций
- `POST /collections` - Создать коллекцию
- `PATCH /collections/:id` - Обновить коллекцию
- `DELETE /collections/:id` - Удалить коллекцию
- `POST /collections/:id/vocabularies` - Добавить словарь
- `DELETE /collections/:id/vocabularies/:vocabularyId` - Удалить словарь

#### Public Library
- `GET /library/vocabularies` - Публичные словари
- `GET /library/search` - Поиск
- `GET /library/trending` - Популярные словари

#### Stats
- `GET /stats` - Статистика пользователя
- `PATCH /stats/daily-goal` - Обновить дневную цель
- `GET /stats/achievements` - Достижения

#### Exercises
- `POST /exercises/multiple-choice` - Генерация Multiple Choice
- `POST /exercises/typing` - Генерация Typing
- `POST /exercises/matching` - Генерация Matching
- `POST /exercises/complete` - Завершить упражнение

#### Starter Packs
- `GET /starter-packs` - Официальные словари

## 🗄️ Структура базы данных

### Основные таблицы:
- `users` - Пользователи
- `vocabularies` - Словари
- `words` - Слова
- `word_progress` - Прогресс изучения (SRS)
- `collections` - Коллекции словарей
- `collection_vocabularies` - Связь словарей и коллекций
- `user_stats` - Статистика пользователей
- `user_achievements` - Достижения
- `exercise_sessions` - Сессии упражнений

## 🧠 Алгоритм SM-2

Проект использует алгоритм SuperMemo 2 (SM-2) для системы интервального повторения:

- **Quality (0-5)**: Оценка ответа пользователя
- **Easiness Factor**: Коэффициент сложности слова (1.3 - 2.5)
- **Interval**: Интервал до следующего повторения (в днях)
- **Repetitions**: Количество правильных повторений подряд

## 🔒 Безопасность

- JWT токены для аутентификации
- Rate limiting (100 req/15min общий, 20 req/15min для создания)
- Валидация всех входных данных
- CORS настроен для мобильного приложения

## 📁 Структура проекта
```
src/
├── config/          # Конфигурация (database, passport, swagger)
├── controllers/     # Бизнес-логика endpoints
├── docs/            # Swagger документация
├── middleware/      # Middleware (auth, errors, rate limiting)
├── routes/          # API routes
├── services/        # Сервисы (SRS engine)
└── index.ts         # Entry point
```

## 🚀 Деплой

### Railway / Render

1. Подключить GitHub репозиторий
2. Установить environment variables
3. Деплой автоматически из main ветки

## 📝 Лицензия

MIT

## 👨‍💻 Автор

Nikolai - [GitHub](https://github.com/Nikolanikol)