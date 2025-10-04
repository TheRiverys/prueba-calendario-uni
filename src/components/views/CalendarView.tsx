import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Trash2, Edit2, Filter } from 'lucide-react';
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

import type { StudySchedule } from '@/types';
import { buildColorLegend } from '@/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CalendarViewProps {
  schedule: StudySchedule[];
  onEdit: (delivery: StudySchedule) => void;
  onDelete: (id: StudySchedule['id']) => void;
  onToggleComplete: (id: StudySchedule['id']) => void;
  selectedSubject?: string;
  subjects?: string[];
  onSubjectChange?: (subject: string) => void;
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
        : schedule.filter((item) => item.subject === selectedSubject);
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
      (item) =>
        isSameDay(parseISO(item.date), day) &&
        (selectedSubject === 'all' || item.subject === selectedSubject)
    );
  };

  const getStudyPeriodsForDay = (day: Date): StudySchedule[] => {
    return schedule.filter((item) =>
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
          className='text-xs font-medium text-muted-foreground uppercase tracking-wider text-center py-2'
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
            className={`min-h-[100px] border border-border p-2 ${
              !isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : 'bg-background'
            } ${isToday ? 'bg-primary/10 ring-1 ring-primary/30' : ''}`}
          >
            <div
              className={`text-sm font-medium mb-1 ${
                isToday
                  ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center'
                  : ''
              }`}
            >
              {formattedDate}
            </div>

            {studyPeriodsForDay.length > 0 && (
              <div className='mb-2'>
                <div className='text-xs text-muted-foreground mb-1'>Períodos de estudio:</div>
                {studyPeriodsForDay.map((period, idx) => (
                  <div
                    key={`study-${period.id}-${idx}`}
                    className={`h-2 ${period.color} opacity-40 rounded-sm mb-1 border border-white/20`}
                    title={`${period.subject} - ${period.name}: ${format(period.startDate, 'd/M', { locale: es })} - ${format(period.endDate, 'd/M', { locale: es })}`}
                  />
                ))}
              </div>
            )}

            <div className='space-y-1'>
              {deliveriesForDay.map((delivery) => (
                <div
                  key={delivery.id}
                  className={`text-xs p-1 rounded ${delivery.color} ${
                    delivery.completed ? 'opacity-60' : 'text-white'
                  } truncate cursor-pointer hover:opacity-90 transition-opacity relative group`}
                  title={`${delivery.subject} - ${delivery.name}${delivery.completed ? ' (Completada)' : ''}`}
                >
                  <div className='font-medium truncate flex items-center'>
                    {delivery.completed && <Check className='w-3 h-3 mr-1' />}
                    {delivery.name}
                  </div>
                  <div className='truncate opacity-90'>{delivery.subject}</div>

                  <div className='absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1'>
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(delivery.id);
                      }}
                      className='bg-chart-1 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:opacity-80'
                      title={
                        delivery.completed ? 'Marcar como pendiente' : 'Marcar como completada'
                      }
                      aria-label={
                        delivery.completed ? 'Marcar como pendiente' : 'Marcar como completada'
                      }
                    >
                      <Check className='w-3 h-3' />
                    </button>
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(delivery);
                      }}
                      className='bg-chart-2 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:opacity-80'
                      title='Editar entrega'
                      aria-label='Editar entrega'
                    >
                      <Edit2 className='w-3 h-3' />
                    </button>
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(delivery.id);
                      }}
                      className='bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs hover:opacity-80'
                      title='Eliminar entrega'
                      aria-label='Eliminar entrega'
                    >
                      <Trash2 className='w-3 h-3' />
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
              className='flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors'
              aria-label='Mes anterior'
            >
              <ChevronLeft className='w-5 h-5' />
            </button>
            <div className='px-4 py-2 bg-muted/50 rounded-lg'>
              <h3 className='text-lg font-semibold text-foreground min-w-[200px] text-center'>
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </h3>
            </div>
            <button
              type='button'
              onClick={nextMonth}
              className='flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors'
              aria-label='Mes siguiente'
            >
              <ChevronRight className='w-5 h-5' />
            </button>
          </div>

          <div className='flex items-center gap-3'>
            {subjects.length > 0 && (
              <div className='flex items-center gap-2'>
                <Filter className='w-4 h-4 text-muted-foreground' />
                <Select value={selectedSubject} onValueChange={onSubjectChange}>
                  <SelectTrigger className='w-[140px]'>
                    <SelectValue placeholder='Todas' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todas</SelectItem>
                    {subjects.map((subject) => (
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
        <div className='flex flex-wrap gap-4 text-sm px-4 py-3 bg-muted/30 rounded-lg'>
          {legendItems.map((item) => (
            <div key={item.subject} className='flex items-center space-x-2'>
              <div className={`w-4 h-4 rounded ${item.color}`} />
              <span className='text-muted-foreground font-medium'>{item.subject}</span>
            </div>
          ))}
          {legendItems.length > 0 && (
            <div className='flex items-center space-x-2 ml-4 border-l border-border pl-4'>
              <div className='w-8 h-1 bg-muted-foreground/30 rounded' />
              <span className='text-muted-foreground font-medium'>Período de estudio</span>
            </div>
          )}
        </div>
      )}

      <div className='border border-border rounded-lg overflow-hidden'>
        <div className='grid grid-cols-7 bg-muted/50'>{renderDays()}</div>
        {renderCells()}
      </div>
    </div>
  );
};

export default CalendarView;
