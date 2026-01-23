export const vocabulariesDocs = {
  '/vocabularies': {
    get: {
      summary: 'Получить список словарей',
      description: 'Возвращает список словарей текущего пользователя с пагинацией',
      tags: ['Vocabularies'],
      security: [{ bearerAuth: [] }],
      parameters: [
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
          description: 'Список словарей',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  vocabularies: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Vocabulary' }
                  },
                  count: { type: 'integer', example: 50 },
                  limit: { type: 'integer', example: 20 },
                  offset: { type: 'integer', example: 0 },
                  hasMore: { type: 'boolean', example: true }
                }
              }
            }
          }
        }
      }
    },
post: {
    summary: 'Создать новый словарь',
    description: 'Создаёт новый словарь для текущего пользователя',
    tags: ['Vocabularies'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['title'],
            properties: {
              title: { type: 'string', example: 'My Korean Vocabulary' },
              description: { type: 'string', example: 'Words I learned today' },
              language: { type: 'string', default: 'ko' },
              category: { type: 'string', example: 'general' },
              difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
              tags: { type: 'array', items: { type: 'string' }, example: ['daily', 'basics'] }
            }
          }
        }
      }
    },
    responses: {
      201: {
        description: 'Словарь создан',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Vocabulary' }
          }
        }
      }
    }
  },
  
  },

  '/vocabularies/{id}': {
    get: {
      summary: 'Получить словарь по ID',
      description: 'Возвращает детальную информацию о словаре',
      tags: ['Vocabularies'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'ID словаря'
        }
      ],
      responses: {
        200: {
          description: 'Информация о словаре',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Vocabulary' }
            }
          }
        },
        404: {
          description: 'Словарь не найден',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    patch: {
    summary: 'Обновить словарь',
    description: 'Обновляет информацию о словаре',
    tags: ['Vocabularies'],
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'ID словаря'
      }
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              category: { type: 'string' },
              difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
              tags: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Словарь обновлён',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Vocabulary' }
          }
        }
      },
      404: {
        description: 'Словарь не найден',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      }
    }
  },
  delete: {
    summary: 'Удалить словарь',
    description: 'Удаляет словарь и все связанные слова',
    tags: ['Vocabularies'],
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'ID словаря'
      }
    ],
    responses: {
      204: {
        description: 'Словарь удалён'
      },
      404: {
        description: 'Словарь не найден',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      }
    }
  }
  },
'/vocabularies/{id}/share': {
    patch: {
      summary: 'Изменить публичность словаря',
      description: 'Делает словарь публичным или приватным',
      tags: ['Vocabularies'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'ID словаря'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['is_public'],
              properties: {
                is_public: { type: 'boolean', example: true }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Настройки публичности обновлены',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Vocabulary' }
            }
          }
        },
        404: {
          description: 'Словарь не найден',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
'/vocabularies/{id}/fork': {
    post: {
      summary: 'Скопировать словарь себе',
      description: 'Создаёт копию публичного словаря для текущего пользователя',
      tags: ['Vocabularies'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'ID словаря для копирования'
        }
      ],
      responses: {
        201: {
          description: 'Словарь успешно скопирован',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Vocabulary' }
            }
          }
        },
        404: {
          description: 'Словарь не найден',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  }


};