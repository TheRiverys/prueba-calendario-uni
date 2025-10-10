import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import GanttView from '@/components/views/GanttView/GanttView';
import type { StudySchedule } from '@/types';

vi.mock('@/components/ui/scroll-area', () => {
  const ScrollArea = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => (
      <div {...props} ref={ref}>
        {children}
      </div>
    )
  );
  ScrollArea.displayName = 'ScrollArea';

  return { ScrollArea };
});

const buildSchedule = (overrides: Partial<StudySchedule> = {}): StudySchedule => ({
  id: 'schedule-1',
  subject: 'Matemáticas',
  name: 'Parcial 1',
  date: '2025-01-25',
  color: 'bg-chart-1',
  completed: false,
  priority: 'normal',
  startDate: new Date('2025-01-20'),
  endDate: new Date('2025-01-24'),
  studyDays: 5,
  warning: false,
  minimumRequired: 4,
  allocatedDays: 5,
  desiredExtraByPriority: 0,
  achievedExtra: 0,
  ...overrides,
});

describe('GanttView', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renderiza el timeline con entregas y resumen', () => {
    const schedule: StudySchedule[] = [
      buildSchedule(),
      buildSchedule({
        id: 'schedule-2',
        subject: 'Historia',
        name: 'Ensayo final',
        color: 'bg-chart-2',
        startDate: new Date('2025-02-10'),
        endDate: new Date('2025-02-18'),
        date: '2025-02-20',
        studyDays: 9,
      }),
    ];

    render(<GanttView schedule={schedule} />);

    const mathHeaders = screen.getAllByText(
      content =>
        content.toLowerCase().includes('cronograma de') && content.toLowerCase().includes('matem')
    );
    expect(mathHeaders.length).toBeGreaterThan(0);

    const historyHeaders = screen.getAllByText(
      content =>
        content.toLowerCase().includes('cronograma de') && content.toLowerCase().includes('hist')
    );
    expect(historyHeaders.length).toBeGreaterThan(0);

    const totalCard = screen.getByText(/Total de entregas/i).closest('div')?.parentElement;
    expect(totalCard?.querySelector('p')?.textContent).toBe('2');
  });

  it('muestra mensaje vacío cuando no hay entregas', () => {
    const schedule: StudySchedule[] = [];

    render(<GanttView schedule={schedule} />);

    expect(screen.getByText(/No hay entregas programadas/i)).toBeInTheDocument();
    const totalCard = screen.getByText(/Total de entregas/i).closest('div')?.parentElement;
    expect(totalCard?.querySelector('p')?.textContent).toBe('0');
  });

  it('calcula los días promedio correctamente', () => {
    const schedule: StudySchedule[] = [
      buildSchedule({ studyDays: 4 }),
      buildSchedule({
        id: 'schedule-3',
        name: 'Proyecto final',
        studyDays: 6,
        startDate: new Date('2025-01-26'),
        endDate: new Date('2025-01-31'),
        date: '2025-02-01',
      }),
    ];

    render(<GanttView schedule={schedule} />);

    const averageCard = screen.getByText(/Promedio/i).closest('div')?.parentElement;
    expect(averageCard?.querySelector('p')?.textContent).toBe('5');
  });
});
