import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;

    if (!userId) {
      return res.status(401).json({ 
        error: {
          message: 'User not authenticated',
          code: 'NO_USER_ID'
        }
      });
    }

    // Получаем пользователя из БД
    const result = await pool.query(
      'SELECT id, email, display_name, avatar_url, provider, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    const user = result.rows[0];
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        provider: user.provider,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      }
    });
  } catch (error) {
    console.error('❌ Get User Error:', error);
    next(error);
  }
};