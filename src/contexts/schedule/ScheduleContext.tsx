import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { parseISO, isValid, format, differenceInCalendarDays } from 'date-fns';
import { useStudySchedule } from '@/hooks/useStudySchedule';
import { useStats } from '@/hooks/useStats';
import { useDeliveriesContext } from '@/contexts/deliveries/DeliveriesContext';
import { useSemesterContext } from '@/contexts/semester/SemesterContext';
import { useConfigContext } from '@/contexts/config/ConfigContext';
import { useAiContext } from '@/contexts/ai/AiContext';
import { usePreferencesContext } from '@/contexts/preferences/PreferencesContext';
import type { StudySchedule, StudyStats } from '@/types';

interface ScheduleContextValue {
  fullSchedule: StudySchedule[];
  studySchedule: StudySchedule[];
  stats: StudyStats;
}

const ScheduleContext = createContext<ScheduleContextValue | undefined>(undefined);

interface ScheduleProviderProps {
  children: ReactNode;
}

export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({ children }) => {
  const { deliveries, deliveriesVersion } = useDeliveriesContext();
  const { semesterStart, semesterStartVersion } = useSemesterContext();
  const { config } = useConfigContext();
  const { aiOverrides } = useAiContext();
  const { selectedSubject, sortBy } = usePreferencesContext();

  // ✅ CORRECTO: Llamar hook al nivel superior, no dentro de useMemo
  const baseSchedule = useStudySchedule(
    deliveries,
    semesterStart,
    config,
    semesterStartVersion,
    deliveriesVersion
  );

  // Procesar schedule con AI overrides si existen
  const scheduleWithAiOverrides = useMemo(() => {
    if (aiOverrides.size === 0) {
      return baseSchedule;
    }

    return baseSchedule.map((item) => {
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
        studyStart: format(start, 'yyyy-MM-dd'),
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
        : scheduleWithAiOverrides.filter((item) => item.subject === selectedSubject);

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
