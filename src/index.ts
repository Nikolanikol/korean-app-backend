import express from 'express';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import { setupMiddleware } from './middleware/common';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { config } from './config/env';
import { testConnection } from './config/database';
import passport from './config/passport.js';
import usersRouter from './routes/users.js';  // ⬅️ Добавили
import vocabulariesRouter from './routes/vocabularies.js';  // ⬅️ Добавили
import wordsRouter from './routes/words.js';  // ⬅️ Добавили
import studyRouter from './routes/study.js';  // ⬅️ Добавили
import collectionsRouter from './routes/collections.js';
import publicLibraryRouter from './routes/publicLibrary.js';
import statsRouter from './routes/stats.js';
import exercisesRouter from './routes/exercises.js';
import starterPacksRouter from './routes/starterPacks.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const app = express();
const PORT = config.port;


// Setup middleware
setupMiddleware(app);
// Initialize Passport
app.use(passport.initialize());
app.use('/api', apiLimiter);

// Routes
app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);  // ⬅️ Добавили
app.use('/vocabularies', vocabulariesRouter);  // ⬅️ Добавили
app.use('/', wordsRouter);  // ⬅️ Добавили (без префикса, т.к. пути уже полные)
app.use('/study', studyRouter);  // ⬅️ Добавили
app.use('/collections', collectionsRouter);
app.use('/library', publicLibraryRouter);
app.use('/stats', statsRouter);
app.use('/exercises', exercisesRouter);
app.use('/starter-packs', starterPacksRouter);


// 404 handler (после routes, перед error handler)
app.use(notFoundHandler);
// Error handler (должен быть ПОСЛЕДНИМ)
app.use(errorHandler);
app.listen(PORT, async() => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
    
  // Test database connection
  await testConnection();
});