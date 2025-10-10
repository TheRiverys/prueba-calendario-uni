import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DeliveriesProvider, useDeliveriesContext } from '@/contexts/deliveries/DeliveriesContext';
import type { Delivery } from '@/types';

import type { User } from '@supabase/supabase-js';

interface DeliveriesHookMock {
  deliveries: Delivery[];
  addDelivery: ReturnType<typeof vi.fn>;
  addDeliveries: ReturnType<typeof vi.fn>;
  updateDelivery: ReturnType<typeof vi.fn>;
  deleteDelivery: ReturnType<typeof vi.fn>;
  toggleCompleted: ReturnType<typeof vi.fn>;
}

const createDeliveriesMock = (): DeliveriesHookMock => ({
  deliveries: [],
  addDelivery: vi.fn(),
  addDeliveries: vi.fn(),
  updateDelivery: vi.fn(),
  deleteDelivery: vi.fn(),
  toggleCompleted: vi.fn(),
});

const localDeliveriesMock = createDeliveriesMock();
const remoteDeliveriesMock = createDeliveriesMock();

vi.mock('@/hooks/useDeliveries', () => ({
  useDeliveries: () => localDeliveriesMock,
}));

vi.mock('@/hooks/supabase/useSupabaseDeliveries', () => ({
  useSupabaseDeliveries: () => remoteDeliveriesMock,
}));

vi.mock('@/hooks/useModal', () => ({
  useModal: () => ({
    modalOpen: false,
    editingDelivery: null,
    formData: {
      subject: '',
      name: '',
      date: '',
      priority: 'normal' as const,
    },
    openModal: vi.fn(),
    closeModal: vi.fn(),
    handleInputChange: vi.fn(),
    setFormData: vi.fn(),
  }),
}));

const defaultDelivery: Delivery = {
  id: 'local-1',
  subject: 'Matematica',
  name: 'Entrega 1',
  date: '2025-01-15',
  color: 'bg-chart-1',
  completed: false,
  priority: 'normal',
};

const createWrapper = (props: {
  user: User | null;
  semesterStart: string;
  semesterStartVersion: number;
}) => {
  const Wrapper: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => (
    <DeliveriesProvider
      user={props.user}
      semesterStart={props.semesterStart}
      semesterStartVersion={props.semesterStartVersion}
      updateNewDateStart={vi.fn()}
      clearNewDateStart={vi.fn()}
    >
      {children}
    </DeliveriesProvider>
  );
  return Wrapper;
};

describe('DeliveriesProvider', () => {
  beforeEach(() => {
    localDeliveriesMock.deliveries = [defaultDelivery];
    localDeliveriesMock.addDelivery = vi.fn();
    localDeliveriesMock.addDeliveries = vi.fn();
    localDeliveriesMock.updateDelivery = vi.fn();
    localDeliveriesMock.deleteDelivery = vi.fn();
    localDeliveriesMock.toggleCompleted = vi.fn();

    remoteDeliveriesMock.deliveries = [
      { ...defaultDelivery, id: 'remote-1', subject: 'Historia', color: 'bg-chart-2' },
    ];
    remoteDeliveriesMock.addDelivery = vi.fn();
    remoteDeliveriesMock.addDeliveries = vi.fn();
    remoteDeliveriesMock.updateDelivery = vi.fn();
    remoteDeliveriesMock.deleteDelivery = vi.fn();
    remoteDeliveriesMock.toggleCompleted = vi.fn();
  });

  it('expone entregas locales cuando no hay usuario autenticado', () => {
    // Arrange
    const { result } = renderHook(() => useDeliveriesContext(), {
      wrapper: createWrapper({ user: null, semesterStart: '2025-01-01', semesterStartVersion: 0 }),
    });

    // Act
    const subjects = result.current.subjects;

    // Assert
    expect(result.current.deliveries).toEqual(localDeliveriesMock.deliveries);

    // Assert Again
    expect(subjects).toEqual(['Matematica']);
  });

  it('expone entregas remotas para usuarios autenticados', () => {
    // Arrange
    const mockUser = { id: 'user-3', email: 'user3@example.com' } as unknown as User;
    const { result } = renderHook(() => useDeliveriesContext(), {
      wrapper: createWrapper({
        user: mockUser,
        semesterStart: '2025-01-01',
        semesterStartVersion: 0,
      }),
    });

    // Act
    const subjects = result.current.subjects;

    // Assert
    expect(result.current.deliveries).toEqual(remoteDeliveriesMock.deliveries);

    // Assert Again
    expect(subjects).toEqual(['Historia']);
  });

  it('canaliza altas locales y actualiza la version', async () => {
    // Arrange
    const { result } = renderHook(() => useDeliveriesContext(), {
      wrapper: createWrapper({ user: null, semesterStart: '2025-01-01', semesterStartVersion: 0 }),
    });
    const baselineVersion = result.current.deliveriesVersion;
    const newDelivery = {
      subject: 'Matematica',
      name: 'Entrega 2',
      date: '2025-02-01',
      priority: 'high' as const,
      color: 'bg-chart-3',
    };

    // Act
    await act(async () => {
      result.current.addDelivery(newDelivery);
    });

    // Assert
    expect(localDeliveriesMock.addDelivery).toHaveBeenCalledWith(newDelivery);

    // Assert Again
    expect(remoteDeliveriesMock.addDelivery).not.toHaveBeenCalled();
    expect(result.current.deliveriesVersion).toBe(baselineVersion + 1);
  });

  it('canaliza altas remotas cuando hay usuario', async () => {
    // Arrange
    const mockUser = { id: 'user-4', email: 'user4@example.com' } as unknown as User;
    const { result } = renderHook(() => useDeliveriesContext(), {
      wrapper: createWrapper({
        user: mockUser,
        semesterStart: '2025-01-01',
        semesterStartVersion: 0,
      }),
    });
    const baselineVersion = result.current.deliveriesVersion;
    const newDelivery = {
      subject: 'Historia',
      name: 'Entrega remota',
      date: '2025-02-15',
      priority: 'normal' as const,
      color: 'bg-chart-4',
    };

    // Act
    await act(async () => {
      result.current.addDelivery(newDelivery);
    });

    // Assert
    await waitFor(() => expect(remoteDeliveriesMock.addDelivery).toHaveBeenCalledWith(newDelivery));

    // Assert Again
    expect(localDeliveriesMock.addDelivery).not.toHaveBeenCalled();
    expect(result.current.deliveriesVersion).toBe(baselineVersion + 1);
  });

  it('inicializa una version positiva cuando hay fecha de semestre', () => {
    // Arrange
    const { result } = renderHook(() => useDeliveriesContext(), {
      wrapper: createWrapper({ user: null, semesterStart: '2025-01-01', semesterStartVersion: 3 }),
    });

    // Act
    const version = result.current.deliveriesVersion;

    // Assert
    expect(version).toBeGreaterThan(0);

    // Assert Again
    expect(localDeliveriesMock.addDelivery).not.toHaveBeenCalled();
  });
});
