import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';
import { calculateNextReview, createInitialSRS } from '../services/srsService.js';

/**

 * GET /study/due-words?vocabularyId=optional
 * Получить слова на повторение сегодня
 */
export const getDueWords = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { vocabularyId } = req.query;

    // Парсим лимит из query params (default: 20)
    const rawLimit = req.query.limit as string;
    let limit = rawLimit ? parseInt(rawLimit, 10) : 20;
    
    // Валидация: от 1 до 100
    if (isNaN(limit) || limit < 1) {
      limit = 20;
    } else if (limit > 100) {
      limit = 100;
    }
    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'User not authenticated',
          code: 'NO_USER_ID'
        }
      });
    }

    // Формируем запрос с optional фильтром по словарю
    let query = `
      SELECT 
        w.id,
        w.vocabulary_id,
        w.korean,
        w.translation,
        w.romanization,
        w.example_sentence,
        w.example_translation,
        w.part_of_speech,
        w.tags,
        w.audio_url,
        wp.ease_factor,
        wp.interval,
        wp.repetitions,
        wp.status,
        wp.next_review_at,
        wp.last_reviewed_at,
        wp.correct_count,
        wp.incorrect_count,
        wp.total_reviews,
        v.title as vocabulary_title
      FROM word_progress wp
      JOIN words w ON wp.word_id = w.id
      JOIN vocabularies v ON w.vocabulary_id = v.id
      WHERE wp.user_id = $1 
        AND wp.next_review_at <= NOW()
        AND wp.status != 'mastered'
    `;

    const params: any[] = [userId];

    if (vocabularyId) {
      query += ` AND w.vocabulary_id = $2`;
      params.push(vocabularyId);
    }

    query += `ORDER BY wp.next_review_at ASC`;
        params.push(limit);
    query += ` LIMIT $${params.length}`
    const result = await pool.query(query, params);

    console.log(`✅ Found ${result.rows.length} due words for user:`, userId);

      res.json({
      words: result.rows,
      total: result.rows.length,
      limit,
      hasMore: result.rows.length === limit,
      vocabularyId: vocabularyId || null
    });
  } catch (error) {
    console.error('❌ Get Due Words Error:', error);
    next(error);
  }
};


/**
 * POST /study/answer
 * Отправить ответ на слово
 */
export const submitAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { wordId, isCorrect } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'User not authenticated',
          code: 'NO_USER_ID'
        }
      });
    }

    // Валидация
    if (!wordId) {
      return res.status(400).json({
        error: {
          message: 'wordId is required',
          code: 'WORD_ID_REQUIRED'
        }
      });
    }

    if (typeof isCorrect !== 'boolean') {
      return res.status(400).json({
        error: {
          message: 'isCorrect must be a boolean',
          code: 'INVALID_IS_CORRECT'
        }
      });
    }

    // Начинаем транзакцию
    await pool.query('BEGIN');

    try {
      // Проверяем существует ли прогресс
      const progressCheck = await pool.query(
        `SELECT ease_factor, interval, repetitions, status 
         FROM word_progress 
         WHERE user_id = $1 AND word_id = $2`,
        [userId, wordId]
      );

      let currentData;
      let isNewProgress = false;

      if (progressCheck.rows.length === 0) {
        // Создаем новый прогресс
        currentData = createInitialSRS();
        isNewProgress = true;
      } else {
        // Используем существующий прогресс
        const row = progressCheck.rows[0];
        currentData = {
          easeFactor: parseFloat(row.ease_factor),
          interval: row.interval,
          repetitions: row.repetitions,
          status: row.status
        };
      }

      // Рассчитываем новые значения по SM-2
      const updated = calculateNextReview(currentData, isCorrect);

     if (isNewProgress) {
  // Получаем vocabulary_id из таблицы words
  const wordInfo = await pool.query(
    'SELECT vocabulary_id FROM words WHERE id = $1',
    [wordId]
  );

  if (wordInfo.rows.length === 0) {
    await pool.query('ROLLBACK');
    return res.status(404).json({
      error: {
        message: 'Word not found',
        code: 'WORD_NOT_FOUND'
      }
    });
  }

  const vocabularyId = wordInfo.rows[0].vocabulary_id;

  // Создаем новую запись
  await pool.query(
    `INSERT INTO word_progress 
      (user_id, word_id, vocabulary_id, ease_factor, interval, repetitions, status, 
       next_review_at, last_reviewed_at, correct_count, incorrect_count, 
       total_reviews, first_learned_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10, 1, NOW())`,
    [
      userId,
      wordId,
      vocabularyId,  // ⬅️ Добавили vocabulary_id
      updated.easeFactor,
      updated.interval,
      updated.repetitions,
      updated.status,
      updated.nextReviewDate,
      isCorrect ? 1 : 0,
      isCorrect ? 0 : 1
    ]
  );

      } else {
        // Обновляем существующую запись
        const masteredAt = updated.status === 'mastered' && currentData.status !== 'mastered'
          ? 'NOW()'
          : 'mastered_at';

        await pool.query(
          `UPDATE word_progress 
           SET ease_factor = $1,
               interval = $2,
               repetitions = $3,
               status = $4,
               next_review_at = $5,
               last_reviewed_at = NOW(),
               correct_count = correct_count + $6,
               incorrect_count = incorrect_count + $7,
               total_reviews = total_reviews + 1,
               mastered_at = ${masteredAt},
               updated_at = NOW()
           WHERE user_id = $8 AND word_id = $9`,
          [
            updated.easeFactor,
            updated.interval,
            updated.repetitions,
            updated.status,
            updated.nextReviewDate,
            isCorrect ? 1 : 0,
            isCorrect ? 0 : 1,
            userId,
            wordId
          ]
        );
      }

      // Коммитим транзакцию
      await pool.query('COMMIT');

      console.log(`✅ Answer submitted: word=${wordId}, correct=${isCorrect}, new_interval=${updated.interval}`);

      res.json({
        success: true,
        progress: {
          easeFactor: updated.easeFactor,
          interval: updated.interval,
          repetitions: updated.repetitions,
          status: updated.status,
          nextReviewDate: updated.nextReviewDate
        }
      });
    } catch (error) {
      // Откатываем транзакцию при ошибке
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('❌ Submit Answer Error:', error);
    next(error);
  }
};
/**
 * GET /study/stats
 * Получить статистику обучения
 */
