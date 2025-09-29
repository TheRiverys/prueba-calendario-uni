
import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Edit2, Trash2, Check, Plus, Circle } from 'lucide-react';
import { format, differenceInDays, differenceInCalendarDays, isBefore, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
// Se elimina Card para un layout menos "encajonado"
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AIControls } from './AIControls';
import type { StudySchedule } from '../types';

interface DeliveryListProps {
  schedule: StudySchedule[];
  onEdit: (delivery: StudySchedule) => void;
  onDelete: (id: StudySchedule['id']) => void;
  onToggleComplete: (id: StudySchedule['id']) => void;
  selectedSubject: string;
  subjects: string[];
  onSubjectChange: (subject: string) => void;
  sortBy: 'algorithm' | 'subject' | 'date';
  onSortChange: (sort: 'algorithm' | 'subject' | 'date') => void;
  activeView: 'list' | 'calendar' | 'gantt';
  onViewChange: (view: 'list' | 'calendar' | 'gantt') => void;
  onAdd: () => void;
}

const buildStatusBadge = (date: string, completed: boolean) => {
  const today = new Date();
  const dueDate = parseISO(date);
  const daysUntil = differenceInDays(dueDate, today);

  if (completed) {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
        <CheckCircle className="w-3 h-3 mr-1" />
        Completada
      </Badge>
    );
  }

  if (isBefore(dueDate, today)) {
    return (
      <Badge variant="destructive" className="flex items-center">
        <XCircle className="w-3 h-3 mr-1" />
        Vencida
      </Badge>
    );
  }

  // Calcular el día de la semana actual
  const currentDayOfWeek = today.getDay();
  const daysUntilEndOfWeek = 6 - currentDayOfWeek; // Días hasta el domingo

  if (daysUntil === 1) {
    return (
      <Badge variant="secondary" className="flex items-center bg-red-100 text-red-800 hover:bg-red-100">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Mañana
      </Badge>
    );
  }

  if (daysUntil === 0) {
    return (
      <Badge variant="destructive" className="flex items-center">
        <Clock className="w-3 h-3 mr-1" />
        Hoy
      </Badge>
    );
  }

  if (daysUntil <= daysUntilEndOfWeek) {
    return (
      <Badge variant="secondary" className="flex items-center bg-orange-100 text-orange-800 hover:bg-orange-100">
        <Clock className="w-3 h-3 mr-1" />
        Esta semana
      </Badge>
    );
  }

  // Próxima semana (después de esta semana)
  const nextWeekStart = daysUntilEndOfWeek + 1;
  const nextWeekEnd = nextWeekStart + 6;

  if (daysUntil <= nextWeekEnd) {
    return (
      <Badge variant="secondary" className="flex items-center bg-blue-100 text-blue-800 hover:bg-blue-100">
        <Clock className="w-3 h-3 mr-1" />
        Próxima semana
      </Badge>
    );
  }

  if (daysUntil <= 30) {
    return (
      <Badge variant="secondary" className="flex items-center bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
        <Calendar className="w-3 h-3 mr-1" />
        Este mes
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="flex items-center bg-slate-100 text-slate-700 hover:bg-slate-100">
      <Circle className="w-3 h-3 mr-1" />
      Pendiente
    </Badge>
  );
};

