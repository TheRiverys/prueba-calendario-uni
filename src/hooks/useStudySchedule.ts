import { useMemo } from 'react';
import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';
import type { Delivery, StudySchedule } from '../types';

type Priority = Delivery['priority'];

interface PlannedDelivery {
  delivery: Delivery;
  dueDate: Date;
  minimumRequired: number;
}

interface AllocationResult {
  start: Date;
  end: Date;
  studyDays: number;
  warning: boolean;
  minimumRequired: number;
}

const PRIORITY_BASE_DAYS: Record<Priority, number> = {
  low: 4,
  normal: 6,
  high: 8
};

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

const computeMinimumRequired = (delivery: Delivery): number => {
  const base = PRIORITY_BASE_DAYS[delivery.priority];
  const name = delivery.name.toLowerCase();
  const needsBonus = INTENSIVE_KEYWORDS.some(keyword => name.includes(keyword));
  return Math.max(1, base + (needsBonus ? INTENSIVE_BONUS_DAYS : 0));
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

const minDate = (a: Date, b: Date): Date => (a.getTime() <= b.getTime() ? a : b);

const buildLatestPossibleStarts = (
  planned: PlannedDelivery[],
  semesterStart: Date
): Date[] => {
  const latestStarts: Date[] = new Array(planned.length);
  let nextTaskStart: Date | null = null;

  for (let index = planned.length - 1; index >= 0; index -= 1) {
    const { dueDate, minimumRequired } = planned[index];
    let maxEnd = dueDate;
    if (nextTaskStart) {
      maxEnd = minDate(maxEnd, addDays(nextTaskStart, -1));
    }
    let candidateStart = addDays(maxEnd, -(minimumRequired - 1));
    if (candidateStart < semesterStart) {
      candidateStart = semesterStart;
    }
    if (candidateStart > maxEnd) {
      candidateStart = maxEnd;
    }
    latestStarts[index] = candidateStart;
    nextTaskStart = candidateStart;
  }

  return latestStarts;
};

const schedulePlannedDeliveries = (
  planned: PlannedDelivery[],
  semesterStart: Date
): Map<number, AllocationResult> => {
  const allocationMap = new Map<number, AllocationResult>();
  if (planned.length === 0) {
    return allocationMap;
  }

  const latestStarts = buildLatestPossibleStarts(planned, semesterStart);
  let cursor = semesterStart;

  planned.forEach((item, index) => {
    const { delivery, dueDate, minimumRequired } = item;
    const baseStart = cursor.getTime() > dueDate.getTime() ? dueDate : cursor;

    let maxEnd = dueDate;
    if (index < planned.length - 1) {
      maxEnd = minDate(maxEnd, addDays(latestStarts[index + 1], -1));
    }

    let start = baseStart.getTime() > maxEnd.getTime() ? maxEnd : baseStart;
    const minStartToFit = addDays(maxEnd, -(minimumRequired - 1));
    if (start.getTime() <= minStartToFit.getTime()) {
      start = minStartToFit;
      if (start.getTime() < baseStart.getTime()) {
        start = baseStart;
      }
    }

    if (start.getTime() > maxEnd.getTime()) {
      start = maxEnd;
    }

    let end = maxEnd;
    let studyDays = Math.max(1, differenceInCalendarDays(end, start) + 1);
    if (studyDays < minimumRequired) {
      end = minDate(dueDate, addDays(start, minimumRequired - 1));
      studyDays = Math.max(1, differenceInCalendarDays(end, start) + 1);
      if (studyDays < minimumRequired) {
        start = addDays(end, -(minimumRequired - 1));
        if (start.getTime() < baseStart.getTime()) {
          start = baseStart;
        }
        if (start.getTime() > end.getTime()) {
          start = end;
        }
        studyDays = Math.max(1, differenceInCalendarDays(end, start) + 1);
      }
    }

    const warning = studyDays < minimumRequired || end.getTime() > dueDate.getTime();

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

const fillGaps = (schedule: StudySchedule[]): StudySchedule[] => {
  if (schedule.length <= 1) {
    return schedule;
  }

  const filled: StudySchedule[] = [];
  for (let index = 0; index < schedule.length; index += 1) {
    const current = schedule[index];
    const previous = filled[filled.length - 1];

    if (previous) {
      const expectedStart = addDays(previous.endDate, 1);
      if (current.startDate.getTime() > expectedStart.getTime()) {
        const gapDays = differenceInCalendarDays(current.startDate, expectedStart);
        current.startDate = expectedStart;
        current.studyStart = toIso(expectedStart);
        current.studyDays += gapDays;
      }
    }

    filled.push(current);
  }

  return filled;
};

export const useStudySchedule = (deliveries: Delivery[], semesterStartIso: string): StudySchedule[] => {
  return useMemo(() => {
    if (!Array.isArray(deliveries) || deliveries.length === 0) {
      return [];
    }

    const semesterStart = toNormalizedDate(semesterStartIso);
    if (!semesterStart) {
      return [];
    }

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
          minimumRequired: computeMinimumRequired(delivery)
        } as PlannedDelivery;
      })
      .filter((value): value is PlannedDelivery => value !== null)
      .sort(comparePlanned);

    const allocations = schedulePlannedDeliveries(planned, semesterStart);
    const schedule: StudySchedule[] = [];

    deliveries.forEach(delivery => {
      const dueDate = toNormalizedDate(delivery.date);
      if (!dueDate) {
        return;
      }

      const minimumRequired = computeMinimumRequired(delivery);

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

    const sorted = schedule
      .filter(item => !item.completed)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    const filled = fillGaps(sorted);

    const completed = schedule.filter(item => item.completed);
    return [...completed, ...filled].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [deliveries, semesterStartIso]);
};
