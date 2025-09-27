
import { useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Delivery, DeliveryRow } from '../types';

type DeliveryInput = Omit<Delivery, 'id' | 'completed'>;
type DeliveryUpdate = Partial<Omit<Delivery, 'id'>>;

const mapRowToDelivery = (row: DeliveryRow): Delivery => ({
  id: row.id,
  subject: row.subject,
  name: row.name,
  date: row.date,
  studyStart: row.study_start ?? undefined,
  color: row.color ?? '',
  completed: row.completed,
  priority: row.priority
});

const mapInputToRow = (input: DeliveryInput, userId: string) => ({
  user_id: userId,
  subject: input.subject,
  name: input.name,
  date: input.date,
  priority: input.priority,
  color: input.color,
  completed: false,
  study_start: input.studyStart ?? null
});

const mapUpdateToRow = (updates: DeliveryUpdate) => {
  const payload: Record<string, unknown> = {};
  if (updates.subject !== undefined) payload.subject = updates.subject;
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.date !== undefined) payload.date = updates.date;
  if (updates.priority !== undefined) payload.priority = updates.priority;
  if (updates.color !== undefined) payload.color = updates.color;
  if (updates.completed !== undefined) payload.completed = updates.completed;
  if (updates.studyStart !== undefined) payload.study_start = updates.studyStart ?? null;
  return payload;
};

export const useSupabaseDeliveries = (user: User | null) => {
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

  const addDelivery = useCallback(async (deliveryData: DeliveryInput) => {
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
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding delivery');
      throw err;
    }
  }, [user]);

  const updateDelivery = useCallback(async (id: Delivery['id'], updates: DeliveryUpdate) => {
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
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating delivery');
      throw err;
    }
  }, [user]);

  const deleteDelivery = useCallback(async (id: Delivery['id']) => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting delivery');
      throw err;
    }
  }, [user]);

  const toggleCompleted = useCallback(async (id: Delivery['id']) => {
    const current = deliveries.find(delivery => delivery.id === id);
    if (!current) {
      return null;
    }
    return updateDelivery(id, { completed: !current.completed });
  }, [deliveries, updateDelivery]);

  const addDeliveries = useCallback(async (entries: DeliveryInput[]) => {
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
  }, [user]);

  return {
    deliveries,
    loading,
    error,
    addDelivery,
    updateDelivery,
    deleteDelivery,
    toggleCompleted,
    addDeliveries,
    refetch: loadDeliveries
  } as const;
};
