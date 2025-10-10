import type { StudySchedule } from '@/types';

export type DeliveryListView = 'list' | 'calendar' | 'gantt';
export type DeliveryListSortOption = 'algorithm' | 'subject' | 'date';

export interface DeliveryListProps {
  readonly schedule: StudySchedule[];
  readonly onEdit: (_deliveryItem: StudySchedule) => void;
  readonly onDelete: (_deliveryId: StudySchedule['id']) => void;
  readonly onToggleComplete: (_deliveryId: StudySchedule['id']) => void;
  readonly selectedSubject: string;
  readonly subjects: string[];
  readonly onSubjectChange: (_subject: string) => void;
  readonly sortBy: DeliveryListSortOption;
  readonly onSortChange: (_sortOption: DeliveryListSortOption) => void;
  readonly activeView: DeliveryListView;
  readonly onViewChange: (_viewOption: DeliveryListView) => void;
  readonly onAdd: () => void;
}

export interface DeliveryListActions {
  readonly onEdit: (_deliveryItem: StudySchedule) => void;
  readonly onDelete: (_deliveryId: StudySchedule['id']) => void;
  readonly onToggleComplete: (_deliveryId: StudySchedule['id']) => void;
  readonly onAdd: () => void;
}
