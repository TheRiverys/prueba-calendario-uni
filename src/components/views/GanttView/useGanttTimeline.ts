import { useCallback, useMemo, useRef } from 'react';

import type { StudySchedule } from '@/types';

import {
  DAY_WIDTH,
  buildDateRange,
  buildMonthSegments,
  buildRows,
  buildSubjectGroups,
  calculateTimelineWidth,
  calculateTodayPosition,
  clampDateIndex,
  isWeekend,
} from './ganttMath';

import type { TimelineCalculations } from './types';

export const useGanttTimeline = (schedule: StudySchedule[]): TimelineCalculations => {
  const todayRef = useRef(new Date());
  const today = todayRef.current;

  const dateRange = useMemo(() => buildDateRange(schedule, today), [schedule, today]);

  const timelineWidth = useMemo(
    () => calculateTimelineWidth(dateRange.days.length),
    [dateRange.days.length]
  );

  const rows = useMemo(() => buildRows(buildSubjectGroups(schedule)), [schedule]);

  const monthSegments = useMemo(() => buildMonthSegments(dateRange.days), [dateRange.days]);

  const getClampedIndex = useCallback(
    (date: Date) => clampDateIndex(dateRange.days, date),
    [dateRange.days]
  );

  const getDayPosition = useCallback(
    (date: Date) => getClampedIndex(date) * DAY_WIDTH,
    [getClampedIndex]
  );

  const getDayCenter = useCallback(
    (date: Date) => getDayPosition(date) + DAY_WIDTH / 2,
    [getDayPosition]
  );

  const getPeriodWidth = useCallback(
    (startDate: Date, endDate: Date) => {
      const startIndex = getClampedIndex(startDate);
      const endIndex = getClampedIndex(endDate);
      return (Math.max(endIndex - startIndex, 0) + 1) * DAY_WIDTH;
    },
    [getClampedIndex]
  );

  const todayPosition = useMemo(
    () => calculateTodayPosition(dateRange.days, today),
    [dateRange.days, today]
  );

  return {
    dateRange,
    dayWidth: DAY_WIDTH,
    timelineWidth,
    rows,
    monthSegments,
    todayPosition,
    today,
    getDayPosition,
    getDayCenter,
    getPeriodWidth,
    isWeekend,
  };
};
