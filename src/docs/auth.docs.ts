import { schemas } from './schemas.js';

export const authDocs = {
  '/auth/google': {
    get: {
      summary: 'Начало Google OAuth flow',
      description: 'Инициирует процесс аутентификации через Google. Перенаправляет пользователя на страницу входа Google.',
      tags: ['Authentication'],
      responses: {
        302: {
          description: 'Редирект на страницу Google OAuth'
        }
      }
    }
  },

  '/auth/google/callback': {
    get: {
      summary: 'Google OAuth callback',
      description: 'Обработка ответа от Google после успешной авторизации. Возвращает JWT token.',
      tags: ['Authentication'],
      responses: {
        200: {
          description: 'Успешная авторизация',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                  },
                  user: {
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Ошибка авторизации',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    }
  }
};