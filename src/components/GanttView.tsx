import React, { useMemo, useState } from 'react';
import { BarChart3, Calendar, Clock, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import type { StudySchedule } from '../types';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface GanttViewProps {
  schedule: StudySchedule[];
}

const GanttView: React.FC<GanttViewProps> = ({ schedule }) => {
  const today = new Date();
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = normal, 2 = zoom, 0.5 = overview
  const [timelineStart, setTimelineStart] = useState<Date>(startOfMonth(today));

  const dayWidth = zoomLevel >= 1 ? 40 : 20;
  const minTimelineDays = 30;
  const minTimelineWidth = minTimelineDays * dayWidth;

  const dateRange = useMemo(() => {
    if (schedule.length === 0) {
      const start = startOfMonth(today);
      const end = endOfMonth(today);
      return {
        start,
        end,
        days: eachDayOfInterval({ start, end })
      };
    }

    const allDates = schedule.flatMap(item => [item.startDate, parseISO(item.date)]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    let rangeStart;
    let rangeEnd;

    if (zoomLevel >= 1) {
      rangeStart = startOfMonth(timelineStart);
      rangeEnd = endOfMonth(addMonths(rangeStart, zoomLevel >= 2 ? 2 : 4));
    } else {
      rangeStart = startOfMonth(minDate);
      rangeEnd = endOfMonth(maxDate);
    }

    if (rangeStart > minDate) rangeStart = startOfMonth(minDate);
    if (rangeEnd < maxDate) rangeEnd = endOfMonth(maxDate);

    return {
      start: rangeStart,
      end: rangeEnd,
      days: eachDayOfInterval({ start: rangeStart, end: rangeEnd })
    };
  }, [schedule, timelineStart, zoomLevel, today]);

  const timelineWidth = Math.max((dateRange.days.length || minTimelineDays) * dayWidth, minTimelineWidth);

  const groupedSchedule = useMemo(() => {
    const groups: Record<string, { subject: string; color: string; items: StudySchedule[] }> = {};
    schedule.forEach(item => {
      if (!groups[item.subject]) {
        groups[item.subject] = {
          subject: item.subject,
          color: item.color,
          items: []
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
        color: group.color
      });
      group.items.forEach(item => {
        data.push({
          type: 'item',
          key: `item-${item.id}`,
          item,
          color: group.color
        });
      });
    });
    return data;
  }, [groupedSchedule]);

  const getClampedDateIndex = (date: Date): number => {
    if (dateRange.days.length === 0) return 0;
    const index = dateRange.days.findIndex(day => isSameDay(day, date));
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

  const todayIndex = dateRange.days.findIndex(day => isSameDay(day, today));
  const todayPosition = todayIndex >= 0 ? getDayPosition(dateRange.days[todayIndex]) + dayWidth / 2 : null;

  const monthSegments = useMemo(() => {
    if (dateRange.days.length === 0) return [];

    const segments: Array<{ start: number; width: number; color: string; studyDays: number; warning: boolean; month?: string }> = [];
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
          month: currentMonth
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
          month
        });
      }
    });

    return segments as Array<{ start: number; width: number; color: string; studyDays: number; warning: boolean; month?: string }>;
  }, [dateRange.days, dayWidth]);

  const navigateTimeline = (direction: 'next' | 'prev'): void => {
    const monthsToMove = zoomLevel >= 1 ? 1 : 3;
    setTimelineStart(prev =>
      direction === 'next' ? addMonths(prev, monthsToMove) : subMonths(prev, monthsToMove)
    );
  };

  const handleZoom = (newZoom: number): void => {
    const clamped = Math.max(0.5, Math.min(2, newZoom));
    setZoomLevel(clamped);
    if (schedule.length > 0) {
      const allDates = schedule.flatMap(item => [item.startDate, parseISO(item.date)]);
      const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
      setTimelineStart(startOfMonth(minDate));
    }
  };

  const getZoomInfo = (): { label: string; description: string } => {
    if (zoomLevel >= 2) return { label: 'Zoom+', description: 'Vista detallada' };
    if (zoomLevel >= 1) return { label: 'Normal', description: 'Vista estándar' };
    return { label: 'Overview', description: 'Vista general' };
  };

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  return (
    <div className="space-y-6">
      {/* Barra de herramientas ligera */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleZoom(zoomLevel - 0.5)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Alejar vista"
            aria-label="Alejar vista"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-2 py-1 bg-muted rounded text-sm font-medium">
            {getZoomInfo().label}
          </span>
          <button
            onClick={() => handleZoom(zoomLevel + 0.5)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Acercar vista"
            aria-label="Acercar vista"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateTimeline('prev')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Mes anterior"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigateTimeline('next')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Mes siguiente"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex">
          {/* Columna fija */}
          <div className="w-56 shrink-0">
            <div className="h-12 flex items-center font-medium text-foreground border-b border-border">
              Materia / Entrega
            </div>
            {rows.map(row => (
              row.type === 'subject' ? (
                <div
                  key={row.key}
                  className="h-12 flex items-center border-b border-border font-medium text-foreground"
                >
                  <span className={`w-3 h-3 rounded-full ${row.color} mr-2`} />
                  {row.subject}
                </div>
              ) : (
                <div
                  key={row.key}
                  className="h-10 flex items-center border-b border-border/50 text-sm text-muted-foreground pl-6"
                >
                  {row.item.name}
                </div>
              )
            ))}
          </div>

          {/* Timeline con scroll compartido */}
          <div className="flex-1 overflow-x-auto">
            <div className="relative" style={{ minWidth: `${timelineWidth}px` }}>
              <div className="border-b border-border">
                <div className="flex border-b border-border/50 text-xs font-medium text-foreground h-6">
                  {monthSegments.map(segment => (
                    <div
                      key={segment.month}
                      className="flex items-center px-2 first:pl-0"
                      style={{ width: `${segment.width}px` }}
                    >
                      {segment.month}
                    </div>
                  ))}
                </div>
                <div className="relative flex text-xs text-muted-foreground h-6">
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
                        {format(day, zoomLevel >= 1 ? 'd' : 'd/M')}
                      </div>
                    );
                  })}
                  {todayPosition !== null && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-destructive"
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
                      className="h-12 border-b border-border/50 flex items-center text-xs uppercase tracking-wide text-muted-foreground bg-muted/30 px-2"
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
                  <div key={row.key} className="relative h-10 border-b border-border/50">
                    {dateRange.days.map((day, index) => (
                      <div
                        key={index}
                        className={`absolute top-0 bottom-0 border-r border-border/50 ${
                          isWeekend(day) ? 'bg-muted/30' : 'bg-background'
                        }`}
                        style={{
                          left: `${index * dayWidth}px`,
                          width: `${dayWidth}px`
                        }}
                      />
                    ))}

                    {todayPosition !== null && (
                      <div
                        className="pointer-events-none absolute top-0 bottom-0 w-px bg-destructive z-30"
                        style={{ left: `${todayPosition}px` }}
                      />
                    )}

                    <div
                      className={`absolute top-1 bottom-1 ${item.color} bg-opacity-30 rounded border ${item.color.replace('bg-', 'border-')} flex items-center px-2 text-xs font-medium text-foreground truncate z-20`}
                      style={{
                        left: `${startPos}px`,
                        width: `${width}px`
                      }}
                      title={`Período de estudio: ${item.subject} - ${item.name}`}
                    >
                      {item.studyDays} días
                    </div>

                    <div
                      className={`absolute w-4 h-4 ${item.color} rounded-full border-2 border-white shadow-md z-40`}
                      style={{
                        left: `${dueCenter - 8}px`,
                        top: '8px'
                      }}
                      title={`Entrega: ${format(parseISO(item.date), "d 'de' MMMM", { locale: es })}`}
                    >
                      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap text-muted-foreground">
                        {format(parseISO(item.date), zoomLevel >= 1 ? 'd/MM' : 'd/M')}
                      </div>
                    </div>

                    {item.warning && (
                      <div
                        className="absolute -top-3 text-chart-3 text-xs font-semibold z-40"
                        style={{ left: `${startPos}px` }}
                        title="Período de estudio muy corto"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {rows.length === 0 && (
          <div className="pt-2 text-sm text-muted-foreground text-center">
            No hay entregas programadas para el periodo visible.
          </div>
        )}

        {/* Leyenda y métricas ligeras */}
        <div className="mt-6 pt-4 border-t border-border space-y-3">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-3 bg-muted-foreground/30 border border-border rounded"></div>
              <span>Período de estudio</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-muted-foreground rounded-full border-2 border-background shadow-md"></div>
              <span>Fecha de entrega</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-0.5 h-4 bg-destructive"></div>
              <span>Hoy</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-chart-3" />
              <span>Menos de 4 días de estudio</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Total de entregas</span>
              </div>
              <p className="text-xl font-semibold text-foreground">{schedule.length}</p>
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Días totales de estudio</span>
              </div>
              <p className="text-xl font-semibold text-foreground">
                {schedule.reduce((acc, item) => acc + item.studyDays, 0)}
              </p>
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">Promedio días/entrega</span>
              </div>
              <p className="text-xl font-semibold text-foreground">
                {schedule.length > 0
                  ? Math.round(schedule.reduce((acc, item) => acc + item.studyDays, 0) / schedule.length)
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GanttView;
