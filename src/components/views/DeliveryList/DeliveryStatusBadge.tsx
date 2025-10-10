import { differenceInDays, parseISO, isBefore } from 'date-fns';
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  XCircle,
  Circle,
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';

interface DeliveryStatusBadgeProps {
  readonly date: string;
  readonly completed: boolean;
}

export const DeliveryStatusBadge: React.FC<DeliveryStatusBadgeProps> = ({ date, completed }) => {
  const today = new Date();
  const dueDate = parseISO(date);

  if (completed) {
    return (
      <Badge variant='secondary' className='bg-green-100 text-xs text-green-800 hover:bg-green-100'>
        <CheckCircle className='mr-1 h-3 w-3' />
        Completada
      </Badge>
    );
  }

  // Comparar solo fechas (sin horas) para determinar si está vencida
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

  if (isBefore(dueDateOnly, todayDateOnly)) {
    return (
      <Badge variant='destructive' className='flex items-center'>
        <XCircle className='mr-1 h-3 w-3' />
        Vencida
      </Badge>
    );
  }

  const daysUntil = differenceInDays(dueDateOnly, todayDateOnly);
  const currentDayOfWeek = today.getDay();
  const daysUntilEndOfWeek = 6 - currentDayOfWeek;

  if (daysUntil === 1) {
    return (
      <Badge
        variant='secondary'
        className='flex items-center bg-red-100 text-red-800 hover:bg-red-100'
      >
        <AlertTriangle className='mr-1 h-3 w-3' />
        Mañana
      </Badge>
    );
  }

  if (daysUntil === 0) {
    return (
      <Badge variant='destructive' className='flex items-center'>
        <Clock className='mr-1 h-3 w-3' />
        Hoy
      </Badge>
    );
  }

  if (daysUntil <= daysUntilEndOfWeek) {
    return (
      <Badge
        variant='secondary'
        className='flex items-center bg-orange-100 text-orange-800 hover:bg-orange-100'
      >
        <Clock className='mr-1 h-3 w-3' />
        Esta semana
      </Badge>
    );
  }

  const nextWeekStart = daysUntilEndOfWeek + 1;
  const nextWeekEnd = nextWeekStart + 6;

  if (daysUntil <= nextWeekEnd) {
    return (
      <Badge
        variant='secondary'
        className='flex items-center bg-blue-100 text-blue-800 hover:bg-blue-100'
      >
        <Clock className='mr-1 h-3 w-3' />
        Próxima semana
      </Badge>
    );
  }

  if (daysUntil <= 30) {
    return (
      <Badge
        variant='secondary'
        className='flex items-center bg-indigo-100 text-indigo-800 hover:bg-indigo-100'
      >
        <CalendarIcon className='mr-1 h-3 w-3' />
        Este mes
      </Badge>
    );
  }

  return (
    <Badge
      variant='secondary'
      className='flex items-center bg-slate-100 text-slate-700 hover:bg-slate-100'
    >
      <Circle className='mr-1 h-3 w-3' />
      Pendiente
    </Badge>
  );
};
