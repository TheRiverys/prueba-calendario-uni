import React from "react"

import type { Delivery, FormData, Priority } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  editingDelivery: Delivery | null
  formData: FormData
  onSubmit: (event: React.FormEvent) => void
  onInputChange: (field: keyof FormData, value: string) => void
  subjectOptions: string[]
  priorities: Priority[]
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  editingDelivery,
  formData,
  onSubmit,
  onInputChange,
  subjectOptions,
  priorities
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {editingDelivery ? "Editar entrega" : "Nueva entrega"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Materia</Label>
            <Input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={event => onInputChange("subject", event.target.value)}
              list="subject-suggestions"
              placeholder="Ej: Derecho civil"
              required
            />
            <datalist id="subject-suggestions">
              {subjectOptions.map(subject => (
                <option key={subject} value={subject} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la entrega</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={event => onInputChange("name", event.target.value)}
              placeholder="Ej: Trabajo final, Examen parcial"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha de entrega</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={event => onInputChange("date", event.target.value)}
              required
              min={formData.studyStart}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioridad</Label>
            <Select value={formData.priority} onValueChange={value => onInputChange("priority", value)}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Seleccionar prioridad" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map(priority => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end sm:gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              {editingDelivery ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}