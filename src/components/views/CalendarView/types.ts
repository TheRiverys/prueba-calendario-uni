import type { StudySchedule } from '@/types';

export interface CalendarViewProps {
  readonly schedule: StudySchedule[];
  readonly onEdit: (_delivery: StudySchedule) => void;
  readonly onDelete: (_id: StudySchedule['id']) => void;
  readonly onToggleComplete: (_id: StudySchedule['id']) => void;
  readonly selectedSubject?: string;
  readonly subjects?: string[];
  readonly onSubjectChange?: (_subject: string) => void;
}

export interface CalendarDayData {
  readonly date: Date;
  readonly deliveries: StudySchedule[];
  readonly studyPeriods: StudySchedule[];
  readonly isCurrentMonth: boolean;
  readonly isToday: boolean;
}

export interface CalendarMetadata {
  readonly currentMonth: Date;
  readonly weekDayLabels: string[];
  readonly weeks: CalendarDayData[][];
}
