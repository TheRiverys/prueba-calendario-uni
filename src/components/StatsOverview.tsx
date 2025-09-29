
import React from 'react';
import { ClipboardList, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface StatsOverviewProps {
  stats: {
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
    borderColor: 'border-border'
  },
  {
    key: 'upcoming',
    label: 'Próximas',
    icon: Clock,
    accent: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    key: 'thisWeek',
    label: 'Esta semana',
    icon: AlertTriangle,
    accent: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  {
    key: 'overdue',
    label: 'Vencidas',
    icon: CheckCircle,
    accent: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  }
] as const;

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <section className="app-shell mt-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsConfig.map(({ key, label, icon: Icon, accent, bgColor, borderColor }) => (
          <div
            key={key}
            className={`${bgColor} ${borderColor} border rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between`}
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                {label}
              </p>
              <p className={`text-3xl font-bold ${accent} leading-none`}>
                {stats[key as keyof typeof stats]}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/80 ml-4">
              <Icon className={`w-6 h-6 ${accent}`} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
