import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DeliveryList from '@/components/views/DeliveryList/DeliveryList';
import type { StudySchedule } from '@/types';

vi.mock('@/components/AIControls', () => ({
  AIControls: () => <div data-testid='ai-controls' />,
}));

const buildSchedule = (overrides: Partial<StudySchedule> = {}): StudySchedule => ({
  id: 'delivery-1',
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

describe('DeliveryList', () => {
  const buildHandlers = () => ({
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onToggleComplete: vi.fn(),
    onSubjectChange: vi.fn(),
    onSortChange: vi.fn(),
    onViewChange: vi.fn(),
    onAdd: vi.fn(),
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-20T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renderiza la tabla y dispara acciones principales', () => {
    const handlers = buildHandlers();

    render(
      <DeliveryList
        schedule={[buildSchedule()]}
        selectedSubject='all'
        subjects={['Matemáticas']}
        sortBy='algorithm'
        activeView='list'
        {...handlers}
      />
    );

    expect(screen.getByText('Entregas')).toBeInTheDocument();
    const deliveryLabels = screen.getAllByText('Matemáticas - Parcial 1');
    expect(deliveryLabels.length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByTitle('Editar entrega')[0]);
    expect(handlers.onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'delivery-1' }));

    fireEvent.click(screen.getAllByTitle('Marcar como completada')[0]);
    expect(handlers.onToggleComplete).toHaveBeenCalledWith('delivery-1');

    fireEvent.click(screen.getAllByTitle('Eliminar entrega')[0]);
    expect(handlers.onDelete).toHaveBeenCalledWith('delivery-1');
  });

  it('muestra estado vacío y permite crear una entrega', () => {
    const handlers = buildHandlers();

    render(
      <DeliveryList
        schedule={[]}
        selectedSubject='all'
        subjects={[]}
        sortBy='algorithm'
        activeView='list'
        {...handlers}
      />
    );

    fireEvent.click(screen.getAllByRole('button', { name: /Nueva entrega/i })[0]);
    expect(handlers.onAdd).toHaveBeenCalled();
  });

  it('muestra badge de estado para entregas de esta semana', () => {
    const handlers = buildHandlers();

    render(
      <DeliveryList
        schedule={[
          buildSchedule({ id: 'delivery-2', date: '2025-01-23', endDate: new Date('2025-01-23') }),
        ]}
        selectedSubject='all'
        subjects={['Matemáticas']}
        sortBy='algorithm'
        activeView='list'
        {...handlers}
      />
    );

    const weeklyBadges = screen.getAllByText('Esta semana');
    expect(weeklyBadges.length).toBeGreaterThan(0);
  });

  it('permite crear una entrega desde la cabecera cuando hay elementos', () => {
    const handlers = buildHandlers();

    render(
      <DeliveryList
        schedule={[buildSchedule()]}
        selectedSubject='all'
        subjects={['Matemáticas']}
        sortBy='algorithm'
        activeView='list'
        {...handlers}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Nueva entrega/i }));
    expect(handlers.onAdd).toHaveBeenCalledTimes(1);
  });
});
