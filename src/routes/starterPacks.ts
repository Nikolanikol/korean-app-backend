import express from 'express';
import { getStarterPacks } from '../controllers/starterPacksController.js';

const router = express.Router();

// Публичный endpoint (не требует аутентификации)
router.get('/', getStarterPacks);

export default router;