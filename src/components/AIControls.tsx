import React from 'react';
import { Sparkles, MessageSquare, Undo2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useAiContext } from '@/contexts/ai/AiContext';
import { useDeliveriesContext } from '@/contexts/deliveries/DeliveriesContext';
import type { AiDetailedEntry } from '../types';

interface AiSchedulePreview {
  date: string;
  subject: string;
  summary: string;
}

const toIsoDate = (value: string): string | null => {
  const trimmed = value.trim();
  const candidate = trimmed.length > 0 ? trimmed : value;
  if (!candidate) {
    return null;
  }
  const parsed = new Date(candidate);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString().split('T')[0];
};

const normalizeScheduleEntry = (entry: AiDetailedEntry): AiSchedulePreview | null => {
  const date = toIsoDate(entry.date);
  if (!date) {
    return null;
  }

  const subject = entry.subject?.trim().length > 0 ? entry.subject.trim() : 'Entrega';
  const task = entry.task?.trim().length > 0 ? entry.task.trim() : 'Sesión de estudio';
  const hours = Number.isFinite(entry.hours) ? Math.max(0, entry.hours) : null;

  return {
    date,
    subject,
    summary: hours !== null ? `${hours.toFixed(1)} h ${task}` : task,
  };
};

export const AIControls: React.FC = () => {
  const {
    generateStudySchedule,
    analyzeProgress,
    clearAiSchedule,
    aiScheduleApplied,
    aiLoading,
    aiError,
  } = useAiContext();
  const { deliveries } = useDeliveriesContext();

  const [schedulePreview, setSchedulePreview] = React.useState<AiSchedulePreview[]>([]);
  const [analysis, setAnalysis] = React.useState<string>('');
  const [analysisOpen, setAnalysisOpen] = React.useState<boolean>(false);
  const [infoMessage, setInfoMessage] = React.useState<string>('');

  const hasDeliveries = deliveries.length > 0;

  const handleGenerateSchedule = async () => {
    const result = await generateStudySchedule();
    const normalized = result.entries
      .map(normalizeScheduleEntry)
      .filter((item): item is AiSchedulePreview => item !== null);

    setSchedulePreview(normalized);

    if (result.applied) {
      setInfoMessage('Plan de IA aplicado a las entregas.');
    } else if (result.entries.length === 0) {
      setInfoMessage('No se pudo generar un plan con IA. Se mantiene el algoritmo original.');
    } else {
      setInfoMessage(
        'Se generó un horario, pero no se encontraron entregas coincidentes para aplicarlo.'
      );
    }
  };

  const handleAnalyzeProgress = async () => {
    const result = await analyzeProgress();
    setAnalysis(result.trim());
    setAnalysisOpen(true);
  };

  const handleResetSchedule = () => {
    clearAiSchedule();
    setSchedulePreview([]);
    setInfoMessage('Planificación restaurada al algoritmo base.');
  };

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex flex-wrap gap-2'>
        <Button
          size='sm'
          variant='outline'
          onClick={handleGenerateSchedule}
          disabled={aiLoading || !hasDeliveries}
          className='flex items-center gap-2 text-xs'
          title='Generar horario con IA'
        >
          <Sparkles className='w-4 h-4' />
          <span className='hidden sm:inline'>Horario IA</span>
          <span className='sm:hidden'>IA</span>
        </Button>

        <Button
          size='sm'
          variant='outline'
          onClick={handleAnalyzeProgress}
          disabled={aiLoading || !hasDeliveries}
          className='flex items-center gap-2 text-xs'
          title='Analizar progreso con IA'
        >
          <MessageSquare className='w-4 h-4' />
          <span className='hidden sm:inline'>Análisis</span>
          <span className='sm:hidden'>Análisis</span>
        </Button>

        <Button
          size='sm'
          variant='ghost'
          onClick={handleResetSchedule}
          disabled={aiLoading || !aiScheduleApplied}
          className='flex items-center gap-2 text-xs'
          title='Restaurar algoritmo por defecto'
        >
          <Undo2 className='w-4 h-4' />
          <span className='hidden sm:inline'>Reset</span>
          <span className='sm:hidden'>Reset</span>
        </Button>
      </div>

      {!hasDeliveries && (
        <p className='text-xs text-muted-foreground'>Agrega entregas para usar IA.</p>
      )}

      {infoMessage && (
        <p className='text-xs text-muted-foreground bg-muted/40 rounded-md px-2 py-1'>
          {infoMessage}
        </p>
      )}

      {aiError && (
        <p className='text-xs text-destructive bg-destructive/10 rounded-md px-2 py-1'>{aiError}</p>
      )}

      {schedulePreview.length > 0 && (
        <div className='text-xs text-muted-foreground bg-muted/20 rounded-md px-2 py-1'>
          Horario IA: {schedulePreview.length} sesiones generadas
        </div>
      )}

      <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
        <DialogContent className='sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle>Análisis de progreso</DialogTitle>
          </DialogHeader>
          <div className='max-h-[60vh] overflow-auto'>
            {analysis ? (
              <div className='space-y-3'>
                <div className='text-xs text-muted-foreground'>Resumen generado por IA:</div>
                <div className='text-sm whitespace-pre-wrap bg-muted/40 rounded-md px-3 py-2'>
                  {analysis}
                </div>
              </div>
            ) : (
              <div className='text-sm text-muted-foreground'>
                No hay análisis disponible todavía.
              </div>
            )}
          </div>
          <div className='flex justify-end'>
            <Button variant='outline' onClick={() => setAnalysisOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