export const getStudyStats = async (
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

    // Общая статистика по всем словам
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'new') as new_count,
        COUNT(*) FILTER (WHERE status = 'learning') as learning_count,
        COUNT(*) FILTER (WHERE status = 'reviewing') as reviewing_count,
        COUNT(*) FILTER (WHERE status = 'mastered') as mastered_count,
        COUNT(*) as total_words,
        SUM(correct_count) as total_correct,
        SUM(incorrect_count) as total_incorrect,
        SUM(total_reviews) as total_reviews,
        ROUND(AVG(ease_factor), 2) as avg_ease_factor
      FROM word_progress
      WHERE user_id = $1`,
      [userId]
    );

    // Слова на сегодня
    const dueResult = await pool.query(
      `SELECT COUNT(*) as due_count
       FROM word_progress
       WHERE user_id = $1 
         AND next_review_at <= NOW()
         AND status != 'mastered'`,
      [userId]
    );

    // Статистика за последние 7 дней
    const recentResult = await pool.query(
      `SELECT 
        DATE(last_reviewed_at) as review_date,
        COUNT(*) as reviews_count,
        SUM(CASE WHEN correct_count > 0 THEN 1 ELSE 0 END) as correct_reviews
       FROM word_progress
       WHERE user_id = $1 
         AND last_reviewed_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(last_reviewed_at)
       ORDER BY review_date DESC`,
      [userId]
    );

    const stats = statsResult.rows[0];
    const dueCount = parseInt(dueResult.rows[0].due_count);

    // Рассчитываем процент правильных ответов
    const totalAnswers = parseInt(stats.total_correct) + parseInt(stats.total_incorrect);
    const accuracyRate = totalAnswers > 0 
      ? Math.round((parseInt(stats.total_correct) / totalAnswers) * 100) 
      : 0;

    console.log(`✅ Retrieved study stats for user:`, userId);

    res.json({
      overview: {
        totalWords: parseInt(stats.total_words),
        newWords: parseInt(stats.new_count),
        learningWords: parseInt(stats.learning_count),
        reviewingWords: parseInt(stats.reviewing_count),
        masteredWords: parseInt(stats.mastered_count),
        dueToday: dueCount
      },
      performance: {
        totalReviews: parseInt(stats.total_reviews),
        correctAnswers: parseInt(stats.total_correct),
        incorrectAnswers: parseInt(stats.total_incorrect),
        accuracyRate,
        averageEaseFactor: parseFloat(stats.avg_ease_factor) || 2.5
      },
      recentActivity: recentResult.rows.map(row => ({
        date: row.review_date,
        reviewsCount: parseInt(row.reviews_count),
        correctReviews: parseInt(row.correct_reviews)
      }))
    });
  } catch (error) {
    console.error('❌ Get Study Stats Error:', error);
    next(error);
  }
};