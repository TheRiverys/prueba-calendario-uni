import { describe, expect, it } from 'vitest';

import { toIso, toNormalizedDate } from './dateUtils';

describe('dateUtils', () => {
  it('returns normalized date for valid ISO strings', () => {
    // Arrange
    const isoWithTime = '2025-10-06T15:45:00.000Z';

    // Act
    const normalized = toNormalizedDate(isoWithTime);

    // Assert
    expect(normalized).not.toBeNull();
    const isoDate = normalized ? toIso(normalized) : '';
    expect(isoDate).toBe('2025-10-06');

    // Annihilate
  });

  it('returns null when value is missing or invalid', () => {
    // Arrange
    const invalid = 'invalid-date';

    // Act
    const normalizedMissing = toNormalizedDate(null);
    const normalizedInvalid = toNormalizedDate(invalid);

    // Assert
    expect(normalizedMissing).toBeNull();
    expect(normalizedInvalid).toBeNull();

    // Annihilate
  });

  it('formats dates to ISO yyyy-MM-dd format', () => {
    // Arrange
    const sample = new Date('2025-12-24T10:00:00.000Z');

    // Act
    const formatted = toIso(sample);

    // Assert
    expect(formatted).toBe('2025-12-24');

    // Annihilate
  });
});
