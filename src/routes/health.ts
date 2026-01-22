import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});
// Тестовый endpoint для проверки error handler
// router.get('/error', (req, res, next) => {
//   const error = new Error('This is a test error!');
//   next(error);  // Передаем ошибку в error handler
// });
export default router;