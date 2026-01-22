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

const app = express();
const PORT = config.port;


// Setup middleware
setupMiddleware(app);
// Initialize Passport
app.use(passport.initialize());
// Routes
app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);  // ⬅️ Добавили

// 404 handler (после routes, перед error handler)
app.use(notFoundHandler);
// Error handler (должен быть ПОСЛЕДНИМ)
app.use(errorHandler);
app.listen(PORT, async() => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
    
  // Test database connection
  await testConnection();
});