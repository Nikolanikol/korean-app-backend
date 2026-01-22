import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';

// GET /starter-packs - получить все официальные словари
export const getStarterPacks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await pool.query(
      `SELECT 
        v.id,
        v.title,
        v.description,
        v.language,
        v.difficulty_level,
        v.category,
        v.tags,
        v.word_count,
        v.fork_count,
        v.study_count,
        v.created_at
      FROM vocabularies v
      WHERE v.is_official = true
      ORDER BY v.created_at ASC`
    );

    res.json({
      starterPacks: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Get Starter Packs Error:', error);
    next(error);
  }
};