import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

interface JWTPayload {
  userId: string;
  email: string;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Получаем токен из заголовка Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.error('❌ Auth Error: No token provided');
    return res.status(401).json({ 
      error: {
        message: 'Access token required',
        code: 'NO_TOKEN'
      }
    });
  }

  try {
    // Проверяем токен
    const payload = jwt.verify(token, config.jwt.secret) as JWTPayload;
    
    // Добавляем данные пользователя в request
    req.user = payload;
    
    console.log('✅ Token verified for user:', payload.email);
    next();
  } catch (error) {
    console.error('❌ Invalid token:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: {
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        }
      });
    }
    
    return res.status(403).json({ 
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      }
    });
  }
};