import React from 'react';
import { useConfig } from '../hooks/useConfig';
import { useAppContext } from '../contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export const ConfigModal: React.FC = () => {
  const { config, updateConfig, resetConfig } = useConfig();
  const { configModalOpen, closeConfigModal } = useAppContext();

  const totalDaysByPriority = {
    high: Math.max(1, config.baseStudyDays + config.priorityVariations.high),
    normal: Math.max(1, config.baseStudyDays + config.priorityVariations.normal),
    low: Math.max(1, config.baseStudyDays + config.priorityVariations.low)
  } as const;

  const handleSave = () => {
    closeConfigModal();
  };

  const handleReset = () => {
    resetConfig();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeConfigModal();
    }
  };

  return (
    <Dialog open={configModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Configuración de la aplicación</DialogTitle>
          <DialogDescription>
            Ajusta los parámetros para personalizar tu experiencia de planificación de estudios.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Parámetros base</CardTitle>
              <CardDescription>
                Ajusta los días mínimos y las horas diarias que se aplican antes de las variaciones por prioridad.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="baseStudyDays">Días base</Label>
                  <Input
                    id="baseStudyDays"
                    type="number"
                    min="1"
                    value={config.baseStudyDays}
                    onChange={event => {
                      const value = parseInt(event.target.value, 10);
                      updateConfig({ baseStudyDays: Number.isFinite(value) ? Math.max(1, value) : 1 });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStudyTime">Horas mínimas por día</Label>
                  <Input
                    id="minStudyTime"
                    type="number"
                    min="1"
                    max="6"
                    value={config.minStudyTime}
                    onChange={event => {
                      const value = parseInt(event.target.value, 10);
                      const normalized = Number.isFinite(value) ? Math.min(6, Math.max(1, value)) : 1;
                      updateConfig({ minStudyTime: normalized });
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Entre 1 y 6 horas recomendadas.</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Estos parámetros se aplican a todas las prioridades antes de sumar o restar los ajustes siguientes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Variación por prioridad</CardTitle>
              <CardDescription>
                Ajusta los días adicionales o restados según la prioridad de las entregas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="highPriority">Prioridad alta</Label>
                  <Input
                    id="highPriority"
                    type="number"
                    value={config.priorityVariations.high}
                    onChange={event => updateConfig({
                      priorityVariations: {
                        ...config.priorityVariations,
                        high: parseInt(event.target.value, 10) || 0
                      }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">días adicionales</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="normalPriority">Prioridad normal</Label>
                  <Input
                    id="normalPriority"
                    type="number"
                    value={config.priorityVariations.normal}
                    onChange={event => updateConfig({
                      priorityVariations: {
                        ...config.priorityVariations,
                        normal: parseInt(event.target.value, 10) || 0
                      }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">días respecto al valor base</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lowPriority">Prioridad baja</Label>
                  <Input
                    id="lowPriority"
                    type="number"
                    value={config.priorityVariations.low}
                    onChange={event => updateConfig({
                      priorityVariations: {
                        ...config.priorityVariations,
                        low: parseInt(event.target.value, 10) || 0
                      }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">días menos</p>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-2">Ejemplo:</p>
                <p className="text-sm text-muted-foreground">
                  Con {config.baseStudyDays} días base, prioridad alta reservará {totalDaysByPriority.high} días,
                  normal {totalDaysByPriority.normal} días y baja {totalDaysByPriority.low} días.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración de IA</CardTitle>
              <CardDescription>
                Configura tu clave API de OpenAI para usar las funciones de IA.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="openaiApiKey">Clave API de OpenAI</Label>
                <Input
                  id="openaiApiKey"
                  type="password"
                  placeholder="sk-..."
                  value={config.openaiApiKey}
                  onChange={event => updateConfig({ openaiApiKey: event.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Necesaria para usar funciones como generación de planes de estudio y análisis de progreso.
                  La clave se almacena localmente y no se comparte.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Restaurar valores por defecto
          </Button>
          <Button onClick={handleSave}>
            Guardar configuración
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
