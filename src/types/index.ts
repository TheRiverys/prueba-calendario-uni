// Tipos principales de la aplicación
export interface Delivery {
  id: string;
  subject: string;
  name: string;
  date: string;
  studyStart?: string;
  color: string;
  completed: boolean;
  priority: 'low' | 'normal' | 'high';
}

export interface StudySchedule extends Delivery {
  startDate: Date;
  endDate: Date;
  studyDays: number;
  warning: boolean;
  minimumRequired: number;
  allocatedDays: number;
}

export interface FormData {
  subject: string;
  name: string;
  date: string;
  studyStart: string;
  priority: 'low' | 'normal' | 'high';
}

export interface Priority {
  value: 'low' | 'normal' | 'high';
  label: string;
  color: string;
}

export interface PriorityVariations {
  high: number;
  normal: number;
  low: number;
}

export interface ConfigSettings {
  baseStudyDays: number;
  minStudyTime: number;
  priorityVariations: PriorityVariations;
  openaiApiKey: string;
}

export interface UserConfigRow {
  id: string;
  user_id: string;
  min_study_time: number | null;
  base_study_days: number | null;
  priority_variations: PriorityVariations | null;
  created_at: string;
  updated_at: string;
}

export interface SemesterStartRow {
  id: string;
  user_id: string;
  semester_start: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryRow {
  id: string;
  user_id: string;
  subject: string;
  name: string;
  date: string;
  priority: 'low' | 'normal' | 'high';
  color: string | null;
  completed: boolean;
  study_start: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiScheduleOverride {
  startDate: string;
  endDate: string;
}

export interface AiDetailedEntry {
  date: string;
  hours: number;
  subject: string;
  task: string;
}

export interface AiScheduleResult {
  entries: AiDetailedEntry[];
  applied: boolean;
}

export interface AppState {
  activeView: 'list' | 'calendar' | 'gantt';
  selectedSubject: string;
  modalOpen: boolean;
  editingDelivery: Delivery | null;
  formData: FormData;
  deliveries: Delivery[];
}

export interface StudyStats {
  total: number;
  upcoming: number;
  overdue: number;
  thisWeek: number;
}

export interface ImportedDelivery {
  subject: string;
  name: string;
  dueDate: string;
}
