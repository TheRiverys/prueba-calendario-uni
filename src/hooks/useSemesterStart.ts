import { useEffect, useState } from "react";
import { SEMESTER_START_STORAGE_KEY } from "../constants/dates";

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
    if (typeof window === "undefined") {
      return getTodayIso();
    }
    try {
      const stored = window.localStorage.getItem(SEMESTER_START_STORAGE_KEY);
      return sanitizeIsoDate(stored);
    } catch (error) {
      console.warn("No se pudo leer la fecha de inicio de semestre almacenada", error);
      return getTodayIso();
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(SEMESTER_START_STORAGE_KEY, semesterStart);
    } catch (error) {
      console.warn("No se pudo persistir la fecha de inicio de semestre", error);
    }
  }, [semesterStart]);

  return { semesterStart, setSemesterStart } as const;
};
