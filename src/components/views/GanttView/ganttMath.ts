import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';

import type { StudySchedule } from '@/types';

import type { DateRange, MonthSegment, TimelineRow, TimelineSubjectGroup } from './types';

export const DAY_WIDTH = 40;
const MIN_TIMELINE_DAYS = 30;

export const buildDateRange = (schedule: StudySchedule[], today: Date): DateRange => {
  if (schedule.length === 0) {
    const start = startOfMonth(subMonths(today, 1));
    const end = endOfMonth(addMonths(today, 3));
    return {
      start,
      end,
      days: eachDayOfInterval({ start, end }),
    } satisfies DateRange;
  }

  let earliestStartDate = schedule[0].startDate;
  let latestDueDate = parseISO(schedule[0].date);

  schedule.forEach(item => {
    if (item.startDate < earliestStartDate) {
      earliestStartDate = item.startDate;
    }
    const itemDueDate = parseISO(item.date);
    if (itemDueDate > latestDueDate) {
      latestDueDate = itemDueDate;
    }
  });

  const start = subDays(earliestStartDate, 0);
  const end = addDays(latestDueDate, 0);

  return {
    start,
    end,
    days: eachDayOfInterval({ start, end }),
  } satisfies DateRange;
};

export const buildSubjectGroups = (schedule: StudySchedule[]): TimelineSubjectGroup[] => {
  const groups: Record<string, TimelineSubjectGroup> = {};

  schedule.forEach(item => {
    if (!groups[item.subject]) {
      groups[item.subject] = {
        subject: item.subject,
        color: item.color,
        items: [],
      } satisfies TimelineSubjectGroup;
    }
    groups[item.subject].items.push(item);
  });

  return Object.values(groups);
};

export const buildRows = (groups: TimelineSubjectGroup[]): TimelineRow[] => {
  const rows: TimelineRow[] = [];

  groups.forEach(group => {
    rows.push({
      type: 'subject',
      key: `subject-${group.subject}`,
      subject: group.subject,
      color: group.color,
    });

    group.items.forEach(item => {
      rows.push({
        type: 'item',
        key: `item-${item.id}`,
        item,
        color: group.color,
      });
    });
  });

  return rows;
};

export const clampDateIndex = (days: Date[], date: Date): number => {
  if (days.length === 0) {
    return 0;
  }

  const index = days.findIndex(day => isSameDay(day, date));
  if (index !== -1) {
    return index;
  }

  if (date < days[0]) {
    return 0;
  }

  if (date > days[days.length - 1]) {
    return days.length - 1;
  }

  return 0;
};

export const calculateTimelineWidth = (dayCount: number): number => {
  const effectiveCount = dayCount === 0 ? MIN_TIMELINE_DAYS : dayCount;
  return Math.max(effectiveCount * DAY_WIDTH, MIN_TIMELINE_DAYS * DAY_WIDTH);
};

export const buildMonthSegments = (days: Date[]): MonthSegment[] => {
  if (days.length === 0) {
    return [];
  }

  const segments: MonthSegment[] = [];
  let currentLabel = format(days[0], 'MMMM yyyy', { locale: es });
  let startIndex = 0;

  days.forEach((day, index) => {
    const label = format(day, 'MMMM yyyy', { locale: es });
    if (label !== currentLabel) {
      segments.push({
        start: startIndex * DAY_WIDTH,
        width: (index - startIndex) * DAY_WIDTH,
        label: currentLabel,
      });
      currentLabel = label;
      startIndex = index;
    }

    if (index === days.length - 1) {
      segments.push({
        start: startIndex * DAY_WIDTH,
        width: (index - startIndex + 1) * DAY_WIDTH,
        label,
      });
    }
  });

  return segments;
};

export const calculateTodayPosition = (days: Date[], today: Date): number | null => {
  const index = days.findIndex(day => isSameDay(day, today));
  if (index < 0) {
    return null;
  }
  return index * DAY_WIDTH + DAY_WIDTH / 2;
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};
