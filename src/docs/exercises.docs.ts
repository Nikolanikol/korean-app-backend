export const exercisesDocs = {
  '/exercises/multiple-choice': {
    post: {
      summary: 'Генерация Multiple Choice упражнения',
      description: 'Создаёт набор вопросов с выбором из 4 вариантов ответа',
      tags: ['Exercises'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['vocabularyId', 'count'],
              properties: {
                vocabularyId: {
                  type: 'string',
                  format: 'uuid',
                  example: '123e4567-e89b-12d3-a456-426614174000'
                },
                count: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 20,
                  example: 10,
                  description: 'Количество вопросов (1-20)'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Набор вопросов сгенерирован',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  sessionId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID сессии упражнения'
                  },
                  questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        wordId: { type: 'string', format: 'uuid' },
                        korean: { type: 'string', example: '사랑' },
                        options: {
                          type: 'array',
                          items: { type: 'string' },
                          example: ['любовь', 'счастье', 'дружба', 'мир']
                        },
                        correctAnswer: { type: 'string', example: 'любовь' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/exercises/typing': {
    post: {
      summary: 'Генерация Typing упражнения',
      description: 'Создаёт набор вопросов где нужно напечатать перевод',
      tags: ['Exercises'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['vocabularyId', 'count'],
              properties: {
                vocabularyId: {
                  type: 'string',
                  format: 'uuid',
                  example: '123e4567-e89b-12d3-a456-426614174000'
                },
                count: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 20,
                  example: 10,
                  description: 'Количество вопросов (1-20)'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Набор вопросов сгенерирован',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  sessionId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID сессии упражнения'
                  },
                  questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        wordId: { type: 'string', format: 'uuid' },
                        korean: { type: 'string', example: '사랑' },
                        correctAnswer: { type: 'string', example: 'любовь' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/exercises/matching': {
    post: {
      summary: 'Генерация Matching упражнения',
      description: 'Создаёт набор пар слов для сопоставления корейского с переводом',
      tags: ['Exercises'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['vocabularyId', 'count'],
              properties: {
                vocabularyId: {
                  type: 'string',
                  format: 'uuid',
                  example: '123e4567-e89b-12d3-a456-426614174000'
                },
                count: {
                  type: 'integer',
                  minimum: 4,
                  maximum: 12,
                  example: 6,
                  description: 'Количество пар (4-12)'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Пары для сопоставления сгенерированы',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  sessionId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID сессии упражнения'
                  },
                  pairs: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        wordId: { type: 'string', format: 'uuid' },
                        korean: { type: 'string', example: '사랑' },
                        translation: { type: 'string', example: 'любовь' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/exercises/complete': {
    post: {
      summary: 'Завершить упражнение',
      description: 'Сохраняет результаты выполненного упражнения',
      tags: ['Exercises'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['sessionId', 'exerciseType', 'score', 'totalQuestions'],
              properties: {
                sessionId: {
                  type: 'string',
                  format: 'uuid',
                  example: '123e4567-e89b-12d3-a456-426614174000'
                },
                exerciseType: {
                  type: 'string',
                  enum: ['multiple_choice', 'typing', 'matching'],
                  example: 'multiple_choice'
                },
                score: {
                  type: 'integer',
                  example: 8,
                  description: 'Количество правильных ответов'
                },
                totalQuestions: {
                  type: 'integer',
                  example: 10,
                  description: 'Общее количество вопросов'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Результат сохранён',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Exercise completed successfully' },
                  accuracy: { type: 'number', example: 80, description: 'Процент правильных ответов' }
                }
              }
            }
          }
        }
      }
    }
  }
};