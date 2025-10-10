import { Calendar } from 'lucide-react';
import React from 'react';

import { AIControls } from '@/components/AIControls';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { DeliveryListSortOption, DeliveryListView } from './types';

interface DeliveryListHeaderProps {
  readonly activeView: DeliveryListView;
  readonly onViewChange: (_view: DeliveryListView) => void;
  readonly selectedSubject: string;
  readonly subjects: string[];
  readonly onSubjectChange: (_subject: string) => void;
  readonly sortBy: DeliveryListSortOption;
  readonly onSortChange: (_option: DeliveryListSortOption) => void;
}

export const DeliveryListHeader: React.FC<DeliveryListHeaderProps> = ({
  activeView,
  onViewChange,
  selectedSubject,
  subjects,
  onSubjectChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className='border-border/60 flex flex-col gap-6 border-b pb-5 sm:gap-4'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <h2 className='text-foreground flex items-center gap-2 text-xl font-semibold'>
          <Calendar className='h-5 w-5' />
          Entregas
        </h2>

        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4'>
          <div className='flex flex-wrap items-center gap-3 sm:gap-4'>
            <HeaderSelect
              label='Vista'
              value={activeView}
              options={[
                { label: 'Lista', value: 'list' },
                { label: 'Calendario', value: 'calendar' },
                { label: 'Gantt', value: 'gantt' },
              ]}
              onValueChange={value => onViewChange(value as DeliveryListView)}
              triggerWidth='w-[110px] sm:w-[130px] lg:w-[150px]'
            />

            <HeaderSelect
              label='Materia'
              value={selectedSubject}
              options={[
                { label: 'Todas las materias', value: 'all' },
                ...subjects.map(subject => ({ label: subject, value: subject })),
              ]}
              onValueChange={value => onSubjectChange(value)}
              triggerWidth='w-[130px] sm:w-[150px] lg:w-[170px]'
            />

            <HeaderSelect
              label='Ordenar'
              value={sortBy}
              options={[
                { label: 'Algoritmo', value: 'algorithm' },
                { label: 'Materia', value: 'subject' },
                { label: 'Fecha de entrega', value: 'date' },
              ]}
              onValueChange={value => onSortChange(value as DeliveryListSortOption)}
              triggerWidth='w-[130px] sm:w-[150px] lg:w-[170px]'
            />

            <div className='flex items-center'>
              <AIControls />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface HeaderSelectProps {
  readonly label: string;
  readonly value: string;
  readonly options: Array<{ label: string; value: string }>;
  readonly onValueChange: (_value: string) => void;
  readonly triggerWidth: string;
}

const HeaderSelect: React.FC<HeaderSelectProps> = ({
  label,
  value,
  options,
  onValueChange,
  triggerWidth,
}) => {
  return (
    <div className='flex min-w-0 items-center gap-2'>
      <span className='text-muted-foreground hidden text-xs tracking-wide whitespace-nowrap uppercase lg:inline'>
        {label}
      </span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={triggerWidth}>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
