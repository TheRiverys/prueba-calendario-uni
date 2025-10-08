import { differenceInCalendarDays, differenceInDays, parseISO } from 'date-fns';

import type { StudySchedule } from '@/types';

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

export const calculateProgress = (item: StudySchedule, now: Date = new Date()): number => {
  if (item.completed) {
    return 100;
  }

  const dueDate = parseISO(item.date);
  if (Number.isNaN(dueDate.getTime())) {
    return 0;
  }

  if (now >= dueDate) {
    return 0;
  }

  if (now < item.startDate) {
    return 0;
  }

  const totalTimeSpan = differenceInCalendarDays(dueDate, item.startDate);
  const elapsedTime = differenceInCalendarDays(now, item.startDate);

  if (totalTimeSpan <= 0) {
    return now >= item.startDate ? 100 : 0;
  }

  return clamp((elapsedTime / totalTimeSpan) * 100, 0, 100);
};

export const resolveProgressColor = (progressValue: number, completed: boolean): string => {
  if (completed) {
    return '#22c55e';
  }

  if (progressValue <= 33) {
    return '#22c55e';
  }

  if (progressValue <= 66) {
    return '#eab308';
  }

  return '#ef4444';
};

export const describeDueDate = (date: string, now: Date = new Date()): string => {
  const dueDate = parseISO(date);
  if (Number.isNaN(dueDate.getTime())) {
    return '';
  }

  const days = differenceInDays(dueDate, now);
  if (days < 0) {
    const absolute = Math.abs(days);
    return `Hace ${absolute} día${absolute !== 1 ? 's' : ''}`;
  }
  if (days === 0 || days === 1) {
    return '';
  }
  if (days === 2) {
    return 'Pasado mañana';
  }
  return `En ${days} días`;
};
