import { describe, expect, it } from 'vitest';

import { AIService } from './ai';

describe('AIService.generateDetailedSchedule', () => {
  it('reparte horas en un rango inclusivo de dos días', () => {
    const result = AIService.generateDetailedSchedule([
      {
        subject: 'Matemáticas',
        name: 'Parcial 1',
        deliveryDate: '2026-03-10',
        startDate: '2026-03-08',
        endDate: '2026-03-09',
        priority: 'normal',
        estimatedHours: 6,
      },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].date).toBe('2026-03-08');
    expect(result[1].date).toBe('2026-03-09');
    expect(result[0].hours).toBe(3);
    expect(result[1].hours).toBe(3);
  });

  it('no divide por cero en bloques de un solo día', () => {
    const result = AIService.generateDetailedSchedule([
      {
        subject: 'Historia',
        name: 'Examen final',
        deliveryDate: '2026-04-20',
        startDate: '2026-04-20',
        endDate: '2026-04-20',
        priority: 'high',
        estimatedHours: 5,
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2026-04-20');
    expect(result[0].hours).toBe(5);
  });
});
