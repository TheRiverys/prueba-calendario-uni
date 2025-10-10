import { addDays } from 'date-fns';

import type { ConfigSettings, Delivery, StudySchedule } from '@/types';

import { toUtcMidnight } from '../utils/dateUtils';

import { buildStudySchedule } from './buildStudySchedule';

/**
 * Servicio para manejar la lógica de planificación de estudio,
 * incluyendo el cálculo de fechas dinámicas para recalculos.
 * Sigue principios SOLID: responsabilidad única en gestión de schedules.
 */
export class StudyScheduleService {
  /**
   * Calcula la nueva fecha de inicio dinámica basada en la fecha actual.
   * Cuando se marca una tarea como completada, las tareas pendientes deben
   * recalcularse desde el día siguiente (no desde hoy).
   * @param semesterStart Fecha de inicio del semestre (normalizada a medianoche UTC).
   * @returns Fecha efectiva para iniciar recálculo (día siguiente o semesterStart).
   */
  static calculateNewDateStart(semesterStart: Date): Date {
    // Normaliza la fecha actual a medianoche UTC (elimina hora, minutos, segundos)
    const todayNormalized = toUtcMidnight(new Date());

    // Calcula el día siguiente (donde deben empezar las tareas pendientes)
    const tomorrowNormalized = addDays(todayNormalized, 1);

    // Si mañana es posterior al inicio del semestre, usar mañana
    // De lo contrario, usar la fecha de inicio del semestre
    return tomorrowNormalized > semesterStart ? tomorrowNormalized : semesterStart;
  }

  /**
   * Recalcula el schedule de estudio para entregas, usando una fecha de inicio dinámica.
   * @param deliveries Lista completa de entregas.
   * @param semesterStart Fecha de inicio del semestre.
   * @param config Configuraciones de estudio.
   * @param useDynamicStart Si usar fecha dinámica (para completaciones manuales).
   * @returns Nuevo schedule de estudio.
   */
  static recalculateSchedule(
    deliveries: Delivery[],
    semesterStart: Date,
    config?: ConfigSettings,
    useDynamicStart: boolean = false
  ): StudySchedule[] {
    const effectiveStartDate = useDynamicStart
      ? this.calculateNewDateStart(semesterStart)
      : semesterStart;

    const newDateStartIso = useDynamicStart ? effectiveStartDate.toISOString() : undefined;

    return buildStudySchedule({
      deliveries,
      semesterStartIso: semesterStart.toISOString(),
      newDateStartIso,
      config,
    });
  }

  /**
   * @deprecated Ya no se usa. La persistencia es en Supabase, no localStorage.
   * Mantenido solo para compatibilidad con usuarios no autenticados.
   */
  static updateLocalStorage(newSchedule: StudySchedule[]): void {
    localStorage.setItem('studySchedule', JSON.stringify(newSchedule));
  }
}
