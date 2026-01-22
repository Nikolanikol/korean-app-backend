import express from 'express';

import { getCurrentUser } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /users/me - получить текущего пользователя (защищенный endpoint)
router.get('/me', authenticateToken, getCurrentUser);

export default router;