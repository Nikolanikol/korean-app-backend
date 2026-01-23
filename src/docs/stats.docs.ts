export const statsDocs = {
  '/stats': {
    get: {
      summary: 'Получить статистику пользователя',
      description: 'Возвращает общую статистику обучения: streak, выученные слова, дневная цель',
      tags: ['Stats'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Статистика пользователя',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserStats' }
            }
          }
        }
      }
    }
  },
  '/stats/daily-goal': {
    patch: {
      summary: 'Обновить дневную цель',
      description: 'Устанавливает новую дневную цель по количеству слов для изучения',
      tags: ['Stats'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['dailyGoal'],
              properties: {
                dailyGoal: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 100,
                  example: 30,
                  description: 'Новая дневная цель (1-100 слов)'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Дневная цель обновлена',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserStats' }
            }
          }
        }
      }
    }
  },
  '/stats/achievements': {
    get: {
      summary: 'Получить достижения пользователя',
      description: 'Возвращает список всех разблокированных достижений',
      tags: ['Stats'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Список достижений',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Achievement' }
              }
            }
          }
        }
      }
    }
  }
};