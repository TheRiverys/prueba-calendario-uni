import React from 'react';
import { Sparkles, Brain, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { useAppContext } from '../contexts/AppContext';
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
    summary: hours !== null ? `${hours.toFixed(1)} h · ${task}` : task
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
    deliveries
  } = useAppContext();

  const [schedulePreview, setSchedulePreview] = React.useState<AiSchedulePreview[]>([]);
  const [analysis, setAnalysis] = React.useState<string>('');
  const [infoMessage, setInfoMessage] = React.useState<string>('');
  const [lastAppliedAt, setLastAppliedAt] = React.useState<string | null>(null);

  const hasDeliveries = deliveries.length > 0;

  const handleGenerateSchedule = async () => {
    const result = await generateStudySchedule();
    const normalized = result.entries
      .map(normalizeScheduleEntry)
      .filter((item): item is AiSchedulePreview => item !== null);

    setSchedulePreview(normalized);

    if (result.applied) {
      setInfoMessage('Plan de IA aplicado a las entregas.');
      setLastAppliedAt(new Date().toISOString());
    } else if (result.entries.length === 0) {
      setInfoMessage('No se pudo generar un plan con IA. Se mantiene el algoritmo original.');
      setLastAppliedAt(null);
    } else {
      setInfoMessage('Se generó un horario, pero no se encontraron entregas coincidentes para aplicarlo.');
      setLastAppliedAt(null);
    }
  };

  const handleAnalyzeProgress = async () => {
    const result = await analyzeProgress();
    setAnalysis(result.trim());
  };

  const handleResetSchedule = () => {
    clearAiSchedule();
    setSchedulePreview([]);
    setLastAppliedAt(null);
    setInfoMessage('Planificación restaurada al algoritmo base.');
  };

  const preview = schedulePreview.slice(0, 5);
  const remainingItems = Math.max(0, schedulePreview.length - preview.length);

  return (
    <div className="border-t border-border pt-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">Asistentes de IA</p>
          <p className="text-xs text-muted-foreground">
            Genera un horario sugerido o recibe recomendaciones personalizadas según tus entregas.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleGenerateSchedule}
            disabled={aiLoading || !hasDeliveries}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {aiLoading ? 'Generando...' : 'Horario con IA'}
          </Button>
          <Button
            variant="outline"
            onClick={handleAnalyzeProgress}
            disabled={aiLoading || !hasDeliveries}
          >
            <Brain className="w-4 h-4 mr-2" />
            {aiLoading ? 'Analizando...' : 'Análisis IA'}
          </Button>
          <Button
            variant="ghost"
            onClick={handleResetSchedule}
            disabled={aiLoading || !aiScheduleApplied}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar algoritmo
          </Button>
        </div>
      </div>

      {!hasDeliveries && (
        <p className="text-xs text-muted-foreground">
          Agrega entregas para habilitar las sugerencias automáticas.
        </p>
      )}

      {infoMessage && (
        <p className="text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
          {infoMessage}
        </p>
      )}

      {lastAppliedAt && (
        <p className="text-2xs text-muted-foreground">
          Última actualización IA: {new Date(lastAppliedAt).toLocaleString()}
        </p>
      )}

      {aiError && (
        <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {aiError}
        </p>
      )}

      {preview.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">
            Horario sugerido (primeras {preview.length} entradas)
          </p>
          <div className="grid gap-2 text-xs">
            {preview.map(entry => (
              <div
                key={`${entry.date}-${entry.subject}-${entry.summary}`}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center bg-muted/40 rounded-md px-3 py-2"
              >
                <span className="font-medium text-foreground">{entry.date}</span>
                <span className="text-muted-foreground sm:text-center">{entry.subject}</span>
                <span className="sm:text-right text-foreground">{entry.summary}</span>
              </div>
            ))}
          </div>
          {remainingItems > 0 && (
            <p className="text-xs text-muted-foreground italic">
              ...y {remainingItems} entradas adicionales disponibles en el horario completo.
            </p>
          )}
        </div>
      )}

      {analysis.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">Recomendaciones de progreso</p>
          <p className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/40 rounded-md px-3 py-2">
            {analysis}
          </p>
        </div>
      )}
    </div>
  );
};
