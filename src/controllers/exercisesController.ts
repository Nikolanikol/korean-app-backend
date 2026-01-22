import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';

// POST /exercises/multiple-choice - генерация multiple choice вопросов
export const generateMultipleChoice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { vocabularyId, count = 10 } = req.body;

    if (!vocabularyId) {
      return res.status(400).json({
        error: {
          message: 'vocabularyId is required',
          code: 'MISSING_VOCABULARY_ID'
        }
      });
    }

    // Получаем случайные слова из словаря
    const wordsResult = await pool.query(
      `SELECT id, korean, translation, romanization
       FROM words
       WHERE vocabulary_id = $1
       ORDER BY RANDOM()
       LIMIT $2`,
      [vocabularyId, Math.min(count, 50)]
    );

    if (wordsResult.rows.length < 4) {
      return res.status(400).json({
        error: {
          message: 'Vocabulary must have at least 4 words',
          code: 'INSUFFICIENT_WORDS'
        }
      });
    }

    // Генерируем вопросы
    const questions = wordsResult.rows.map((word, index) => {
      // Получаем 3 неправильных варианта
      const wrongAnswers = wordsResult.rows
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.translation);

      // Добавляем правильный ответ и перемешиваем
      const options = [...wrongAnswers, word.translation]
        .sort(() => Math.random() - 0.5);

      return {
        questionId: index + 1,
        wordId: word.id,
        korean: word.korean,
        romanization: word.romanization,
        options,
        correctAnswer: word.translation
      };
    });

    res.json({
      questions,
      totalQuestions: questions.length,
      vocabularyId
    });
  } catch (error) {
    console.error('❌ Generate Multiple Choice Error:', error);
    next(error);
  }
};// POST /exercises/typing - генерация typing вопросов
export const generateTyping = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { vocabularyId, count = 10 } = req.body;

    if (!vocabularyId) {
      return res.status(400).json({
        error: {
          message: 'vocabularyId is required',
          code: 'MISSING_VOCABULARY_ID'
        }
      });
    }

    const wordsResult = await pool.query(
      `SELECT id, korean, translation, romanization
       FROM words
       WHERE vocabulary_id = $1
       ORDER BY RANDOM()
       LIMIT $2`,
      [vocabularyId, Math.min(count, 50)]
    );

    if (wordsResult.rows.length === 0) {
      return res.status(400).json({
        error: {
          message: 'No words found in vocabulary',
          code: 'NO_WORDS'
        }
      });
    }

    const questions = wordsResult.rows.map((word, index) => ({
      questionId: index + 1,
      wordId: word.id,
      korean: word.korean,
      romanization: word.romanization,
      correctAnswer: word.translation
    }));

    res.json({
      questions,
      totalQuestions: questions.length,
      vocabularyId
    });
  } catch (error) {
    console.error('❌ Generate Typing Error:', error);
    next(error);
  }
};
// POST /exercises/matching - генерация matching вопросов
export const generateMatching = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { vocabularyId, count = 10 } = req.body;

    if (!vocabularyId) {
      return res.status(400).json({
        error: {
          message: 'vocabularyId is required',
          code: 'MISSING_VOCABULARY_ID'
        }
      });
    }

    const wordsResult = await pool.query(
      `SELECT id, korean, translation
       FROM words
       WHERE vocabulary_id = $1
       ORDER BY RANDOM()
       LIMIT $2`,
      [vocabularyId, Math.min(count, 20)]
    );

    if (wordsResult.rows.length < 4) {
      return res.status(400).json({
        error: {
          message: 'Vocabulary must have at least 4 words',
          code: 'INSUFFICIENT_WORDS'
        }
      });
    }

    // Создаём две перемешанные колонки
    const leftColumn = wordsResult.rows.map(w => ({
      id: w.id,
      text: w.korean
    }));

    const rightColumn = wordsResult.rows
      .map(w => ({
        id: w.id,
        text: w.translation
      }))
      .sort(() => Math.random() - 0.5);

    res.json({
      leftColumn,
      rightColumn,
      totalPairs: leftColumn.length,
      vocabularyId
    });
  } catch (error) {
    console.error('❌ Generate Matching Error:', error);
    next(error);
  }
};
// POST /exercises/complete - сохранить результат упражнения
export const completeExercise = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { vocabularyId, exerciseType, totalQuestions, correctAnswers, durationSeconds } = req.body;

    if (!exerciseType || !totalQuestions || correctAnswers === undefined) {
      return res.status(400).json({
        error: {
          message: 'exerciseType, totalQuestions, and correctAnswers are required',
          code: 'MISSING_FIELDS'
        }
      });
    }

    const result = await pool.query(
      `INSERT INTO exercise_sessions 
        (user_id, vocabulary_id, exercise_type, total_questions, correct_answers, incorrect_answers, duration_seconds, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [
        userId,
        vocabularyId || null,
        exerciseType,
        totalQuestions,
        correctAnswers,
        totalQuestions - correctAnswers,
        durationSeconds || null
      ]
    );

    res.json({
      session: result.rows[0],
      message: 'Exercise completed successfully'
    });
  } catch (error) {
    console.error('❌ Complete Exercise Error:', error);
    next(error);
  }
};