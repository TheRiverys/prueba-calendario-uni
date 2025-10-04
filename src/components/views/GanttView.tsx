import React, { useMemo, useRef, useEffect } from 'react';
import { BarChart3, Calendar, Clock, AlertTriangle } from 'lucide-react';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  addDays,
  subDays,
} from 'date-fns';
import { es } from 'date-fns/locale';

import type { StudySchedule } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GanttViewProps {
  schedule: StudySchedule[];
}

const GanttView: React.FC<GanttViewProps> = ({ schedule }) => {
  const today = new Date();
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const dayWidth = 40;
  const minTimelineDays = 30;
  const minTimelineWidth = minTimelineDays * dayWidth;

  const dateRange = useMemo(() => {
    if (schedule.length === 0) {
      const start = startOfMonth(subMonths(today, 1));
      const end = endOfMonth(addMonths(today, 3));
      return {
        start,
        end,
        days: eachDayOfInterval({ start, end }),
      };
    }

    let earliestStartDate = schedule[0].startDate;
    let latestDueDate = parseISO(schedule[0].date);

    schedule.forEach((item) => {
      if (item.startDate < earliestStartDate) {
        earliestStartDate = item.startDate;
      }
      const itemDueDate = parseISO(item.date);
      if (itemDueDate > latestDueDate) {
        latestDueDate = itemDueDate;
      }
    });

    const marginDays = 0;
    const start = subDays(earliestStartDate, marginDays);
    const end = addDays(latestDueDate, marginDays);

    return {
      start,
      end,
      days: eachDayOfInterval({ start, end }),
    };
  }, [schedule, today]);

  const timelineWidth = Math.max(
    (dateRange.days.length || minTimelineDays) * dayWidth,
    minTimelineWidth
  );

  const groupedSchedule = useMemo(() => {
    const groups: Record<string, { subject: string; color: string; items: StudySchedule[] }> = {};
    schedule.forEach((item) => {
      if (!groups[item.subject]) {
        groups[item.subject] = {
          subject: item.subject,
          color: item.color,
          items: [],
        };
      }
      groups[item.subject].items.push(item);
    });
    return Object.values(groups);
  }, [schedule]);

  const rows = useMemo(() => {
    const data: Array<
      | { type: 'subject'; key: string; subject: string; color: string }
      | { type: 'item'; key: string; item: StudySchedule; color: string }
    > = [];
    groupedSchedule.forEach((group) => {
      data.push({
        type: 'subject',
        key: `subject-${group.subject}`,
        subject: group.subject,
        color: group.color,
      });
      group.items.forEach((item) => {
        data.push({
          type: 'item',
          key: `item-${item.id}`,
          item,
          color: group.color,
        });
      });
    });
    return data;
  }, [groupedSchedule]);

  const getClampedDateIndex = (date: Date): number => {
    if (dateRange.days.length === 0) return 0;
    const index = dateRange.days.findIndex((day) => isSameDay(day, date));
    if (index !== -1) return index;
    if (date < dateRange.days[0]) return 0;
    if (date > dateRange.days[dateRange.days.length - 1]) return dateRange.days.length - 1;
    return 0;
  };

  const getDayPosition = (date: Date): number => getClampedDateIndex(date) * dayWidth;
  const getDayCenter = (date: Date): number => getDayPosition(date) + dayWidth / 2;

  const getPeriodWidth = (startDate: Date, endDate: Date): number => {
    const startIndex = getClampedDateIndex(startDate);
    const endIndex = getClampedDateIndex(endDate);
    return (Math.max(endIndex - startIndex, 0) + 1) * dayWidth;
  };

  const todayIndex = dateRange.days.findIndex((day) => isSameDay(day, today));
  const todayPosition = todayIndex >= 0 ? getDayCenter(dateRange.days[todayIndex]) : null;

  const monthSegments = useMemo(() => {
    if (dateRange.days.length === 0) return [];

    const segments: Array<{
      start: number;
      width: number;
      color: string;
      studyDays: number;
      warning: boolean;
      month?: string;
    }> = [];
    let currentMonth = format(dateRange.days[0], 'MMMM yyyy', { locale: es });
    let startIndex = 0;

    dateRange.days.forEach((day, index) => {
      const month = format(day, 'MMMM yyyy', { locale: es });
      if (month !== currentMonth) {
        segments.push({
          start: startIndex * dayWidth,
          width: (index - startIndex) * dayWidth,
          color: 'bg-gray-100',
          studyDays: 0,
          warning: false,
          month: currentMonth,
        });
        currentMonth = month;
        startIndex = index;
      }

      if (index === dateRange.days.length - 1) {
        segments.push({
          start: startIndex * dayWidth,
          width: (index - startIndex + 1) * dayWidth,
          color: 'bg-gray-100',
          studyDays: 0,
          warning: false,
          month,
        });
      }
    });

    return segments;
  }, [dateRange.days, dayWidth]);

  useEffect(() => {
    if (scrollViewportRef.current && todayPosition !== null) {
      const containerWidth = scrollViewportRef.current.clientWidth;
      const scrollToPosition = todayPosition - containerWidth / 2 + dayWidth / 2;

      scrollViewportRef.current.scrollTo({
        left: Math.max(0, scrollToPosition),
        behavior: 'smooth',
      });
    }
  }, [todayPosition, dayWidth]);

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  return (
    <div className='space-y-6'>
      {/* Sección de navegación eliminada completamente */}

      <div className='p-6'>
        <div className='flex'>
          <div className='w-56 shrink-0'>
            <div className='h-12 flex items-center font-medium text-foreground border-b border-border'>
              Materia / Entrega
            </div>
            {rows.map((row) =>
              row.type === 'subject' ? (
                <div
                  key={row.key}
                  className='h-12 flex items-center border-b border-border font-medium text-foreground'
                >
                  <span className={`w-3 h-3 rounded-full ${row.color} mr-2`} />
                  {row.subject}
                </div>
              ) : (
                <div
                  key={row.key}
                  className='h-10 flex items-center border-b border-border/50 text-sm text-muted-foreground pl-6'
                >
                  {row.item.name}
                </div>
              )
            )}
          </div>

          <ScrollArea className='flex-1'>
            <div
              className='relative'
              style={{ minWidth: `${timelineWidth}px` }}
              ref={scrollViewportRef}
            >
              <div className='border-b border-border'>
                <div className='flex border-b border-border/50 text-xs font-medium text-foreground h-6'>
                  {monthSegments.map((segment) => (
                    <div
                      key={segment.month}
                      className='flex items-center px-2 first:pl-0'
                      style={{ width: `${segment.width}px` }}
                    >
                      {segment.month}
                    </div>
                  ))}
                </div>
                <div className='relative flex text-xs text-muted-foreground h-6'>
                  {dateRange.days.map((day, index) => {
                    const weekend = isWeekend(day);
                    const isToday = isSameDay(day, today);

                    return (
                      <div
                        key={index}
                        className={`flex-1 border-r border-border/50 text-center flex items-center justify-center ${
                          weekend ? 'bg-muted/30' : ''
                        } ${isToday ? 'bg-primary/20 font-semibold text-primary' : ''}`}
                        style={{ width: `${dayWidth}px` }}
                      >
                        {format(day, 'd')}
                      </div>
                    );
                  })}
                  {todayPosition !== null && (
                    <div
                      className='absolute top-0 bottom-0 w-px bg-destructive'
                      style={{ left: `${todayPosition}px` }}
                    />
                  )}
                </div>
              </div>

              {rows.map((row) => {
                if (row.type === 'subject') {
                  return (
                    <div
                      key={row.key}
                      className='h-12 border-b border-border/50 flex items-center text-xs uppercase tracking-wide text-muted-foreground bg-muted/30 px-2'
                    >
                      Cronograma de {row.subject}
                    </div>
                  );
                }

                const { item } = row;
                const startPos = getDayPosition(item.startDate);
                const width = Math.max(getPeriodWidth(item.startDate, item.endDate), dayWidth);
                const dueCenter = getDayCenter(parseISO(item.date));

                return (
                  <div key={row.key} className='relative h-10 border-b border-border/50'>
                    {dateRange.days.map((day, index) => (
                      <div
                        key={index}
                        className={`absolute top-0 bottom-0 border-r border-border/50 ${
                          isWeekend(day) ? 'bg-muted/30' : 'bg-background'
                        }`}
                        style={{
                          left: `${index * dayWidth}px`,
                          width: `${dayWidth}px`,
                        }}
                      />
                    ))}

                    {todayPosition !== null && (
                      <div
                        className='pointer-events-none absolute top-0 bottom-0 w-px bg-destructive z-30'
                        style={{ left: `${todayPosition}px` }}
                      />
                    )}

                    <div
                      className={`absolute top-1 bottom-1 ${item.color} bg-opacity-30 rounded border ${item.color.replace('bg-', 'border-')} flex items-center px-2 text-xs font-medium text-foreground truncate z-20`}
                      style={{
                        left: `${startPos}px`,
                        width: `${width}px`,
                      }}
                      title={`Período de estudio: ${item.subject} - ${item.name}`}
                    >
                      {item.studyDays} días
                    </div>

                    <div
                      className={`absolute w-4 h-4 ${item.color} rounded-full border-2 border-white shadow-md z-40`}
                      style={{
                        left: `${dueCenter - 8}px`,
                        top: '8px',
                      }}
                      title={`Entrega: ${format(parseISO(item.date), "d 'de' MMMM", { locale: es })}`}
                    >
                      <div className='absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap text-muted-foreground'>
                        {format(parseISO(item.date), 'd/MM')}
                      </div>
                    </div>

                    {item.warning && (
                      <div
                        className='absolute -top-3 text-chart-3 text-xs font-semibold z-40'
                        style={{ left: `${startPos}px` }}
                        title='Período de estudio muy corto'
                      >
                        <AlertTriangle className='w-4 h-4' />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {rows.length === 0 && (
          <div className='pt-2 text-sm text-muted-foreground text-center'>
            No hay entregas programadas para el periodo visible.
          </div>
        )}

        <div className='mt-6 pt-4 border-t border-border space-y-4'>
          <div className='flex flex-wrap gap-4 text-sm text-muted-foreground'>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-3 bg-muted-foreground/30 border border-border rounded' />
              <span>Período de estudio</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-4 h-4 bg-muted-foreground rounded-full border-2 border-background shadow-md' />
              <span>Fecha de entrega</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-0.5 h-4 bg-destructive' />
              <span>Hoy</span>
            </div>
            <div className='flex items-center space-x-2'>
              <AlertTriangle className='w-4 h-4 text-chart-3' />
              <span>Menos de 4 días de estudio</span>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='flex items-center justify-between p-3 rounded-lg bg-card border border-border shadow-sm'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-full bg-primary/10 dark:bg-primary/5'>
                  <Calendar className='w-4 h-4 text-primary dark:text-primary' />
                </div>
                <span className='text-sm font-medium text-card-foreground'>Total de entregas</span>
              </div>
              <p className='text-2xl font-bold text-card-foreground tabular-nums'>
                {schedule.length}
              </p>
            </div>
            <div className='flex items-center justify-between p-3 rounded-lg bg-card border border-border shadow-sm'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-full bg-blue-500/10 dark:bg-blue-500/5'>
                  <Clock className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                </div>
                <span className='text-sm font-medium text-card-foreground'>
                  Días totales de estudio
                </span>
              </div>
              <p className='text-2xl font-bold text-card-foreground tabular-nums'>
                {schedule.reduce((acc, item) => acc + item.studyDays, 0)}
              </p>
            </div>
            <div className='flex items-center justify-between p-3 rounded-lg bg-card border border-border shadow-sm'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-full bg-green-500/10 dark:bg-green-500/5'>
                  <BarChart3 className='w-4 h-4 text-green-600 dark:text-green-400' />
                </div>
                <span className='text-sm font-medium text-card-foreground'>
                  Promedio días/entrega
                </span>
              </div>
              <p className='text-2xl font-bold text-card-foreground tabular-nums'>
                {schedule.length > 0
                  ? Math.round(
                      schedule.reduce((acc, item) => acc + item.studyDays, 0) / schedule.length
                    )
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttView;
