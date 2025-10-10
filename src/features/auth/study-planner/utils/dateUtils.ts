import { format, parseISO } from 'date-fns';

/**
 * Normaliza un string de fecha a un objeto Date a medianoche UTC.
 * Evita problemas de timezone usando UTC de forma consistente.
 * @param value String de fecha en formato ISO (ej: "2025-10-05" o "2025-10-05T00:00:00.000Z")
 * @returns Date normalizado a medianoche UTC, o null si el valor es inválido
 */
export const toNormalizedDate = (value: string | null | undefined): Date | null => {
  if (!value) {
    return null;
  }

  // Parsear la fecha como ISO
  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  // Extraer año, mes y día de la fecha parseada
  // Crear una nueva fecha UTC a medianoche (elimina componentes de hora y timezone)
  const year = parsed.getFullYear();
  const month = parsed.getMonth();
  const day = parsed.getDate();

  // Date.UTC() crea timestamp UTC, luego lo convertimos a Date
  const utcMidnight = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

  return utcMidnight;
};

/**
 * Normaliza un objeto Date al inicio del día en UTC.
 * Útil para normalizar fechas creadas con new Date() a medianoche UTC.
 * @param value Objeto Date
 * @returns Date normalizado a medianoche UTC
 */
export const toUtcMidnight = (value: Date): Date => {
  const year = value.getFullYear();
  const month = value.getMonth();
  const day = value.getDate();

  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
};

/**
 * Convierte un objeto Date a string ISO en formato corto (YYYY-MM-DD).
 * @param value Objeto Date
 * @returns String en formato ISO corto
 */
export const toIso = (value: Date): string => format(value, 'yyyy-MM-dd');
