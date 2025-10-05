import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
  isWithinInterval,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Check, Trash2, Edit2, Filter } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { StudySchedule } from '@/types';
import { buildColorLegend } from '@/utils';

interface CalendarViewProps {
  readonly schedule: StudySchedule[];
  readonly onEdit: (_delivery: StudySchedule) => void;
  readonly onDelete: (_id: StudySchedule['id']) => void;
  readonly onToggleComplete: (_id: StudySchedule['id']) => void;
  readonly selectedSubject?: string;
  readonly subjects?: string[];
  readonly onSubjectChange?: (_subject: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  schedule,
  onEdit,
  onDelete,
  onToggleComplete,
  selectedSubject = 'all',
  subjects = [],
  onSubjectChange = () => {},
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const legendItems = useMemo(() => {
    const filteredSchedule =
      selectedSubject === 'all'
        ? schedule
        : schedule.filter(item => item.subject === selectedSubject);
    return buildColorLegend(filteredSchedule);
  }, [schedule, selectedSubject]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const nextMonth = (): void => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = (): void => setCurrentMonth(subMonths(currentMonth, 1));

  const getDeliveriesForDay = (day: Date): StudySchedule[] => {
    return schedule.filter(
      item =>
        isSameDay(parseISO(item.date), day) &&
        (selectedSubject === 'all' || item.subject === selectedSubject)
    );
  };

  const getStudyPeriodsForDay = (day: Date): StudySchedule[] => {
    return schedule.filter(item =>
      isWithinInterval(day, { start: item.startDate, end: item.endDate })
    );
  };

  const renderDays = (): React.JSX.Element[] => {
    const dateFormat = 'EEEEEE';
    const days: React.JSX.Element[] = [];
    const startDateCopy = startDate;

    for (let i = 0; i < 7; i++) {
      days.push(
        <div
          key={i}
          className='text-muted-foreground py-2 text-center text-xs font-medium tracking-wider uppercase'
        >
          {format(addDays(startDateCopy, i), dateFormat, { locale: es })}
        </div>
      );
    }

    return days;
  };

  const renderCells = (): React.JSX.Element[] => {
    const rows: React.JSX.Element[] = [];
    let days: React.JSX.Element[] = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = day;
        const deliveriesForDay = getDeliveriesForDay(cloneDay);
        const studyPeriodsForDay = getStudyPeriodsForDay(cloneDay);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            key={day.getTime()}
            className={`border-border min-h-[100px] border p-2 ${
              !isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : 'bg-background'
            } ${isToday ? 'bg-primary/10 ring-primary/30 ring-1' : ''}`}
          >
            <div
              className={`mb-1 text-sm font-medium ${
                isToday
                  ? 'bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full'
                  : ''
              }`}
            >
              {formattedDate}
            </div>

            {studyPeriodsForDay.length > 0 && (
              <div className='mb-2'>
                <div className='text-muted-foreground mb-1 text-xs'>Períodos de estudio:</div>
                {studyPeriodsForDay.map((period, idx) => (
                  <div
                    key={`study-${period.id}-${idx}`}
                    className={`h-2 ${period.color} mb-1 rounded-sm border border-white/20 opacity-40`}
                    title={`${period.subject} - ${period.name}: ${format(period.startDate, 'd/M', { locale: es })} - ${format(period.endDate, 'd/M', { locale: es })}`}
                  />
                ))}
              </div>
            )}

            <div className='space-y-1'>
              {deliveriesForDay.map(delivery => (
                <div
                  key={delivery.id}
                  className={`rounded p-1 text-xs ${delivery.color} ${
                    delivery.completed ? 'opacity-60' : 'text-white'
                  } group relative cursor-pointer truncate transition-opacity hover:opacity-90`}
                  title={`${delivery.subject} - ${delivery.name}${delivery.completed ? ' (Completada)' : ''}`}
                >
                  <div className='flex items-center truncate font-medium'>
                    {delivery.completed && <Check className='mr-1 h-3 w-3' />}
                    {delivery.name}
                  </div>
                  <div className='truncate opacity-90'>{delivery.subject}</div>

                  <div className='absolute top-0 right-0 flex space-x-1 opacity-0 transition-opacity group-hover:opacity-100'>
                    <button
                      type='button'
                      onClick={e => {
                        e.stopPropagation();
                        onToggleComplete(delivery.id);
                      }}
                      className='bg-chart-1 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white hover:opacity-80'
                      title={
                        delivery.completed ? 'Marcar como pendiente' : 'Marcar como completada'
                      }
                      aria-label={
                        delivery.completed ? 'Marcar como pendiente' : 'Marcar como completada'
                      }
                    >
                      <Check className='h-3 w-3' />
                    </button>
                    <button
                      type='button'
                      onClick={e => {
                        e.stopPropagation();
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
                      onClick={e => {
                        e.stopPropagation();
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
        day = addDays(day, 1);
      }
      rows.push(
        <div className='grid grid-cols-7' key={day.getTime()}>
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center justify-center gap-2'>
            <button
              type='button'
              onClick={prevMonth}
              className='hover:bg-muted flex h-10 w-10 items-center justify-center rounded-lg transition-colors'
              aria-label='Mes anterior'
            >
              <ChevronLeft className='h-5 w-5' />
            </button>
            <div className='bg-muted/50 rounded-lg px-4 py-2'>
              <h3 className='text-foreground min-w-[200px] text-center text-lg font-semibold'>
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </h3>
            </div>
            <button
              type='button'
              onClick={nextMonth}
              className='hover:bg-muted flex h-10 w-10 items-center justify-center rounded-lg transition-colors'
              aria-label='Mes siguiente'
            >
              <ChevronRight className='h-5 w-5' />
            </button>
          </div>

          <div className='flex items-center gap-3'>
            {subjects.length > 0 && (
              <div className='flex items-center gap-2'>
                <Filter className='text-muted-foreground h-4 w-4' />
                <Select value={selectedSubject} onValueChange={onSubjectChange}>
                  <SelectTrigger className='w-[140px]'>
                    <SelectValue placeholder='Todas' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todas</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>

      {legendItems.length > 0 && (
        <div className='bg-muted/30 flex flex-wrap gap-4 rounded-lg px-4 py-3 text-sm'>
          {legendItems.map(item => (
            <div key={item.subject} className='flex items-center space-x-2'>
              <div className={`h-4 w-4 rounded ${item.color}`} />
              <span className='text-muted-foreground font-medium'>{item.subject}</span>
            </div>
          ))}
          {legendItems.length > 0 && (
            <div className='border-border ml-4 flex items-center space-x-2 border-l pl-4'>
              <div className='bg-muted-foreground/30 h-1 w-8 rounded' />
              <span className='text-muted-foreground font-medium'>Período de estudio</span>
            </div>
          )}
        </div>
      )}

      <div className='border-border overflow-hidden rounded-lg border'>
        <div className='bg-muted/50 grid grid-cols-7'>{renderDays()}</div>
        {renderCells()}
      </div>
    </div>
  );
};

export default CalendarView;
