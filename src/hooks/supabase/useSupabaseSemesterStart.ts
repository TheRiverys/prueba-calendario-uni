import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

import type { User } from '@supabase/supabase-js';

export const useSupabaseSemesterStart = (user: User | null) => {
  const [semesterStart, setSemesterStart] = useState<string>('');
  const [newDateStart, setNewDateStart] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar fecha de inicio del semestre y fecha dinámica

  const loadSemesterStart = useCallback(async () => {
    if (!user) {
      setSemesterStart('');
      setNewDateStart(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('semester_starts')
        .select('semester_start, new_date_start')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 es "not found"
        throw error;
      }

      if (data) {
        setSemesterStart(data.semester_start);
        setNewDateStart(data.new_date_start ?? null);
      } else {
        // Si no hay fecha configurada en Supabase, no establecer fecha por defecto aquí
        // Dejar que el estado local maneje el valor inicial apropiado
        setSemesterStart('');
        setNewDateStart(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading semester start');
      setSemesterStart('');
      setNewDateStart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadSemesterStart();
  }, [loadSemesterStart]);

  // Actualizar fecha de inicio del semestre
  const updateSemesterStart = async (newSemesterStart: string) => {
    if (!user) {
      return;
    }

    try {
      const { error } = await supabase.from('semester_starts').upsert(
        {
          user_id: user.id,
          semester_start: newSemesterStart,
          // Limpiar new_date_start cuando cambia semester_start
          new_date_start: null,
        },
        {
          onConflict: 'user_id',
        }
      );

      if (error) {
        throw error;
      }

      // Actualizar inmediatamente el estado local para evitar problemas de sincronización
      setSemesterStart(newSemesterStart);
      setNewDateStart(null);
      return newSemesterStart;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating semester start');
      throw err;
    }
  };

  // Actualizar fecha dinámica (cuando se completa una tarea)
  const updateNewDateStart = async (dynamicDate: string | null) => {
    if (!user) {
      return;
    }

    try {
      const { error } = await supabase
        .from('semester_starts')
        .update({
          new_date_start: dynamicDate,
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Actualizar inmediatamente el estado local
      setNewDateStart(dynamicDate);
      return dynamicDate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating dynamic start date');
      throw err;
    }
  };

  // Limpiar fecha dinámica
  const clearNewDateStart = async () => {
    return updateNewDateStart(null);
  };

  return {
    semesterStart,
    newDateStart,
    loading,
    error,
    updateSemesterStart,
    updateNewDateStart,
    clearNewDateStart,
    refetch: loadSemesterStart,
  };
};
