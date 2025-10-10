import { describe, expect, it } from 'vitest';

import type { ConfigSettings } from '@/types';

import { getPriorityValue } from './priorityUtils';

describe('priorityUtils', () => {
  it('uses default variations when config is undefined', () => {
    // Arrange
    const priority = 'high';

    // Act
    const value = getPriorityValue(priority);

    // Assert
    expect(value).toBe(1);

    // Annihilate
  });

  it('reads custom variations from config', () => {
    // Arrange
    const config: ConfigSettings = {
      baseStudyDays: 5,
      minStudyTime: 3,
      priorityVariations: {
        high: 4,
        normal: 2,
        low: 0,
      },
      openaiApiKey: '',
      allocationWindowDays: 45,
    };

    // Act
    const high = getPriorityValue('high', config);
    const low = getPriorityValue('low', config);

    // Assert
    expect(high).toBe(4);
    expect(low).toBe(0);

    // Annihilate
  });
});
