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
import { BarChart3, Calendar, Clock, AlertTriangle } from 'lucide-react';
import React, { useMemo, useRef, useEffect } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import type { StudySchedule } from '@/types';

interface GanttViewProps {
  readonly schedule: StudySchedule[];
}

const GanttView: React.FC<GanttViewProps> = ({ schedule }) => {
  const todayRef = useRef(new Date());

  const today = todayRef.current;

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

    schedule.forEach(item => {
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
    schedule.forEach(item => {
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
    groupedSchedule.forEach(group => {
      data.push({
        type: 'subject',
        key: `subject-${group.subject}`,
        subject: group.subject,
        color: group.color,
      });
      group.items.forEach(item => {
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
    if (dateRange.days.length === 0) {
      return 0;
    }
    const index = dateRange.days.findIndex(day => isSameDay(day, date));
    if (index !== -1) {
      return index;
    }
    if (date < dateRange.days[0]) {
      return 0;
    }
    if (date > dateRange.days[dateRange.days.length - 1]) {
      return dateRange.days.length - 1;
    }
    return 0;
  };

  const getDayPosition = (date: Date): number => getClampedDateIndex(date) * dayWidth;
  const getDayCenter = (date: Date): number => getDayPosition(date) + dayWidth / 2;

  const getPeriodWidth = (startDate: Date, endDate: Date): number => {
    const startIndex = getClampedDateIndex(startDate);
    const endIndex = getClampedDateIndex(endDate);
    return (Math.max(endIndex - startIndex, 0) + 1) * dayWidth;
  };

  const todayIndex = dateRange.days.findIndex(day => isSameDay(day, today));
  const todayPosition = todayIndex >= 0 ? getDayCenter(dateRange.days[todayIndex]) : null;

  const monthSegments = useMemo(() => {
    if (dateRange.days.length === 0) {
      return [];
    }

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
            <div className='text-foreground border-border flex h-12 items-center border-b font-medium'>
              Materia / Entrega
            </div>
            {rows.map(row =>
              row.type === 'subject' ? (
                <div
                  key={row.key}
                  className='border-border text-foreground flex h-12 items-center border-b font-medium'
                >
                  <span className={`h-3 w-3 rounded-full ${row.color} mr-2`} />
                  {row.subject}
                </div>
              ) : (
                <div
                  key={row.key}
                  className='border-border/50 text-muted-foreground flex h-10 items-center border-b pl-6 text-sm'
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
              <div className='border-border border-b'>
                <div className='border-border/50 text-foreground flex h-6 border-b text-xs font-medium'>
                  {monthSegments.map(segment => (
                    <div
                      key={segment.month}
                      className='flex items-center px-2 first:pl-0'
                      style={{ width: `${segment.width}px` }}
                    >
                      {segment.month}
                    </div>
                  ))}
                </div>
                <div className='text-muted-foreground relative flex h-6 text-xs'>
                  {dateRange.days.map((day, index) => {
                    const weekend = isWeekend(day);
                    const isToday = isSameDay(day, today);

                    return (
                      <div
                        key={index}
                        className={`border-border/50 flex flex-1 items-center justify-center border-r text-center ${
                          weekend ? 'bg-muted/30' : ''
                        } ${isToday ? 'bg-primary/20 text-primary font-semibold' : ''}`}
                        style={{ width: `${dayWidth}px` }}
                      >
                        {format(day, 'd')}
                      </div>
                    );
                  })}
                  {todayPosition !== null && (
                    <div
                      className='bg-destructive absolute top-0 bottom-0 w-px'
                      style={{ left: `${todayPosition}px` }}
                    />
                  )}
                </div>
              </div>

              {rows.map(row => {
                if (row.type === 'subject') {
                  return (
                    <div
                      key={row.key}
                      className='border-border/50 text-muted-foreground bg-muted/30 flex h-12 items-center border-b px-2 text-xs tracking-wide uppercase'
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
                  <div key={row.key} className='border-border/50 relative h-10 border-b'>
                    {dateRange.days.map((day, index) => (
                      <div
                        key={index}
                        className={`border-border/50 absolute top-0 bottom-0 border-r ${
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
                        className='bg-destructive pointer-events-none absolute top-0 bottom-0 z-30 w-px'
                        style={{ left: `${todayPosition}px` }}
                      />
                    )}

                    <div
                      className={`absolute top-1 bottom-1 ${item.color} bg-opacity-30 rounded border ${item.color.replace('bg-', 'border-')} text-foreground z-20 flex items-center truncate px-2 text-xs font-medium`}
                      style={{
                        left: `${startPos}px`,
                        width: `${width}px`,
                      }}
                      title={`Período de estudio: ${item.subject} - ${item.name}`}
                    >
                      {item.studyDays} días
                    </div>

                    <div
                      className={`absolute h-4 w-4 ${item.color} z-40 rounded-full border-2 border-white shadow-md`}
                      style={{
                        left: `${dueCenter - 8}px`,
                        top: '8px',
                      }}
                      title={`Entrega: ${format(parseISO(item.date), "d 'de' MMMM", { locale: es })}`}
                    >
                      <div className='text-muted-foreground absolute -top-5 left-1/2 -translate-x-1/2 transform text-xs whitespace-nowrap'>
                        {format(parseISO(item.date), 'd/MM')}
                      </div>
                    </div>

                    {item.warning && (
                      <div
                        className='text-chart-3 absolute -top-3 z-40 text-xs font-semibold'
                        style={{ left: `${startPos}px` }}
                        title='Período de estudio muy corto'
                      >
                        <AlertTriangle className='h-4 w-4' />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {rows.length === 0 && (
          <div className='text-muted-foreground pt-2 text-center text-sm'>
            No hay entregas programadas para el periodo visible.
          </div>
        )}

        <div className='border-border mt-6 space-y-4 border-t pt-4'>
          <div className='text-muted-foreground flex flex-wrap gap-4 text-sm'>
            <div className='flex items-center space-x-2'>
              <div className='bg-muted-foreground/30 border-border h-3 w-8 rounded border' />
              <span>Período de estudio</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='bg-muted-foreground border-background h-4 w-4 rounded-full border-2 shadow-md' />
              <span>Fecha de entrega</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='bg-destructive h-4 w-0.5' />
              <span>Hoy</span>
            </div>
            <div className='flex items-center space-x-2'>
              <AlertTriangle className='text-chart-3 h-4 w-4' />
              <span>Menos de 4 días de estudio</span>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='bg-card border-border flex items-center justify-between rounded-lg border p-3 shadow-sm'>
              <div className='flex items-center gap-3'>
                <div className='bg-primary/10 dark:bg-primary/5 rounded-full p-2'>
                  <Calendar className='text-primary dark:text-primary h-4 w-4' />
                </div>
                <span className='text-card-foreground text-sm font-medium'>Total de entregas</span>
              </div>
              <p className='text-card-foreground text-2xl font-bold tabular-nums'>
                {schedule.length}
              </p>
            </div>
            <div className='bg-card border-border flex items-center justify-between rounded-lg border p-3 shadow-sm'>
              <div className='flex items-center gap-3'>
                <div className='rounded-full bg-blue-500/10 p-2 dark:bg-blue-500/5'>
                  <Clock className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                </div>
                <span className='text-card-foreground text-sm font-medium'>
                  Días totales de estudio
                </span>
              </div>
              <p className='text-card-foreground text-2xl font-bold tabular-nums'>
                {schedule.reduce((acc, item) => acc + item.studyDays, 0)}
              </p>
            </div>
            <div className='bg-card border-border flex items-center justify-between rounded-lg border p-3 shadow-sm'>
              <div className='flex items-center gap-3'>
                <div className='rounded-full bg-green-500/10 p-2 dark:bg-green-500/5'>
                  <BarChart3 className='h-4 w-4 text-green-600 dark:text-green-400' />
                </div>
                <span className='text-card-foreground text-sm font-medium'>
                  Promedio días/entrega
                </span>
              </div>
              <p className='text-card-foreground text-2xl font-bold tabular-nums'>
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
