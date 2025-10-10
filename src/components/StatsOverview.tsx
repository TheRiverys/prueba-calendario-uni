import { ClipboardList, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import React from 'react';

interface StatsOverviewProps {
  readonly stats: {
    total: number;
    upcoming: number;
    overdue: number;
    thisWeek: number;
  };
}

const statsConfig = [
  {
    key: 'total',
    label: 'Total de entregas',
    icon: ClipboardList,
    accent: 'text-foreground',
    bgColor: 'bg-card',
    borderColor: 'border-border',
  },
  {
    key: 'upcoming',
    label: 'Próximas',
    icon: Clock,
    accent: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    key: 'thisWeek',
    label: 'Esta semana',
    icon: AlertTriangle,
    accent: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  {
    key: 'overdue',
    label: 'Vencidas',
    icon: CheckCircle,
    accent: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/50',
    borderColor: 'border-red-200 dark:border-red-800',
  },
] as const;

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <section className='stats-overview app-shell mt-6'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {statsConfig.map(({ key, label, icon: Icon, accent, bgColor, borderColor }) => (
          <div
            key={key}
            className={`${bgColor} ${borderColor} flex items-center justify-between rounded-lg border p-6 shadow-sm transition-all duration-200 hover:shadow-md`}
          >
            <div className='flex-1'>
              <p className='text-muted-foreground mb-1 text-sm font-medium tracking-wide uppercase'>
                {label}
              </p>
              <p className={`text-3xl font-bold ${accent} leading-none`}>
                {stats[key as keyof typeof stats]}
              </p>
            </div>
            <div className='ml-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80'>
              <Icon className={`h-6 w-6 ${accent}`} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
