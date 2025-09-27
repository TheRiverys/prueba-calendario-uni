import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Edit2, Trash2, Check } from 'lucide-react';
import { format, differenceInDays, differenceInCalendarDays, isBefore, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

// Interfaces
interface StudySchedule {
  id: number;
  subject: string;
  name: string;
  date: string;
  color: string;
  completed: boolean;
  priority: 'low' | 'normal' | 'high';
  startDate: Date;
  endDate: Date;
  studyDays: number;
  warning: boolean;
  calculatedDays?: number;
}

interface DeliveryListProps {
  schedule: StudySchedule[];
  onEdit: (delivery: StudySchedule) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (id: number) => void;
}

const DeliveryList: React.FC<DeliveryListProps> = ({ schedule, onEdit, onDelete, onToggleComplete }) => {
  const today = new Date();

  const getStatusBadge = (date: string) => {
    const dueDate = parseISO(date);
    const daysUntil = differenceInDays(dueDate, today);

    if (isBefore(dueDate, today)) {
      return (
        <Badge variant="destructive" className="flex items-center">
          <XCircle className="w-3 h-3 mr-1" />
          Vencida
        </Badge>
      );
    } else if (daysUntil <= 3) {
      return (
        <Badge variant="secondary" className="flex items-center bg-amber-100 text-amber-800 hover:bg-amber-100">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Urgente
        </Badge>
      );
    } else if (daysUntil <= 7) {
      return (
        <Badge variant="secondary" className="flex items-center bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="w-3 h-3 mr-1" />
          Esta semana
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="flex items-center bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          A tiempo
        </Badge>
      );
    }
  };

  const getDaysUntilText = (date: string): string => {
    const dueDate = parseISO(date);
    const days = differenceInDays(dueDate, today);

    if (days < 0) {
      return `Hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? 's' : ''}`;
    } else if (days === 0) {
      return 'Hoy';
    } else if (days === 1) {
      return 'Mañana';
    } else {
      return `En ${days} días`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Lista de Entregas
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {schedule.map((item) => (
          <Card key={item.id} className={`transition-all hover:shadow-md ${
            item.completed ? 'opacity-75 border-green-200 bg-green-50/30' : ''
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Header con título y status */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.color}`} />
                    <h3 className={`font-medium text-base truncate ${
                      item.completed
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground'
                    }`}>
                      {item.subject} - {item.name}
                    </h3>
                    <div className="flex gap-2 flex-shrink-0">
                      {item.completed && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completada
                        </Badge>
                      )}
                      {!item.completed && getStatusBadge(item.date)}
                    </div>
                  </div>

                  {/* Información de fechas */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(parseISO(item.date), "d 'de' MMM yyyy", { locale: es })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{getDaysUntilText(item.date)}</span>
                    </div>
                  </div>

                  {/* Período de estudio */}
                  <div className="bg-muted/30 rounded-lg p-3 mb-3">
                    <div className="text-sm font-medium text-foreground mb-1">
                      Período de estudio recomendado
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Inicio:</span>
                        <span>{format(item.startDate, "d 'de' MMM", { locale: es })}</span>
                        <span className="font-medium">Fin:</span>
                        <span>{format(item.endDate, "d 'de' MMM", { locale: es })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Duración:</span>
                        <span>{item.studyDays} días</span>
                        {item.warning && (
                          <Badge variant="outline" className="text-chart-3 border-chart-3 text-xs ml-2">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Poco tiempo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className='space-y-2'>
                    <Progress
                      value={(() => {
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
                      })()}
                      className={`h-2 ${
                        today >= item.endDate
                          ? '[&>div]:bg-destructive'
                          : differenceInCalendarDays(item.endDate, today) <= 3
                          ? '[&>div]:bg-chart-3'
                          : '[&>div]:bg-chart-1'
                      }`}
                    />
                    <div className='text-xs text-muted-foreground'>
                      {(() => {
                        const remaining = differenceInCalendarDays(item.endDate, today);
                        if (remaining < 0) {
                          return 'Entrega vencida';
                        }
                        if (today < item.startDate) {
                          return 'Periodo de estudio no iniciado';
                        }
                        if (remaining === 0) {
                          return 'Último día de estudio';
                        }
                        return `Quedan ${remaining} días`;
                      })()}
                    </div>

                  </div>

                </div>

                {/* Botones de acción */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleComplete(item.id)}
                    className={item.completed
                      ? 'text-green-600 hover:bg-green-100'
                      : 'text-muted-foreground hover:bg-muted'
                    }
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
            </CardContent>
          </Card>
        ))}

        {schedule.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No hay entregas para mostrar
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryList;




