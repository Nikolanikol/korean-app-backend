import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';

/**
 * GET /vocabularies/:vocabularyId/words
 * Получить все слова из словаря
 */
export const getWords = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { vocabularyId } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'User not authenticated',
          code: 'NO_USER_ID'
        }
      });
    }

    // Проверяем доступ к словарю
    const vocabCheck = await pool.query(
      'SELECT user_id, is_public FROM vocabularies WHERE id = $1',
      [vocabularyId]
    );

    if (vocabCheck.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Vocabulary not found',
          code: 'VOCABULARY_NOT_FOUND'
        }
      });
    }

    const vocabulary = vocabCheck.rows[0];

    // Проверяем права доступа
    if (vocabulary.user_id !== userId && !vocabulary.is_public) {
      return res.status(403).json({
        error: {
          message: 'Access denied to this vocabulary',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Получаем все слова
    const result = await pool.query(
      `SELECT 
        id,
        vocabulary_id,
        korean,
        translation,
        romanization,
        example_sentence,
        example_translation,
        part_of_speech,
        tags,
        audio_url,
        order_index,
        created_at,
        updated_at
      FROM words 
      WHERE vocabulary_id = $1 
      ORDER BY 
        CASE WHEN order_index IS NOT NULL THEN order_index ELSE 999999 END,
        created_at ASC`,
      [vocabularyId]
    );

    console.log(`✅ Retrieved ${result.rows.length} words for vocabulary:`, vocabularyId);

    res.json({
      words: result.rows,
      total: result.rows.length,
      vocabularyId
    });
  } catch (error) {
    console.error('❌ Get Words Error:', error);
    next(error);
  }
};
/**
 * POST /vocabularies/:vocabularyId/words
 * Создать новое слово в словаре
 */
export const createWord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { vocabularyId } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'User not authenticated',
          code: 'NO_USER_ID'
        }
      });
    }

    // Проверяем что словарь существует и принадлежит пользователю
    const vocabCheck = await pool.query(
      'SELECT user_id FROM vocabularies WHERE id = $1',
      [vocabularyId]
    );

    if (vocabCheck.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Vocabulary not found',
          code: 'VOCABULARY_NOT_FOUND'
        }
      });
    }

    if (vocabCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        error: {
          message: 'You can only add words to your own vocabularies',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Получаем данные из body
    const {
      korean,
      translation,
      romanization,
      exampleSentence,
      exampleTranslation,
      partOfSpeech,
      tags,
      audioUrl,
      orderIndex
    } = req.body;

    // Валидация
    if (!korean || korean.trim().length === 0) {
      return res.status(400).json({
        error: {
          message: 'Korean word is required',
          code: 'KOREAN_REQUIRED'
        }
      });
    }

    if (!translation || translation.trim().length === 0) {
      return res.status(400).json({
        error: {
          message: 'Translation is required',
          code: 'TRANSLATION_REQUIRED'
        }
      });
    }

    // Начинаем транзакцию
    await pool.query('BEGIN');

    try {
      // Создаем слово
      const wordResult = await pool.query(
        `INSERT INTO words 
          (vocabulary_id, korean, translation, romanization, example_sentence, 
           example_translation, part_of_speech, tags, audio_url, order_index)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING 
          id, vocabulary_id, korean, translation, romanization, 
          example_sentence, example_translation, part_of_speech, 
          tags, audio_url, order_index, created_at, updated_at`,
        [
          vocabularyId,
          korean.trim(),
          translation.trim(),
          romanization || null,
          exampleSentence || null,
          exampleTranslation || null,
          partOfSpeech || null,
          tags || [],
          audioUrl || null,
          orderIndex || null
        ]
      );

      const word = wordResult.rows[0];

      // Увеличиваем word_count в словаре
      await pool.query(
        'UPDATE vocabularies SET word_count = word_count + 1, updated_at = NOW() WHERE id = $1',
        [vocabularyId]
      );

      // Коммитим транзакцию
      await pool.query('COMMIT');

      console.log('✅ Word created:', word.id, 'in vocabulary:', vocabularyId);

      res.status(201).json({
        word
      });
    } catch (error) {
      // Откатываем транзакцию при ошибке
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('❌ Create Word Error:', error);
    next(error);
  }
};
/**
 * POST /vocabularies/:vocabularyId/words/bulk
 * Создать несколько слов сразу
 */
export const createBulkWords = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { vocabularyId } = req.params;
    const { words } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'User not authenticated',
          code: 'NO_USER_ID'
        }
      });
    }

    // Валидация
    if (!Array.isArray(words) || words.length === 0) {
      return res.status(400).json({
        error: {
          message: 'Words array is required and must not be empty',
          code: 'INVALID_WORDS_ARRAY'
        }
      });
    }

    if (words.length > 100) {
      return res.status(400).json({
        error: {
          message: 'Cannot create more than 100 words at once',
          code: 'TOO_MANY_WORDS'
        }
      });
    }

    // Проверяем что словарь существует и принадлежит пользователю
    const vocabCheck = await pool.query(
      'SELECT user_id FROM vocabularies WHERE id = $1',
      [vocabularyId]
    );

    if (vocabCheck.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Vocabulary not found',
          code: 'VOCABULARY_NOT_FOUND'
        }
      });
    }

    if (vocabCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        error: {
          message: 'You can only add words to your own vocabularies',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Валидируем каждое слово
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (!word.korean || word.korean.trim().length === 0) {
        return res.status(400).json({
          error: {
            message: `Word at index ${i}: Korean word is required`,
            code: 'KOREAN_REQUIRED'
          }
        });
      }
      if (!word.translation || word.translation.trim().length === 0) {
        return res.status(400).json({
          error: {
            message: `Word at index ${i}: Translation is required`,
            code: 'TRANSLATION_REQUIRED'
          }
        });
      }
    }

    // Начинаем транзакцию
    await pool.query('BEGIN');

    try {
      const createdWords = [];

      // Создаем слова по одному (для простоты)
      for (const word of words) {
        const result = await pool.query(
          `INSERT INTO words 
            (vocabulary_id, korean, translation, romanization, example_sentence, 
             example_translation, part_of_speech, tags, audio_url, order_index)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING 
            id, vocabulary_id, korean, translation, romanization, 
            example_sentence, example_translation, part_of_speech, 
            tags, audio_url, order_index, created_at, updated_at`,
          [
            vocabularyId,
            word.korean.trim(),
            word.translation.trim(),
            word.romanization || null,
            word.exampleSentence || null,
            word.exampleTranslation || null,
            word.partOfSpeech || null,
            word.tags || [],
            word.audioUrl || null,
            word.orderIndex || null
          ]
        );

        createdWords.push(result.rows[0]);
      }

      // Увеличиваем word_count в словаре
      await pool.query(
        'UPDATE vocabularies SET word_count = word_count + $1, updated_at = NOW() WHERE id = $2',
        [words.length, vocabularyId]
      );

      // Коммитим транзакцию
      await pool.query('COMMIT');

      console.log(`✅ Created ${createdWords.length} words in vocabulary:`, vocabularyId);

      res.status(201).json({
        words: createdWords,
        total: createdWords.length,
        vocabularyId
      });
    } catch (error) {
      // Откатываем транзакцию при ошибке
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('❌ Create Bulk Words Error:', error);
    next(error);
  }
};

