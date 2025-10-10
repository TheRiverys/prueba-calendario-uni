import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';

import type { StudySchedule } from '@/types';

import type { CalendarDayData, CalendarMetadata } from './types';

export const buildCalendarMetadata = (currentMonth: Date): CalendarMetadata => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const weekDayLabels = Array.from({ length: 7 }, (_, index) =>
    format(addDays(startDate, index), 'EEEEEE', { locale: es })
  );

  const weeks: CalendarDayData[][] = [];
  let currentDay = startDate;

  while (currentDay <= endDate) {
    const week: CalendarDayData[] = [];
    for (let index = 0; index < 7; index += 1) {
      const date = addDays(currentDay, index);
      week.push({
        date,
        deliveries: [],
        studyPeriods: [],
        isCurrentMonth: isSameMonth(date, monthStart),
        isToday: isSameDay(date, new Date()),
      });
    }
    weeks.push(week);
    currentDay = addDays(currentDay, 7);
  }

  return {
    currentMonth,
    weekDayLabels,
    weeks,
  };
};

export const populateCalendarDays = (
  metadata: CalendarMetadata,
  schedule: StudySchedule[],
  selectedSubject: string
): CalendarMetadata => {
  const weeks = metadata.weeks.map(week =>
    week.map(day => {
      const deliveries = schedule.filter(
        item =>
          isSameDay(parseISO(item.date), day.date) &&
          (selectedSubject === 'all' || item.subject === selectedSubject)
      );

      const studyPeriods = schedule.filter(item =>
        isWithinInterval(day.date, { start: item.startDate, end: item.endDate })
      );

      return {
        ...day,
        deliveries,
        studyPeriods,
      };
    })
  );

  return {
    ...metadata,
    weeks,
  };
};

export const goToNextMonth = (current: Date): Date => addMonths(current, 1);
export const goToPreviousMonth = (current: Date): Date => subMonths(current, 1);
