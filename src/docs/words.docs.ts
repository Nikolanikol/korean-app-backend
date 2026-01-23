export const wordsDocs = {
  '/vocabularies/{vocabularyId}/words': {
    get: {
      summary: 'Получить все слова в словаре',
      description: 'Возвращает список всех слов в указанном словаре',
      tags: ['Words'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'vocabularyId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'ID словаря'
        }
      ],
      responses: {
        200: {
          description: 'Список слов',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Word' }
              }
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

    post: {
      summary: 'Добавить слово в словарь',
      description: 'Создаёт новое слово в указанном словаре',
      tags: ['Words'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'vocabularyId',
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
              required: ['korean', 'translation'],
              properties: {
                korean: { type: 'string', example: '사랑' },
                translation: { type: 'string', example: 'любовь' },
                romanization: { type: 'string', example: 'sarang' },
                example_sentence: { type: 'string', example: '사랑해요' },
                notes: { type: 'string', example: 'Существительное' }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Слово создано',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Word' }
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
  '/vocabularies/{vocabularyId}/words/bulk': {
    post: {
      summary: 'Массовое добавление слов',
      description: 'Создаёт несколько слов в словаре одним запросом',
      tags: ['Words'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'vocabularyId',
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
              required: ['words'],
              properties: {
                words: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['korean', 'translation'],
                    properties: {
                      korean: { type: 'string', example: '사랑' },
                      translation: { type: 'string', example: 'любовь' },
                      romanization: { type: 'string', example: 'sarang' },
                      example_sentence: { type: 'string' },
                      notes: { type: 'string' }
                    }
                  },
                  example: [
                    { korean: '사랑', translation: 'любовь', romanization: 'sarang' },
                    { korean: '행복', translation: 'счастье', romanization: 'haengbok' }
                  ]
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Слова созданы',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Word' }
              }
            }
          }
        }
      }
    }
  },

  '/words/{id}': {
    patch: {
      summary: 'Обновить слово',
      description: 'Обновляет информацию о слове',
      tags: ['Words'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'ID слова'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                korean: { type: 'string' },
                translation: { type: 'string' },
                romanization: { type: 'string' },
                example_sentence: { type: 'string' },
                notes: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Слово обновлено',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Word' }
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
    },
    delete: {
      summary: 'Удалить слово',
      description: 'Удаляет слово из словаря',
      tags: ['Words'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'ID слова'
        }
      ],
      responses: {
        204: {
          description: 'Слово удалено'
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
'/vocabularies/{vocabularyId}/words/reorder': {
    patch: {
      summary: 'Изменить порядок слов',
      description: 'Обновляет позиции слов в словаре для кастомной сортировки',
      tags: ['Words'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'vocabularyId',
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
              required: ['wordIds'],
              properties: {
                wordIds: {
                  type: 'array',
                  items: { type: 'string', format: 'uuid' },
                  example: [
                    '123e4567-e89b-12d3-a456-426614174001',
                    '123e4567-e89b-12d3-a456-426614174002',
                    '123e4567-e89b-12d3-a456-426614174003'
                  ],
                  description: 'Массив ID слов в новом порядке'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Порядок слов обновлён',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Word order updated successfully' }
                }
              }
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