/**
 * PATCH /words/:id
 * Обновить слово
 */
export const updateWord = async (
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

    // Проверяем что слово существует и пользователь владелец словаря
    const wordCheck = await pool.query(
      `SELECT w.id, v.user_id 
       FROM words w
       JOIN vocabularies v ON w.vocabulary_id = v.id
       WHERE w.id = $1`,
      [id]
    );

    if (wordCheck.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Word not found',
          code: 'WORD_NOT_FOUND'
        }
      });
    }

    if (wordCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        error: {
          message: 'You can only update words in your own vocabularies',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Получаем данные для обновления
    const {
      korean,
      translation,
      romanization,
      exampleSentence,
      exampleTranslation,
      partOfSpeech,
      tags,
      audioUrl,
      orderIndex
    } = req.body;

    // Валидация: хотя бы одно поле должно быть передано
    if (!korean && !translation && !romanization && !exampleSentence && 
        !exampleTranslation && !partOfSpeech && !tags && !audioUrl && orderIndex === undefined) {
      return res.status(400).json({
        error: {
          message: 'No fields to update',
          code: 'EMPTY_UPDATE'
        }
      });
    }

    // Формируем динамический SQL запрос
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (korean !== undefined) {
      updates.push(`korean = $${paramIndex++}`);
      values.push(korean.trim());
    }

    if (translation !== undefined) {
      updates.push(`translation = $${paramIndex++}`);
      values.push(translation.trim());
    }

    if (romanization !== undefined) {
      updates.push(`romanization = $${paramIndex++}`);
      values.push(romanization);
    }

    if (exampleSentence !== undefined) {
      updates.push(`example_sentence = $${paramIndex++}`);
      values.push(exampleSentence);
    }

    if (exampleTranslation !== undefined) {
      updates.push(`example_translation = $${paramIndex++}`);
      values.push(exampleTranslation);
    }

    if (partOfSpeech !== undefined) {
      updates.push(`part_of_speech = $${paramIndex++}`);
      values.push(partOfSpeech);
    }

    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(tags);
    }

    if (audioUrl !== undefined) {
      updates.push(`audio_url = $${paramIndex++}`);
      values.push(audioUrl);
    }

    if (orderIndex !== undefined) {
      updates.push(`order_index = $${paramIndex++}`);
      values.push(orderIndex);
    }

    // Добавляем updated_at
    updates.push(`updated_at = NOW()`);

    // Добавляем id в конец
    values.push(id);

    const query = `
      UPDATE words 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id, vocabulary_id, korean, translation, romanization, 
        example_sentence, example_translation, part_of_speech, 
        tags, audio_url, order_index, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    const word = result.rows[0];

    console.log('✅ Word updated:', word.id);

    res.json({
      word
    });
  } catch (error) {
    console.error('❌ Update Word Error:', error);
    next(error);
  }
};
/**
 * DELETE /words/:id
 * Удалить слово
 */
export const deleteWord = async (
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

    // Проверяем что слово существует и пользователь владелец словаря
    const wordCheck = await pool.query(
      `SELECT w.id, w.vocabulary_id, w.korean, v.user_id 
       FROM words w
       JOIN vocabularies v ON w.vocabulary_id = v.id
       WHERE w.id = $1`,
      [id]
    );

    if (wordCheck.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Word not found',
          code: 'WORD_NOT_FOUND'
        }
      });
    }

    const word = wordCheck.rows[0];

    if (word.user_id !== userId) {
      return res.status(403).json({
        error: {
          message: 'You can only delete words from your own vocabularies',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Начинаем транзакцию
    await pool.query('BEGIN');

    try {
      // Удаляем слово
      await pool.query('DELETE FROM words WHERE id = $1', [id]);

      // Уменьшаем word_count в словаре
      await pool.query(
        'UPDATE vocabularies SET word_count = word_count - 1, updated_at = NOW() WHERE id = $1',
        [word.vocabulary_id]
      );

      // Коммитим транзакцию
      await pool.query('COMMIT');

      console.log('✅ Word deleted:', id, '- Korean:', word.korean);

      res.json({
        message: 'Word successfully deleted',
        deletedWordId: id
      });
    } catch (error) {
      // Откатываем транзакцию при ошибке
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('❌ Delete Word Error:', error);
    next(error);
  }
};
/**
 * PATCH /vocabularies/:vocabularyId/words/reorder
 * Изменить порядок слов в словаре
 */
export const reorderWords = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    const { vocabularyId } = req.params;
    const { wordIds } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'User not authenticated',
          code: 'NO_USER_ID'
        }
      });
    }

    // Валидация
    if (!Array.isArray(wordIds) || wordIds.length === 0) {
      return res.status(400).json({
        error: {
          message: 'wordIds array is required and must not be empty',
          code: 'INVALID_WORD_IDS'
        }
      });
    }

    // Проверяем что словарь существует и принадлежит пользователю
    const vocabCheck = await pool.query(
      'SELECT user_id FROM vocabularies WHERE id = $1',
      [vocabularyId]
    );

    if (vocabCheck.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Vocabulary not found',
          code: 'VOCABULARY_NOT_FOUND'
        }
      });
    }

    if (vocabCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        error: {
          message: 'You can only reorder words in your own vocabularies',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Начинаем транзакцию
    await pool.query('BEGIN');

    try {
      // Обновляем order_index для каждого слова
      for (let i = 0; i < wordIds.length; i++) {
        await pool.query(
          'UPDATE words SET order_index = $1 WHERE id = $2 AND vocabulary_id = $3',
          [i, wordIds[i], vocabularyId]
        );
      }

      // Коммитим транзакцию
      await pool.query('COMMIT');

      console.log(`✅ Reordered ${wordIds.length} words in vocabulary:`, vocabularyId);

      res.json({
        message: 'Words reordered successfully',
        reorderedCount: wordIds.length
      });
    } catch (error) {
      // Откатываем транзакцию при ошибке
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('❌ Reorder Words Error:', error);
    next(error);
  }
};