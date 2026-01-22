import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { 
  getWords,
  createWord,
  createBulkWords,
  updateWord,
  deleteWord,
  reorderWords
} from '../controllers/wordsController.js';

const router = express.Router();

/**
 * GET /vocabularies/:vocabularyId/words
 * Получить все слова из словаря
 */
router.get('/vocabularies/:vocabularyId/words', authenticateToken, getWords);

/**
 * POST /vocabularies/:vocabularyId/words
 * Создать новое слово в словаре
 */
router.post('/vocabularies/:vocabularyId/words', authenticateToken, createWord);

/**
 * POST /vocabularies/:vocabularyId/words/bulk
 * Создать несколько слов сразу
 */
router.post('/vocabularies/:vocabularyId/words/bulk', authenticateToken, createBulkWords);

/**
 * PATCH /vocabularies/:vocabularyId/words/reorder
 * Изменить порядок слов
 */
router.patch('/vocabularies/:vocabularyId/words/reorder', authenticateToken, reorderWords);

/**
 * PATCH /words/:id
 * Обновить слово
 */
router.patch('/words/:id', authenticateToken, updateWord);

/**
 * DELETE /words/:id
 * Удалить слово
 */
router.delete('/words/:id', authenticateToken, deleteWord);

export default router;