import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';

// GET /library/vocabularies - получить публичные словари с фильтрами
export const getPublicVocabularies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { language, difficulty, category, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT 
        v.id,
        v.user_id,
        v.title,
        v.description,
        v.language,
        v.difficulty_level,
        v.category,
        v.tags,
        v.word_count,
        v.fork_count,
        v.study_count,
        v.created_at,
        v.updated_at,
        u.display_name as author_name
      FROM vocabularies v
      JOIN users u ON v.user_id = u.id
      WHERE v.is_public = true
    `;

    const params: any[] = [];
    let paramCount = 0;

    if (language) {
      paramCount++;
      query += ` AND v.language = $${paramCount}`;
      params.push(language);
    }

    if (difficulty) {
      paramCount++;
      query += ` AND v.difficulty_level = $${paramCount}`;
      params.push(difficulty);
    }

    if (category) {
      paramCount++;
      query += ` AND v.category = $${paramCount}`;
      params.push(category);
    }

    query += ` ORDER BY v.created_at DESC`;
    
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit as string));
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(parseInt(offset as string));

    const result = await pool.query(query, params);

    res.json({
      vocabularies: result.rows,
      count: result.rows.length,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('❌ Get Public Vocabularies Error:', error);
    next(error);
  }
};
// GET /library/search - поиск по публичным словарям
export const searchPublicVocabularies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q, limit = 20, offset = 0 } = req.query;

    if (!q || (q as string).trim().length < 2) {
      return res.status(400).json({
        error: {
          message: 'Search query must be at least 2 characters',
          code: 'INVALID_QUERY'
        }
      });
    }

    const searchTerm = `%${(q as string).toLowerCase()}%`;

    const result = await pool.query(
      `SELECT 
        v.id,
        v.user_id,
        v.title,
        v.description,
        v.language,
        v.difficulty_level,
        v.category,
        v.tags,
        v.word_count,
        v.fork_count,
        v.study_count,
        v.created_at,
        u.display_name as author_name
      FROM vocabularies v
      JOIN users u ON v.user_id = u.id
      WHERE v.is_public = true
        AND (
          LOWER(v.title) LIKE $1
          OR LOWER(v.description) LIKE $1
          OR LOWER(v.category) LIKE $1
        )
      ORDER BY v.study_count DESC, v.fork_count DESC
      LIMIT $2 OFFSET $3`,
      [searchTerm, parseInt(limit as string), parseInt(offset as string)]
    );

    res.json({
      vocabularies: result.rows,
      count: result.rows.length,
      query: q,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('❌ Search Public Vocabularies Error:', error);
    next(error);
  }
};
// GET /library/trending - популярные словари
export const getTrendingVocabularies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { limit = 10 } = req.query;

    const result = await pool.query(
      `SELECT 
        v.id,
        v.user_id,
        v.title,
        v.description,
        v.language,
        v.difficulty_level,
        v.category,
        v.tags,
        v.word_count,
        v.fork_count,
        v.study_count,
        v.created_at,
        u.display_name as author_name,
        (v.fork_count * 2 + v.study_count) as popularity_score
      FROM vocabularies v
      JOIN users u ON v.user_id = u.id
      WHERE v.is_public = true
        AND v.created_at > NOW() - INTERVAL '90 days'
      ORDER BY popularity_score DESC
      LIMIT $1`,
      [parseInt(limit as string)]
    );

    res.json({
      vocabularies: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Get Trending Vocabularies Error:', error);
    next(error);
  }
};