import { useMemo } from 'react';
import { parseISO, isAfter, isBefore, addDays } from 'date-fns';
import type { StudySchedule, StudyStats } from '../types';

export const useStats = (schedule: StudySchedule[]): StudyStats => {
  return useMemo(() => {
    const today = new Date();
    const upcoming = schedule.filter((d) => isAfter(parseISO(d.date), today));
    const overdue = schedule.filter((d) => isBefore(parseISO(d.date), today));
    const thisWeek = schedule.filter((d) => {
      const dueDate = parseISO(d.date);
      const weekFromNow = addDays(today, 7);
      return isAfter(dueDate, today) && isBefore(dueDate, weekFromNow);
    });

    return {
      total: schedule.length,
      upcoming: upcoming.length,
      overdue: overdue.length,
      thisWeek: thisWeek.length,
    };
  }, [schedule]);
};
