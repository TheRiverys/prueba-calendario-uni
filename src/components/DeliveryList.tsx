
import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Edit2, Trash2, Check } from 'lucide-react';
import { format, differenceInDays, differenceInCalendarDays, isBefore, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAppContext } from '../contexts/AppContext';
import type { StudySchedule } from '../types';

interface DeliveryListProps {
  schedule: StudySchedule[];
  onEdit: (delivery: StudySchedule) => void;
  onDelete: (id: StudySchedule['id']) => void;
  onToggleComplete: (id: StudySchedule['id']) => void;
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

  if (daysUntil <= 3) {
    return (
      <Badge variant="secondary" className="flex items-center bg-amber-100 text-amber-800 hover:bg-amber-100">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Urgente
      </Badge>
    );
  }

  if (daysUntil <= 7) {
    return (
      <Badge variant="secondary" className="flex items-center bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
        <Clock className="w-3 h-3 mr-1" />
        Esta semana
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="flex items-center bg-green-100 text-green-800 hover:bg-green-100">
      <CheckCircle className="w-3 h-3 mr-1" />
      A tiempo
    </Badge>
  );
};

const getDaysUntilText = (date: string): string => {
  const today = new Date();
  const dueDate = parseISO(date);
  const days = differenceInDays(dueDate, today);

  if (days < 0) {
    return `Hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? 's' : ''}`;
  }
  if (days === 0) {
    return 'Hoy';
  }
  if (days === 1) {
    return 'Mañana';
  }
  return `En ${days} días`;
};

const getProgressValue = (item: StudySchedule): number => {
  const today = new Date();
  if (item.studyDays <= 0) {
    return 0;
  }
  if (today <= item.startDate) {
    return 0;
  }
  if (today >= item.endDate) {
    return 100;
  }
  const totalSpan = Math.max(1, differenceInCalendarDays(item.endDate, item.startDate) + 1);
  const elapsedSpan = Math.max(0, differenceInCalendarDays(today, item.startDate));
  return Math.max(0, Math.min(100, (elapsedSpan / totalSpan) * 100));
};

const DeliveryList: React.FC<DeliveryListProps> = ({ schedule, onEdit, onDelete, onToggleComplete }) => {
  const { sortBy, setSortBy } = useAppContext();

  const renderDesktopTable = () => (
    <div className="hidden 2xl:block overflow-hidden rounded-xl border border-border/70 bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-3 text-left font-semibold">Entrega</th>
            <th className="px-5 py-3 text-left font-semibold">Fecha límite</th>
            <th className="px-5 py-3 text-left font-semibold">Periodo asignado</th>
            <th className="px-5 py-3 text-left font-semibold">Progreso</th>
            <th className="px-5 py-3 text-right font-semibold">Acciones</th>
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
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getDaysUntilText(item.date)}
                        </span>
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
                    <Progress
                      value={progressValue}
                      className={`h-2 ${
                        differenceInCalendarDays(item.endDate, new Date()) <= 3 && new Date() < item.endDate
                          ? '[&>div]:bg-chart-3'
                          : new Date() >= item.endDate
                            ? '[&>div]:bg-destructive'
                            : '[&>div]:bg-chart-1'
                      }`}
                    />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-3 h-3" />
                      <span>
                        {progressValue === 0 ? 'Sin comenzar' : progressValue === 100 ? 'Completado' : `${Math.round(progressValue)}%`}
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
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleComplete(item.id)}
                      className={item.completed ? 'text-green-600 hover:bg-green-100' : 'text-muted-foreground hover:bg-muted'}
                      title={item.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                      className="text-chart-1 hover:bg-chart-1/10"
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
    <div className="space-y-4 2xl:hidden">
      {schedule.map(item => {
        const progressValue = getProgressValue(item);
        return (
          <div
            key={item.id}
            className={`space-y-4 rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm ${
              item.completed ? 'opacity-80' : ''
            }`}
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
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getDaysUntilText(item.date)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="space-y-1">
                <span className="font-medium text-foreground">Fecha límite</span>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{format(parseISO(item.date), "d 'de' MMM yyyy", { locale: es })}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-foreground">Periodo asignado</span>
                <div className="flex items-center gap-2">
                  <span>{format(item.startDate, "d 'de' MMM", { locale: es })}</span>
                  <span>→</span>
                  <span>{format(item.endDate, "d 'de' MMM", { locale: es })}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Progress
                value={progressValue}
                className={`h-2 ${
                  differenceInCalendarDays(item.endDate, new Date()) <= 3 && new Date() < item.endDate
                    ? '[&>div]:bg-chart-3'
                    : new Date() >= item.endDate
                      ? '[&>div]:bg-destructive'
                      : '[&>div]:bg-chart-1'
                }`}
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="w-3 h-3" />
                <span>
                  {progressValue === 0 ? 'Sin comenzar' : progressValue === 100 ? 'Completado' : `${Math.round(progressValue)}%`}
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
                className={item.completed ? 'text-green-600 hover:bg-green-100' : 'text-muted-foreground hover:bg-muted'}
                title={item.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(item)}
                className="text-chart-1 hover:bg-chart-1/10"
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
    <Card className="border border-border/60 shadow-sm">
      <CardHeader className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <Calendar className="w-5 h-5" />
            Agenda de entregas
          </CardTitle>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Revisa el estado de cada entrega, ajusta periodos de estudio y controla tu progreso diario.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="hidden lg:inline text-xs uppercase tracking-wide">Ordenar por</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar orden" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="algorithm">Algoritmo</SelectItem>
              <SelectItem value="subject">Materia</SelectItem>
              <SelectItem value="date">Fecha de entrega</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-6">
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
      </CardContent>
    </Card>
  );
};

export default DeliveryList;
