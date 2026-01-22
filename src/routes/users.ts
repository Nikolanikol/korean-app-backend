import express from 'express';

import { deleteAccount, getCurrentUser, updateProfile } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /users/me - получить текущего пользователя (защищенный endpoint)
router.get('/me', authenticateToken, getCurrentUser);

// PATCH /users/me - обновить профиль (защищенный endpoint)
router.patch('/me', authenticateToken, updateProfile);

// DELETE /users/me - удалить аккаунт (защищенный endpoint)
router.delete('/me', authenticateToken, deleteAccount);
export default router;

