import express from 'express';
import cors from 'cors';

// Создаём минимальный Express app для тестирования
export function createTestApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check endpoint для теста
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}