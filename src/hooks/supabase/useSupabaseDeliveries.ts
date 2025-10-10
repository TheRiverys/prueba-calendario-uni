import { addDays } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';

import { toUtcMidnight } from '@/features/auth/study-planner/utils/dateUtils';
import { supabase } from '@/lib/supabase';
import type { Delivery, DeliveryRow } from '@/types';

import type { User } from '@supabase/supabase-js';

type DeliveryInput = Omit<Delivery, 'id' | 'completed'>;
type DeliveryUpdate = Partial<Omit<Delivery, 'id'>>;

const mapRowToDelivery = (row: DeliveryRow): Delivery => ({
  id: row.id,
  subject: row.subject,
  name: row.name,
  date: row.date,
  color: row.color ?? '',
  completed: row.completed,
  priority: row.priority,
  // Campos de tracking
  startDate: row.start_date ?? undefined,
  endDate: row.end_date ?? undefined,
  completedAt: row.completed_at ?? undefined,
  completedManually: row.completed_manually ?? undefined,
});

const mapInputToRow = (input: DeliveryInput, userId: string) => ({
  user_id: userId,
  subject: input.subject,
  name: input.name,
  date: input.date,
  priority: input.priority,
  color: input.color,
  completed: false,
});

const mapUpdateToRow = (updates: DeliveryUpdate) => {
  const payload: Record<string, unknown> = {};
  if (updates.subject !== undefined) {
    payload.subject = updates.subject;
  }
  if (updates.name !== undefined) {
    payload.name = updates.name;
  }
  if (updates.date !== undefined) {
    payload.date = updates.date;
  }
  if (updates.priority !== undefined) {
    payload.priority = updates.priority;
  }
  if (updates.color !== undefined) {
    payload.color = updates.color;
  }
  if (updates.completed !== undefined) {
    payload.completed = updates.completed;
  }
  // Campos de tracking
  if (updates.startDate !== undefined) {
    payload.start_date = updates.startDate ?? null;
  }
  if (updates.endDate !== undefined) {
    payload.end_date = updates.endDate ?? null;
  }
  if (updates.completedAt !== undefined) {
    payload.completed_at = updates.completedAt ?? null;
  }
  if (updates.completedManually !== undefined) {
    payload.completed_manually = updates.completedManually ?? null;
  }
  return payload;
};

