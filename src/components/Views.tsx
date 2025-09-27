import React, { Suspense, lazy } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { StudySchedule } from '../types';

// Lazy load components para code-splitting
const DeliveryList = lazy(() => import('./DeliveryList.tsx'));
const CalendarView = lazy(() => import('./CalendarView.tsx'));
const GanttView = lazy(() => import('./GanttView.tsx'));

interface ViewsProps {
  activeView: 'list' | 'calendar' | 'gantt';
  schedule: StudySchedule[];
}

export const Views: React.FC<ViewsProps> = ({ activeView, schedule }) => {
  const { openModal, deleteDelivery, toggleCompleted } = useAppContext();
  const renderView = () => {
    switch (activeView) {
      case 'list':
        return (
          <Suspense fallback={<div className="flex justify-center items-center h-64">Cargando...</div>}>
            <DeliveryList
              schedule={schedule}
              onEdit={openModal}
              onDelete={deleteDelivery}
              onToggleComplete={toggleCompleted}
            />
          </Suspense>
        );
      case 'calendar':
        return (
          <Suspense fallback={<div className="flex justify-center items-center h-64">Cargando...</div>}>
            <CalendarView
              schedule={schedule}
              onEdit={openModal}
              onDelete={deleteDelivery}
              onToggleComplete={toggleCompleted}
            />
          </Suspense>
        );
      case 'gantt':
        return (
          <Suspense fallback={<div className="flex justify-center items-center h-64">Cargando...</div>}>
            <GanttView schedule={schedule} />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-8">
      <div className="bg-card border rounded-lg p-6">
        {renderView()}
      </div>
    </div>
  );
};
