import { addDays, differenceInCalendarDays } from 'date-fns';

import type { ConfigSettings, Delivery, StudySchedule } from '@/types';
import { DEFAULT_CONFIG } from '@/utils/config';

import { toIso, toNormalizedDate } from '../utils/dateUtils';
import { getPriorityValue } from '../utils/priorityUtils';

import { computeSequentialDurations } from './computeSequentialDurations';

import type { PlannedDelivery, StudyScheduleBuilderParams } from '../types';

type AllocationResult = {
  start: Date;
  end: Date;
  studyDays: number;
  warning: boolean;
  minDays: number;
  desiredExtraByPriority: number;
  achievedExtra: number;
};

const DEFAULT_BASE_STUDY_DAYS = DEFAULT_CONFIG.baseStudyDays;

const comparePlanned =
  (config: ConfigSettings | undefined) =>
  (a: PlannedDelivery, b: PlannedDelivery): number => {
    const dueDiff = a.dueDate.getTime() - b.dueDate.getTime();
    if (dueDiff !== 0) {
      return dueDiff;
    }
    const priorityA = getPriorityValue(a.delivery.priority, config);
    const priorityB = getPriorityValue(b.delivery.priority, config);
    if (priorityB !== priorityA) {
      return priorityB - priorityA;
    }
    return a.delivery.id.localeCompare(b.delivery.id);
  };

const buildPlannedDeliveries = (
  deliveries: Delivery[],
  semesterStart: Date,
  minDays: number
): PlannedDelivery[] => {
  return deliveries
    .filter(delivery => !delivery.completed)
    .map(delivery => {
      const dueDate = toNormalizedDate(delivery.date);
      if (!dueDate) {
        return null;
      }
      return { delivery, dueDate, minDays } satisfies PlannedDelivery;
    })
    .filter((candidate): candidate is PlannedDelivery => candidate !== null)
    .filter(candidate => candidate.dueDate.getTime() >= semesterStart.getTime());
};

const mapAllocations = (
  plannedEligible: PlannedDelivery[],
  durations: number[],
  warningFlags: boolean[],
  desiredExtras: number[],
  achievedExtras: number[],
  semesterStart: Date
): Map<string, AllocationResult> => {
  const allocationById = new Map<string, AllocationResult>();

  if (plannedEligible.length === 0) {
    return allocationById;
  }

  let nextAvailableEnd: Date | null = null;
  for (let index = plannedEligible.length - 1; index >= 0; index -= 1) {
    const plannedItem = plannedEligible[index];
    const dueTime = plannedItem.dueDate.getTime();
    const effectiveEnd = (() => {
      if (!nextAvailableEnd) {
        return new Date(dueTime);
      }
      const candidate = Math.min(dueTime, nextAvailableEnd.getTime());
      return new Date(candidate);
    })();
    const start = addDays(effectiveEnd, -(durations[index] - 1));
    allocationById.set(plannedItem.delivery.id, {
      start,
      end: effectiveEnd,
      studyDays: durations[index],
      warning:
        warningFlags[index] ||
        durations[index] < plannedItem.minDays ||
        start.getTime() < semesterStart.getTime(),
      minDays: plannedItem.minDays,
      desiredExtraByPriority: desiredExtras[index],
      achievedExtra: achievedExtras[index],
    });
    nextAvailableEnd = addDays(start, -1);
  }

  return allocationById;
};

const buildCompletedDeliverySchedule = (
  delivery: Delivery,
  dueDate: Date,
  minDays: number
): StudySchedule => ({
  ...delivery,
  studyStart: toIso(dueDate),
  startDate: dueDate,
  endDate: dueDate,
  studyDays: 0,
  warning: false,
  minimumRequired: minDays,
  allocatedDays: 0,
  desiredExtraByPriority: 0,
  achievedExtra: 0,
});

const buildPendingFallbackSchedule = (
  delivery: Delivery,
  dueDate: Date,
  semesterStart: Date,
  minDays: number,
  config: ConfigSettings | undefined
): StudySchedule => {
  const isBeforeSemester = dueDate.getTime() < semesterStart.getTime();
  const start = isBeforeSemester ? dueDate : semesterStart;
  const end = dueDate;
  const studyDays = Math.max(0, differenceInCalendarDays(end, start) + 1);

  return {
    ...delivery,
    studyStart: toIso(start),
    startDate: start,
    endDate: end,
    studyDays,
    warning: isBeforeSemester || studyDays < minDays,
    minimumRequired: minDays,
    allocatedDays: studyDays,
    desiredExtraByPriority: Math.max(0, getPriorityValue(delivery.priority, config)),
    achievedExtra: 0,
  } satisfies StudySchedule;
};

export const buildStudySchedule = ({
  deliveries,
  semesterStartIso,
  config,
}: StudyScheduleBuilderParams): StudySchedule[] => {
  if (!Array.isArray(deliveries) || deliveries.length === 0) {
    return [];
  }

  const semesterStart = toNormalizedDate(semesterStartIso);
  if (!semesterStart) {
    return [];
  }

  const minDays = Math.max(1, Math.round(config?.baseStudyDays ?? DEFAULT_BASE_STUDY_DAYS));

  const plannedEligible = buildPlannedDeliveries(deliveries, semesterStart, minDays).sort(
    comparePlanned(config)
  );

  const {
    durations,
    warnings: warningFlags,
    desiredExtras,
    achievedExtras,
  } = computeSequentialDurations(plannedEligible, semesterStart, config);

  const allocationById = mapAllocations(
    plannedEligible,
    durations,
    warningFlags,
    desiredExtras,
    achievedExtras,
    semesterStart
  );

  const schedule: StudySchedule[] = [];

  deliveries.forEach(delivery => {
    const dueDate = toNormalizedDate(delivery.date);
    if (!dueDate) {
      return;
    }

    if (delivery.completed) {
      schedule.push(buildCompletedDeliverySchedule(delivery, dueDate, minDays));
      return;
    }

    const allocation = allocationById.get(delivery.id);
    if (!allocation) {
      schedule.push(
        buildPendingFallbackSchedule(delivery, dueDate, semesterStart, minDays, config)
      );
      return;
    }

    schedule.push({
      ...delivery,
      studyStart: toIso(allocation.start),
      startDate: allocation.start,
      endDate: allocation.end,
      studyDays: allocation.studyDays,
      warning: allocation.warning,
      minimumRequired: allocation.minDays,
      allocatedDays: allocation.studyDays,
      desiredExtraByPriority: allocation.desiredExtraByPriority,
      achievedExtra: allocation.achievedExtra,
    });
  });

  return schedule.sort((first, second) => first.startDate.getTime() - second.startDate.getTime());
};
