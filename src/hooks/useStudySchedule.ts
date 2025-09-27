import { useMemo } from 'react';
import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';
import type { Delivery, StudySchedule } from '../types';

type Priority = Delivery['priority'];

interface PlannedDelivery {
  delivery: Delivery;
  dueDate: Date;
  requiredDays: number;
}

interface Allocation {
  start: Date;
  end: Date;
  studyDays: number;
  warning: boolean;
}

const PRIORITY_BASE_DAYS: Record<Priority, number> = {
  low: 3,
  normal: 5,
  high: 7
};

const PRIORITY_WEIGHT: Record<Priority, number> = {
  high: 0,
  normal: 1,
  low: 2
};

const INTENSIVE_KEYWORDS = ['examen', 'final', 'proyecto', 'trabajo final'];
const INTENSIVE_BONUS_DAYS = 2;

const toDate = (value: string | null | undefined): Date | null => {
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

const computeRequiredDays = (delivery: Delivery): number => {
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
  const priorityDiff = PRIORITY_WEIGHT[a.delivery.priority] - PRIORITY_WEIGHT[b.delivery.priority];
  if (priorityDiff !== 0) {
    return priorityDiff;
  }
  const subjectDiff = a.delivery.subject.localeCompare(b.delivery.subject);
  if (subjectDiff !== 0) {
    return subjectDiff;
  }
  return a.delivery.name.localeCompare(b.delivery.name);
};

const allocateWindow = (
  planned: PlannedDelivery,
  suggestedStart: Date,
  semesterStart: Date,
  isFirst: boolean
): Allocation => {
  const required = planned.requiredDays;
  const dueDate = planned.dueDate;
  const baselineStart = startOfDay(suggestedStart);

  let start = baselineStart;
  if (isFirst || start < semesterStart) {
    start = semesterStart;
  }
  if (start > dueDate) {
    start = addDays(dueDate, -(required - 1));
  }

  let end = addDays(start, required - 1);
  if (end > dueDate) {
    end = dueDate;
    const potentialStart = addDays(end, -(required - 1));
    if (potentialStart < start) {
      start = potentialStart;
    }
  }

  if (start < semesterStart) {
    start = semesterStart;
  }
  if (end < start) {
    end = start;
  }

  const studyDays = Math.max(1, differenceInCalendarDays(end, start) + 1);
  const warning = start < baselineStart || studyDays < required || end.getTime() > dueDate.getTime();

  return { start, end, studyDays, warning };
};

export const useStudySchedule = (deliveries: Delivery[], semesterStartIso: string): StudySchedule[] => {
  return useMemo(() => {
    if (!Array.isArray(deliveries) || deliveries.length === 0) {
      return [];
    }

    const semesterStart = toDate(semesterStartIso);
    if (!semesterStart) {
      return [];
    }

    const plannedDeliveries = deliveries
      .reduce<PlannedDelivery[]>((acc, delivery) => {
        if (delivery.completed) {
          return acc;
        }
        const dueDate = toDate(delivery.date);
        if (!dueDate) {
          return acc;
        }
        acc.push({
          delivery,
          dueDate,
          requiredDays: computeRequiredDays(delivery)
        });
        return acc;
      }, [])
      .sort(comparePlanned);

    const allocationMap = new Map<number, Allocation & { minimumRequired: number }>();
    let previousEnd: Date | null = null;

    plannedDeliveries.forEach((planned, index) => {
      const suggestedStart = previousEnd ? addDays(previousEnd, 1) : semesterStart;
      const allocation = allocateWindow(planned, suggestedStart, semesterStart, index === 0);
      previousEnd = allocation.end;
      allocationMap.set(planned.delivery.id, {
        ...allocation,
        minimumRequired: planned.requiredDays
      });
    });

    const schedule: StudySchedule[] = [];

    deliveries.forEach(delivery => {
      const dueDate = toDate(delivery.date);
      if (!dueDate) {
        return;
      }

      const minimumRequired = computeRequiredDays(delivery);

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

      const allocation = allocationMap.get(delivery.id);
      if (allocation) {
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
        return;
      }

      const fallbackStudyDays = Math.max(1, differenceInCalendarDays(dueDate, semesterStart) + 1);
      schedule.push({
        ...delivery,
        studyStart: toIso(semesterStart),
        startDate: semesterStart,
        endDate: dueDate,
        studyDays: fallbackStudyDays,
        warning: fallbackStudyDays < minimumRequired,
        minimumRequired,
        allocatedDays: fallbackStudyDays
      });
    });

    schedule.sort((a, b) => {
      const startDiff = a.startDate.getTime() - b.startDate.getTime();
      if (startDiff !== 0) {
        return startDiff;
      }
      const dueDiff = parseISO(a.date).getTime() - parseISO(b.date).getTime();
      if (dueDiff !== 0) {
        return dueDiff;
      }
      return a.id - b.id;
    });

    return schedule;
  }, [deliveries, semesterStartIso]);
};
