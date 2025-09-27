import React from 'react';
import { List, Calendar, BarChart3, Plus, Upload, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ControlsProps {
  activeView: 'list' | 'calendar' | 'gantt';
  onViewChange: (view: 'list' | 'calendar' | 'gantt') => void;
  onAddClick: () => void;
  selectedSubject: string;
  subjects: string[];
  onSubjectChange: (subject: string) => void;
  sortBy: 'algorithm' | 'subject' | 'date';
  onSortChange: (sort: 'algorithm' | 'subject' | 'date') => void;
  semesterStart: string;
  onSemesterStartChange: (date: string) => void;
  onImportClick: () => void;
  onExportClick: () => void;
  disableExport: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  activeView,
  onViewChange,
  onAddClick,
  selectedSubject,
  subjects,
  onSubjectChange,
  sortBy,
  onSortChange,
  semesterStart,
  onSemesterStartChange,
  onImportClick,
  onExportClick,
  disableExport
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="bg-card border rounded-lg p-6 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          {/* Selector de vista y botón añadir */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                onClick={() => onViewChange('list')}
                variant={activeView === 'list' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <List className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Lista</span>
                <span className="xs:hidden">List</span>
              </Button>

              <Button
                onClick={() => onViewChange('calendar')}
                variant={activeView === 'calendar' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Calendar className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Calendario</span>
                <span className="xs-hidden">Cal</span>
              </Button>

              <Button
                onClick={() => onViewChange('gantt')}
                variant={activeView === 'gantt' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Gantt</span>
                <span className="xs-hidden">Gnt</span>
              </Button>
            </div>

            <Button onClick={onAddClick} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Añadir entrega</span>
              <span className="sm:hidden">Añadir</span>
            </Button>
          </div>

          {/* Inicio del semestre */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
            <label className="controls-label">Inicio del semestre:</label>
            <Input
              type="date"
              value={semesterStart}
              onChange={(event) => onSemesterStartChange(event.target.value)}
              className="w-full sm:w-auto sm:min-w-48"
            />
          </div>
        </div>

        {/* Controles de filtro y ordenación */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
            <label className="controls-label">Materia:</label>
            <Select value={selectedSubject} onValueChange={onSubjectChange}>
              <SelectTrigger className="w-full sm:w-auto sm:min-w-48">
                <SelectValue placeholder="Seleccionar materia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las materias</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
            <label className="controls-label">Ordenar por:</label>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-full sm:w-auto sm:min-w-40">
                <SelectValue placeholder="Seleccionar orden" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="algorithm">Algoritmo</SelectItem>
                <SelectItem value="subject">Materia</SelectItem>
                <SelectItem value="date">Fecha de entrega</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Importación y exportación */}
        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Importar entregas</p>
              <p className="text-xs text-muted-foreground">
                Usa un archivo CSV o Excel con columnas: Asignatura, Título, Fecha (AAAA-MM-DD). La primera fila puede ser un encabezado.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onImportClick}>
              <Upload className="w-4 h-4 mr-2" />
              Importar CSV/Excel
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Exportar calendario</p>
              <p className="text-xs text-muted-foreground">
                Descarga un archivo .ics con las entregas para cargarlo en tu calendario.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onExportClick} disabled={disableExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar .ics
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