const DeliveryList: React.FC<DeliveryListProps> = ({
  schedule,
  onEdit,
  onDelete,
  onToggleComplete,
  selectedSubject,
  subjects,
  onSubjectChange,
  sortBy,
  onSortChange,
  activeView,
  onViewChange,
  onAdd
}) => {
  const getProgressValue = (item: StudySchedule): number => {
    const today = new Date();

    // Si está completada, mostrar 100%
    if (item.completed) {
      return 100;
    }

    // Si ya pasó la fecha límite, mostrar 0% (ya no hay progreso posible)
    if (today >= parseISO(item.date)) {
      return 0;
    }

    // Calcular el progreso basado en la fecha límite
    // Asumimos que el trabajo debería comenzar con tiempo suficiente antes de la fecha límite
    // Para simplificar, usamos la fecha límite como el 100% y calculamos el progreso hacia atrás

    const dueDate = parseISO(item.date);

    // Si aún no es hora de comenzar, mostrar 0%
    if (today < item.startDate) {
      return 0;
    }

    // Calcular el progreso basado en el tiempo transcurrido desde el inicio hasta la fecha límite
    const totalTimeSpan = differenceInCalendarDays(dueDate, item.startDate);
    const elapsedTime = differenceInCalendarDays(today, item.startDate);

    // Si el total es muy pequeño, considerar progreso completo si ya pasó suficiente tiempo
    if (totalTimeSpan <= 0) {
      return today >= item.startDate ? 100 : 0;
    }

    const progress = Math.max(0, Math.min(100, (elapsedTime / totalTimeSpan) * 100));

    return progress;
  };

  const getProgressColor = (progressValue: number, completed: boolean = false): string => {
    // Si está completada, mostrar siempre verde
    if (completed) {
      return '#22c55e'; // Verde
    }

    // Cambia completamente el color basado en el progreso
    if (progressValue <= 33) {
      return '#22c55e'; // Verde para progreso bajo
    } else if (progressValue <= 66) {
      return '#eab308'; // Amarillo para progreso medio
    } else {
      return '#ef4444'; // Rojo para progreso alto
    }
  };

  const getDaysUntilText = (date: string): string => {
    const today = new Date();
    const dueDate = parseISO(date);
    const days = differenceInDays(dueDate, today);

    if (days < 0) {
      return `Hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? 's' : ''}`;
    }
    if (days === 0) {
      return ''; // No mostrar texto adicional para "Hoy"
    }
    if (days === 1) {
      return ''; // No mostrar texto adicional para "Mañana"
    }
    if (days === 2) {
      return 'Pasado mañana';
    }
    return `En ${days} días`;
  };

  const renderDesktopTable = () => (
    <div className="hidden 2xl:block overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-3 text-left font-semibold">Entrega</th>
            <th className="px-5 py-3 text-left font-semibold">Fecha límite</th>
            <th className="px-5 py-3 text-left font-semibold">Periodo asignado</th>
            <th className="px-5 py-3 text-left font-semibold">Progreso</th>
            <th className="px-5 py-3 text-right font-semibold">
              <div className="flex items-center justify-end gap-2">
                Acciones
                <Button
                  size="sm"
                  onClick={onAdd}
                  className="h-8 w-8 p-0"
                  title="Añadir nueva entrega"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {schedule.map(item => {
            const progressValue = getProgressValue(item);
            return (
              <tr key={item.id} className={item.completed ? 'bg-muted/20 opacity-80' : 'bg-card'}>
                <td className="px-5 py-4 align-top">
                  <div className="flex items-start gap-3">
                    <div className={`w-2.5 h-12 rounded-full ${item.color}`} />
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`font-semibold text-foreground truncate ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.subject} · {item.name}
                        </span>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground bg-muted/40 rounded px-2 py-0.5">
                          {item.priority === 'high' ? 'Alta' : item.priority === 'normal' ? 'Normal' : 'Baja'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {buildStatusBadge(item.date, item.completed)}
                        {getDaysUntilText(item.date) && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getDaysUntilText(item.date)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 align-top text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{format(parseISO(item.date), "d 'de' MMM yyyy", { locale: es })}</span>
                  </div>
                </td>
                <td className="px-5 py-4 align-top text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Inicio:</span>
                    <span>{format(item.startDate, "d 'de' MMM", { locale: es })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Fin:</span>
                    <span>{format(item.endDate, "d 'de' MMM", { locale: es })}</span>
                  </div>
                </td>
                <td className="px-5 py-4 align-top">
                  <div className="space-y-2">
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full w-full flex-1 transition-all duration-300 ease-in-out"
                        style={{
                          backgroundColor: getProgressColor(progressValue, item.completed),
                          width: `${progressValue}%`
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-3 h-3" />
                      <span>
                        {item.completed ? 'Completada' : progressValue === 0 ? 'Sin comenzar' : progressValue === 100 ? 'Completada' : `${Math.round(progressValue)}%`}
                      </span>
                      {item.warning && (
                        <Badge variant="outline" className="text-chart-3 border-chart-3">
                          <AlertTriangle className="w-3 h-3 mr-1" /> Poco tiempo
                        </Badge>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 align-top">
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleComplete(item.id)}
                      className={item.completed ? 'text-green-600 hover:bg-green-100' : 'text-green-700 hover:bg-green-50'}
                      title={item.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                      className="text-blue-600 hover:bg-blue-50"
                      title="Editar entrega"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(item.id)}
                      className="text-destructive hover:bg-destructive/10"
                      title="Eliminar entrega"
                    >
                      <Trash2 className="w-4 h-4" />
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

  const renderMobileCards = () => (
    <div className="2xl:hidden divide-y divide-border/70">
      {schedule.map(item => {
        const progressValue = getProgressValue(item);
        return (
          <div
            key={item.id}
            className={`space-y-4 p-4 ${item.completed ? 'opacity-80' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-12 rounded-full ${item.color}`} />
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={`font-semibold text-foreground truncate ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {item.subject} · {item.name}
                  </h3>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground bg-muted/40 rounded px-2 py-0.5">
                    {item.priority === 'high' ? 'Alta' : item.priority === 'normal' ? 'Normal' : 'Baja'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {buildStatusBadge(item.date, item.completed)}
                  {getDaysUntilText(item.date) && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getDaysUntilText(item.date)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full w-full flex-1 transition-all duration-300 ease-in-out"
                  style={{
                    backgroundColor: getProgressColor(progressValue, item.completed),
                    width: `${progressValue}%`
                  }}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="w-3 h-3" />
                <span>
                  {item.completed ? 'Completada' : progressValue === 0 ? 'Sin comenzar' : progressValue === 100 ? 'Completada' : `${Math.round(progressValue)}%`}
                </span>
                {item.warning && (
                  <Badge variant="outline" className="text-chart-3 border-chart-3">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Poco tiempo
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleComplete(item.id)}
                className={item.completed ? 'text-green-600 hover:bg-green-100' : 'text-green-700 hover:bg-green-50'}
                title={item.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(item)}
                className="text-blue-600 hover:bg-blue-50"
                title="Editar entrega"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(item.id)}
                className="text-destructive hover:bg-destructive/10"
                title="Eliminar entrega"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <section className="w-full">
      {/* Header fino sin caja */}
      <div className="flex flex-col gap-6 sm:gap-4 border-b border-border/60 pb-5">
        {/* Título y controles principales */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <Calendar className="w-5 h-5" />
            Entregas
          </h2>

          {/* Controles de navegación y acciones */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {/* Controles principales en una línea */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Vista */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="hidden lg:inline text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">Vista</span>
                <Select value={activeView} onValueChange={(v) => onViewChange(v as 'list' | 'calendar' | 'gantt')}>
                  <SelectTrigger className="w-[110px] sm:w-[130px] lg:w-[150px]">
                    <SelectValue placeholder="Vista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="list">Lista</SelectItem>
                    <SelectItem value="calendar">Calendario</SelectItem>
                    <SelectItem value="gantt">Gantt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Materia */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="hidden lg:inline text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">Materia</span>
                <Select value={selectedSubject} onValueChange={onSubjectChange}>
                  <SelectTrigger className="w-[130px] sm:w-[150px] lg:w-[170px]">
                    <SelectValue placeholder="Materia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las materias</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ordenar por */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="hidden lg:inline text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">Ordenar</span>
                <Select value={sortBy} onValueChange={onSortChange}>
                  <SelectTrigger className="w-[130px] sm:w-[150px] lg:w-[170px]">
                    <SelectValue placeholder="Orden" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="algorithm">Algoritmo</SelectItem>
                    <SelectItem value="subject">Materia</SelectItem>
                    <SelectItem value="date">Fecha de entrega</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Asistentes de IA - compacto */}
              <div className="flex items-center">
                <AIControls />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido con padding y sin caja externa adicional */}
      <div className="pt-6">
        {schedule.length > 0 ? (
          <div className="space-y-6">
            {renderDesktopTable()}
            {renderMobileCards()}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center text-muted-foreground">
            No hay entregas registradas. Añade la primera para comenzar a planificar tu calendario.
          </div>
        )}
      </div>
    </section>
  );
};

export default DeliveryList;
