import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';

// GET /stats - получить статистику пользователя
export const getUserStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;

    // Получаем или создаём статистику
    let statsResult = await pool.query(
      'SELECT * FROM user_stats WHERE user_id = $1',
      [userId]
    );

    if (statsResult.rows.length === 0) {
      // Создаём статистику если её нет
      statsResult = await pool.query(
        `INSERT INTO user_stats (user_id)
         VALUES ($1)
         RETURNING *`,
        [userId]
      );
    }

    const stats = statsResult.rows[0];

    res.json({
      stats: {
        currentStreak: stats.current_streak,
        longestStreak: stats.longest_streak,
        totalWordsLearned: stats.total_words_learned,
        totalStudyTime: stats.total_study_time,
        lastStudyDate: stats.last_study_date,
        dailyGoal: stats.daily_goal
      }
    });
  } catch (error) {
    console.error('❌ Get User Stats Error:', error);
    next(error);
  }
};
// PATCH /stats/daily-goal - обновить ежедневную цель
export const updateDailyGoal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { dailyGoal } = req.body;

    if (!dailyGoal || dailyGoal < 1 || dailyGoal > 100) {
      return res.status(400).json({
        error: {
          message: 'Daily goal must be between 1 and 100',
          code: 'INVALID_DAILY_GOAL'
        }
      });
    }

    const result = await pool.query(
      `INSERT INTO user_stats (user_id, daily_goal)
       VALUES ($1, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET daily_goal = $2, updated_at = NOW()
       RETURNING *`,
      [userId, dailyGoal]
    );

    res.json({
      stats: {
        dailyGoal: result.rows[0].daily_goal
      },
      message: 'Daily goal updated successfully'
    });
  } catch (error) {
    console.error('❌ Update Daily Goal Error:', error);
    next(error);
  }
};// GET /stats/achievements - получить достижения пользователя
export const getUserAchievements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;

    const result = await pool.query(
      `SELECT 
        achievement_type,
        unlocked_at
       FROM user_achievements
       WHERE user_id = $1
       ORDER BY unlocked_at DESC`,
      [userId]
    );

    res.json({
      achievements: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Get User Achievements Error:', error);
    next(error);
  }
};