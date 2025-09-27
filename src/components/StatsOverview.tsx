
import React from 'react';
import { ClipboardList, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from './ui/card';

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
    accent: 'text-foreground'
  },
  {
    key: 'upcoming',
    label: 'Próximas',
    icon: Clock,
    accent: 'text-chart-2'
  },
  {
    key: 'thisWeek',
    label: 'Esta semana',
    icon: AlertTriangle,
    accent: 'text-chart-3'
  },
  {
    key: 'overdue',
    label: 'Vencidas',
    icon: CheckCircle,
    accent: 'text-destructive'
  }
] as const;

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <section className="mx-auto mt-6 max-w-[1800px] px-4 sm:px-6 lg:px-10 xl:px-14">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statsConfig.map(({ key, label, icon: Icon, accent }) => (
          <Card key={key} className="border border-border/70">
            <div className="flex items-center justify-between p-5">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className={`text-2xl font-semibold ${accent}`}>
                  {stats[key as keyof typeof stats]}
                </p>
              </div>
              <div className="rounded-full bg-muted/60 p-3">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
