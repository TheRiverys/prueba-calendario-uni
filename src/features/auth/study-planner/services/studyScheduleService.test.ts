import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import type { Delivery, ConfigSettings } from '@/types';

import { buildStudySchedule } from './buildStudySchedule';
import { StudyScheduleService } from './studyScheduleService';

// --- 1. Mocks y Factorías de Datos ---
// Mock de la dependencia principal para aislar el servicio bajo prueba.
vi.mock('./buildStudySchedule', () => ({
  buildStudySchedule: vi.fn(),
}));

const mockedBuildStudySchedule = vi.mocked(buildStudySchedule);

// Factoría para crear datos de prueba consistentes y legibles.
const createMockDelivery = (overrides: Partial<Delivery> = {}): Delivery => ({
  id: '1',
  subject: 'Test Subject',
  name: 'Test Delivery',
  date: '2025-11-10T12:00:00.000Z',
  color: '#ffffff',
  completed: false,
  priority: 'normal',
  ...overrides,
});

// --- 2. Suite de Tests para StudyScheduleService ---
describe('StudyScheduleService', () => {
  const SEMESTER_START = new Date('2025-09-01T00:00:00.000Z');
  const MOCK_CONFIG: ConfigSettings = {
    baseStudyDays: 5,
    minStudyTime: 1,
    priorityVariations: { high: 2, normal: 1, low: 0.5 },
    openaiApiKey: '',
  };

  beforeEach(() => {
    // Limpiamos todos los mocks antes de cada test para asegurar el aislamiento.
    vi.clearAllMocks();
  });

  // --- Pruebas para una función pura: `calculateNewDateStart` ---
  describe('calculateNewDateStart()', () => {
    beforeEach(() => {
      // Usamos tiempo falso para tener control total sobre `new Date()`.
      vi.useFakeTimers();
    });

    afterEach(() => {
      // Restauramos el tiempo real para no afectar a otros tests.
      vi.useRealTimers();
    });

    it('should return tomorrow (normalized to UTC midnight) when current date is after the semester start', () => {
      // Arrange
      const currentDate = new Date('2025-12-01T10:00:00.000Z');
      vi.setSystemTime(currentDate);
      // El día siguiente normalizado a medianoche UTC
      const expectedTomorrow = new Date('2025-12-02T00:00:00.000Z');

      // Act
      const result = StudyScheduleService.calculateNewDateStart(SEMESTER_START);

      // Assert
      expect(result).toEqual(expectedTomorrow);
    });

    it('should return the semester start date when the current date is before it', () => {
      // Arrange
      const pastDate = new Date('2025-08-01T10:00:00.000Z');
      vi.setSystemTime(pastDate);

      // Act
      const result = StudyScheduleService.calculateNewDateStart(SEMESTER_START);

      // Assert
      expect(result).toEqual(SEMESTER_START);
    });
  });

  // --- Pruebas para el orquestador principal: `recalculateSchedule` ---
  describe('recalculateSchedule()', () => {
    const mockDeliveries = [createMockDelivery()];

    it('should call buildStudySchedule with a dynamic start date when useDynamicStart is true', () => {
      // Arrange
      const MOCK_NOW = new Date('2025-10-10T15:30:00.000Z'); // Fecha actual controlada
      vi.useFakeTimers();
      vi.setSystemTime(MOCK_NOW);
      // calculateNewDateStart devuelve mañana normalizado a medianoche UTC
      const expectedTomorrow = new Date('2025-10-11T00:00:00.000Z');

      // Act
      StudyScheduleService.recalculateSchedule(mockDeliveries, SEMESTER_START, MOCK_CONFIG, true);

      // Assert
      expect(mockedBuildStudySchedule).toHaveBeenCalledOnce();
      expect(mockedBuildStudySchedule).toHaveBeenCalledWith({
        deliveries: mockDeliveries,
        semesterStartIso: SEMESTER_START.toISOString(),
        newDateStartIso: expectedTomorrow.toISOString(),
        config: MOCK_CONFIG,
      });

      vi.useRealTimers(); // Cleanup
    });

    it('should call buildStudySchedule without a dynamic start date when useDynamicStart is false', () => {
      // Arrange, Act
      StudyScheduleService.recalculateSchedule(mockDeliveries, SEMESTER_START, MOCK_CONFIG, false);

      // Assert
      expect(mockedBuildStudySchedule).toHaveBeenCalledOnce();
      expect(mockedBuildStudySchedule).toHaveBeenCalledWith({
        deliveries: mockDeliveries,
        semesterStartIso: SEMESTER_START.toISOString(),
        newDateStartIso: undefined, // Verificamos explícitamente que es undefined
        config: MOCK_CONFIG,
      });
    });
  });

  // Nota: handleManualCompletion fue eliminada.
  // Su funcionalidad se movió a useSupabaseDeliveries.toggleCompleted
  // para manejar la persistencia en Supabase en lugar de localStorage.
});
