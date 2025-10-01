import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export const useSupabaseSemesterStart = (user: User | null) => {
  const [semesterStart, setSemesterStart] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar fecha de inicio del semestre
  const loadSemesterStart = async () => {
    if (!user) {
      setSemesterStart('');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('semester_starts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 es "not found"
        throw error;
      }

      if (data) {
        setSemesterStart(data.semester_start);
      } else {
        // Si no hay fecha configurada en Supabase, no establecer fecha por defecto aquí
        // Dejar que el estado local maneje el valor inicial apropiado
        setSemesterStart('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading semester start');
      setSemesterStart('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSemesterStart();
  }, [user]);

  // Actualizar fecha de inicio del semestre
  const updateSemesterStart = async (newSemesterStart: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('semester_starts')
        .upsert(
          {
            user_id: user.id,
            semester_start: newSemesterStart,
          },
          {
            onConflict: 'user_id',
          }
        );

      if (error) throw error;

      // Actualizar inmediatamente el estado local para evitar problemas de sincronización
      setSemesterStart(newSemesterStart);
      return newSemesterStart;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating semester start');
      throw err;
    }
  };

  return {
    semesterStart,
    loading,
    error,
    updateSemesterStart,
    refetch: loadSemesterStart,
  };
};
