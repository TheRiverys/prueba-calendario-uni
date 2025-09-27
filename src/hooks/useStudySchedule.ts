import { useMemo } from 'react';
import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';
import type { Delivery, StudySchedule, ConfigSettings } from '../types';
import { DEFAULT_CONFIG, DEFAULT_PRIORITY_VARIATIONS } from '../utils';

type Priority = Delivery['priority'];

type PrioritySettings = {
  base: number;
  variation: Record<Priority, number>;
};

type PlannedDelivery = {
  delivery: Delivery;
  dueDate: Date;
  minimumRequired: number;
};

type AllocationResult = {
  start: Date;
  end: Date;
  studyDays: number;
  warning: boolean;
  minimumRequired: number;
};

const DEFAULT_BASE_STUDY_DAYS = DEFAULT_CONFIG.baseStudyDays;

const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  normal: 1,
  low: 2
};

const INTENSIVE_KEYWORDS = ['examen', 'final', 'proyecto', 'trabajo final'];
const INTENSIVE_BONUS_DAYS = 2;

const toNormalizedDate = (value: string | null | undefined): Date | null => {
  if (!value) {
    return null;
  }
  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return startOfDay(parsed);
};

const toIso = (value: Date): string => format(value, 'yyyy-MM-dd');

const minDate = (a: Date, b: Date): Date => (a.getTime() <= b.getTime() ? a : b);

const buildPrioritySettings = (config?: ConfigSettings): PrioritySettings => {
  const baseStudyDays = Math.max(1, Math.round(config?.baseStudyDays ?? DEFAULT_BASE_STUDY_DAYS));

  return {
    base: baseStudyDays,
    variation: {
      high: config?.priorityVariations.high ?? DEFAULT_PRIORITY_VARIATIONS.high,
      normal: config?.priorityVariations.normal ?? DEFAULT_PRIORITY_VARIATIONS.normal,
      low: config?.priorityVariations.low ?? DEFAULT_PRIORITY_VARIATIONS.low
    }
  };
};

const computeMinimumRequired = (delivery: Delivery, settings: PrioritySettings): number => {
  const base = settings.base;
  const variation = settings.variation[delivery.priority];
  const name = delivery.name.toLowerCase();
  const needsBonus = INTENSIVE_KEYWORDS.some(keyword => name.includes(keyword));
  return Math.max(1, base + variation + (needsBonus ? INTENSIVE_BONUS_DAYS : 0));
};

const comparePlanned = (a: PlannedDelivery, b: PlannedDelivery): number => {
  const dueDiff = a.dueDate.getTime() - b.dueDate.getTime();
  if (dueDiff !== 0) {
    return dueDiff;
  }
  const priorityDiff = PRIORITY_ORDER[a.delivery.priority] - PRIORITY_ORDER[b.delivery.priority];
  if (priorityDiff !== 0) {
    return priorityDiff;
  }
  const subjectDiff = a.delivery.subject.localeCompare(b.delivery.subject);
  if (subjectDiff !== 0) {
    return subjectDiff;
  }
  return a.delivery.name.localeCompare(b.delivery.name);
};

const buildEarliestStarts = (planned: PlannedDelivery[], semesterStart: Date): Date[] => {
  const earliestStarts: Date[] = new Array(planned.length);
  let cursor = semesterStart;

  planned.forEach((item, index) => {
    earliestStarts[index] = cursor;
    cursor = addDays(cursor, item.minimumRequired);
  });

  return earliestStarts;
};

const buildLatestWindows = (
  planned: PlannedDelivery[],
  earliestStarts: Date[],
  semesterStart: Date
): { latestStarts: Date[]; latestEnds: Date[] } => {
  const latestStarts: Date[] = new Array(planned.length);
  const latestEnds: Date[] = new Array(planned.length);

  let nextStart = planned.length > 0 ? addDays(planned[planned.length - 1].dueDate, 1) : semesterStart;

  for (let index = planned.length - 1; index >= 0; index -= 1) {
    const { dueDate, minimumRequired } = planned[index];
    const earliest = earliestStarts[index];

    let maxEnd = dueDate;
    if (index < planned.length - 1) {
      maxEnd = minDate(maxEnd, addDays(nextStart, -1));
    }

    let start = addDays(maxEnd, -(minimumRequired - 1));
    if (start.getTime() < earliest.getTime()) {
      start = earliest;
      maxEnd = addDays(start, minimumRequired - 1);
      if (maxEnd.getTime() > dueDate.getTime()) {
        maxEnd = dueDate;
        const adjustedStart = addDays(maxEnd, -(minimumRequired - 1));
        if (adjustedStart.getTime() >= earliest.getTime()) {
          start = adjustedStart;
        }
      }
    }

    if (maxEnd.getTime() < start.getTime()) {
      maxEnd = start;
    }

    latestStarts[index] = start;
    latestEnds[index] = maxEnd;
    nextStart = start;
  }

  return { latestStarts, latestEnds };
};

