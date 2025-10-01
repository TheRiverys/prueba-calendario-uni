import { useMemo } from 'react';
import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';
import type { Delivery, StudySchedule, ConfigSettings } from '../types';
import { DEFAULT_CONFIG, DEFAULT_PRIORITY_VARIATIONS } from '../utils';

type Priority = Delivery['priority'];

type PlannedDelivery = {
  delivery: Delivery;
  dueDate: Date;
  minDays: number;
};

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

const getPriorityValue = (priority: Priority, config?: ConfigSettings): number => {
  const variations = config?.priorityVariations ?? DEFAULT_PRIORITY_VARIATIONS;
  return variations[priority];
};

const computeSequentialDurations = (
  planned: PlannedDelivery[],
  semesterStart: Date,
  config?: ConfigSettings
): { durations: number[]; warnings: boolean[]; desiredExtras: number[]; achievedExtras: number[] } => {
  const n = planned.length;
  const durations = planned.map(p => Math.max(1, p.minDays));
  const warnings = new Array<boolean>(n).fill(false);
  const desiredExtras = planned.map(p => getPriorityValue(p.delivery.priority, config));
  const achievedExtras = new Array<number>(n).fill(0);

  if (n === 0) {
    return { durations, warnings, desiredExtras, achievedExtras };
  }

  const countInclusive = (start: Date, end: Date): number => Math.max(1, differenceInCalendarDays(end, start) + 1);
  const capacity = planned.map(p => countInclusive(semesterStart, p.dueDate));

  const prefixSumAt = (idx: number): number => {
    let sum = 0;
    for (let t = 0; t <= idx; t += 1) {
      sum += durations[t];
    }
    return sum;
  };

  const canGrow = (candidateIdx: number, prefixEnd: number): boolean => {
    for (let j = candidateIdx; j <= prefixEnd; j += 1) {
      if (prefixSumAt(j) >= capacity[j]) {
        return false;
      }
    }
    return true;
  };

  const allocateExtra = (groupStart: number, groupEnd: number, amount: number, config?: ConfigSettings) => {
    const windowDays = config?.allocationWindowDays ?? 30;
    const groupDueDate = planned[groupEnd].dueDate;

    let remaining = amount;
    while (remaining > 0) {
      const candidates: Array<{ idx: number; weight: number; achieved: number }> = [];

      // El bucle ahora mira hacia adelante en el array 'planned'
      for (let k = groupStart; k < planned.length; k += 1) {
        const task = planned[k];

        // Condición 1: La tarea no puede haber superado su propia capacidad
        if (!canGrow(k, groupEnd)) {
          continue;
        }

        // Condición 2: La tarea debe estar dentro de la ventana de tiempo
        const daysUntilDue = differenceInCalendarDays(task.dueDate, groupDueDate);
        if (daysUntilDue < 0 || daysUntilDue > windowDays) {
          // Si la tarea ya venció o está muy lejos en el futuro, la ignoramos
          // (La condición daysUntilDue < 0 no debería ocurrir si k >= groupStart, pero es una buena salvaguarda)
          if (daysUntilDue > windowDays) break; // Optimización: como el array está ordenado, no hace falta seguir
          continue;
        }

        candidates.push({
          idx: k,
          weight: Math.max(0, desiredExtras[k]),
          achieved: achievedExtras[k]
        });
      }

      if (candidates.length === 0) {
        break;
      }

      // El resto de la lógica de ordenación y asignación permanece igual
      candidates.sort((a, b) => {
        if (b.weight !== a.weight) {
          return b.weight - a.weight;
        }
        if (a.achieved !== b.achieved) {
          return a.achieved - b.achieved;
        }
        const dueDiff = planned[a.idx].dueDate.getTime() - planned[b.idx].dueDate.getTime();
        if (dueDiff !== 0) {
          return dueDiff;
        }
        return planned[a.idx].delivery.id.localeCompare(planned[b.idx].delivery.id);
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
      for (let k = 0; k <= prefixEnd; k += 1) {
        if (achievedExtras[k] > 0 && durations[k] > planned[k].minDays) {
          candidates.push({
            idx: k,
            weight: desiredExtras[k],
            achieved: achievedExtras[k]
          });
        }
      }

      if (candidates.length === 0) {
        break;
      }

      candidates.sort((a, b) => {
        if (a.weight !== b.weight) {
          return a.weight - b.weight;
        }
        if (b.achieved !== a.achieved) {
          return b.achieved - a.achieved;
        }
        const dueDiff = planned[b.idx].dueDate.getTime() - planned[a.idx].dueDate.getTime();
        if (dueDiff !== 0) {
          return dueDiff;
        }
        return planned[a.idx].delivery.id.localeCompare(planned[b.idx].delivery.id);
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

  return { durations, warnings, desiredExtras, achievedExtras };
};

export const useStudySchedule = (
  deliveries: Delivery[],
  semesterStartIso: string,
  config?: ConfigSettings,
  semesterStartTrigger?: number,
  deliveriesTrigger?: number
): StudySchedule[] => {
  return useMemo(() => {
    if (!Array.isArray(deliveries) || deliveries.length === 0) {
      return [];
    }

    const semesterStart = toNormalizedDate(semesterStartIso);
    if (!semesterStart) {
      return [];
    }

    const comparePlanned = (a: PlannedDelivery, b: PlannedDelivery): number => {
      const dueDiff = a.dueDate.getTime() - b.dueDate.getTime();
      if (dueDiff !== 0) {
        return dueDiff;
      }
      const pa = getPriorityValue(a.delivery.priority, config);
      const pb = getPriorityValue(b.delivery.priority, config);
      if (pb !== pa) {
        return pb - pa;
      }
      return a.delivery.id.localeCompare(b.delivery.id);
    };

    const MIN_DIAS = Math.max(1, Math.round(config?.baseStudyDays ?? DEFAULT_BASE_STUDY_DAYS));

    const plannedAll: PlannedDelivery[] = deliveries
      .filter(d => !d.completed)
      .map(d => {
        const dueDate = toNormalizedDate(d.date);
        if (!dueDate) {
          return null;
        }
        return { delivery: d, dueDate, minDays: MIN_DIAS } satisfies PlannedDelivery;
      })
      .filter((value): value is PlannedDelivery => value !== null);

    const plannedEligible = plannedAll
      .filter(p => p.dueDate.getTime() >= semesterStart.getTime())
      .sort(comparePlanned);

    const { durations, warnings: warnFlags, desiredExtras, achievedExtras } = computeSequentialDurations(
      plannedEligible,
      semesterStart,
      config
    );

    const allocationById = new Map<string, AllocationResult>();
    if (plannedEligible.length > 0) {
      let nextAvailableEnd: Date | null = null;
      for (let i = plannedEligible.length - 1; i >= 0; i -= 1) {
        const plannedItem = plannedEligible[i];
        const dueTime = plannedItem.dueDate.getTime();
        const effectiveEnd = (() => {
          if (!nextAvailableEnd) {
            return new Date(dueTime);
          }
          const candidate = Math.min(dueTime, nextAvailableEnd.getTime());
          return new Date(candidate);
        })();
        const start = addDays(effectiveEnd, -(durations[i] - 1));
        allocationById.set(plannedItem.delivery.id, {
          start,
          end: effectiveEnd,
          studyDays: durations[i],
          warning:
            warnFlags[i] || durations[i] < plannedItem.minDays || start.getTime() < semesterStart.getTime(),
          minDays: plannedItem.minDays,
          desiredExtraByPriority: desiredExtras[i],
          achievedExtra: achievedExtras[i]
        });
        nextAvailableEnd = addDays(start, -1);
      }
    }

    const schedule: StudySchedule[] = [];

    deliveries.forEach(delivery => {
      const dueDate = toNormalizedDate(delivery.date);
      if (!dueDate) {
        return;
      }

      const minDays = MIN_DIAS;

      if (delivery.completed) {
        schedule.push({
          ...delivery,
          studyStart: toIso(dueDate),
          startDate: dueDate,
          endDate: dueDate,
          studyDays: 0,
          warning: false,
          minimumRequired: minDays,
          allocatedDays: 0,
          desiredExtraByPriority: 0,
          achievedExtra: 0
        });
        return;
      }

      const allocation = allocationById.get(delivery.id);

      if (!allocation) {
        const isBeforeSemester = dueDate.getTime() < semesterStart.getTime();
        const start = isBeforeSemester ? dueDate : semesterStart;
        const end = dueDate;
        const studyDays = Math.max(0, differenceInCalendarDays(end, start) + 1);
        schedule.push({
          ...delivery,
          studyStart: toIso(start),
          startDate: start,
          endDate: end,
          studyDays,
          warning: isBeforeSemester || studyDays < minDays,
          minimumRequired: minDays,
          allocatedDays: studyDays,
          desiredExtraByPriority: Math.max(0, getPriorityValue(delivery.priority, config)),
          achievedExtra: 0
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
        minimumRequired: allocation.minDays,
        allocatedDays: allocation.studyDays,
        desiredExtraByPriority: allocation.desiredExtraByPriority,
        achievedExtra: allocation.achievedExtra
      });
    });

    return schedule.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [deliveries, semesterStartIso, config, semesterStartTrigger, deliveriesTrigger]);
};