import { format, parseISO, startOfDay } from 'date-fns';

export const toNormalizedDate = (value: string | null | undefined): Date | null => {
  if (!value) {
    return null;
  }
  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return startOfDay(parsed);
};

export const toIso = (value: Date): string => format(value, 'yyyy-MM-dd');
