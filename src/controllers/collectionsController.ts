import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';



// GET /collections - получить все коллекции пользователя
export const getCollections = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;

    const result = await pool.query(
      `SELECT 
        id,
        user_id,
        title,
        description,
        icon,
        color,
        created_at,
        updated_at
      FROM collections
      WHERE user_id = $1
      ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      collections: result.rows
    });
  } catch (error) {
    console.error('❌ Get Collections Error:', error);
    next(error);
  }
};

// POST /collections - создать коллекцию
export const createCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { title, description, icon, color } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: {
          message: 'Title is required',
          code: 'MISSING_TITLE'
        }
      });
    }

    const result = await pool.query(
      `INSERT INTO collections (user_id, title, description, icon, color)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title.trim(), description || null, icon || null, color || null]
    );

    res.status(201).json({
      collection: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Create Collection Error:', error);
    next(error);
  }
};
// PATCH /collections/:id - обновить коллекцию
export const updateCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { id } = req.params;
    const { title, description, icon, color } = req.body;

    // Проверка прав
    const checkResult = await pool.query(
      'SELECT id FROM collections WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Collection not found',
          code: 'COLLECTION_NOT_FOUND'
        }
      });
    }

    const result = await pool.query(
      `UPDATE collections
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           icon = COALESCE($3, icon),
           color = COALESCE($4, color),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [title, description, icon, color, id]
    );

    res.json({
      collection: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Update Collection Error:', error);
    next(error);
  }
};
// DELETE /collections/:id - удалить коллекцию
export const deleteCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM collections WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Collection not found',
          code: 'COLLECTION_NOT_FOUND'
        }
      });
    }

    res.json({
      message: 'Collection deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete Collection Error:', error);
    next(error);
  }
};
// POST /collections/:id/vocabularies - добавить словарь в коллекцию
export const addVocabularyToCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { id } = req.params;
    const { vocabularyId } = req.body;

    if (!vocabularyId) {
      return res.status(400).json({
        error: {
          message: 'vocabularyId is required',
          code: 'MISSING_VOCABULARY_ID'
        }
      });
    }

    // Проверка что коллекция принадлежит пользователю
    const collectionCheck = await pool.query(
      'SELECT id FROM collections WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (collectionCheck.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Collection not found',
          code: 'COLLECTION_NOT_FOUND'
        }
      });
    }

    // Получаем максимальную позицию
    const positionResult = await pool.query(
      'SELECT COALESCE(MAX(position), -1) + 1 as next_position FROM collection_vocabularies WHERE collection_id = $1',
      [id]
    );

    const position = positionResult.rows[0].next_position;

    // Добавляем словарь
    await pool.query(
      `INSERT INTO collection_vocabularies (collection_id, vocabulary_id, position)
       VALUES ($1, $2, $3)
       ON CONFLICT (collection_id, vocabulary_id) DO NOTHING`,
      [id, vocabularyId, position]
    );

    res.status(201).json({
      message: 'Vocabulary added to collection'
    });
  } catch (error) {
    console.error('❌ Add Vocabulary to Collection Error:', error);
    next(error);
  }
};
// DELETE /collections/:id/vocabularies/:vocabularyId - удалить словарь из коллекции
export const removeVocabularyFromCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { id, vocabularyId } = req.params;

    // Проверка что коллекция принадлежит пользователю
    const collectionCheck = await pool.query(
      'SELECT id FROM collections WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (collectionCheck.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Collection not found',
          code: 'COLLECTION_NOT_FOUND'
        }
      });
    }

    const result = await pool.query(
      'DELETE FROM collection_vocabularies WHERE collection_id = $1 AND vocabulary_id = $2 RETURNING *',
      [id, vocabularyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Vocabulary not in collection',
          code: 'VOCABULARY_NOT_IN_COLLECTION'
        }
      });
    }

    res.json({
      message: 'Vocabulary removed from collection'
    });
  } catch (error) {
    console.error('❌ Remove Vocabulary from Collection Error:', error);
    next(error);
  }
};