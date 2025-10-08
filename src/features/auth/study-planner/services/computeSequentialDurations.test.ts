import { describe, expect, it, vi } from 'vitest';

import type { ConfigSettings, Delivery } from '@/types';

import { computeSequentialDurations } from './computeSequentialDurations';

import type { PlannedDelivery } from '../types';

let diffOverride: ((_later: Date, _earlier: Date) => number) | null = null;

vi.mock('date-fns', async () => {
  const actual = (await vi.importActual('date-fns')) as {
    differenceInCalendarDays: (_later: Date, _earlier: Date) => number;
    [key: string]: unknown;
  };
  return {
    ...actual,
    differenceInCalendarDays: (later: Date, earlier: Date) =>
      diffOverride ? diffOverride(later, earlier) : actual.differenceInCalendarDays(later, earlier),
  };
});

describe('computeSequentialDurations', () => {
  const buildDelivery = (overrides: Partial<Delivery>): Delivery => ({
    id: 'delivery-id',
    subject: 'Subject',
    name: 'Task',
    date: '2025-01-05',
    studyStart: undefined,
    color: '#000000',
    completed: false,
    priority: 'normal',
    ...overrides,
  });

  it('returns empty structures when no planned deliveries exist', () => {
    // Arrange
    const planned: PlannedDelivery[] = [];
    const semesterStart = new Date('2025-01-01T00:00:00.000Z');

    // Act
    const result = computeSequentialDurations(planned, semesterStart);

    // Assert
    expect(result.durations).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.desiredExtras).toEqual([]);
    expect(result.achievedExtras).toEqual([]);

    // Annihilate
  });

  it('distributes extra days respecting priority and window', () => {
    // Arrange
    const semesterStart = new Date('2025-01-01T00:00:00.000Z');
    const planned: PlannedDelivery[] = [
      {
        delivery: buildDelivery({ id: 'high', priority: 'high' }),
        dueDate: new Date('2025-01-05T00:00:00.000Z'),
        minDays: 2,
      },
      {
        delivery: buildDelivery({ id: 'normal', priority: 'normal' }),
        dueDate: new Date('2025-01-05T00:00:00.000Z'),
        minDays: 2,
      },
    ];

    // Act
    const result = computeSequentialDurations(planned, semesterStart);

    // Assert
    expect(result.durations).toEqual([3, 2]);
    expect(result.warnings).toEqual([false, false]);
    expect(result.desiredExtras).toEqual([1, 0]);
    expect(result.achievedExtras).toEqual([1, 0]);

    // Annihilate
  });

  it('sets warnings when there is not enough capacity to trim deficits', () => {
    // Arrange
    const semesterStart = new Date('2025-01-01T00:00:00.000Z');
    const planned: PlannedDelivery[] = [
      {
        delivery: buildDelivery({ id: 'first', priority: 'high', date: '2025-01-02' }),
        dueDate: new Date('2025-01-02T00:00:00.000Z'),
        minDays: 3,
      },
      {
        delivery: buildDelivery({ id: 'second', priority: 'normal', date: '2025-01-02' }),
        dueDate: new Date('2025-01-02T00:00:00.000Z'),
        minDays: 3,
      },
    ];

    // Act
    const result = computeSequentialDurations(planned, semesterStart);

    // Assert
    expect(result.durations).toEqual([3, 3]);
    expect(result.warnings).toEqual([true, true]);
    expect(result.achievedExtras).toEqual([0, 0]);

    // Annihilate
  });

  it('omits candidates beyond the allocation window when distributing extras', () => {
    // Arrange
    const semesterStart = new Date('2025-01-01T00:00:00.000Z');
    const config: ConfigSettings = {
      baseStudyDays: 2,
      minStudyTime: 2,
      priorityVariations: {
        high: 1,
        normal: 0,
        low: -1,
      },
      openaiApiKey: '',
      allocationWindowDays: 0,
    };
    const planned: PlannedDelivery[] = [
      {
        delivery: buildDelivery({ id: 'window-base', priority: 'high', date: '2025-01-02' }),
        dueDate: new Date('2025-01-02T00:00:00.000Z'),
        minDays: 1,
      },
      {
        delivery: buildDelivery({ id: 'outside-window', priority: 'high', date: '2025-01-04' }),
        dueDate: new Date('2025-01-04T00:00:00.000Z'),
        minDays: 4,
      },
    ];

    // Act
    const result = computeSequentialDurations(planned, semesterStart, config);

    // Assert
    expect(result.achievedExtras).toEqual([0, 0]);
    expect(result.warnings).toEqual([true, true]);

    // Annihilate
  });

  it('trims previously allocated extras when a later deficit occurs', () => {
    // Arrange
    const semesterStart = new Date('2025-01-01T00:00:00.000Z');
    const planned: PlannedDelivery[] = [
      {
        delivery: buildDelivery({ id: 'early', priority: 'low', date: '2025-01-02' }),
        dueDate: new Date('2025-01-02T00:00:00.000Z'),
        minDays: 1,
      },
      {
        delivery: buildDelivery({ id: 'tight', priority: 'high', date: '2025-01-03' }),
        dueDate: new Date('2025-01-03T00:00:00.000Z'),
        minDays: 2,
      },
    ];

    // Act
    const result = computeSequentialDurations(planned, semesterStart);

    // Assert
    expect(result.durations).toEqual([1, 2]);
    expect(result.achievedExtras).toEqual([0, 0]);
    expect(result.warnings).toEqual([false, false]);

    // Annihilate
  });

  it('prioritizes trimming extras by desired weight and identifier order when deficit remains', () => {
    // Arrange
    const semesterStart = new Date('2025-01-01T00:00:00.000Z');
    const planned: PlannedDelivery[] = [
      {
        delivery: buildDelivery({ id: 'seed', priority: 'low', date: '2025-01-03' }),
        dueDate: new Date('2025-01-03T00:00:00.000Z'),
        minDays: 1,
      },
      {
        delivery: buildDelivery({ id: 'alpha', priority: 'high', date: '2025-01-04' }),
        dueDate: new Date('2025-01-04T00:00:00.000Z'),
        minDays: 3,
      },
      {
        delivery: buildDelivery({ id: 'beta', priority: 'high', date: '2025-01-04' }),
        dueDate: new Date('2025-01-04T00:00:00.000Z'),
        minDays: 3,
      },
    ];

    // Act
    const result = computeSequentialDurations(planned, semesterStart);

    // Assert
    expect(result.durations).toEqual([1, 3, 3]);
    expect(result.achievedExtras).toEqual([0, 0, 0]);
    expect(result.warnings).toEqual([true, true, true]);

    // Annihilate
  });

  it('prioritizes trimming extras by achieved count when weights match', () => {
    // Arrange
    const semesterStart = new Date('2025-01-01T00:00:00.000Z');
    const planned: PlannedDelivery[] = [
      {
        delivery: buildDelivery({ id: 'seed', priority: 'low', date: '2025-01-04' }),
        dueDate: new Date('2025-01-04T00:00:00.000Z'),
        minDays: 1,
      },
      {
        delivery: buildDelivery({ id: 'focus', priority: 'high', date: '2025-01-05' }),
        dueDate: new Date('2025-01-05T00:00:00.000Z'),
        minDays: 3,
      },
      {
        delivery: buildDelivery({ id: 'support', priority: 'high', date: '2025-01-05' }),
        dueDate: new Date('2025-01-05T00:00:00.000Z'),
        minDays: 3,
      },
    ];

    // Act
    const result = computeSequentialDurations(planned, semesterStart);

    // Assert
    expect(result.warnings).toEqual([true, true, true]);
    expect(result.durations).toEqual([1, 3, 3]);

    // Annihilate
  });

  it('prioritizes trimming extras by due date when achievements stay equal', () => {
    // Arrange
    const semesterStart = new Date('2025-01-01T00:00:00.000Z');
    const planned: PlannedDelivery[] = [
      {
        delivery: buildDelivery({ id: 'seed', priority: 'low', date: '2025-01-03' }),
        dueDate: new Date('2025-01-03T00:00:00.000Z'),
        minDays: 1,
      },
      {
        delivery: buildDelivery({ id: 'alpha', priority: 'high', date: '2025-01-05' }),
        dueDate: new Date('2025-01-05T00:00:00.000Z'),
        minDays: 3,
      },
      {
        delivery: buildDelivery({ id: 'gamma', priority: 'high', date: '2025-01-06' }),
        dueDate: new Date('2025-01-06T00:00:00.000Z'),
        minDays: 3,
      },
    ];

    // Act
    const result = computeSequentialDurations(planned, semesterStart);

    // Assert
    expect(result.durations).toEqual([1, 3, 3]);
    expect(result.warnings).toEqual([true, true, true]);

    // Annihilate
  });
  it('ignores out-of-order tasks when distributing extras', () => {
    // Arrange
    const semesterStart = new Date('2025-01-01T00:00:00.000Z');
    const config: ConfigSettings = {
      baseStudyDays: 1,
      minStudyTime: 1,
      priorityVariations: {
        high: 1,
        normal: 0,
        low: -1,
      },
      openaiApiKey: '',
      allocationWindowDays: 30,
    };
    const planned: PlannedDelivery[] = [
      {
        delivery: buildDelivery({ id: 'group-high', priority: 'high', date: '2025-01-10' }),
        dueDate: new Date('2025-01-10T00:00:00.000Z'),
        minDays: 1,
      },
      {
        delivery: buildDelivery({ id: 'group-normal', priority: 'normal', date: '2025-01-10' }),
        dueDate: new Date('2025-01-10T00:00:00.000Z'),
        minDays: 1,
      },
      {
        delivery: buildDelivery({ id: 'out-of-order', priority: 'high', date: '2025-01-05' }),
        dueDate: new Date('2025-01-05T00:00:00.000Z'),
        minDays: 1,
      },
    ];

    // Act
    const result = computeSequentialDurations(planned, semesterStart, config);

    // Assert
    expect(result.achievedExtras[0]).toBeGreaterThan(0);
    expect(result.achievedExtras[2]).toBe(0);

    // Annihilate
  });

  it('skips saturated early tasks when distributing slack', () => {
    // Arrange
    const semesterStart = new Date('2025-01-01T00:00:00.000Z');
    const planned: PlannedDelivery[] = [
      {
        delivery: buildDelivery({ id: 'early', priority: 'high', date: '2025-01-01' }),
        dueDate: new Date('2025-01-01T00:00:00.000Z'),
        minDays: 1,
      },
      {
        delivery: buildDelivery({ id: 'later', priority: 'normal', date: '2025-01-05' }),
        dueDate: new Date('2025-01-05T00:00:00.000Z'),
        minDays: 2,
      },
    ];

    // Act
    const result = computeSequentialDurations(planned, semesterStart);

    // Assert
    expect(result.durations).toEqual([1, 4]);
    expect(result.achievedExtras).toEqual([0, 2]);

    // Annihilate
  });

  it('stops scanning candidates that fall outside the allocation window', () => {
    // Arrange
    const semesterStart = new Date('2025-01-01T00:00:00.000Z');
    const config: ConfigSettings = {
      baseStudyDays: 1,
      minStudyTime: 1,
      priorityVariations: {
        high: 1,
        normal: 0,
        low: -1,
      },
      openaiApiKey: '',
      allocationWindowDays: 2,
    };
    const planned: PlannedDelivery[] = [
      {
        delivery: buildDelivery({ id: 'near', priority: 'high', date: '2025-01-05' }),
        dueDate: new Date('2025-01-05T00:00:00.000Z'),
        minDays: 1,
      },
      {
        delivery: buildDelivery({ id: 'far', priority: 'normal', date: '2025-02-10' }),
        dueDate: new Date('2025-02-10T00:00:00.000Z'),
        minDays: 41,
      },
    ];

    // Act
    const result = computeSequentialDurations(planned, semesterStart, config);

    // Assert
    expect(result.achievedExtras).toEqual([0, 0]);
    expect(result.warnings).toEqual([true, true]);

    // Annihilate
  });

  it('falls back when inconsistent capacities saturate earlier tasks', () => {
    // Arrange
    diffOverride = (later: Date, earlier: Date) => {
      const laterIso = later.toISOString();
      const earlierIso = earlier.toISOString();
      if (laterIso.startsWith('2025-01-05') && earlierIso.startsWith('2025-01-01')) {
        return 0;
      }
      if (laterIso.startsWith('2025-01-10') && earlierIso.startsWith('2025-01-01')) {
        return 9;
      }
      const diff = Math.round((later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24));
      return diff;
    };
    const semesterStart = new Date('2025-01-01T00:00:00.000Z');
    const planned: PlannedDelivery[] = [
      {
        delivery: buildDelivery({ id: 'early', priority: 'high', date: '2025-01-05' }),
        dueDate: new Date('2025-01-05T00:00:00.000Z'),
        minDays: 1,
      },
      {
        delivery: buildDelivery({ id: 'later', priority: 'normal', date: '2025-01-10' }),
        dueDate: new Date('2025-01-10T00:00:00.000Z'),
        minDays: 2,
      },
    ];

    // Act
    const result = computeSequentialDurations(planned, semesterStart);

    // Assert
    expect(result.achievedExtras[0]).toBe(0);
    expect(result.achievedExtras[1]).toBeGreaterThan(0);

    // Annihilate
    diffOverride = null;
  });

  it('returns without allocation when every candidate breaches the window', () => {
    // Arrange
    diffOverride = (later: Date, earlier: Date) => {
      const laterIso = later.toISOString();
      const earlierIso = earlier.toISOString();
      if (laterIso.startsWith('2025-01-05') && earlierIso.startsWith('2025-01-05')) {
        return 5;
      }
      const diff = Math.round((later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24));
      return diff;
    };
    const semesterStart = new Date('2025-01-01T00:00:00.000Z');
    const config: ConfigSettings = {
      baseStudyDays: 1,
      minStudyTime: 1,
      priorityVariations: {
        high: 1,
        normal: 0,
        low: -1,
      },
      openaiApiKey: '',
      allocationWindowDays: 2,
    };
    const planned: PlannedDelivery[] = [
      {
        delivery: buildDelivery({ id: 'only', priority: 'high', date: '2025-01-05' }),
        dueDate: new Date('2025-01-05T00:00:00.000Z'),
        minDays: 1,
      },
    ];

    // Act
    const result = computeSequentialDurations(planned, semesterStart, config);

    // Assert
    expect(result.durations[0]).toBe(1);
    expect(result.achievedExtras[0]).toBe(0);

    // Annihilate
    diffOverride = null;
  });

  it('marks warnings when minimum days exceed the available capacity', () => {
    // Arrange
    const semesterStart = new Date('2025-01-01T00:00:00.000Z');
    const planned: PlannedDelivery[] = [
      {
        delivery: buildDelivery({ id: 'tight-a', priority: 'high', date: '2025-01-01' }),
        dueDate: new Date('2025-01-01T00:00:00.000Z'),
        minDays: 3,
      },
      {
        delivery: buildDelivery({ id: 'tight-b', priority: 'normal', date: '2025-01-01' }),
        dueDate: new Date('2025-01-01T00:00:00.000Z'),
        minDays: 3,
      },
    ];

    // Act
    const result = computeSequentialDurations(planned, semesterStart);

    // Assert
    expect(result.durations).toEqual([3, 3]);
    expect(result.warnings).toEqual([true, true]);

    // Annihilate
  });
});
