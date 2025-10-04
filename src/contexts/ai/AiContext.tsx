import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { parseISO, isValid, format } from 'date-fns';
import { useAI } from '@/hooks/useAI';
import { useDeliveriesContext } from '@/contexts/deliveries/DeliveriesContext';
import { useSemesterContext } from '@/contexts/semester/SemesterContext';
import type { Delivery, AiDetailedEntry, AiScheduleResult, AiScheduleOverride } from '@/types';

const normalizeIsoDate = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const parsed = parseISO(trimmed);
  if (!isValid(parsed)) {
    return null;
  }
  return format(parsed, 'yyyy-MM-dd');
};

const buildDeliveryKey = (subject: string, name: string, date: string): string => {
  return `${subject.trim().toLowerCase()}|${name.trim().toLowerCase()}|${date}`;
};

interface AiContextValue {
  aiOverrides: Map<Delivery['id'], AiScheduleOverride>;
  generateStudySchedule: () => Promise<AiScheduleResult>;
  analyzeProgress: () => Promise<string>;
  clearAiSchedule: () => void;
  aiScheduleApplied: boolean;
  aiLoading: boolean;
  aiError: string | null;
}

const AiContext = createContext<AiContextValue | undefined>(undefined);

interface AiProviderProps {
  children: ReactNode;
}

export const AiProvider: React.FC<AiProviderProps> = ({ children }) => {
  const { deliveries } = useDeliveriesContext();
  const { semesterStart, semesterStartVersion } = useSemesterContext();

  const [aiOverrides, setAiOverrides] = useState<Map<Delivery['id'], AiScheduleOverride>>(
    () => new Map()
  );

  const {
    generateStudyPlan,
    generateDetailedSchedule,
    analyzeProgress,
    isLoading: aiLoading,
    error: aiError,
  } = useAI();

  useEffect(() => {
    setAiOverrides((previous) => {
      if (previous.size === 0) {
        return previous;
      }
      return new Map();
    });
  }, [semesterStartVersion]);

  const clearAiSchedule = useCallback(() => {
    setAiOverrides((previous) => (previous.size === 0 ? previous : new Map()));
  }, []);

  const generateStudySchedule = useCallback(async (): Promise<AiScheduleResult> => {
    try {
      const studyPlan = await generateStudyPlan(deliveries, semesterStart);

      if (studyPlan.length === 0) {
        clearAiSchedule();
        return { entries: [], applied: false } satisfies AiScheduleResult;
      }

      const deliveryKeyIndex = new Map<string, Delivery['id']>();
      deliveries.forEach((delivery) => {
        const normalizedDate = normalizeIsoDate(delivery.date);
        if (!normalizedDate) {
          return;
        }
        const key = buildDeliveryKey(delivery.subject, delivery.name, normalizedDate);
        if (!deliveryKeyIndex.has(key)) {
          deliveryKeyIndex.set(key, delivery.id);
        }
      });

      const overrides = new Map<Delivery['id'], AiScheduleOverride>();
      studyPlan.forEach((planEntry) => {
        const deliveryDate = normalizeIsoDate(planEntry.deliveryDate);
        const startDate = normalizeIsoDate(planEntry.startDate);
        const endDate = normalizeIsoDate(planEntry.endDate);
        if (!deliveryDate || !startDate || !endDate) {
          return;
        }
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        if (!isValid(start) || !isValid(end) || end.getTime() < start.getTime()) {
          return;
        }
        const key = buildDeliveryKey(planEntry.subject ?? '', planEntry.name ?? '', deliveryDate);
        const deliveryId = deliveryKeyIndex.get(key);
        if (!deliveryId) {
          return;
        }
        overrides.set(deliveryId, { startDate, endDate });
      });

      setAiOverrides((previous) => {
        if (overrides.size === 0 && previous.size === 0) {
          return previous;
        }
        return overrides.size === 0 ? new Map() : new Map(overrides);
      });

      const detailedSchedule = generateDetailedSchedule(studyPlan) as AiDetailedEntry[];
      return {
        entries: detailedSchedule,
        applied: overrides.size > 0,
      } satisfies AiScheduleResult;
    } catch (error) {
      console.error('Error generando horario con IA:', error);
      clearAiSchedule();
      return { entries: [], applied: false } satisfies AiScheduleResult;
    }
  }, [generateStudyPlan, generateDetailedSchedule, deliveries, semesterStart, clearAiSchedule]);

  const analyzeProgressWrapper = useCallback(async () => {
    const completed = deliveries.filter((delivery) => delivery.completed);
    const upcoming = deliveries.filter((delivery) => !delivery.completed);
    return analyzeProgress(completed, upcoming);
  }, [analyzeProgress, deliveries]);

  const aiScheduleApplied = useMemo(() => aiOverrides.size > 0, [aiOverrides]);

  const value = useMemo<AiContextValue>(
    () => ({
      aiOverrides,
      generateStudySchedule,
      analyzeProgress: analyzeProgressWrapper,
      clearAiSchedule,
      aiScheduleApplied,
      aiLoading,
      aiError,
    }),
    [
      aiOverrides,
      generateStudySchedule,
      analyzeProgressWrapper,
      clearAiSchedule,
      aiScheduleApplied,
      aiLoading,
      aiError,
    ]
  );

  return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
};

export const useAiContext = (): AiContextValue => {
  const context = useContext(AiContext);
  if (!context) {
    throw new Error('useAiContext must be used within an AiProvider');
  }
  return context;
};
