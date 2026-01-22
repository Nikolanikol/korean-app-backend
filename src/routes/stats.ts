import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getUserStats,
  updateDailyGoal,
  getUserAchievements
} from '../controllers/statsController.js';

const router = express.Router();

// Все роуты требуют аутентификации
router.use(authenticateToken);

router.get('/', getUserStats);
router.patch('/daily-goal', updateDailyGoal);
router.get('/achievements', getUserAchievements);

export default router;