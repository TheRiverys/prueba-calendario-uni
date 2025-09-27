import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Check, Trash2, Edit2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import type { StudySchedule } from '../types';
import { buildColorLegend } from '../utils';

interface CalendarViewProps {
  schedule: StudySchedule[];
  onEdit: (delivery: StudySchedule) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (id: number) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ schedule, onEdit, onDelete, onToggleComplete }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Obtener meses con entregas para navegación rápida
  const getMonthsWithDeliveries = (): string[] => {
    if (schedule.length === 0) return [];

    const months: string[] = [];
    schedule.forEach(item => {
      const deliveryDate = parseISO(item.date);
      const monthKey = format(deliveryDate, 'yyyy-MM');
      if (!months.includes(monthKey)) {
        months.push(monthKey);
      }
    });

    return months.sort();
  };

  const monthsWithDeliveries = getMonthsWithDeliveries();
  const legendItems = useMemo(() => buildColorLegend(schedule), [schedule]);

  // Encontrar el mes más cercano con entregas
  const findNearestMonthWithDeliveries = (): Date => {
    if (monthsWithDeliveries.length === 0) return new Date();

    const currentMonthKey = format(currentMonth, 'yyyy-MM');
    const currentIndex = monthsWithDeliveries.indexOf(currentMonthKey);

    if (currentIndex !== -1) return currentMonth;

    // Encontrar el mes más cercano
    const today = new Date();
    let nearestMonth = monthsWithDeliveries[0];
    let minDiff = Math.abs(new Date(monthsWithDeliveries[0] + '-01').getTime() - today.getTime());

    monthsWithDeliveries.forEach(monthKey => {
      const monthDate = new Date(monthKey + '-01');
      const diff = Math.abs(monthDate.getTime() - today.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        nearestMonth = monthKey;
      }
    });

    return new Date(nearestMonth + '-01');
  };

  // Navegar al mes más cercano con entregas
  const goToNearestMonthWithDeliveries = (): void => {
    setCurrentMonth(findNearestMonthWithDeliveries());
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const nextMonth = (): void => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = (): void => setCurrentMonth(subMonths(currentMonth, 1));

  const getDeliveriesForDay = (day: Date): StudySchedule[] => {
    return schedule.filter(item => isSameDay(parseISO(item.date), day));
  };

  const getStudyPeriodsForDay = (day: Date): StudySchedule[] => {
    return schedule.filter(item =>
      isWithinInterval(day, { start: item.startDate, end: item.endDate })
    );
  };

  const renderDays = (): React.JSX.Element[] => {
    const dateFormat = "EEEEEE";
    const days: React.JSX.Element[] = [];
    let startDateCopy = startDate;

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center py-2">
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
            } ${isToday ? 'ring-2 ring-primary' : ''}`}
          >
            <div className={`text-sm font-medium mb-1 ${
              isToday ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center' : ''
            }`}>
              {formattedDate}
            </div>
            
            {/* Indicadores de período de estudio */}
            {studyPeriodsForDay.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-muted-foreground mb-1">Períodos de estudio:</div>
                {studyPeriodsForDay.map((period, idx) => (
                  <div
                    key={`study-${period.id}-${idx}`}
                    className={`h-2 ${period.color} opacity-40 rounded-sm mb-1 border border-white/20`}
                    title={`${period.subject} - ${period.name}: ${format(period.startDate, 'd/M', { locale: es })} - ${format(period.endDate, 'd/M', { locale: es })}`}
                  />
                ))}
              </div>
            )}
            
            {/* Entregas del día */}
            <div className="space-y-1">
              {deliveriesForDay.map((delivery) => (
                <div
                  key={delivery.id}
                  className={`text-xs p-1 rounded ${delivery.color} ${
                    delivery.completed ? 'opacity-60' : 'text-white'
                  } truncate cursor-pointer hover:opacity-90 transition-opacity relative group`}
                  title={`${delivery.subject} - ${delivery.name}${delivery.completed ? ' (Completada)' : ''}`}
                >
                  <div className="font-medium truncate flex items-center">
                    {delivery.completed && <Check className="w-3 h-3 mr-1" />}
                    {delivery.name}
                  </div>
                  <div className="truncate opacity-90">{delivery.subject}</div>

                  {/* Botones de acción (aparecen al hacer hover) */}
                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(delivery.id);
                      }}
                      className="bg-chart-1 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:opacity-80"
                      title={delivery.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(delivery);
                      }}
                      className="bg-chart-2 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:opacity-80"
                      title="Editar entrega"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(delivery.id);
                      }}
                      className="bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs hover:opacity-80"
                      title="Eliminar entrega"
                    >
                      <Trash2 className="w-3 h-3" />
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
        <div className="grid grid-cols-7" key={day.getTime()}>
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Vista de Calendario
            </h2>

            <div className="flex items-center space-x-4">
              {monthsWithDeliveries.length > 0 && (
                <button
                  onClick={goToNearestMonthWithDeliveries}
                  className="px-3 py-1 text-sm bg-chart-1/10 text-chart-1 rounded-lg hover:bg-chart-1/20 transition-colors"
                  title="Ir al mes más cercano con entregas"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Ver entregas
                </button>
              )}

              <button
                onClick={prevMonth}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-medium text-foreground min-w-[200px] text-center">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </h3>

              <button
                onClick={nextMonth}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Leyenda */}
          <div className='mb-6 flex flex-wrap gap-4 text-sm'>
            {legendItems.map(item => (
              <div key={item.subject} className='flex items-center space-x-2'>
                <div className={'w-4 h-4 rounded ' + item.color} />
                <span className='text-muted-foreground'>{item.subject}</span>
              </div>
            ))}
            {legendItems.length > 0 && (
              <div className='flex items-center space-x-2 ml-4 border-l border-border pl-4'>
                <div className='w-8 h-1 bg-muted-foreground/30 rounded' />
                <span className='text-muted-foreground'>Periodo de estudio</span>
              </div>
            )}
          </div>
          {/* Calendario */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-7 bg-muted/50">
              {renderDays()}
            </div>
            {renderCells()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;