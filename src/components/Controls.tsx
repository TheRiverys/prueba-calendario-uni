
import React from 'react';
import { List, Calendar, BarChart3, Plus, Upload, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AIControls } from './AIControls';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ControlsProps {
  activeView: 'list' | 'calendar' | 'gantt';
  onViewChange: (view: 'list' | 'calendar' | 'gantt') => void;
  onAddClick: () => void;
  selectedSubject: string;
  subjects: string[];
  onSubjectChange: (subject: string) => void;
  semesterStart: string;
  onSemesterStartChange: (date: string) => void;
  onImportClick: () => void;
  onExportClick: () => void;
  disableExport: boolean;
}

const viewButtons = [
  { key: 'list' as const, label: 'Lista', icon: List },
  { key: 'calendar' as const, label: 'Calendario', icon: Calendar },
  { key: 'gantt' as const, label: 'Gantt', icon: BarChart3 }
];

export const Controls: React.FC<ControlsProps> = ({
  activeView,
  onViewChange,
  onAddClick,
  selectedSubject,
  subjects,
  onSubjectChange,
  semesterStart,
  onSemesterStartChange,
  onImportClick,
  onExportClick,
  disableExport
}) => {
  return (
    <section className="mt-8 w-full px-4 sm:px-6 lg:px-10 xl:px-14">
      <Card className="mx-auto w-full max-w-[1800px] border border-border/70 shadow-sm">
        <CardHeader className="border-b border-border/60 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Panel de planificación</CardTitle>
              <CardDescription>
                Cambia de vista, ajusta filtros y sincroniza tus entregas con otras herramientas desde un único espacio.
              </CardDescription>
            </div>
            <Button onClick={onAddClick} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Añadir entrega
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vistas</span>
              <div className="flex flex-wrap items-center gap-2">
                {viewButtons.map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    onClick={() => onViewChange(key)}
                    variant={activeView === key ? 'default' : 'outline'}
                    size="sm"
                    className="min-w-[104px] justify-center"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="uppercase tracking-wide">Inicio del semestre</span>
              <Input
                type="date"
                value={semesterStart}
                onChange={event => onSemesterStartChange(event.target.value)}
                className="w-[180px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Materia</span>
              <Select value={selectedSubject} onValueChange={onSubjectChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar materia" />
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

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Importar entregas</span>
              <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground">
                <p>Sube un CSV o Excel con columnas: materia, título y fecha (AAAA-MM-DD).</p>
                <Button variant="outline" size="sm" className="self-start" onClick={onImportClick}>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar archivo
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Exportar calendario</span>
              <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground">
                <p>Descarga un .ics para añadir tus entregas a cualquier calendario compatible.</p>
                <Button variant="outline" size="sm" className="self-start" onClick={onExportClick} disabled={disableExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar .ics
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <AIControls />
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
