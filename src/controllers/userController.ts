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
export const updateProfile = async (
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

    // Получаем данные для обновления из body
    const { displayName, nativeLanguage, learningLanguage } = req.body;

    // Валидация: хотя бы одно поле должно быть передано
    if (!displayName && !nativeLanguage && !learningLanguage) {
      return res.status(400).json({
        error: {
          message: 'No fields to update',
          code: 'EMPTY_UPDATE'
        }
      });
    }

    // Формируем SQL запрос динамически
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (displayName !== undefined) {
      updates.push(`display_name = $${paramIndex++}`);
      values.push(displayName);
    }

    if (nativeLanguage !== undefined) {
      updates.push(`native_language = $${paramIndex++}`);
      values.push(nativeLanguage);
    }

    if (learningLanguage !== undefined) {
      updates.push(`learning_language = $${paramIndex++}`);
      values.push(learningLanguage);
    }

    // Добавляем updated_at
    updates.push(`updated_at = NOW()`);

    // Добавляем userId в конец
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, display_name, avatar_url, provider, native_language, learning_language, created_at, updated_at
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    const user = result.rows[0];

    console.log('✅ Profile updated for user:', user.email);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        provider: user.provider,
        nativeLanguage: user.native_language,
        learningLanguage: user.learning_language,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      }
    });
  } catch (error) {
    console.error('❌ Update Profile Error:', error);
    next(error);
  }
};
export const deleteAccount = async (
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

    // Удаляем пользователя (каскадное удаление настроено на уровне БД)
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, email',
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

    const deletedUser = result.rows[0];

    console.log('✅ Account deleted for user:', deletedUser.email);

    res.json({
      message: 'Account successfully deleted',
      deletedUserId: deletedUser.id
    });
  } catch (error) {
    console.error('❌ Delete Account Error:', error);
    next(error);
  }
};