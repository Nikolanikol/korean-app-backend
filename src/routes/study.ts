import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { 
  getDueWords,
  submitAnswer,
  getStudyStats
} from '../controllers/studyController.js';

const router = express.Router();

/**
 * GET /study/due-words?vocabularyId=optional
 * Получить слова на повторение сегодня
 */
router.get('/due-words', authenticateToken, getDueWords);

/**
 * POST /study/answer
 * Отправить ответ на слово (правильно/неправильно)
 */
router.post('/answer', authenticateToken, submitAnswer);

/**
 * GET /study/stats
 * Получить статистику обучения
 */
router.get('/stats', authenticateToken, getStudyStats);

export default router;