import { format, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';

import type { TimelineCalculations, TimelineRow } from './types';

interface GanttTimelineProps {
  readonly timeline: TimelineCalculations;
}

export const GanttTimeline: React.FC<GanttTimelineProps> = ({ timeline }) => {
  const {
    dateRange,
    dayWidth,
    timelineWidth,
    rows,
    monthSegments,
    todayPosition,
    today,
    getDayPosition,
    getDayCenter,
    getPeriodWidth,
    isWeekend,
  } = timeline;

  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport || todayPosition === null || typeof viewport.scrollTo !== 'function') {
      return;
    }

    const containerWidth = viewport.clientWidth;
    const scrollToPosition = todayPosition - containerWidth / 2 + dayWidth / 2;

    viewport.scrollTo({
      left: Math.max(0, scrollToPosition),
      behavior: 'smooth',
    });
  }, [todayPosition, dayWidth]);

  return (
    <div className='flex'>
      <div className='w-56 shrink-0'>
        <div className='text-foreground border-border flex h-12 items-center border-b font-medium'>
          Materia / Entrega
        </div>
        {rows.map(row => renderLeftColumnRow(row))}
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
                  key={`${segment.label}-${segment.start}`}
                  className='flex items-center px-2 first:pl-0'
                  style={{ width: `${segment.width}px` }}
                >
                  {segment.label}
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

          {rows.map(row =>
            renderTimelineRow(row, {
              dateRangeDays: dateRange.days,
              dayWidth,
              todayPosition,
              getDayPosition,
              getDayCenter,
              getPeriodWidth,
              isWeekend,
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const renderLeftColumnRow = (row: TimelineRow): React.ReactNode => {
  if (row.type === 'subject') {
    return (
      <div
        key={row.key}
        className='border-border text-foreground flex h-12 items-center border-b font-medium'
      >
        <span className={`h-3 w-3 rounded-full ${row.color} mr-2`} />
        {row.subject}
      </div>
    );
  }

  return (
    <div
      key={row.key}
      className='border-border/50 text-muted-foreground flex h-10 items-center border-b pl-6 text-sm'
    >
      {row.item.name}
    </div>
  );
};

interface RenderRowOptions {
  readonly dateRangeDays: Date[];
  readonly dayWidth: number;
  readonly todayPosition: number | null;
  readonly getDayPosition: (_date: Date) => number;
  readonly getDayCenter: (_date: Date) => number;
  readonly getPeriodWidth: (_startDate: Date, _endDate: Date) => number;
  readonly isWeekend: (_date: Date) => boolean;
}

const renderTimelineRow = (row: TimelineRow, options: RenderRowOptions): React.ReactNode => {
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
  const startPos = options.getDayPosition(item.startDate);
  const width = Math.max(options.getPeriodWidth(item.startDate, item.endDate), options.dayWidth);
  const dueCenter = options.getDayCenter(parseISO(item.date));

  return (
    <div key={row.key} className='border-border/50 relative h-10 border-b'>
      {options.dateRangeDays.map((day, index) => (
        <div
          key={index}
          className={`border-border/50 absolute top-0 bottom-0 border-r ${
            options.isWeekend(day) ? 'bg-muted/30' : 'bg-background'
          }`}
          style={{
            left: `${index * options.dayWidth}px`,
            width: `${options.dayWidth}px`,
          }}
        />
      ))}

      {options.todayPosition !== null && (
        <div
          className='bg-destructive pointer-events-none absolute top-0 bottom-0 z-30 w-px'
          style={{ left: `${options.todayPosition}px` }}
        />
      )}

      <div
        className={`absolute top-1 bottom-1 ${row.color} bg-opacity-30 rounded border ${row.color.replace('bg-', 'border-')} text-foreground z-20 flex items-center truncate px-2 text-xs font-medium`}
        style={{
          left: `${startPos}px`,
          width: `${width}px`,
        }}
        title={`Período de estudio: ${item.subject} - ${item.name}`}
      >
        {item.studyDays} días
      </div>

      <div
        className={`absolute h-4 w-4 ${row.color} z-40 rounded-full border-2 border-white shadow-md`}
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
          title='Periodo de estudio muy corto'
        >
          <AlertTriangle className='h-4 w-4' />
        </div>
      )}
    </div>
  );
};