export const useSupabaseDeliveries = (
  user: User | null,
  semesterStart: Date,
  updateNewDateStart: (_value: string | null) => Promise<void>,
  clearNewDateStart: () => Promise<void>
) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDeliveries = useCallback(async () => {
    if (!user) {
      setDeliveries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('deliveries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (queryError) {
        throw queryError;
      }

      const mapped = (data ?? []).map(mapRowToDelivery);
      setDeliveries(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading deliveries');
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadDeliveries();
  }, [loadDeliveries]);

  const addDelivery = useCallback(
    async (deliveryData: DeliveryInput) => {
      if (!user) {
        return null;
      }

      try {
        const { data, error: mutationError } = await supabase
          .from('deliveries')
          .insert(mapInputToRow(deliveryData, user.id))
          .select('*')
          .single<DeliveryRow>();

        if (mutationError) {
          throw mutationError;
        }

        const created = mapRowToDelivery(data);
        setDeliveries(prev => [...prev, created]);

        // Limpiar fecha dinámica cuando se añade una nueva entrega
        void clearNewDateStart();

        return created;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error adding delivery');
        throw err;
      }
    },
    [user, clearNewDateStart]
  );

  const updateDelivery = useCallback(
    async (id: Delivery['id'], updates: DeliveryUpdate) => {
      if (!user) {
        return null;
      }

      try {
        const { data, error: mutationError } = await supabase
          .from('deliveries')
          .update(mapUpdateToRow(updates))
          .eq('id', id)
          .eq('user_id', user.id)
          .select('*')
          .single<DeliveryRow>();

        if (mutationError) {
          throw mutationError;
        }

        const updated = mapRowToDelivery(data);
        setDeliveries(prev => prev.map(delivery => (delivery.id === id ? updated : delivery)));

        // Limpiar fecha dinámica cuando se actualiza una entrega (excepto completed)
        if (updates.completed === undefined) {
          void clearNewDateStart();
        }

        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error updating delivery');
        throw err;
      }
    },
    [user, clearNewDateStart]
  );

  const deleteDelivery = useCallback(
    async (id: Delivery['id']) => {
      if (!user) {
        return;
      }

      try {
        const { error: mutationError } = await supabase
          .from('deliveries')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (mutationError) {
          throw mutationError;
        }

        setDeliveries(prev => prev.filter(delivery => delivery.id !== id));

        // Limpiar fecha dinámica cuando se elimina una entrega
        void clearNewDateStart();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error deleting delivery');
        throw err;
      }
    },
    [user, clearNewDateStart]
  );

  const toggleCompleted = useCallback(
    async (id: Delivery['id']) => {
      const current = deliveries.find(delivery => delivery.id === id);
      if (!current || !user) {
        return null;
      }

      const updatedCompleted = !current.completed;
      const now = new Date().toISOString();

      // Actualizar en la base de datos con tracking completo
      const updatedDelivery = await updateDelivery(id, {
        completed: updatedCompleted,
        completedAt: updatedCompleted ? now : undefined,
        completedManually: updatedCompleted ? true : undefined,
      });

      if (!updatedDelivery) {
        return null;
      }

      // Si se marca como completada, calcular y guardar fecha dinámica en Supabase
      if (updatedCompleted) {
        try {
          // Calcular fecha dinámica (mañana a medianoche UTC)
          const todayNormalized = toUtcMidnight(new Date());
          const tomorrowNormalized = addDays(todayNormalized, 1);
          const dynamicStartDate =
            tomorrowNormalized > semesterStart ? tomorrowNormalized : semesterStart;

          // Guardar en Supabase
          await updateNewDateStart(dynamicStartDate.toISOString());
        } catch {
          // Error en guardar fecha dinámica, continuar con el estado actualizado
          // La tarea ya está marcada como completada correctamente
        }
      } else {
        // Si se desmarca como completada, limpiar la fecha dinámica
        await clearNewDateStart();
      }

      return updatedDelivery;
    },
    [deliveries, updateDelivery, user, semesterStart, updateNewDateStart, clearNewDateStart]
  );

  const addDeliveries = useCallback(
    async (entries: DeliveryInput[]) => {
      if (!user || entries.length === 0) {
        return [] as Delivery[];
      }

      try {
        const payload = entries.map(entry => mapInputToRow(entry, user.id));
        const { data, error: mutationError } = await supabase
          .from('deliveries')
          .insert(payload)
          .select('*');

        if (mutationError) {
          throw mutationError;
        }

        const created = (data ?? []).map(mapRowToDelivery);
        setDeliveries(prev => [...prev, ...created]);
        return created;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error adding deliveries');
        throw err;
      }
    },
    [user]
  );

  /**
   * Actualiza las fechas del algoritmo (start_date, end_date) para múltiples entregas.
   * Se usa después de recalcular el schedule para persistir las fechas asignadas.
   *
   * IMPORTANTE: NO recarga deliveries para evitar bucle infinito.
   * Las fechas se persisten pero no se reflejan en el estado local hasta el próximo load.
   */
  const updateScheduleDates = useCallback(
    async (scheduleUpdates: Array<{ id: string; startDate: string; endDate: string }>) => {
      if (!user || scheduleUpdates.length === 0) {
        return;
      }

      // Actualizar cada entrega con sus fechas calculadas
      const updatePromises = scheduleUpdates.map(async update => {
        await supabase
          .from('deliveries')
          .update({
            start_date: update.startDate,
            end_date: update.endDate,
          })
          .eq('id', update.id)
          .eq('user_id', user.id);
      });

      await Promise.all(updatePromises);

      // NO recargar deliveries aquí - causaría bucle infinito
      // Las fechas se persisten en Supabase y se cargarán en el próximo login/reload
    },
    [user]
  );

  return {
    deliveries,
    loading,
    error,
    addDelivery,
    updateDelivery,
    deleteDelivery,
    toggleCompleted,
    addDeliveries,
    updateScheduleDates,
    refetch: loadDeliveries,
  } as const;
};
