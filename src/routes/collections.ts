import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  addVocabularyToCollection,
  removeVocabularyFromCollection
} from '../controllers/collectionsController.js';

const router = express.Router();

// Все роуты требуют аутентификации
router.use(authenticateToken);

// CRUD для коллекций
router.get('/', getCollections);
router.post('/', createCollection);
router.patch('/:id', updateCollection);
router.delete('/:id', deleteCollection);

// Управление словарями в коллекции
router.post('/:id/vocabularies', addVocabularyToCollection);
router.delete('/:id/vocabularies/:vocabularyId', removeVocabularyFromCollection);

export default router;