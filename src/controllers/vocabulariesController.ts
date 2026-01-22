import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';

/**
 * GET /vocabularies
 * Получить все словари текущего пользователя
 */
export const getVocabularies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'User not authenticated',
          code: 'NO_USER_ID'
        }
      });
    }

    // Получаем все словари пользователя
    const result = await pool.query(
      `SELECT 
        id, 
        user_id, 
        title, 
        description, 
        language, 
        difficulty_level, 
        category,
        tags,
        is_public,
        is_official,
        word_count,
        fork_count,
        study_count,
        created_at, 
        updated_at
      FROM vocabularies 
      WHERE user_id = $1 
      ORDER BY created_at DESC`,
      [userId]
    );

    console.log(`✅ Retrieved ${result.rows.length} vocabularies for user:`, userId);

    res.json({
      vocabularies: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Get Vocabularies Error:', error);
    next(error);
  }
};

/**
 * GET /vocabularies/:id
 * Получить конкретный словарь по ID
 */
export const getVocabularyById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'User not authenticated',
          code: 'NO_USER_ID'
        }
      });
    }

    // Получаем словарь
    const result = await pool.query(
      `SELECT 
        id, 
        user_id, 
        title, 
        description, 
        language, 
        difficulty_level, 
        category,
        tags,
        is_public,
        is_official,
        word_count,
        fork_count,
        study_count,
        created_at, 
        updated_at
      FROM vocabularies 
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Vocabulary not found',
          code: 'VOCABULARY_NOT_FOUND'
        }
      });
    }

    const vocabulary = result.rows[0];

    // Проверяем права доступа: либо владелец, либо публичный словарь
    if (vocabulary.user_id !== userId && !vocabulary.is_public) {
      return res.status(403).json({
        error: {
          message: 'Access denied to this vocabulary',
          code: 'ACCESS_DENIED'
        }
      });
    }

    console.log(`✅ Retrieved vocabulary:`, vocabulary.id);

    res.json({
      vocabulary
    });
  } catch (error) {
    console.error('❌ Get Vocabulary Error:', error);
    next(error);
  }
};

/**
 * POST /vocabularies
 * Создать новый словарь
 */
export const createVocabulary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'User not authenticated',
          code: 'NO_USER_ID'
        }
      });
    }

    // Получаем данные из body
    const { 
      title, 
      description, 
      language, 
      difficultyLevel, 
      category,
      tags,
      isPublic 
    } = req.body;

   if (!title || title.trim().length === 0) {
  return res.status(400).json({
    error: {
      message: 'Title is required',
      code: 'TITLE_REQUIRED'
    }
  });
}

if (!description || description.trim().length === 0) {
  return res.status(400).json({
    error: {
      message: 'Description is required',
      code: 'DESCRIPTION_REQUIRED'
    }
  });
}

if (!category || category.trim().length === 0) {
  return res.status(400).json({
    error: {
      message: 'Category is required',
      code: 'CATEGORY_REQUIRED'
    }
  });
}

if (!difficultyLevel) {
  return res.status(400).json({
    error: {
      message: 'Difficulty level is required',
      code: 'DIFFICULTY_LEVEL_REQUIRED'
    }
  });
}

// Валидация difficulty_level
if (!['beginner', 'intermediate', 'advanced'].includes(difficultyLevel)) {
  return res.status(400).json({
    error: {
      message: 'Invalid difficulty level. Must be: beginner, intermediate, or advanced',
      code: 'INVALID_DIFFICULTY'
    }
  });
}


    // Создаем словарь
// Создаем словарь
const result = await pool.query(
  `INSERT INTO vocabularies 
    (user_id, title, description, language, difficulty_level, category, tags, is_public)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING 
    id, user_id, title, description, language, difficulty_level, 
    category, tags, is_public, is_official, word_count, fork_count, 
    study_count, created_at, updated_at`,
  [
    userId,
    title.trim(),
    description.trim(),
    language || 'ko',
    difficultyLevel,
    category.trim(),
    tags || [],
    isPublic || false
  ]
);

    const vocabulary = result.rows[0];

    console.log('✅ Vocabulary created:', vocabulary.id);

    res.status(201).json({
      vocabulary
    });
  } catch (error) {
    console.error('❌ Create Vocabulary Error:', error);
    next(error);
  }
};

/**
 * PATCH /vocabularies/:id
 * Обновить словарь
 */
export const updateVocabulary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'User not authenticated',
          code: 'NO_USER_ID'
        }
      });
    }

    // Проверяем что словарь существует и принадлежит пользователю
    const checkResult = await pool.query(
      'SELECT user_id FROM vocabularies WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Vocabulary not found',
          code: 'VOCABULARY_NOT_FOUND'
        }
      });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({
        error: {
          message: 'You can only update your own vocabularies',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Получаем данные для обновления
    const { 
      title, 
      description, 
      language, 
      difficultyLevel, 
      category,
      tags,
      isPublic 
    } = req.body;

    // Валидация: хотя бы одно поле должно быть передано
    if (!title && !description && !language && !difficultyLevel && !category && !tags && isPublic === undefined) {
      return res.status(400).json({
        error: {
          message: 'No fields to update',
          code: 'EMPTY_UPDATE'
        }
      });
    }

    // Валидация difficulty_level
    if (difficultyLevel && !['beginner', 'intermediate', 'advanced'].includes(difficultyLevel)) {
      return res.status(400).json({
        error: {
          message: 'Invalid difficulty level. Must be: beginner, intermediate, or advanced',
          code: 'INVALID_DIFFICULTY'
        }
      });
    }

    // Формируем динамический SQL запрос
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title.trim());
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }

    if (language !== undefined) {
      updates.push(`language = $${paramIndex++}`);
      values.push(language);
    }

    if (difficultyLevel !== undefined) {
      updates.push(`difficulty_level = $${paramIndex++}`);
      values.push(difficultyLevel);
    }

    if (category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(category);
    }

    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(tags);
    }

    if (isPublic !== undefined) {
      updates.push(`is_public = $${paramIndex++}`);
      values.push(isPublic);
    }

    // Добавляем updated_at
    updates.push(`updated_at = NOW()`);

    // Добавляем id в конец
    values.push(id);

    const query = `
      UPDATE vocabularies 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id, user_id, title, description, language, difficulty_level, 
        category, tags, is_public, is_official, word_count, fork_count, 
        study_count, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    const vocabulary = result.rows[0];

    console.log('✅ Vocabulary updated:', vocabulary.id);

    res.json({
      vocabulary
    });
  } catch (error) {
    console.error('❌ Update Vocabulary Error:', error);
    next(error);
  }
};

