import React from 'react';

import { DeliveryListEmptyState } from './DeliveryListEmptyState';
import { DeliveryListHeader } from './DeliveryListHeader';
import { DeliveryMobileCards } from './DeliveryMobileCards';
import { DeliveryTable } from './DeliveryTable';

import type { DeliveryListProps } from './types';

const DeliveryList: React.FC<DeliveryListProps> = ({
  schedule,
  onEdit,
  onDelete,
  onToggleComplete,
  selectedSubject,
  subjects,
  onSubjectChange,
  sortBy,
  onSortChange,
  activeView,
  onViewChange,
  onAdd,
}) => {
  const hasItems = schedule.length > 0;

  return (
    <section className='w-full'>
      <DeliveryListHeader
        activeView={activeView}
        onViewChange={onViewChange}
        selectedSubject={selectedSubject}
        subjects={subjects}
        onSubjectChange={onSubjectChange}
        sortBy={sortBy}
        onSortChange={onSortChange}
      />

      <div className='pt-6'>
        {hasItems ? (
          <div className='space-y-6'>
            <DeliveryTable
              schedule={schedule}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
            />
            <DeliveryMobileCards
              schedule={schedule}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
            />
          </div>
        ) : (
          <DeliveryListEmptyState onAdd={onAdd} />
        )}
      </div>
    </section>
  );
};

export default DeliveryList;
