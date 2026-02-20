import { parseISO, isValid, differenceInCalendarDays, format } from 'date-fns';
import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';

import { useAiContext } from '@/contexts/ai/AiContext';
import { useAuthContext } from '@/contexts/auth/AuthContext';
import { useConfigContext } from '@/contexts/config/ConfigContext';
import { useDeliveriesContext } from '@/contexts/deliveries/DeliveriesContext';
import { usePreferencesContext } from '@/contexts/preferences/PreferencesContext';
import { useSemesterContext } from '@/contexts/semester/SemesterContext';
import { buildStudySchedule } from '@/features/auth/study-planner/services/buildStudySchedule';
import { useStats } from '@/hooks/useStats';
import type { StudySchedule, StudyStats, Delivery } from '@/types';

interface ScheduleContextValue {
  fullSchedule: StudySchedule[];
  studySchedule: StudySchedule[];
  stats: StudyStats;
}

const ScheduleContext = createContext<ScheduleContextValue | undefined>(undefined);

interface ScheduleProviderProps {
  readonly children: ReactNode;
}

/**
 * Verifica si una entrega tiene fechas persistidas válidas
 */
const hasValidPersistedDates = (delivery: Delivery): boolean => {
  if (delivery.completed) {
    return true; // Las completadas no necesitan fechas válidas
  }
  if (!delivery.startDate || !delivery.endDate) {
    return false;
  }
  const start = parseISO(delivery.startDate);
  const end = parseISO(delivery.endDate);
  return isValid(start) && isValid(end) && end.getTime() >= start.getTime();
};

/**
 * Detecta si las fechas persistidas difieren de las que produciría el algoritmo actual.
 * Esto permite recalcular cuando cambian configuración, fecha de semestre o newDateStart.
 */
const hasScheduleMismatchWithPersistedDates = (
  deliveries: Delivery[],
  semesterStart: string,
  config: Parameters<typeof buildStudySchedule>[0]['config'],
  newDateStart: string | null
): boolean => {
  const computed = buildStudySchedule({
    deliveries,
    semesterStartIso: semesterStart,
    config,
    newDateStartIso: newDateStart ?? undefined,
  });

  if (computed.length === 0) {
    return false;
  }

  const computedById = new Map(
    computed.map(item => [
      item.id,
      {
        startDate: format(item.startDate, 'yyyy-MM-dd'),
        endDate: format(item.endDate, 'yyyy-MM-dd'),
      },
    ])
  );

  return deliveries.some(delivery => {
    if (delivery.completed) {
      return false;
    }

    if (!delivery.startDate || !delivery.endDate) {
      return true;
    }

    const persistedStart = parseISO(delivery.startDate);
    const persistedEnd = parseISO(delivery.endDate);
    if (!isValid(persistedStart) || !isValid(persistedEnd)) {
      return true;
    }

    const computedDates = computedById.get(delivery.id);
    if (!computedDates) {
      return true;
    }

    return (
      computedDates.startDate !== format(persistedStart, 'yyyy-MM-dd') ||
      computedDates.endDate !== format(persistedEnd, 'yyyy-MM-dd')
    );
  });
};

/**
 * Construye el schedule desde fechas persistidas en Supabase
 * Solo se usa cuando TODAS las entregas pendientes tienen fechas válidas
 */
const buildScheduleFromPersistedDates = (
  deliveries: Delivery[],
  semesterStart: string
): StudySchedule[] => {
  const semesterStartDate = parseISO(semesterStart);

  return deliveries.map(delivery => {
    // Si está completada, usar fecha de entrega para ambas
    if (delivery.completed) {
      const dueDate = parseISO(delivery.date);
      return {
        ...delivery,
        startDate: dueDate,
        endDate: dueDate,
        studyDays: 0,
        warning: false,
        minimumRequired: 0,
        allocatedDays: 0,
        desiredExtraByPriority: 0,
        achievedExtra: 0,
      } satisfies StudySchedule;
    }

    // Usar fechas persistidas para entregas pendientes
    const start = delivery.startDate ? parseISO(delivery.startDate) : semesterStartDate;
    const end = delivery.endDate ? parseISO(delivery.endDate) : parseISO(delivery.date);
    const dueDate = parseISO(delivery.date);
    const studyDays = Math.max(0, differenceInCalendarDays(end, start) + 1);
    const warning = dueDate.getTime() < start.getTime() || end.getTime() > dueDate.getTime();

    return {
      ...delivery,
      startDate: start,
      endDate: end,
      studyDays,
      warning,
      minimumRequired: 0, // No tenemos este dato persistido, lo dejamos en 0
      allocatedDays: studyDays,
      desiredExtraByPriority: 0, // No tenemos este dato persistido
      achievedExtra: 0, // No tenemos este dato persistido
    } satisfies StudySchedule;
  });
};

