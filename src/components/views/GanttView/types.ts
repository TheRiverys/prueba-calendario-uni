import type { StudySchedule } from '@/types';

export interface GanttViewProps {
  readonly schedule: StudySchedule[];
}

export interface DateRange {
  readonly start: Date;
  readonly end: Date;
  readonly days: Date[];
}

export interface TimelineSubjectGroup {
  readonly subject: string;
  readonly color: string;
  readonly items: StudySchedule[];
}

export type TimelineRow =
  | {
      readonly type: 'subject';
      readonly key: string;
      readonly subject: string;
      readonly color: string;
    }
  | {
      readonly type: 'item';
      readonly key: string;
      readonly item: StudySchedule;
      readonly color: string;
    };

export interface MonthSegment {
  readonly start: number;
  readonly width: number;
  readonly label: string;
}

export interface TimelineCalculations {
  readonly dateRange: DateRange;
  readonly dayWidth: number;
  readonly timelineWidth: number;
  readonly rows: TimelineRow[];
  readonly monthSegments: MonthSegment[];
  readonly todayPosition: number | null;
  readonly today: Date;
  readonly getDayPosition: (_date: Date) => number;
  readonly getDayCenter: (_date: Date) => number;
  readonly getPeriodWidth: (_startDate: Date, _endDate: Date) => number;
  readonly isWeekend: (_date: Date) => boolean;
}
