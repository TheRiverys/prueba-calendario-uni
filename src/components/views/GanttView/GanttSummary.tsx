import { AlertTriangle, BarChart3, Calendar, Clock } from 'lucide-react';
import React from 'react';

import type { StudySchedule } from '@/types';

interface GanttSummaryProps {
  readonly schedule: StudySchedule[];
}

export const GanttSummary: React.FC<GanttSummaryProps> = ({ schedule }) => {
  const totalDeliveries = schedule.length;
  const totalStudyDays = schedule.reduce((acc, item) => acc + item.studyDays, 0);
  const averageStudyDays = totalDeliveries > 0 ? Math.round(totalStudyDays / totalDeliveries) : 0;

  return (
    <div className='border-border mt-6 space-y-4 border-t pt-4'>
      <div className='text-muted-foreground flex flex-wrap gap-4 text-sm'>
        <div className='flex items-center space-x-2'>
          <div className='bg-muted-foreground/30 border-border h-3 w-8 rounded border' />
          <span>Período de estudio</span>
        </div>
        <div className='flex items-center space-x-2'>
          <div className='bg-muted-foreground border-background h-4 w-4 rounded-full border-2 shadow-md' />
          <span>Fecha de entrega</span>
        </div>
        <div className='flex items-center space-x-2'>
          <div className='bg-destructive h-4 w-0.5' />
          <span>Hoy</span>
        </div>
        <div className='flex items-center space-x-2'>
          <AlertTriangle className='text-chart-3 h-4 w-4' />
          <span>Menos de 4 días de estudio</span>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <SummaryCard
          icon={<Calendar className='text-primary dark:text-primary h-4 w-4' />}
          label='Total de entregas'
          value={totalDeliveries}
          iconContainerClass='bg-primary/10 dark:bg-primary/5 rounded-full p-2'
        />
        <SummaryCard
          icon={<Clock className='h-4 w-4 text-blue-600 dark:text-blue-400' />}
          label='Días totales de estudio'
          value={totalStudyDays}
          iconContainerClass='rounded-full bg-blue-500/10 p-2 dark:bg-blue-500/5'
        />
        <SummaryCard
          icon={<BarChart3 className='h-4 w-4 text-green-600 dark:text-green-400' />}
          label='Promedio días/entrega'
          value={averageStudyDays}
          iconContainerClass='rounded-full bg-green-500/10 p-2 dark:bg-green-500/5'
        />
      </div>
    </div>
  );
};

interface SummaryCardProps {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: number;
  readonly iconContainerClass: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, label, value, iconContainerClass }) => {
  return (
    <div className='bg-card border-border flex items-center justify-between rounded-lg border p-3 shadow-sm'>
      <div className='flex items-center gap-3'>
        <div className={iconContainerClass}>{icon}</div>
        <span className='text-card-foreground text-sm font-medium'>{label}</span>
      </div>
      <p className='text-card-foreground text-2xl font-bold tabular-nums'>{value}</p>
    </div>
  );
};
