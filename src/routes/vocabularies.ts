import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { 
  getVocabularies,
  getVocabularyById,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary
} from '../controllers/vocabulariesController.js';

const router = express.Router();

/**
 * GET /vocabularies
 * Получить все словари текущего пользователя
 */
router.get('/', authenticateToken, getVocabularies);

/**
 * GET /vocabularies/:id
 * Получить конкретный словарь по ID
 */
router.get('/:id', authenticateToken, getVocabularyById);

/**
 * POST /vocabularies
 * Создать новый словарь
 */
router.post('/', authenticateToken, createVocabulary);

/**
 * PATCH /vocabularies/:id
 * Обновить словарь
 */
router.patch('/:id', authenticateToken, updateVocabulary);

/**
 * DELETE /vocabularies/:id
 * Удалить словарь
 */
router.delete('/:id', authenticateToken, deleteVocabulary);

export default router;