export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({ children }) => {
  const { user } = useAuthContext();
  const { deliveries, updateScheduleDates } = useDeliveriesContext();
  const { semesterStart, newDateStart } = useSemesterContext();
  const { config } = useConfigContext();
  const { aiOverrides } = useAiContext();
  const { selectedSubject, sortBy } = usePreferencesContext();

  // Ref para rastrear la última versión del schedule persistido
  const lastPersistedScheduleRef = useRef<Map<string, { startDate: string; endDate: string }>>(
    new Map()
  );

  /**
   * Determina si necesita recalcular el schedule o puede usar fechas persistidas
   */
  const shouldRecalculate = useMemo(() => {
    if (!semesterStart || deliveries.length === 0) {
      return false; // No hay datos para calcular
    }

    // Si hay entregas pendientes sin fechas válidas, DEBE recalcular
    const pendingWithoutDates = deliveries.some(d => !hasValidPersistedDates(d));
    if (pendingWithoutDates) {
      return true;
    }

    return hasScheduleMismatchWithPersistedDates(deliveries, semesterStart, config, newDateStart);
  }, [deliveries, semesterStart, config, newDateStart]);

  // Calcular el schedule base
  const baseSchedule = useMemo(() => {
    if (!semesterStart) {
      return [];
    }

    // Caso 1: Si debe recalcular, usar el algoritmo
    if (shouldRecalculate) {
      return buildStudySchedule({
        deliveries,
        semesterStartIso: semesterStart,
        config,
        newDateStartIso: newDateStart ?? undefined,
      });
    }

    // Caso 2: Usar fechas persistidas de Supabase
    return buildScheduleFromPersistedDates(deliveries, semesterStart);
  }, [deliveries, semesterStart, config, newDateStart, shouldRecalculate]);

  /**
   * Persistir fechas del algoritmo en Supabase SOLO cuando hay cambios reales
   * Se ejecuta únicamente cuando shouldRecalculate=true (algoritmo recalculó)
   */
  useEffect(() => {
    // Solo persistir si el usuario está autenticado y se recalculó el schedule
    if (!user || !shouldRecalculate || baseSchedule.length === 0) {
      return;
    }

    // Extraer fechas calculadas para entregas NO completadas
    const newScheduleMap = new Map<string, { startDate: string; endDate: string }>();
    const scheduleDateUpdates: Array<{ id: string; startDate: string; endDate: string }> = [];

    baseSchedule
      .filter(item => !item.completed)
      .forEach(item => {
        const startDateStr = format(item.startDate, 'yyyy-MM-dd');
        const endDateStr = format(item.endDate, 'yyyy-MM-dd');
        newScheduleMap.set(item.id, { startDate: startDateStr, endDate: endDateStr });

        // Comparar con la última versión persistida
        const lastPersisted = lastPersistedScheduleRef.current.get(item.id);
        if (
          !lastPersisted ||
          lastPersisted.startDate !== startDateStr ||
          lastPersisted.endDate !== endDateStr
        ) {
          // Hay cambio real, agregar a updates
          scheduleDateUpdates.push({
            id: item.id,
            startDate: startDateStr,
            endDate: endDateStr,
          });
        }
      });

    // Solo guardar si hay cambios reales
    if (scheduleDateUpdates.length > 0) {
      void updateScheduleDates(scheduleDateUpdates);
      // Actualizar ref con las fechas recién persistidas
      lastPersistedScheduleRef.current = newScheduleMap;
    }
  }, [user, shouldRecalculate, baseSchedule, updateScheduleDates]);

  // Procesar schedule con AI overrides si existen
  const scheduleWithAiOverrides = useMemo(() => {
    if (aiOverrides.size === 0) {
      return baseSchedule;
    }

    return baseSchedule.map(item => {
      const override = aiOverrides.get(item.id);
      if (!override) {
        return item;
      }

      const start = parseISO(override.startDate);
      const end = parseISO(override.endDate);
      if (!isValid(start) || !isValid(end) || end.getTime() < start.getTime()) {
        return item;
      }

      const studyDays = Math.max(1, differenceInCalendarDays(end, start) + 1);
      const dueDate = parseISO(item.date);
      const warning = dueDate.getTime() < start.getTime() || end.getTime() > dueDate.getTime();

      return {
        ...item,
        startDate: start,
        endDate: end,
        studyDays,
        allocatedDays: studyDays,
        warning,
      } satisfies StudySchedule;
    });
  }, [baseSchedule, aiOverrides]);

  const filteredSchedule = useMemo(() => {
    let source =
      selectedSubject === 'all'
        ? scheduleWithAiOverrides
        : scheduleWithAiOverrides.filter(item => item.subject === selectedSubject);

    if (sortBy === 'algorithm' || sortBy === 'date') {
      source = [...source].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'subject') {
      source = [...source].sort((a, b) => {
        if (a.subject !== b.subject) {
          return a.subject.localeCompare(b.subject);
        }
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    }

    return source;
  }, [scheduleWithAiOverrides, selectedSubject, sortBy]);

  const stats = useStats(scheduleWithAiOverrides);

  const value = useMemo<ScheduleContextValue>(
    () => ({
      fullSchedule: scheduleWithAiOverrides,
      studySchedule: filteredSchedule,
      stats,
    }),
    [scheduleWithAiOverrides, filteredSchedule, stats]
  );

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
};

export const useScheduleContext = (): ScheduleContextValue => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useScheduleContext must be used within a ScheduleProvider');
  }
  return context;
};
