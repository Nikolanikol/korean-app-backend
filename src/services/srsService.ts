/**
 * SRS Service - Spaced Repetition System (SM-2 Algorithm)
 * 
 * SM-2 алгоритм для оптимального запоминания:
 * - Ease Factor (EF): коэффициент легкости (1.3 - 2.5+)
 * - Interval: дни до следующего повторения
 * - Repetitions: количество правильных ответов подряд
 */

export interface SRSData {
  easeFactor: number;
  interval: number;
  repetitions: number;
  status: 'new' | 'learning' | 'reviewing' | 'mastered';
}

export interface SRSUpdateResult extends SRSData {
  nextReviewDate: Date;
}

/**
 * Рассчитывает новые значения SRS после ответа пользователя
 * @param currentData - текущие данные SRS
 * @param isCorrect - правильно ли ответил пользователь
 * @returns обновленные данные SRS
 */
export function calculateNextReview(
  currentData: SRSData,
  isCorrect: boolean
): SRSUpdateResult {
  let { easeFactor, interval, repetitions, status } = currentData;

  if (isCorrect) {
    // Правильный ответ
    repetitions += 1;

    // Расчет нового интервала по SM-2
    if (repetitions === 1) {
      interval = 1; // Через 1 день
    } else if (repetitions === 2) {
      interval = 6; // Через 6 дней
    } else {
      interval = Math.round(interval * easeFactor);
    }

    // Обновляем ease factor (quality = 4 для правильного ответа)
    // EF = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const quality = 4;
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // Минимальное значение EF = 1.3
    if (easeFactor < 1.3) {
      easeFactor = 1.3;
    }

    // Обновляем статус
    if (repetitions >= 5 && interval >= 21) {
      status = 'mastered'; // Выучено
    } else if (repetitions >= 3) {
      status = 'reviewing'; // На повторении
    } else {
      status = 'learning'; // Еще учим
    }
  } else {
    // Неправильный ответ
    repetitions = 0;
    interval = 1; // Начинаем заново через 1 день
    status = 'learning';
    // EF остается прежним
  }

  // Рассчитываем следующую дату повторения
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    easeFactor: Math.round(easeFactor * 100) / 100, // Округляем до 2 знаков
    interval,
    repetitions,
    status,
    nextReviewDate,
  };
}

/**
 * Создает начальные данные SRS для нового слова
 */
export function createInitialSRS(): SRSData {
  return {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    status: 'new',
  };
}

/**
 * Проверяет, нужно ли показать слово сегодня
 */
export function isDueForReview(nextReviewDate: Date): boolean {
  const now = new Date();
  return nextReviewDate <= now;
}

/**
 * Рассчитывает процент мастерства (0-100)
 */
export function calculateMasteryPercentage(data: SRSData): number {
  const { repetitions, interval } = data;
  
  // Максимум: 10 повторений и 60 дней интервал = 100%
  const repetitionScore = Math.min(repetitions / 10, 1) * 50;
  const intervalScore = Math.min(interval / 60, 1) * 50;
  
  return Math.round(repetitionScore + intervalScore);
}