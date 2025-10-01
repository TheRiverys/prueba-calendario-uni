import React from "react"
import { Upload, Download } from "lucide-react"

import type { ImportValidationError } from "@/types"
import { useConfig } from "@/hooks/useConfig"
import { useAppContext } from "@/contexts/AppContext"
import { pickColorForSubject, parseDeliveriesFile, createIcsCalendar } from "@/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const COLUMN_DISPLAY_NAMES: Record<ImportValidationError["column"], string> = {
  subject: "Materia",
  name: "Título",
  dueDate: "Fecha de entrega",
  structure: "Estructura del archivo",
  header: "Cabecera"
}

const MAX_ERRORS_IN_ALERT = 5

const formatImportErrors = (importErrors: ImportValidationError[]): string => {
  if (importErrors.length === 0) {
    return ""
  }

  const lines = importErrors.slice(0, MAX_ERRORS_IN_ALERT).map(error => {
    const label = COLUMN_DISPLAY_NAMES[error.column]
    const location = error.row > 0 ? `Fila ${error.row}` : "General"
    const suffix = label ? ` (${label})` : ""
    return `- ${location}${suffix}: ${error.message}`
  })

  if (importErrors.length > MAX_ERRORS_IN_ALERT) {
    lines.push(`- ...${importErrors.length - MAX_ERRORS_IN_ALERT} error(es) adicional(es)`)
  }

  return lines.join("\n")
}

export const ConfigModal: React.FC = () => {
  const { config, updateConfig, resetConfig } = useConfig()
  const {
    configModalOpen,
    closeConfigModal,
    deliveries,
    addDeliveries,
    fullSchedule,
    semesterStart
  } = useAppContext()

  const importInputRef = React.useRef<HTMLInputElement | null>(null)

  const totalDaysByPriority = {
    high: Math.max(1, config.baseStudyDays + config.priorityVariations.high),
    normal: Math.max(1, config.baseStudyDays + config.priorityVariations.normal),
    low: Math.max(1, config.baseStudyDays + config.priorityVariations.low)
  } as const

  const handleSave = (): void => {
    closeConfigModal()
  }

  const handleReset = (): void => {
    resetConfig()
  }

  const handleOpenChange = (open: boolean): void => {
    if (!open) {
      closeConfigModal()
    }
  }

  const handleImportClick = (): void => {
    importInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const { deliveries: importedRows, errors: importErrors } = await parseDeliveriesFile(file)

      if (importedRows.length === 0) {
        const baseMessage = (
          importErrors.length > 0
            ? `No se importó ninguna entrega. Corrige los siguientes errores:\n${formatImportErrors(importErrors)}`
            : "No se encontraron filas válidas en el archivo."
        )
        window.alert(baseMessage)
        return
      }

      const newDeliveries = importedRows.map(row => ({
        subject: row.subject,
        name: row.name,
        date: row.dueDate,
        priority: "normal" as const,
        color: pickColorForSubject(row.subject, deliveries)
      }))

      addDeliveries(newDeliveries)

      if (importErrors.length > 0) {
        window.alert(
          `Se importaron ${newDeliveries.length} entregas, pero detectamos ${importErrors.length} fila(s) con problemas:\n${formatImportErrors(importErrors)}`
        )
      } else {
        window.alert(`Se importaron ${newDeliveries.length} entregas correctamente.`)
      }
    } catch (error) {
      console.error("Error al importar entregas", error)
      window.alert(error instanceof Error ? error.message : "No se pudo importar el archivo.")
    } finally {
      event.target.value = ""
    }
  }

  const handleExport = (): void => {
    if (fullSchedule.length === 0) {
      window.alert("No hay entregas para exportar.")
      return
    }

    const calendar = createIcsCalendar(fullSchedule)
    const blob = new Blob([calendar], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    const filename = `entregas-${semesterStart || "calendario"}.ics`
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={configModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[860px] md:max-w-[960px] lg:max-w-[1040px]">
        <DialogHeader>
          <DialogTitle>Configuración de la aplicación</DialogTitle>
          <DialogDescription>
            Ajusta los parámetros para personalizar tu experiencia de planificación de estudios.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(100vh-18rem)] overflow-y-auto pr-1 sm:pr-2 lg:pr-4">
          <div className="space-y-10 pb-6">
            {/* Parámetros base */}
            <section className="space-y-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-foreground">Parámetros base</h3>
                <p className="text-sm text-muted-foreground">Ajusta los mínimos antes de las variaciones por prioridad.</p>
              </div>
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
              <p className="text-xs text-muted-foreground">
                Estos parámetros se aplican globalmente antes de sumar/restar variaciones por prioridad.
              </p>
            </section>

            {/* Variación por prioridad */}
            <section className="space-y-4 border-t border-border pt-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-foreground">Variación por prioridad</h3>
                <p className="text-sm text-muted-foreground">Días adicionales o restados según la prioridad.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <p className="text-sm font-medium mb-2">Ejemplo</p>
                <p className="text-sm text-muted-foreground">
                  Con {config.baseStudyDays} días base, prioridad alta reservará {totalDaysByPriority.high} días,
                  normal {totalDaysByPriority.normal} y baja {totalDaysByPriority.low}.
                </p>
              </div>
            </section>

            {/* Configuración de IA */}
            <section className="space-y-4 border-t border-border pt-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-foreground">Configuración de IA</h3>
                <p className="text-sm text-muted-foreground">Clave API para funciones de IA.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="openaiApiKey">Clave API de OpenAI</Label>
                <Input
                  id="openaiApiKey"
                  type="password"
                  placeholder="sk-..."
                  value={config.openaiApiKey}
                  onChange={event => updateConfig({ openaiApiKey: event.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Necesaria para generación de planes y análisis. Se almacena localmente.
                </p>
              </div>
            </section>

            {/* Importar y exportar datos */}
            <section className="space-y-6 border-t border-border pt-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-foreground">Importar y exportar datos</h3>
                <p className="text-sm text-muted-foreground">Gestiona tus entregas desde/ hacia archivos.</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Importar entregas</Label>
                    <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                      <p>Sube un CSV o Excel con columnas: materia, título y fecha (AAAA-MM-DD).</p>
                      <Button variant="outline" size="sm" className="self-start" onClick={handleImportClick}>
                        <Upload className="mr-2 h-4 w-4" />
                        Importar archivo
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Exportar calendario</Label>
                    <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                      <p>Descarga un .ics para añadir tus entregas a cualquier calendario compatible.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="self-start"
                        onClick={handleExport}
                        disabled={fullSchedule.length === 0}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Exportar .ics
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <input
          ref={importInputRef}
          type="file"
          accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Archivo de importación"
        />

        <DialogFooter className="gap-2 sm:gap-3 sm:justify-end">
          <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
            Restaurar valores por defecto
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto">
            Guardar configuración
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}







