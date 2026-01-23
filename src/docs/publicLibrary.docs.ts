export const publicLibraryDocs = {
  '/library/vocabularies': {
    get: {
      summary: 'Получить публичные словари',
      description: 'Возвращает список публичных словарей с фильтрами и пагинацией',
      tags: ['Public Library'],
      parameters: [
        {
          in: 'query',
          name: 'language',
          schema: { type: 'string', example: 'ko' },
          description: 'Фильтр по языку'
        },
        {
          in: 'query',
          name: 'difficulty',
          schema: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
          description: 'Фильтр по сложности'
        },
        {
          in: 'query',
          name: 'category',
          schema: { type: 'string', example: 'exam_prep' },
          description: 'Фильтр по категории'
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', default: 20 },
          description: 'Количество результатов'
        },
        {
          in: 'query',
          name: 'offset',
          schema: { type: 'integer', default: 0 },
          description: 'Смещение для пагинации'
        }
      ],
      responses: {
        200: {
          description: 'Список публичных словарей',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  vocabularies: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Vocabulary' }
                  },
                  count: { type: 'integer' },
                  limit: { type: 'integer' },
                  offset: { type: 'integer' },
                  hasMore: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/library/search': {
    get: {
      summary: 'Поиск в публичной библиотеке',
      description: 'Текстовый поиск по названиям и описаниям публичных словарей',
      tags: ['Public Library'],
      parameters: [
        {
          in: 'query',
          name: 'q',
          required: true,
          schema: { type: 'string', example: 'topik' },
          description: 'Поисковый запрос'
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', default: 20 },
          description: 'Количество результатов'
        },
        {
          in: 'query',
          name: 'offset',
          schema: { type: 'integer', default: 0 },
          description: 'Смещение для пагинации'
        }
      ],
      responses: {
        200: {
          description: 'Результаты поиска',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  vocabularies: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Vocabulary' }
                  },
                  count: { type: 'integer' },
                  limit: { type: 'integer' },
                  offset: { type: 'integer' },
                  hasMore: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/library/trending': {
    get: {
      summary: 'Популярные словари',
      description: 'Возвращает самые популярные публичные словари',
      tags: ['Public Library'],
      parameters: [
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', default: 10 },
          description: 'Количество результатов'
        }
      ],
      responses: {
        200: {
          description: 'Список популярных словарей',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Vocabulary' }
              }
            }
          }
        }
      }
    }
  },
  
};