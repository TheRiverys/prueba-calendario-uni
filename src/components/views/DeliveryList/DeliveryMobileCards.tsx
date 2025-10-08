import { AlertTriangle, Clock, Check, Edit2, Trash2 } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { StudySchedule } from '@/types';

import { calculateProgress, describeDueDate, resolveProgressColor } from './deliveryListUtils';
import { DeliveryStatusBadge } from './DeliveryStatusBadge';

interface DeliveryMobileCardsProps {
  readonly schedule: StudySchedule[];
  readonly onEdit: (_delivery: StudySchedule) => void;
  readonly onDelete: (_id: StudySchedule['id']) => void;
  readonly onToggleComplete: (_id: StudySchedule['id']) => void;
}

interface DeliveryCardProps {
  readonly item: StudySchedule;
  readonly onEdit: (_delivery: StudySchedule) => void;
  readonly onDelete: (_id: StudySchedule['id']) => void;
  readonly onToggleComplete: (_id: StudySchedule['id']) => void;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({
  item,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  const progressValue = calculateProgress(item);
  const progressColor = resolveProgressColor(progressValue, item.completed);
  const dueDescription = describeDueDate(item.date);

  return (
    <div className={`space-y-4 p-4 ${item.completed ? 'opacity-80' : ''}`}>
      <div className='flex items-start gap-3'>
        <div className={`h-12 w-2 rounded-full ${item.color}`} />
        <div className='min-w-0 space-y-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <h3
              className={`text-foreground truncate font-semibold ${item.completed ? 'text-muted-foreground line-through' : ''}`}
            >
              {item.subject} - {item.name}
            </h3>
            <span className='text-muted-foreground bg-muted/40 rounded px-2 py-0.5 text-xs tracking-wide uppercase'>
              {item.priority === 'high' ? 'Alta' : item.priority === 'normal' ? 'Normal' : 'Baja'}
            </span>
          </div>
          <div className='text-muted-foreground flex flex-wrap items-center gap-2 text-xs'>
            <DeliveryStatusBadge date={item.date} completed={item.completed} />
            {dueDescription && (
              <span className='flex items-center gap-1'>
                <Clock className='h-3 w-3' />
                {dueDescription}
              </span>
            )}
          </div>
        </div>
      </div>

      <DeliveryProgress item={item} progressValue={progressValue} progressColor={progressColor} />

      <DeliveryActions
        item={item}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleComplete={onToggleComplete}
      />
    </div>
  );
};

interface DeliveryProgressProps {
  readonly item: StudySchedule;
  readonly progressValue: number;
  readonly progressColor: string;
}

const DeliveryProgress: React.FC<DeliveryProgressProps> = ({
  item,
  progressValue,
  progressColor,
}) => (
  <div className='space-y-2'>
    <div className='bg-secondary relative h-2 w-full overflow-hidden rounded-full'>
      <div
        className='h-full w-full flex-1 transition-all duration-300 ease-in-out'
        style={{ backgroundColor: progressColor, width: `${progressValue}%` }}
      />
    </div>
    <div className='text-muted-foreground flex items-center gap-2 text-xs'>
      <Check className='h-3 w-3' />
      <span>
        {item.completed
          ? 'Completada'
          : progressValue === 0
            ? 'Sin comenzar'
            : progressValue === 100
              ? 'Completada'
              : `${Math.round(progressValue)}%`}
      </span>
      {item.warning && (
        <Badge variant='outline' className='text-chart-3 border-chart-3'>
          <AlertTriangle className='mr-1 h-3 w-3' /> Poco tiempo
        </Badge>
      )}
    </div>
  </div>
);

interface DeliveryActionsProps {
  readonly item: StudySchedule;
  readonly onEdit: (_delivery: StudySchedule) => void;
  readonly onDelete: (_id: StudySchedule['id']) => void;
  readonly onToggleComplete: (_id: StudySchedule['id']) => void;
}

const DeliveryActions: React.FC<DeliveryActionsProps> = ({
  item,
  onEdit,
  onDelete,
  onToggleComplete,
}) => (
  <div className='flex items-center justify-end gap-2'>
    <Button
      variant='ghost'
      size='sm'
      onClick={() => onToggleComplete(item.id)}
      className={
        item.completed ? 'text-green-600 hover:bg-green-100' : 'text-green-700 hover:bg-green-50'
      }
      title={item.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
    >
      <Check className='h-4 w-4' />
    </Button>
    <Button
      variant='ghost'
      size='sm'
      onClick={() => onEdit(item)}
      className='text-blue-600 hover:bg-blue-50'
      title='Editar entrega'
    >
      <Edit2 className='h-4 w-4' />
    </Button>
    <Button
      variant='ghost'
      size='sm'
      onClick={() => onDelete(item.id)}
      className='text-destructive hover:bg-destructive/10'
      title='Eliminar entrega'
    >
      <Trash2 className='h-4 w-4' />
    </Button>
  </div>
);

export const DeliveryMobileCards: React.FC<DeliveryMobileCardsProps> = ({
  schedule,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  return (
    <div className='divide-border/70 divide-y 2xl:hidden'>
      {schedule.map(item => (
        <DeliveryCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
        />
      ))}
    </div>
  );
};
