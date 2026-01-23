export const studyDocs = {
  '/study/due-words': {
    get: {
      summary: 'Получить слова на повторение',
      description: 'Возвращает слова, которые нужно повторить сегодня (SRS система)',
      tags: ['Study'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'vocabularyId',
          schema: { type: 'string', format: 'uuid' },
          description: 'Фильтр по конкретному словарю (опционально)'
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', default: 20 },
          description: 'Максимальное количество слов'
        }
      ],
      responses: {
        200: {
          description: 'Список слов на повторение',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    word: { $ref: '#/components/schemas/Word' },
                    progress: { $ref: '#/components/schemas/WordProgress' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/study/answer': {
    post: {
      summary: 'Отправить результат изучения слова',
      description: 'Обновляет прогресс изучения слова на основе алгоритма SM-2 (SRS)',
      tags: ['Study'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['wordId', 'quality'],
              properties: {
                wordId: {
                  type: 'string',
                  format: 'uuid',
                  example: '123e4567-e89b-12d3-a456-426614174000'
                },
                quality: {
                  type: 'integer',
                  minimum: 0,
                  maximum: 5,
                  example: 4,
                  description: 'Качество ответа: 0-2 (неправильно), 3-5 (правильно)'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Прогресс обновлён',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/WordProgress' }
            }
          }
        },
        404: {
          description: 'Слово не найдено',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/study/stats': {
    get: {
      summary: 'Получить статистику обучения',
      description: 'Возвращает общую статистику по изучению слов',
      tags: ['Study'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Статистика обучения',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  totalWords: {
                    type: 'integer',
                    example: 150,
                    description: 'Общее количество слов'
                  },
                  dueToday: {
                    type: 'integer',
                    example: 12,
                    description: 'Слов на повторение сегодня'
                  },
                  learned: {
                    type: 'integer',
                    example: 85,
                    description: 'Выученных слов (repetitions >= 3)'
                  },
                  learning: {
                    type: 'integer',
                    example: 65,
                    description: 'В процессе изучения'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};