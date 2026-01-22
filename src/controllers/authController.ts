import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const handleGoogleCallback = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;

    if (!user) {
      console.error('❌ Auth Error: No user object in request');
      return res.status(401).json({ 
        error: {
          message: 'Authentication failed',
          code: 'NO_USER'
        }
      });
    }

    if (!user.id || !user.email) {
      console.error('❌ Auth Error: Incomplete user data');
      return res.status(500).json({ 
        error: {
          message: 'Incomplete user data',
          code: 'INVALID_USER_DATA'
        }
      });
    }

    // Генерируем JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    console.log('✅ JWT Token generated for:', user.email);

    // Возвращаем токен
    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
      },
      token,
    });
  } catch (error) {
    console.error('❌ JWT Generation Error:', error);
    next(error);
  }
};