const planAllocations = (
  planned: PlannedDelivery[],
  semesterStart: Date,
  earliestStarts: Date[],
  latestStarts: Date[],
  latestEnds: Date[]
): Map<Delivery['id'], AllocationResult> => {
  const allocationMap = new Map<Delivery['id'], AllocationResult>();
  let cursor = semesterStart;

  planned.forEach((item, index) => {
    const { delivery, dueDate, minimumRequired } = item;

    let start = cursor;
    const earliest = earliestStarts[index];
    if (start.getTime() < earliest.getTime()) {
      start = earliest;
    }

    const latest = latestStarts[index];
    if (start.getTime() > latest.getTime()) {
      start = latest;
    }

    let availableEnd = latestEnds[index];
    if (index < planned.length - 1) {
      const nextStartLimit = addDays(latestStarts[index + 1], -1);
      if (nextStartLimit.getTime() < availableEnd.getTime()) {
        availableEnd = nextStartLimit;
      }
    }
    if (availableEnd.getTime() > dueDate.getTime()) {
      availableEnd = dueDate;
    }

    if (availableEnd.getTime() < start.getTime()) {
      start = availableEnd;
    }

    const availableSpan = Math.max(1, differenceInCalendarDays(availableEnd, start) + 1);

    let studyDays = minimumRequired;
    let warning = false;
    if (availableSpan < minimumRequired) {
      studyDays = availableSpan;
      warning = true;
    }

    let end = addDays(start, studyDays - 1);
    if (end.getTime() > availableEnd.getTime()) {
      end = availableEnd;
      studyDays = Math.max(1, differenceInCalendarDays(end, start) + 1);
    }

    const extraCapacity = Math.max(0, differenceInCalendarDays(availableEnd, end));
    if (extraCapacity > 0) {
      end = addDays(end, extraCapacity);
      studyDays = Math.max(1, differenceInCalendarDays(end, start) + 1);
    }

    if (end.getTime() > dueDate.getTime()) {
      end = dueDate;
      studyDays = Math.max(1, differenceInCalendarDays(end, start) + 1);
      warning = true;
    }

    warning = warning || studyDays < minimumRequired;

    allocationMap.set(delivery.id, {
      start,
      end,
      studyDays,
      warning,
      minimumRequired
    });

    cursor = addDays(end, 1);
  });

  return allocationMap;
};

export const useStudySchedule = (
  deliveries: Delivery[],
  semesterStartIso: string,
  config?: ConfigSettings
): StudySchedule[] => {
  return useMemo(() => {
    if (!Array.isArray(deliveries) || deliveries.length === 0) {
      return [];
    }

    const semesterStart = toNormalizedDate(semesterStartIso);
    if (!semesterStart) {
      return [];
    }

    const prioritySettings = buildPrioritySettings(config);

    const planned: PlannedDelivery[] = deliveries
      .filter(delivery => !delivery.completed)
      .map(delivery => {
        const dueDate = toNormalizedDate(delivery.date);
        if (!dueDate) {
          return null;
        }
        return {
          delivery,
          dueDate,
          minimumRequired: computeMinimumRequired(delivery, prioritySettings)
        } satisfies PlannedDelivery;
      })
      .filter((value): value is PlannedDelivery => value !== null)
      .sort(comparePlanned);

    const earliestStarts = buildEarliestStarts(planned, semesterStart);
    const { latestStarts, latestEnds } = buildLatestWindows(planned, earliestStarts, semesterStart);
    const allocations = planAllocations(planned, semesterStart, earliestStarts, latestStarts, latestEnds);

    const schedule: StudySchedule[] = [];

    deliveries.forEach(delivery => {
      const dueDate = toNormalizedDate(delivery.date);
      if (!dueDate) {
        return;
      }

      const minimumRequired = computeMinimumRequired(delivery, prioritySettings);

      if (delivery.completed) {
        schedule.push({
          ...delivery,
          studyStart: toIso(dueDate),
          startDate: dueDate,
          endDate: dueDate,
          studyDays: 0,
          warning: false,
          minimumRequired,
          allocatedDays: 0
        });
        return;
      }

      const allocation = allocations.get(delivery.id);
      if (!allocation) {
        const fallbackDays = Math.max(1, differenceInCalendarDays(dueDate, semesterStart) + 1);
        const warning = fallbackDays < minimumRequired;
        schedule.push({
          ...delivery,
          studyStart: toIso(semesterStart),
          startDate: semesterStart,
          endDate: dueDate,
          studyDays: fallbackDays,
          warning,
          minimumRequired,
          allocatedDays: fallbackDays
        });
        return;
      }

      schedule.push({
        ...delivery,
        studyStart: toIso(allocation.start),
        startDate: allocation.start,
        endDate: allocation.end,
        studyDays: allocation.studyDays,
        warning: allocation.warning,
        minimumRequired,
        allocatedDays: allocation.studyDays
      });
    });

    return schedule.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [deliveries, semesterStartIso, config]);
};