/**
 * DELETE /vocabularies/:id
 * Удалить словарь
 */
export const deleteVocabulary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'User not authenticated',
          code: 'NO_USER_ID'
        }
      });
    }

    // Проверяем что словарь существует и принадлежит пользователю
    const checkResult = await pool.query(
      'SELECT user_id, title FROM vocabularies WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Vocabulary not found',
          code: 'VOCABULARY_NOT_FOUND'
        }
      });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({
        error: {
          message: 'You can only delete your own vocabularies',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Удаляем словарь (каскадное удаление слов настроено на уровне БД)
    await pool.query(
      'DELETE FROM vocabularies WHERE id = $1',
      [id]
    );

    console.log('✅ Vocabulary deleted:', id, '- Title:', checkResult.rows[0].title);

    res.json({
      message: 'Vocabulary successfully deleted',
      deletedVocabularyId: id
    });
  } catch (error) {
    console.error('❌ Delete Vocabulary Error:', error);
    next(error);
  }
};

/**
 * PATCH /vocabularies/:id/share
 * Сделать словарь публичным или приватным
 */
export const makeVocabularyPublic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { id } = req.params;
    const { isPublic } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'User not authenticated',
          code: 'NO_USER_ID'
        }
      });
    }

    // Валидация
    if (typeof isPublic !== 'boolean') {
      return res.status(400).json({
        error: {
          message: 'isPublic must be a boolean value',
          code: 'INVALID_IS_PUBLIC'
        }
      });
    }

    // Проверяем что словарь существует и принадлежит пользователю
    const checkResult = await pool.query(
      'SELECT user_id, is_public FROM vocabularies WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Vocabulary not found',
          code: 'VOCABULARY_NOT_FOUND'
        }
      });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({
        error: {
          message: 'You can only change sharing settings for your own vocabularies',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Обновляем статус публичности
    const result = await pool.query(
      `UPDATE vocabularies 
       SET is_public = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING 
         id, user_id, title, description, language, difficulty_level, 
         category, tags, is_public, is_official, word_count, fork_count, 
         study_count, created_at, updated_at`,
      [isPublic, id]
    );

    const vocabulary = result.rows[0];

    console.log(`✅ Vocabulary ${isPublic ? 'shared publicly' : 'made private'}:`, vocabulary.id);

    res.json({
      vocabulary,
      message: isPublic 
        ? 'Vocabulary is now public and visible in the library' 
        : 'Vocabulary is now private'
    });
  } catch (error) {
    console.error('❌ Make Vocabulary Public Error:', error);
    next(error);
  }
};
// **
//  * POST /vocabularies/:id/fork
//  * Скопировать чужой словарь себе
//  */
export const forkVocabulary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'User not authenticated',
          code: 'NO_USER_ID'
        }
      });
    }

    // Получаем оригинальный словарь
    const originalResult = await pool.query(
      `SELECT * FROM vocabularies WHERE id = $1`,
      [id]
    );

    if (originalResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Vocabulary not found',
          code: 'VOCABULARY_NOT_FOUND'
        }
      });
    }

    const original = originalResult.rows[0];

    // Проверяем что словарь публичный (если это не свой словарь)
    if (original.user_id !== userId && !original.is_public) {
      return res.status(403).json({
        error: {
          message: 'Cannot fork private vocabulary',
          code: 'VOCABULARY_NOT_PUBLIC'
        }
      });
    }

    // Нельзя форкнуть свой собственный словарь
    if (original.user_id === userId) {
      return res.status(400).json({
        error: {
          message: 'Cannot fork your own vocabulary',
          code: 'CANNOT_FORK_OWN'
        }
      });
    }

    // Начинаем транзакцию
    await pool.query('BEGIN');

    try {
      // Создаем копию словаря
      const forkedResult = await pool.query(
        `INSERT INTO vocabularies 
          (user_id, title, description, language, difficulty_level, category, tags, is_public)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING 
          id, user_id, title, description, language, difficulty_level, 
          category, tags, is_public, is_official, word_count, fork_count, 
          study_count, created_at, updated_at`,
        [
          userId,
          `${original.title} (копия)`,
          original.description,
          original.language,
          original.difficulty_level,
          original.category,
          original.tags,
          false // Копия всегда приватная по умолчанию
        ]
      );

      const forkedVocabulary = forkedResult.rows[0];

      // Увеличиваем fork_count у оригинала
      await pool.query(
        'UPDATE vocabularies SET fork_count = fork_count + 1 WHERE id = $1',
        [id]
      );

      // Коммитим транзакцию
      await pool.query('COMMIT');

      console.log('✅ Vocabulary forked:', forkedVocabulary.id, 'from:', id);

      res.status(201).json({
        vocabulary: forkedVocabulary,
        message: 'Vocabulary successfully copied to your library'
      });
    } catch (error) {
      // Откатываем транзакцию при ошибке
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('❌ Fork Vocabulary Error:', error);
    next(error);
  }
};