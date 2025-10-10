import { Check, Edit2, Trash2 } from 'lucide-react';
import React from 'react';

import type { StudySchedule } from '@/types';

interface CalendarDayProps {
  readonly day: Date;
  readonly deliveries: StudySchedule[];
  readonly studyPeriods: StudySchedule[];
  readonly isCurrentMonth: boolean;
  readonly isToday: boolean;
  readonly onEdit: (_delivery: StudySchedule) => void;
  readonly onDelete: (_id: StudySchedule['id']) => void;
  readonly onToggleComplete: (_id: StudySchedule['id']) => void;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  deliveries,
  studyPeriods,
  isCurrentMonth,
  isToday,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  const dayClass = [
    'border-border min-h-[100px] border p-2',
    !isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : 'bg-background',
    isToday ? 'bg-primary/10 ring-primary/30 ring-1' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const dateLabelClass = [
    'mb-1 text-sm font-medium',
    isToday
      ? 'bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full'
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={dayClass} data-testid={`calendar-day-${day.toISOString().slice(0, 10)}`}>
      <div className={dateLabelClass}>{day.getDate()}</div>

      {studyPeriods.length > 0 && (
        <div className='space-y-1'>
          {studyPeriods.map(period => (
            <div
              key={`period-${period.id}`}
              className='text-muted-foreground bg-muted/40 flex items-center gap-2 rounded px-2 py-1 text-xs'
            >
              <span className={`h-2 w-2 rounded-full ${period.color}`} />
              <span>
                {period.subject} - {period.name}
              </span>
              <span className='text-muted-foreground/70 text-[10px] tracking-wider uppercase'>
                Bloque de estudio
              </span>
            </div>
          ))}
        </div>
      )}

      <div className='space-y-1 pt-2'>
        {deliveries.map(delivery => (
          <div
            key={delivery.id}
            className={`border-border flex items-start justify-between rounded border px-2 py-1 text-xs ${
              delivery.completed ? 'bg-muted line-through opacity-70' : 'bg-card'
            }`}
          >
            <div className='flex flex-col gap-1'>
              <span className='text-foreground font-medium'>{delivery.subject}</span>
              <span className='text-muted-foreground'>{delivery.name}</span>
            </div>
            <div className='flex items-center gap-1'>
              <button
                type='button'
                onClick={event => {
                  event.stopPropagation();
                  onToggleComplete(delivery.id);
                }}
                className='flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white hover:bg-green-600'
                title={delivery.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                aria-label={delivery.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
              >
                <Check className='h-3 w-3' />
              </button>
              <button
                type='button'
                onClick={event => {
                  event.stopPropagation();
                  onEdit(delivery);
                }}
                className='bg-chart-2 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white hover:opacity-80'
                title='Editar entrega'
                aria-label='Editar entrega'
              >
                <Edit2 className='h-3 w-3' />
              </button>
              <button
                type='button'
                onClick={event => {
                  event.stopPropagation();
                  onDelete(delivery.id);
                }}
                className='bg-destructive text-destructive-foreground flex h-5 w-5 items-center justify-center rounded-full text-xs hover:opacity-80'
                title='Eliminar entrega'
                aria-label='Eliminar entrega'
              >
                <Trash2 className='h-3 w-3' />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
