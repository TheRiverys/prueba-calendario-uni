import { useEffect, useState } from 'react';
import type { Delivery } from '../types';

const STORAGE_KEY = 'deliveries';

type StoredDelivery = Partial<Delivery>;

type DeliveryInput = Omit<Delivery, 'id' | 'completed'>;

const isValidPriority = (value: unknown): value is Delivery['priority'] => {
  return value === 'low' || value === 'normal' || value === 'high';
};

const sanitizeDelivery = (candidate: StoredDelivery): Delivery | null => {
  if (typeof candidate !== 'object' || candidate === null) {
    return null;
  }
  const { id, subject, name, date, color, completed, priority, studyStart } = candidate;
  if (typeof id !== 'number' || !subject || !name || !date || !color || typeof completed !== 'boolean' || !isValidPriority(priority)) {
    return null;
  }
  return {
    id,
    subject: String(subject).trim(),
    name: String(name).trim(),
    date: String(date),
    studyStart: studyStart ? String(studyStart) : undefined,
    color: String(color),
    completed,
    priority
  };
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
    console.warn('No se pudo recuperar las entregas almacenadas.', error);
    return [];
  }
};

const getNextId = (items: Delivery[]): number => items.reduce((acc, item) => Math.max(acc, item.id), 0) + 1;

export const useDeliveries = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>(readStoredDeliveries);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deliveries));
    } catch (error) {
      console.warn('No se pudo persistir las entregas.', error);
    }
  }, [deliveries]);

  const addDelivery = (delivery: DeliveryInput) => {
    setDeliveries(prev => {
      const nextId = getNextId(prev);
      const newDelivery: Delivery = {
        ...delivery,
        id: nextId,
        completed: false
      };
      return [...prev, newDelivery];
    });
  };

  const addDeliveries = (items: DeliveryInput[]) => {
    if (items.length === 0) {
      return;
    }
    setDeliveries(prev => {
      const next = [...prev];
      let nextId = getNextId(prev);
      items.forEach(item => {
        next.push({
          ...item,
          id: nextId,
          completed: false
        });
        nextId += 1;
      });
      return next;
    });
  };

  const updateDelivery = (id: number, updates: Partial<Delivery>) => {
    setDeliveries(prev => prev.map(delivery => (delivery.id === id ? { ...delivery, ...updates } : delivery)));
  };

  const deleteDelivery = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta entrega?')) {
      setDeliveries(prev => prev.filter(delivery => delivery.id !== id));
    }
  };

  const toggleCompleted = (id: number) => {
    setDeliveries(prev => prev.map(delivery => (
      delivery.id === id
        ? { ...delivery, completed: !delivery.completed }
        : delivery
    )));
  };

  return {
    deliveries,
    addDelivery,
    addDeliveries,
    updateDelivery,
    deleteDelivery,
    toggleCompleted
  };
};
