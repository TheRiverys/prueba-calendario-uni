// Tipos principales de la aplicacion
export interface Delivery {
  id: number;
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
\nexport interface ImportedDelivery {\n  subject: string;\n  name: string;\n  dueDate: string;\n}\n