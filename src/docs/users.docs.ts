export const usersDocs = {
  '/users/me': {
    get: {
      summary: 'Получить текущего пользователя',
      description: 'Возвращает информацию о текущем авторизованном пользователе',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Информация о пользователе',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/User'
              }
            }
          }
        },
        401: {
          description: 'Не авторизован',
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