import express from 'express';
import {
  getPublicVocabularies,
  searchPublicVocabularies,
  getTrendingVocabularies
} from '../controllers/publicLibraryController.js';

const router = express.Router();

// Публичные endpoints (не требуют аутентификации)
router.get('/vocabularies', getPublicVocabularies);
router.get('/search', searchPublicVocabularies);
router.get('/trending', getTrendingVocabularies);

export default router;