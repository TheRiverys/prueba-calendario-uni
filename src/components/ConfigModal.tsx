import { Upload, Download } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { useAuthContext } from '@/contexts/auth/AuthContext';
import { useConfigContext } from '@/contexts/config/ConfigContext';
import { useDeliveriesContext } from '@/contexts/deliveries/DeliveriesContext';
import { useScheduleContext } from '@/contexts/schedule/ScheduleContext';
import type { ImportValidationError } from '@/types';
import { pickColorForSubject } from '@/utils/colors';
import { createIcsCalendar } from '@/utils/ics';
import { parseDeliveriesFile } from '@/utils/importers';

const COLUMN_DISPLAY_NAMES: Record<ImportValidationError['column'], string> = {
  subject: 'Materia',
  name: 'Tí­tulo',
  dueDate: 'Fecha de entrega',
  structure: 'Estructura del archivo',
  header: 'Cabecera',
};

const MAX_ERRORS_IN_TOAST = 5;

const formatImportErrors = (importErrors: ImportValidationError[]): string => {
  if (importErrors.length === 0) {
    return '';
  }

  const lines = importErrors.slice(0, MAX_ERRORS_IN_TOAST).map(error => {
    const label = COLUMN_DISPLAY_NAMES[error.column];
    const location = error.row > 0 ? `Fila ${error.row}` : 'General';
    const suffix = label ? ` (${label})` : '';
    return `- ${location}${suffix}: ${error.message}`;
  });

  if (importErrors.length > MAX_ERRORS_IN_TOAST) {
    lines.push(`- ...${importErrors.length - MAX_ERRORS_IN_TOAST} error(es) adicional(es)`);
  }

  return lines.join('\n');
};

