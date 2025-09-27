import React from 'react';
import { BookOpen, ClipboardList, Clock, AlertTriangle, CheckCircle, Moon, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useAppContext } from '../contexts/AppContext';

interface HeaderProps {
  stats: {
    total: number;
    upcoming: number;
    overdue: number;
    thisWeek: number;
  };
}

export const Header: React.FC<HeaderProps> = ({ stats }) => {
  const { theme, toggleTheme } = useAppContext();
  return (
    <>
      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 min-w-0">
              <BookOpen className="w-8 h-8 text-primary flex-shrink-0" />
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                Calendario de Entregas Universitarias
              </h1>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
                <div className="hidden sm:block">
                  {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                </div>
                <div className="sm:hidden">
                  {format(new Date(), "d/MM/yyyy", { locale: es })}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
              >
                {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>


      {/* Estadísticas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-card border rounded-lg p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Card className="min-h-0">
            <CardContent className="flex items-center justify-between p-3 sm:p-6">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Entregas</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <ClipboardList className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground flex-shrink-0 ml-2" />
            </CardContent>
          </Card>

          <Card className="min-h-0">
            <CardContent className="flex items-center justify-between p-3 sm:p-6">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Próximas</p>
                <p className="text-lg sm:text-2xl font-bold text-chart-2">{stats.upcoming}</p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-chart-2 flex-shrink-0 ml-2" />
            </CardContent>
          </Card>

          <Card className="min-h-0">
            <CardContent className="flex items-center justify-between p-3 sm:p-6">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Esta Semana</p>
                <p className="text-lg sm:text-2xl font-bold text-chart-3">{stats.thisWeek}</p>
              </div>
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-chart-3 flex-shrink-0 ml-2" />
            </CardContent>
          </Card>

          <Card className="min-h-0">
            <CardContent className="flex items-center justify-between p-3 sm:p-6">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Vencidas</p>
                <p className="text-lg sm:text-2xl font-bold text-destructive">{stats.overdue}</p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-destructive flex-shrink-0 ml-2" />
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </>
  );
};


