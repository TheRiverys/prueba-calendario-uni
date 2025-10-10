import { differenceInCalendarDays } from 'date-fns';

import type { ConfigSettings } from '@/types';

import { getPriorityValue } from '../utils/priorityUtils';

import type { PlannedDelivery, SequentialDurationsResult } from '../types';

const countInclusive = (start: Date, end: Date): number =>
  Math.max(1, differenceInCalendarDays(end, start) + 1);

export const computeSequentialDurations = (
  planned: PlannedDelivery[],
  semesterStart: Date,
  config?: ConfigSettings
): SequentialDurationsResult => {
  const n = planned.length;
  const durations = planned.map(plan => Math.max(1, plan.minDays));
  const warnings = new Array<boolean>(n).fill(false);
  const desiredExtras = planned.map(plan => getPriorityValue(plan.delivery.priority, config));
  const achievedExtras = new Array<number>(n).fill(0);

  if (n === 0) {
    return { durations, warnings, desiredExtras, achievedExtras };
  }

  const capacity = planned.map(plan => countInclusive(semesterStart, plan.dueDate));

  const prefixSumAt = (idx: number): number => {
    let sum = 0;
    for (let position = 0; position <= idx; position += 1) {
      sum += durations[position];
    }
    return sum;
  };

  const canGrow = (candidateIdx: number, prefixEnd: number): boolean => {
    for (let index = candidateIdx; index <= prefixEnd; index += 1) {
      if (prefixSumAt(index) >= capacity[index]) {
        return false;
      }
    }
    return true;
  };

  const allocateExtra = (
    groupStart: number,
    groupEnd: number,
    amount: number,
    allocationConfig?: ConfigSettings
  ) => {
    const windowDays = allocationConfig?.allocationWindowDays ?? 30;
    const groupDueDate = planned[groupEnd].dueDate;

    let remaining = amount;
    while (remaining > 0) {
      const candidates: Array<{ idx: number; weight: number; achieved: number }> = [];

      for (let iterator = groupStart; iterator < planned.length; iterator += 1) {
        const task = planned[iterator];

        if (!canGrow(iterator, groupEnd)) {
          continue;
        }

        const daysUntilDue = differenceInCalendarDays(task.dueDate, groupDueDate);
        if (daysUntilDue < 0 || daysUntilDue > windowDays) {
          if (daysUntilDue > windowDays) {
            break;
          }
          continue;
        }

        candidates.push({
          idx: iterator,
          weight: Math.max(0, desiredExtras[iterator]),
          achieved: achievedExtras[iterator],
        });
      }

      if (candidates.length === 0) {
        break;
      }

      candidates.sort((first, second) => {
        if (second.weight !== first.weight) {
          return second.weight - first.weight;
        }
        if (first.achieved !== second.achieved) {
          return first.achieved - second.achieved;
        }
        const dueDiff =
          planned[first.idx].dueDate.getTime() - planned[second.idx].dueDate.getTime();
        if (dueDiff !== 0) {
          return dueDiff;
        }
        return planned[first.idx].delivery.id.localeCompare(planned[second.idx].delivery.id);
      });

      const chosen = candidates[0].idx;
      if (!canGrow(chosen, groupEnd)) {
        break;
      }

      durations[chosen] += 1;
      achievedExtras[chosen] += 1;
      remaining -= 1;
    }
  };

  const trimExtras = (prefixEnd: number, deficit: number): number => {
    let remaining = deficit;
    while (remaining < 0) {
      const candidates: Array<{ idx: number; weight: number; achieved: number }> = [];
      for (let iterator = 0; iterator <= prefixEnd; iterator += 1) {
        if (achievedExtras[iterator] > 0 && durations[iterator] > planned[iterator].minDays) {
          candidates.push({
            idx: iterator,
            weight: desiredExtras[iterator],
            achieved: achievedExtras[iterator],
          });
        }
      }

      if (candidates.length === 0) {
        break;
      }

      candidates.sort((first, second) => {
        if (first.weight !== second.weight) {
          return first.weight - second.weight;
        }
        if (second.achieved !== first.achieved) {
          return second.achieved - first.achieved;
        }
        const dueDiff =
          planned[second.idx].dueDate.getTime() - planned[first.idx].dueDate.getTime();
        if (dueDiff !== 0) {
          return dueDiff;
        }
        return planned[first.idx].delivery.id.localeCompare(planned[second.idx].delivery.id);
      });

      const chosen = candidates[0].idx;
      durations[chosen] -= 1;
      achievedExtras[chosen] -= 1;
      remaining += 1;
    }

    return remaining;
  };

  let groupStart = 0;
  while (groupStart < n) {
    let groupEnd = groupStart;
    const groupDue = planned[groupStart].dueDate.getTime();
    while (groupEnd + 1 < n && planned[groupEnd + 1].dueDate.getTime() === groupDue) {
      groupEnd += 1;
    }

    const slack = capacity[groupEnd] - prefixSumAt(groupEnd);

    if (slack < 0) {
      const remainingDeficit = trimExtras(groupEnd, slack);
      if (remainingDeficit < 0) {
        for (let idx = 0; idx <= groupEnd; idx += 1) {
          warnings[idx] = true;
        }
      }
    } else if (slack > 0) {
      allocateExtra(groupStart, groupEnd, slack, config);
    }

    groupStart = groupEnd + 1;
  }

  return { durations, warnings, desiredExtras, achievedExtras } satisfies SequentialDurationsResult;
};