export const ConfigModal: React.FC = () => {
  const { config, updateConfig, resetConfig, configModalOpen, closeConfigModal } =
    useConfigContext();
  const { deliveries, addDeliveries } = useDeliveriesContext();
  const { fullSchedule } = useScheduleContext();
  const { user } = useAuthContext();

  const importInputRef = React.useRef<HTMLInputElement | null>(null);

  const totalDaysByPriority = {
    high: Math.max(1, config.baseStudyDays + config.priorityVariations.high),
    normal: Math.max(1, config.baseStudyDays + config.priorityVariations.normal),
    low: Math.max(1, config.baseStudyDays + config.priorityVariations.low),
  } as const;

  const handleSave = (): void => {
    closeConfigModal();
  };

  const handleReset = (): void => {
    resetConfig();
  };

  const handleOpenChange = (open: boolean): void => {
    if (!open) {
      closeConfigModal();
    }
  };

  const handleImportClick = (): void => {
    if (!user) {
      return;
    }
    importInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (!user) {
      return;
    }
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const { deliveries: importedRows, errors: importErrors } = await parseDeliveriesFile(file);

      if (importedRows.length === 0) {
        if (importErrors.length > 0) {
          toast.error('No se importó ninguna entrega.', {
            description: formatImportErrors(importErrors),
          });
        } else {
          toast.error('No se encontraron filas válidas en el archivo.');
        }
        return;
      }

      const newDeliveries = importedRows.map(row => ({
        subject: row.subject,
        name: row.name,
        date: row.dueDate,
        priority: 'normal' as const,
        color: pickColorForSubject(row.subject, deliveries),
      }));

      addDeliveries(newDeliveries);

      if (importErrors.length > 0) {
        toast.warning(`Se importaron ${newDeliveries.length} entregas con incidencias.`, {
          description: formatImportErrors(importErrors),
        });
      } else {
        toast.success(`Se importaron ${newDeliveries.length} entregas correctamente.`);
      }
    } catch (error) {
      toast.error('No se pudo importar el archivo.', {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      event.target.value = '';
    }
  };

  const handleExport = (): void => {
    if (!user) {
      return;
    }
    if (fullSchedule.length === 0) {
      toast.info('No hay entregas para exportar.');
      return;
    }

    try {
      const calendar = createIcsCalendar(fullSchedule);
      const blob = new globalThis.Blob([calendar], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'academic-suite.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Archivo .ics generado correctamente.');
    } catch (error) {
      toast.error('No se pudo generar el archivo .ics.', {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <Dialog open={configModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Configuración</DialogTitle>
          <DialogDescription>
            Ajusta los parámetros del planificador, importa entregas o exporta tu calendario.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-8'>
          <section className='space-y-4'>
            <div className='flex flex-col gap-1'>
              <h3 className='text-foreground text-base font-semibold'>Planificación base</h3>
              <p className='text-muted-foreground text-sm'>
                Configura los días de estudio predeterminados.
              </p>
            </div>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='baseStudyDays'>Días base de estudio</Label>
                <Input
                  id='baseStudyDays'
                  type='number'
                  value={config.baseStudyDays}
                  onChange={event =>
                    updateConfig({ baseStudyDays: parseInt(event.target.value, 10) || 0 })
                  }
                />
                <p className='text-muted-foreground text-xs'>
                  Días mínimos que se asignarán a cada entrega.
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='minStudyTime'>Tiempo mínimo por sesión (horas)</Label>
                <Input
                  id='minStudyTime'
                  type='number'
                  value={config.minStudyTime}
                  onChange={event =>
                    updateConfig({ minStudyTime: parseInt(event.target.value, 10) || 0 })
                  }
                />
                <p className='text-muted-foreground text-xs'>
                  Duración mínima recomendada de cada sesión.
                </p>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='allocationWindowDays'>Ventana de asignación (días)</Label>
              <Input
                id='allocationWindowDays'
                type='number'
                value={config.allocationWindowDays}
                onChange={event =>
                  updateConfig({ allocationWindowDays: parseInt(event.target.value, 10) || 0 })
                }
              />
              <p className='text-muted-foreground text-xs'>
                Define cuántos días alrededor de una entrega puede extenderse el plan.
              </p>
            </div>
          </section>

          <section className='border-border space-y-4 border-t pt-6'>
            <div className='flex flex-col gap-1'>
              <h3 className='text-foreground text-base font-semibold'>Prioridades</h3>
              <p className='text-muted-foreground text-sm'>
                Ajusta variaciones de tiempo según la prioridad.
              </p>
            </div>

            <div className='grid gap-4 md:grid-cols-3'>
              <div className='space-y-2'>
                <Label htmlFor='highPriority'>Prioridad alta</Label>
                <Input
                  id='highPriority'
                  type='number'
                  value={config.priorityVariations.high}
                  onChange={event =>
                    updateConfig({
                      priorityVariations: {
                        ...config.priorityVariations,
                        high: parseInt(event.target.value, 10) || 0,
                      },
                    })
                  }
                />
                <p className='text-muted-foreground text-xs'>días extra respecto al valor base</p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='normalPriority'>Prioridad normal</Label>
                <Input
                  id='normalPriority'
                  type='number'
                  value={config.priorityVariations.normal}
                  onChange={event =>
                    updateConfig({
                      priorityVariations: {
                        ...config.priorityVariations,
                        normal: parseInt(event.target.value, 10) || 0,
                      },
                    })
                  }
                />
                <p className='text-muted-foreground text-xs'>días respecto al valor base</p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='lowPriority'>Prioridad baja</Label>
                <Input
                  id='lowPriority'
                  type='number'
                  value={config.priorityVariations.low}
                  onChange={event =>
                    updateConfig({
                      priorityVariations: {
                        ...config.priorityVariations,
                        low: parseInt(event.target.value, 10) || 0,
                      },
                    })
                  }
                />
                <p className='text-muted-foreground text-xs'>días menos</p>
              </div>
            </div>

            <div className='bg-muted rounded-md p-3'>
              <p className='mb-2 text-sm font-medium'>Ejemplo</p>
              <p className='text-muted-foreground text-sm'>
                Con {config.baseStudyDays} días base, prioridad alta reservar{' '}
                {totalDaysByPriority.high} días, normal {totalDaysByPriority.normal} y baja{' '}
                {totalDaysByPriority.low}.
              </p>
            </div>
          </section>
          <section className='border-border space-y-4 border-t pt-6'>
            <div className='flex flex-col gap-1'>
              <h3 className='text-foreground text-base font-semibold'>Configuración de IA</h3>
              <p className='text-muted-foreground text-sm'>Clave API para funciones de IA.</p>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='openaiApiKey'>Clave API de OpenAI</Label>
              <Input
                id='openaiApiKey'
                type='password'
                placeholder='sk-...'
                value={config.openaiApiKey}
                onChange={event => updateConfig({ openaiApiKey: event.target.value })}
              />
              <p className='text-muted-foreground text-xs'>
                Necesaria para generación de planes y análisis. Se almacena localmente.
              </p>
            </div>
          </section>

          <section className='border-border space-y-6 border-t pt-6'>
            <div className='flex flex-col gap-1'>
              <h3 className='text-foreground text-base font-semibold'>Importar y exportar datos</h3>
              <p className='text-muted-foreground text-sm'>
                Gestiona tus entregas desde/ hacia archivos.
              </p>
            </div>
            <div className='grid gap-6 md:grid-cols-2'>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label className='text-sm font-medium'>Importar entregas</Label>
                  {user ? (
                    <div className='border-border/70 bg-muted/20 text-muted-foreground flex flex-col gap-3 rounded-lg border border-dashed p-4 text-sm'>
                      <p>Sube un CSV o Excel con columnas: materia, título y fecha (AAAA-MM-DD).</p>
                      <Button
                        variant='outline'
                        size='sm'
                        className='self-start'
                        onClick={handleImportClick}
                      >
                        <Upload className='mr-2 h-4 w-4' />
                        Importar archivo
                      </Button>
                    </div>
                  ) : (
                    <div className='border-border/70 bg-muted/20 text-muted-foreground flex flex-col gap-3 rounded-lg border border-dashed p-4 text-sm'>
                      <p className='text-center'>
                        Regístrate o inicia sesión para importar entregas desde archivos
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label className='text-sm font-medium'>Exportar calendario</Label>
                  {user ? (
                    <div className='border-border/70 bg-muted/20 text-muted-foreground flex flex-col gap-3 rounded-lg border border-dashed p-4 text-sm'>
                      <p>
                        Descarga un .ics para añadir tus entregas a cualquier calendario compatible.
                      </p>
                      <Button
                        variant='outline'
                        size='sm'
                        className='self-start'
                        onClick={handleExport}
                        disabled={fullSchedule.length === 0}
                      >
                        <Download className='mr-2 h-4 w-4' />
                        Exportar .ics
                      </Button>
                    </div>
                  ) : (
                    <div className='border-border/70 bg-muted/20 text-muted-foreground flex flex-col gap-3 rounded-lg border border-dashed p-4 text-sm'>
                      <p className='text-center'>
                        Regístrate o inicia sesión para exportar al calendario
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <input
          ref={importInputRef}
          type='file'
          accept='.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          className='hidden'
          onChange={handleFileChange}
          aria-label='Archivo de importación'
        />

        <DialogFooter className='gap-2 sm:justify-end sm:gap-3'>
          <Button variant='outline' onClick={handleReset} className='w-full sm:w-auto'>
            Restaurar valores por defecto
          </Button>
          <Button onClick={handleSave} className='w-full sm:w-auto'>
            Guardar configuración
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
