import { useEffect, useState } from 'react';

import { toast } from '@/components/ui/sonner';

import type { Delivery } from '../types';

const STORAGE_KEY = 'deliveries';
const LOCAL_ID_PREFIX = 'local-';

type StoredDelivery = Partial<Delivery> & { id?: string | number };

type DeliveryInput = Omit<Delivery, 'id' | 'completed'>;

const isValidPriority = (value: unknown): value is Delivery['priority'] => {
  return value === 'low' || value === 'normal' || value === 'high';
};

const normalizeId = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${LOCAL_ID_PREFIX}${Math.max(1, Math.round(value))}`;
  }
  return null;
};

const sanitizeDelivery = (candidate: StoredDelivery): Delivery | null => {
  if (typeof candidate !== 'object' || candidate === null) {
    return null;
  }

  const normalizedId = normalizeId(candidate.id);
  const { subject, name, date, color, completed, priority } = candidate;

  if (
    !normalizedId ||
    typeof subject !== 'string' ||
    typeof name !== 'string' ||
    typeof date !== 'string' ||
    typeof color !== 'string' ||
    typeof completed !== 'boolean' ||
    !isValidPriority(priority)
  ) {
    return null;
  }

  return {
    id: normalizedId,
    subject: subject.trim(),
    name: name.trim(),
    date: date,
    color: color,
    completed,
    priority,
  } satisfies Delivery;
};

const readStoredDeliveries = (): Delivery[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as StoredDelivery[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(sanitizeDelivery)
      .filter((delivery): delivery is Delivery => delivery !== null);
  } catch (error) {
    toast.error('No se pudieron recuperar las entregas almacenadas.', {
      description: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
};

const extractLocalNumericId = (id: string): number | null => {
  if (!id.startsWith(LOCAL_ID_PREFIX)) {
    return null;
  }
  const numericPart = Number.parseInt(id.slice(LOCAL_ID_PREFIX.length), 10);
  return Number.isFinite(numericPart) ? numericPart : null;
};

const getNextId = (items: Delivery[]): string => {
  const highest = items.reduce((acc, delivery) => {
    const numericId = extractLocalNumericId(delivery.id);
    return numericId !== null ? Math.max(acc, numericId) : acc;
  }, 0);
  return `${LOCAL_ID_PREFIX}${highest + 1}`;
};

export const useDeliveries = (_semesterStart: Date) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>(readStoredDeliveries);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deliveries));
    } catch (error) {
      toast.error('No se pudieron guardar las entregas.', {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  }, [deliveries]);

  const addDelivery = (delivery: DeliveryInput) => {
    setDeliveries(prev => {
      const nextId = getNextId(prev);
      const newDelivery: Delivery = {
        ...delivery,
        id: nextId,
        completed: false,
      };
      return [...prev, newDelivery];
    });

    // El schedule se recalculará automáticamente en ScheduleContext
  };

  const addDeliveries = (items: DeliveryInput[]) => {
    if (items.length === 0) {
      return;
    }
    setDeliveries(prev => {
      const next = [...prev];
      let nextId = getNextId(prev);
      const toDelivery = (input: DeliveryInput, id: string): Delivery => ({
        ...input,
        id,
        completed: false,
      });

      items.forEach(item => {
        next.push(toDelivery(item, nextId));
        nextId = getNextId([...next]);
      });
      return next;
    });

    // El schedule se recalculará automáticamente en ScheduleContext
  };

  const updateDelivery = (id: string, updates: Partial<Delivery>) => {
    setDeliveries(prev =>
      prev.map(delivery => (delivery.id === id ? { ...delivery, ...updates } : delivery))
    );

    // El schedule se recalculará automáticamente en ScheduleContext
  };

  const deleteDelivery = (id: string) => {
    setDeliveries(prev => prev.filter(delivery => delivery.id !== id));
    toast.success('Entrega eliminada correctamente');

    // El schedule se recalculará automáticamente en ScheduleContext
  };

  const toggleCompleted = (id: string) => {
    // Encuentra la tarea que se va a modificar
    const deliveryToToggle = deliveries.find(d => d.id === id);
    if (!deliveryToToggle) {
      return;
    }

    // Actualizar el estado local
    // El schedule se recalculará automáticamente en ScheduleContext
    // cuando cambie el array de deliveries
    setDeliveries(prev => prev.map(d => (d.id === id ? { ...d, completed: !d.completed } : d)));

    toast.success(deliveryToToggle.completed ? 'Tarea marcada como pendiente' : 'Tarea completada');
  };

  return {
    deliveries,
    addDelivery,
    addDeliveries,
    updateDelivery,
    deleteDelivery,
    toggleCompleted,
  } as const;
};
