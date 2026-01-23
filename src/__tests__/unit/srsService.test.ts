import { describe, test, expect } from '@jest/globals';

// Простые вспомогательные функции для тестирования SM-2 логики
function calculateEasinessFactor(currentEF: number, quality: number): number {
  const newEF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  return Math.max(1.3, newEF);
}

function calculateInterval(
  repetitions: number,
  interval: number,
  easinessFactor: number,
  quality: number
): { newRepetitions: number; newInterval: number } {
  if (quality < 3) {
    return { newRepetitions: 0, newInterval: 1 };
  }

  const newRepetitions = repetitions + 1;
  let newInterval: number;

  if (newRepetitions === 1) {
    newInterval = 1;
  } else if (newRepetitions === 2) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * easinessFactor);
  }

  return { newRepetitions, newInterval };
}

describe('SRS Algorithm (SM-2)', () => {
  describe('Easiness Factor calculation', () => {
    test('should maintain EF for quality 4', () => {
      const ef = calculateEasinessFactor(2.5, 4);
      expect(ef).toBeCloseTo(2.5, 1);
    });

    test('should increase EF for quality 5', () => {
      const ef = calculateEasinessFactor(2.5, 5);
      expect(ef).toBeGreaterThan(2.5);
    });

    test('should decrease EF for quality 3', () => {
      const ef = calculateEasinessFactor(2.5, 3);
      expect(ef).toBeLessThan(2.5);
    });

    test('should never go below 1.3', () => {
      const ef = calculateEasinessFactor(1.3, 0);
      expect(ef).toBe(1.3);
    });
  });

  describe('Interval calculation', () => {
    test('should reset on quality < 3', () => {
      const result = calculateInterval(5, 30, 2.5, 2);
      expect(result.newRepetitions).toBe(0);
      expect(result.newInterval).toBe(1);
    });

    test('should return 1 day for first repetition', () => {
      const result = calculateInterval(0, 0, 2.5, 4);
      expect(result.newRepetitions).toBe(1);
      expect(result.newInterval).toBe(1);
    });

    test('should return 6 days for second repetition', () => {
      const result = calculateInterval(1, 1, 2.5, 4);
      expect(result.newRepetitions).toBe(2);
      expect(result.newInterval).toBe(6);
    });

    test('should multiply by EF for third+ repetition', () => {
      const result = calculateInterval(2, 6, 2.5, 4);
      expect(result.newRepetitions).toBe(3);
      expect(result.newInterval).toBe(15); // 6 * 2.5 = 15
    });
  });
});