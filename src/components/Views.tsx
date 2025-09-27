
import React, { Suspense, lazy } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { StudySchedule } from '../types';

const DeliveryList = lazy(() => import('./DeliveryList.tsx'));
const CalendarView = lazy(() => import('./CalendarView.tsx'));
const GanttView = lazy(() => import('./GanttView.tsx'));

interface ViewsProps {
  activeView: 'list' | 'calendar' | 'gantt';
  schedule: StudySchedule[];
}

const LoadingFallback: React.FC = () => (
  <div className="flex justify-center items-center h-64 text-sm text-muted-foreground">
    Cargando…
  </div>
);

export const Views: React.FC<ViewsProps> = ({ activeView, schedule }) => {
  const { openModal, deleteDelivery, toggleCompleted } = useAppContext();

  const renderListView = () => (
    <Suspense fallback={<LoadingFallback />}>
      <DeliveryList
        schedule={schedule}
        onEdit={openModal}
        onDelete={deleteDelivery}
        onToggleComplete={toggleCompleted}
      />
    </Suspense>
  );

  const renderCalendarView = () => (
    <Suspense fallback={<LoadingFallback />}>
      <CalendarView
        schedule={schedule}
        onEdit={openModal}
        onDelete={deleteDelivery}
        onToggleComplete={toggleCompleted}
      />
    </Suspense>
  );

  const renderGanttView = () => (
    <Suspense fallback={<LoadingFallback />}>
      <GanttView schedule={schedule} />
    </Suspense>
  );

  const renderActiveView = () => {
    switch (activeView) {
      case 'list':
        return renderListView();
      case 'calendar':
        return (
          <div className="bg-card border rounded-lg shadow-sm">
            {renderCalendarView()}
          </div>
        );
      case 'gantt':
        return (
          <div className="bg-card border rounded-lg shadow-sm">
            {renderGanttView()}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 mt-6 pb-10 mx-auto max-w-[1800px]">
      {renderActiveView()}
    </div>
  );
};
