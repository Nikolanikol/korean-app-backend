# Архитектура проекта

## 🏗️ Общая структура
```
┌─────────────────────────────────────────┐
│     Mobile App (React Native)           │
│                                          │
│  Authentication, Vocabularies,          │
│  Flashcards, Exercises, Progress        │
└──────────────┬──────────────────────────┘
               │ HTTPS/REST
               │ JWT Bearer Token
               ▼
┌─────────────────────────────────────────┐
│        Backend API (Express.js)         │
│                                          │
│  ┌──────────┐  ┌──────────┐            │
│  │  Routes  │→│Controllers│            │
│  └──────────┘  └─────┬────┘            │
│                      │                  │
│  ┌──────────┐  ┌────▼─────┐            │
│  │Middleware│  │ Services  │            │
│  └──────────┘  └──────────┘            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Supabase PostgreSQL Database       │
│                                          │
│  Tables, Indexes, Triggers, RLS         │
└─────────────────────────────────────────┘
```

## 📂 Структура кода

### Layer Architecture

Проект следует трёхслойной архитектуре:

**1. Routes Layer** (`src/routes/`)
- Определение endpoints
- Подключение middleware
- Валидация параметров

**2. Controllers Layer** (`src/controllers/`)
- Бизнес-логика
- Обработка запросов
- Формирование ответов

**3. Services Layer** (`src/services/`)
- Специализированная логика (SRS алгоритм)
- Взаимодействие с внешними API

### Принципы разделения ответственности
```typescript
// ❌ НЕ ТАК (всё в одном файле)
router.get('/study/due-words', async (req, res) => {
  // SQL запрос
  // SRS вычисления
  // Форматирование ответа
});

// ✅ ТАК (разделение на слои)
// routes/study.ts
router.get('/due-words', authMiddleware, getDueWords);

// controllers/studyController.ts
export const getDueWords = async (req, res) => {
  const words = await fetchDueWords(userId);
  const processed = srsService.filterByReviewDate(words);
  res.json(processed);
};

// services/srsService.ts
export const filterByReviewDate = (words) => {
  // SM-2 логика
};
```

## 🔐 Аутентификация

### OAuth 2.0 Flow
```
1. User clicks "Login with Google"
   ↓
2. Frontend → GET /auth/google
   ↓
3. Backend → Redirect to Google
   ↓
4. User authorizes on Google
   ↓
5. Google → Redirect to /auth/google/callback
   ↓
6. Backend → Create/find user in DB
   ↓
7. Backend → Generate JWT token
   ↓
8. Backend → Return token to frontend
   ↓
9. Frontend → Store token + use for API calls
```

### JWT Token Structure
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 🗄️ База данных

### ER-диаграмма (упрощённая)
```
┌─────────┐
│  users  │
└────┬────┘
     │
     │ 1:N
     ▼
┌─────────────┐     1:N     ┌────────┐
│vocabularies │◄────────────┤ words  │
└──────┬──────┘             └───┬────┘
       │                        │
       │ N:M                    │ 1:N
       ▼                        ▼
┌─────────────┐          ┌──────────────┐
│ collections │          │word_progress │
└─────────────┘          └──────────────┘
```

### Ключевые индексы
```sql
-- Критичные для производительности
idx_word_progress_next_review    -- SRS запросы
idx_vocabularies_public_search   -- Поиск в библиотеке
idx_vocabularies_official        -- Starter packs
idx_words_vocabulary             -- Слова в словаре
idx_vocabularies_tags (GIN)      -- Поиск по тегам
```

## 🧠 Алгоритм SM-2 (Spaced Repetition)

### Формулы
```typescript
// 1. Easiness Factor (EF)
EF' = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
if (EF' < 1.3) EF' = 1.3

// 2. Interval
if (quality < 3) {
  repetitions = 0
  interval = 1
} else {
  repetitions++
  if (repetitions === 1) interval = 1
  else if (repetitions === 2) interval = 6
  else interval = Math.round(interval * EF)
}

// 3. Next Review Date
next_review_at = now + interval (days)
```

### Пример работы
```
День 1: Новое слово, качество = 4
→ repetitions = 1, interval = 1, EF = 2.5
→ next_review = завтра

День 2: Повторение, качество = 5
→ repetitions = 2, interval = 6, EF = 2.6
→ next_review = через 6 дней

День 8: Повторение, качество = 4
→ repetitions = 3, interval = 15, EF = 2.5
→ next_review = через 15 дней
```

## ⚡ Оптимизация

### Rate Limiting
```typescript
// Общий лимит для всех endpoints
100 requests / 15 minutes

// Специальный лимит для создания
20 requests / 15 minutes (POST, PUT, PATCH)
```

### Пагинация
```typescript
// Query параметры
?limit=20&offset=0

// Response
{
  data: [...],
  count: 150,
  limit: 20,
  offset: 0,
  hasMore: true
}
```

### Database Optimization

- **Prepared statements** через Supabase client
- **Indexes** на часто запрашиваемые поля
- **Limit queries** на все SELECT запросы
- **Batch operations** для массового создания

## 🔄 Exercises Architecture

### Генерация → Выполнение → Сохранение
```
1. POST /exercises/multiple-choice
   ↓
2. Generate sessionId + questions
   ↓
3. Return to frontend
   ↓
4. User completes exercise (frontend)
   ↓
5. POST /exercises/complete
   ↓
6. Save results to exercise_sessions
```

**Важно**: Логика упражнений выполняется на **фронтенде**, бэкенд только генерирует вопросы и сохраняет результаты.

## 📊 Middleware Pipeline
```
Request
  ↓
CORS
  ↓
Body Parser
  ↓
Rate Limiter
  ↓
Auth Middleware (если требуется)
  ↓
Controller
  ↓
Error Handler
  ↓
Response
```

## 🚀 Deployment Considerations

### Environment-specific configs

- **Development**: `localhost:3000`, detailed logs
- **Production**: Cloud URL, minimal logs, error tracking

### Environment Variables
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## 🔮 Будущие улучшения

### Потенциальные оптимизации

1. **Кэширование** - Redis для часто запрашиваемых данных
2. **WebSockets** - Реал-тайм обновления статистики
3. **Background Jobs** - Queue для тяжелых операций
4. **CDN** - Для статических ресурсов (аудио для TTS)
5. **Database Replication** - Read replicas для масштабирования