import { describe, expect, it } from 'vitest';

import type { ConfigSettings, Delivery } from '@/types';

import { toIso } from '../utils/dateUtils';

import { buildStudySchedule } from './buildStudySchedule';

const baseConfig: ConfigSettings = {
  baseStudyDays: 2,
  minStudyTime: 2,
  priorityVariations: {
    high: 1,
    normal: 0,
    low: -1,
  },
  openaiApiKey: '',
  allocationWindowDays: 30,
};

describe('buildStudySchedule', () => {
  const buildDelivery = (overrides: Partial<Delivery>): Delivery => ({
    id: 'delivery',
    subject: 'Subject',
    name: 'Task',
    date: '2025-01-05',
    color: '#000000',
    completed: false,
    priority: 'normal',
    ...overrides,
  });

  it('returns an empty array when deliveries are missing', () => {
    // Arrange
    const params = { deliveries: [], semesterStartIso: '2025-01-01', config: baseConfig };

    // Act
    const schedule = buildStudySchedule(params);

    // Assert
    expect(schedule).toEqual([]);

    // Annihilate
  });

  it('short-circuits when semester start is invalid', () => {
    // Arrange
    const deliveries: Delivery[] = [buildDelivery({})];

    // Act
    const schedule = buildStudySchedule({
      deliveries,
      semesterStartIso: 'invalid-date',
      config: baseConfig,
    });

    // Assert
    expect(schedule).toEqual([]);

    // Annihilate
  });

  it('builds a schedule honoring the legacy algorithm flow', () => {
    // Arrange
    const deliveries: Delivery[] = [
      buildDelivery({ id: 'completed', date: '2025-01-02', completed: true, priority: 'high' }),
      buildDelivery({ id: 'high', date: '2025-01-05', priority: 'high' }),
      buildDelivery({ id: 'normal', date: '2025-01-07', priority: 'normal' }),
    ];
    const semesterStartIso = '2025-01-01';

    // Act
    const schedule = buildStudySchedule({ deliveries, semesterStartIso, config: baseConfig });

    // Assert
    expect(schedule).toHaveLength(3);

    const [first, second, third] = schedule;
    expect(first.id).toBe('high');
    expect(toIso(first.startDate)).toBe('2025-01-01');
    expect(toIso(first.endDate)).toBe('2025-01-05');
    expect(first.studyDays).toBe(5);
    expect(first.allocatedDays).toBe(5);
    expect(first.desiredExtraByPriority).toBe(1);
    expect(first.achievedExtra).toBe(3);
    expect(first.warning).toBe(false);

    expect(second.id).toBe('completed');
    expect(second.completed).toBe(true);
    expect(second.studyDays).toBe(0);
    expect(second.warning).toBe(false);

    expect(third.id).toBe('normal');
    expect(toIso(third.startDate)).toBe('2025-01-06');
    expect(toIso(third.endDate)).toBe('2025-01-07');
    expect(third.warning).toBe(false);

    // Annihilate
  });

  it('falls back to direct allocation for pending deliveries before the semester and skips invalid dates', () => {
    // Arrange
    const deliveries: Delivery[] = [
      buildDelivery({ id: 'invalid', date: 'fecha-no-valida', priority: 'normal' }),
      buildDelivery({ id: 'early', date: '2024-12-25', priority: 'high' }),
    ];
    const semesterStartIso = '2025-01-01';

    // Act
    const schedule = buildStudySchedule({ deliveries, semesterStartIso, config: baseConfig });

    // Assert
    expect(schedule).toHaveLength(1);
    const [entry] = schedule;
    expect(entry.id).toBe('early');
    expect(entry.warning).toBe(true);
    expect(toIso(entry.startDate)).toBe('2024-12-25');
    expect(toIso(entry.endDate)).toBe('2024-12-25');
    expect(entry.allocatedDays).toBe(1);
    expect(entry.desiredExtraByPriority).toBe(1);

    // Annihilate
  });

  it('propagates warning flags from the sequential allocator when capacity is insufficient', () => {
    // Arrange
    const deliveries: Delivery[] = [
      buildDelivery({ id: 'tight', date: '2025-01-01', priority: 'high' }),
    ];
    const customConfig: ConfigSettings = {
      ...baseConfig,
      baseStudyDays: 4,
    };

    // Act
    const schedule = buildStudySchedule({
      deliveries,
      semesterStartIso: '2025-01-01',
      config: customConfig,
    });

    // Assert
    expect(schedule).toHaveLength(1);
    const [entry] = schedule;
    expect(entry.minimumRequired).toBe(4);
    expect(entry.warning).toBe(true);
    expect(toIso(entry.startDate)).toBe('2024-12-29');
    expect(toIso(entry.endDate)).toBe('2025-01-01');

    // Annihilate
  });

  it('orders same-date deliveries using the identifier tie-breaker', () => {
    // Arrange
    const deliveries: Delivery[] = [
      buildDelivery({ id: 'beta', date: '2025-01-10', priority: 'normal' }),
      buildDelivery({ id: 'alpha', date: '2025-01-10', priority: 'normal' }),
    ];

    // Act
    const schedule = buildStudySchedule({
      deliveries,
      semesterStartIso: '2025-01-01',
      config: baseConfig,
    });

    // Assert
    expect(schedule).toHaveLength(2);
    expect(schedule[0].id).toBe('alpha');
    expect(schedule[1].id).toBe('beta');

    // Annihilate
  });

  it('orders same-date deliveries giving precedence to higher priority', () => {
    // Arrange
    const deliveries: Delivery[] = [
      buildDelivery({ id: 'low', date: '2025-02-10', priority: 'low' }),
      buildDelivery({ id: 'high', date: '2025-02-10', priority: 'high' }),
    ];

    // Act
    const schedule = buildStudySchedule({
      deliveries,
      semesterStartIso: '2025-01-01',
      config: baseConfig,
    });

    // Assert
    expect(schedule).toHaveLength(2);
    expect(schedule[0].id).toBe('high');
    expect(schedule[1].id).toBe('low');

    // Annihilate
  });
});
