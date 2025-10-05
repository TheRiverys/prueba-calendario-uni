import { useEffect, useState } from 'react';

import { toast } from '@/components/ui/sonner';

const SEMESTER_START_STORAGE_KEY = 'semester-start-date';

const getTodayIso = (): string => {
  return new Date().toISOString().split('T')[0];
};

const sanitizeIsoDate = (value: string | null | undefined): string => {
  if (!value) {
    return getTodayIso();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? getTodayIso() : value;
};

export const useSemesterStart = () => {
  const [semesterStart, setSemesterStart] = useState<string>(() => {
    if (typeof window === 'undefined') {
      return getTodayIso();
    }
    try {
      const stored = window.localStorage.getItem(SEMESTER_START_STORAGE_KEY);
      return sanitizeIsoDate(stored);
    } catch (error) {
      toast.error('No se pudo leer la fecha de inicio de semestre almacenada', {
        description: error instanceof Error ? error.message : String(error),
      });
      return getTodayIso();
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(SEMESTER_START_STORAGE_KEY, semesterStart);
    } catch (error) {
      toast.error('No se pudo persistir la fecha de inicio de semestre', {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  }, [semesterStart]);

  return { semesterStart, setSemesterStart } as const;
};
