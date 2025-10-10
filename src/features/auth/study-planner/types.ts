import type { ConfigSettings, Delivery } from '@/types';

export type Priority = Delivery['priority'];

export interface PlannedDelivery {
  delivery: Delivery;
  dueDate: Date;
  minDays: number;
}

export interface SequentialDurationsResult {
  durations: number[];
  warnings: boolean[];
  desiredExtras: number[];
  achievedExtras: number[];
}

export interface StudyScheduleBuilderParams {
  deliveries: Delivery[];
  semesterStartIso: string;
  config?: ConfigSettings;
  newDateStartIso?: string;
}
