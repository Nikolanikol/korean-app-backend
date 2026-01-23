export const schemas = {
  User: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'user@example.com'
      },
      username: {
        type: 'string',
        example: 'john_doe'
      }
    }
  },

  Error: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        example: 'Error message'
      }
    }
  },
  Vocabulary: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      user_id: {
        type: 'string',
        format: 'uuid'
      },
      title: {
        type: 'string',
        example: 'TOPIK I Vocabulary'
      },
      description: {
        type: 'string',
        example: 'Essential words for TOPIK I exam'
      },
      language: {
        type: 'string',
        example: 'ko'
      },
      is_public: {
        type: 'boolean',
        example: false
      },
      is_official: {
        type: 'boolean',
        example: false
      },
      category: {
        type: 'string',
        example: 'exam_prep'
      },
      difficulty: {
        type: 'string',
        example: 'beginner'
      },
      tags: {
        type: 'array',
        items: {
          type: 'string'
        },
        example: ['topik', 'beginner']
      },
      created_at: {
        type: 'string',
        format: 'date-time'
      },
      updated_at: {
        type: 'string',
        format: 'date-time'
      }
    }
  },

  Word: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      vocabulary_id: {
        type: 'string',
        format: 'uuid'
      },
      korean: {
        type: 'string',
        example: '안녕하세요'
      },
      translation: {
        type: 'string',
        example: 'Здравствуйте'
      },
      romanization: {
        type: 'string',
        example: 'annyeonghaseyo'
      },
      example_sentence: {
        type: 'string',
        example: '안녕하세요! 만나서 반갑습니다.'
      },
      notes: {
        type: 'string',
        example: 'Формальное приветствие'
      },
      position: {
        type: 'integer',
        example: 1
      },
      created_at: {
        type: 'string',
        format: 'date-time'
      }
    }
  },
  WordProgress: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid'
      },
      user_id: {
        type: 'string',
        format: 'uuid'
      },
      word_id: {
        type: 'string',
        format: 'uuid'
      },
      repetitions: {
        type: 'integer',
        example: 3
      },
      easiness_factor: {
        type: 'number',
        example: 2.5
      },
      interval: {
        type: 'integer',
        example: 7,
        description: 'Интервал в днях до следующего повторения'
      },
      next_review_at: {
        type: 'string',
        format: 'date-time'
      },
      last_reviewed_at: {
        type: 'string',
        format: 'date-time'
      }
    }
  },
  Collection: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      user_id: {
        type: 'string',
        format: 'uuid'
      },
      name: {
        type: 'string',
        example: 'TOPIK I Preparation'
      },
      description: {
        type: 'string',
        example: 'All vocabularies for TOPIK I exam'
      },
      created_at: {
        type: 'string',
        format: 'date-time'
      }
    }
  },
  UserStats: {
    type: 'object',
    properties: {
      user_id: {
        type: 'string',
        format: 'uuid'
      },
      current_streak: {
        type: 'integer',
        example: 7,
        description: 'Текущая серия дней подряд'
      },
      longest_streak: {
        type: 'integer',
        example: 15,
        description: 'Самая длинная серия'
      },
      total_words_learned: {
        type: 'integer',
        example: 250
      },
      daily_goal: {
        type: 'integer',
        example: 20,
        description: 'Дневная цель (слов)'
      },
      last_activity_date: {
        type: 'string',
        format: 'date'
      }
    }
  },

  Achievement: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid'
      },
      user_id: {
        type: 'string',
        format: 'uuid'
      },
      achievement_type: {
        type: 'string',
        example: 'first_word',
        description: 'Тип достижения'
      },
      unlocked_at: {
        type: 'string',
        format: 'date-time'
      }
    }
  },
};