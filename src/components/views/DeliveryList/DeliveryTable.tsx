import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, Calendar, Check, Clock, Edit2, Plus, Trash2 } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { StudySchedule } from '@/types';

import { calculateProgress, describeDueDate, resolveProgressColor } from './deliveryListUtils';
import { DeliveryStatusBadge } from './DeliveryStatusBadge';

import type { DeliveryListActions } from './types';

interface DeliveryTableProps extends DeliveryListActions {
  readonly schedule: StudySchedule[];
}

export const DeliveryTable: React.FC<DeliveryTableProps> = ({
  schedule,
  onAdd,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  return (
    <div className='hidden overflow-hidden 2xl:block'>
      <table className='w-full text-sm'>
        <thead className='bg-muted/60 text-muted-foreground text-xs tracking-wide uppercase'>
          <tr>
            <th className='px-5 py-3 text-left font-semibold'>Entrega</th>
            <th className='px-5 py-3 text-left font-semibold'>Fecha límite</th>
            <th className='px-5 py-3 text-left font-semibold'>Periodo asignado</th>
            <th className='px-5 py-3 text-left font-semibold'>Progreso</th>
            <th className='px-5 py-3 text-right font-semibold'>
              <div className='flex items-center justify-end gap-2'>
                Acciones
                <Button
                  size='sm'
                  onClick={onAdd}
                  className='h-8 w-8 p-0'
                  title='Añadir nueva entrega'
                >
                  <Plus className='h-4 w-4' />
                </Button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className='divide-border/70 divide-y'>
          {schedule.map(item => {
            const progressValue = calculateProgress(item);
            const progressColor = resolveProgressColor(progressValue, item.completed);
            const dueDescription = describeDueDate(item.date);

            return (
              <tr key={item.id} className={item.completed ? 'bg-muted/20 opacity-80' : 'bg-card'}>
                <td className='px-5 py-4 align-top'>
                  <div className='flex items-start gap-3'>
                    <div className={`h-12 w-2.5 rounded-full ${item.color}`} />
                    <div className='min-w-0 space-y-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span
                          className={`text-foreground truncate font-semibold ${item.completed ? 'text-muted-foreground line-through' : ''}`}
                        >
                          {item.subject} - {item.name}
                        </span>
                        <span className='text-muted-foreground bg-muted/40 rounded px-2 py-0.5 text-xs tracking-wide uppercase'>
                          {item.priority === 'high'
                            ? 'Alta'
                            : item.priority === 'normal'
                              ? 'Normal'
                              : 'Baja'}
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
                </td>
                <td className='text-muted-foreground px-5 py-4 align-top text-sm'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-3.5 w-3.5' />
                    <span>{format(parseISO(item.date), "d 'de' MMM yyyy", { locale: es })}</span>
                  </div>
                </td>
                <td className='text-muted-foreground space-y-1 px-5 py-4 align-top text-sm'>
                  <div className='flex items-center gap-2'>
                    <span className='text-foreground font-medium'>Inicio:</span>
                    <span>{format(item.startDate, "d 'de' MMM", { locale: es })}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-foreground font-medium'>Fin:</span>
                    <span>{format(item.endDate, "d 'de' MMM", { locale: es })}</span>
                  </div>
                </td>
                <td className='px-5 py-4 align-top'>
                  <div className='space-y-2'>
                    <div className='bg-secondary relative h-2 w-full overflow-hidden rounded-full'>
                      <div
                        className='h-full transition-all duration-500 ease-out'
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
                            : progressValue >= 100
                              ? 'Lista para entregar'
                              : `${Math.round(progressValue)}% completado`}
                      </span>
                      {item.warning && (
                        <Badge variant='outline' className='text-chart-3 border-chart-3'>
                          <AlertTriangle className='mr-1 h-3 w-3' /> Poco tiempo
                        </Badge>
                      )}
                    </div>
                  </div>
                </td>
                <td className='px-5 py-4 align-top'>
                  <div className='flex items-center justify-end gap-2 pt-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onToggleComplete(item.id)}
                      className={
                        item.completed
                          ? 'text-green-600 hover:bg-green-100'
                          : 'text-green-700 hover:bg-green-50'
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
