export const collectionsDocs = {
  '/collections': {
    get: {
      summary: 'Получить список коллекций',
      description: 'Возвращает все коллекции текущего пользователя',
      tags: ['Collections'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Список коллекций',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Collection' }
              }
            }
          }
        }
      }
    }
    ,
    post: {
      summary: 'Создать новую коллекцию',
      description: 'Создаёт новую коллекцию для группировки словарей',
      tags: ['Collections'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string', example: 'TOPIK I Preparation' },
                description: { type: 'string', example: 'All vocabularies for TOPIK I exam' }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Коллекция создана',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Collection' }
            }
          }
        }
      }

  }
  },
  
'/collections/{id}': {
    patch: {
      summary: 'Обновить коллекцию',
      description: 'Обновляет название и описание коллекции',
      tags: ['Collections'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'ID коллекции'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Коллекция обновлена',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Collection' }
            }
          }
        },
        404: {
          description: 'Коллекция не найдена',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    delete: {
      summary: 'Удалить коллекцию',
      description: 'Удаляет коллекцию (словари остаются)',
      tags: ['Collections'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'ID коллекции'
        }
      ],
      responses: {
        204: {
          description: 'Коллекция удалена'
        },
        404: {
          description: 'Коллекция не найдена',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/collections/{id}/vocabularies': {
    post: {
      summary: 'Добавить словарь в коллекцию',
      description: 'Добавляет существующий словарь в коллекцию',
      tags: ['Collections'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'ID коллекции'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['vocabularyId'],
              properties: {
                vocabularyId: {
                  type: 'string',
                  format: 'uuid',
                  example: '123e4567-e89b-12d3-a456-426614174000'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Словарь добавлен в коллекцию',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Vocabulary added to collection' }
                }
              }
            }
          }
        },
        404: {
          description: 'Коллекция или словарь не найдены',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/collections/{id}/vocabularies/{vocabularyId}': {
    delete: {
      summary: 'Удалить словарь из коллекции',
      description: 'Убирает словарь из коллекции (сам словарь не удаляется)',
      tags: ['Collections'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'ID коллекции'
        },
        {
          in: 'path',
          name: 'vocabularyId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'ID словаря'
        }
      ],
      responses: {
        204: {
          description: 'Словарь удалён из коллекции'
        },
        404: {
          description: 'Коллекция или словарь не найдены',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  
};