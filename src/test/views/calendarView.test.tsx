import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CalendarView from '@/components/views/CalendarView/CalendarView';
import type { StudySchedule } from '@/types';

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

const buildHandlers = () => ({
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onToggleComplete: vi.fn(),
  onSubjectChange: vi.fn(),
});

describe('CalendarView', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-20T00:00:00Z'));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renderiza el calendario y permite cambiar de mes y filtrar', () => {
    const handlers = buildHandlers();
    const schedule: StudySchedule[] = [
      buildSchedule(),
      buildSchedule({
        id: 'schedule-2',
        subject: 'Historia',
        name: 'Ensayo final',
        color: 'bg-chart-2',
        date: '2025-02-02',
        startDate: new Date('2025-01-28'),
        endDate: new Date('2025-02-01'),
      }),
    ];

    render(
      <CalendarView
        schedule={schedule}
        selectedSubject='all'
        subjects={['Matemáticas', 'Historia']}
        onSubjectChange={handlers.onSubjectChange}
        onEdit={handlers.onEdit}
        onDelete={handlers.onDelete}
        onToggleComplete={handlers.onToggleComplete}
      />
    );

    expect(screen.getAllByText('Matemáticas').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Mes siguiente' }));
    expect(screen.getAllByText(/febrero 2025/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Mes anterior' }));
    expect(screen.getAllByText(/enero 2025/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Historia' }));
    expect(handlers.onSubjectChange).toHaveBeenCalledWith('Historia');
  });

  it('muestra mensaje cuando no hay entregas en el mes', () => {
    const handlers = buildHandlers();

    render(
      <CalendarView
        schedule={[]}
        selectedSubject='all'
        subjects={[]}
        onSubjectChange={handlers.onSubjectChange}
        onEdit={handlers.onEdit}
        onDelete={handlers.onDelete}
        onToggleComplete={handlers.onToggleComplete}
      />
    );

    expect(
      screen.queryByText('No hay entregas programadas para el periodo visible.')
    ).not.toBeInTheDocument();
  });

  it('dispara acciones de editar y completar entrega', () => {
    const handlers = buildHandlers();

    render(
      <CalendarView
        schedule={[buildSchedule()]}
        selectedSubject='all'
        subjects={[]}
        onSubjectChange={handlers.onSubjectChange}
        onEdit={handlers.onEdit}
        onDelete={handlers.onDelete}
        onToggleComplete={handlers.onToggleComplete}
      />
    );

    const editButton = screen.getAllByLabelText('Editar entrega')[0];
    fireEvent.click(editButton);
    expect(handlers.onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'schedule-1' }));

    const toggleButton = screen.getAllByLabelText('Marcar como completada')[0];
    fireEvent.click(toggleButton);
    expect(handlers.onToggleComplete).toHaveBeenCalledWith('schedule-1');
  });

  it('aplica el filtro por materia tambien a los bloques de estudio', () => {
    const handlers = buildHandlers();
    const schedule: StudySchedule[] = [
      buildSchedule(),
      buildSchedule({
        id: 'schedule-2',
        subject: 'Historia',
        name: 'Ensayo final',
        color: 'bg-chart-2',
        date: '2025-02-02',
        startDate: new Date('2025-01-28'),
        endDate: new Date('2025-02-01'),
      }),
    ];

    render(
      <CalendarView
        schedule={schedule}
        selectedSubject='Historia'
        subjects={['Matemáticas', 'Historia']}
        onSubjectChange={handlers.onSubjectChange}
        onEdit={handlers.onEdit}
        onDelete={handlers.onDelete}
        onToggleComplete={handlers.onToggleComplete}
      />
    );

    expect(screen.queryByText('Matemáticas - Parcial 1')).not.toBeInTheDocument();
    expect(screen.getAllByText('Historia - Ensayo final').length).toBeGreaterThan(0);
  });
});
