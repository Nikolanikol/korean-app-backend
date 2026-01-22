import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  generateMultipleChoice,
  generateTyping,
  generateMatching,
  completeExercise
} from '../controllers/exercisesController.js';

const router = express.Router();

// Все роуты требуют аутентификации
router.use(authenticateToken);

router.post('/multiple-choice', generateMultipleChoice);
router.post('/typing', generateTyping);
router.post('/matching', generateMatching);
router.post('/complete', completeExercise);

export default router;