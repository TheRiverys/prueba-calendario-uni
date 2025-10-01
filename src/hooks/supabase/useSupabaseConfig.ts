import { useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from "@/lib/supabase";
import type { ConfigSettings, UserConfigRow } from '@/types';
import { createDefaultConfig, sanitizeConfig } from '@/utils';

const parseConfig = (row: UserConfigRow | null): ConfigSettings => {
  if (!row) {
    return createDefaultConfig();
  }

  return sanitizeConfig({
    baseStudyDays: row.base_study_days ?? undefined,
    minStudyTime: row.min_study_time ?? undefined,
    priorityVariations: row.priority_variations ?? undefined,
    openaiApiKey: ''
  });
};

export const useSupabaseConfig = (user: User | null) => {
  const [config, setConfig] = useState<ConfigSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    if (!user) {
      setConfig(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('user_configs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle<UserConfigRow>();

      if (queryError && queryError.code !== 'PGRST116') {
        throw queryError;
      }

      const parsed = parseConfig(data ?? null);
      setConfig(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading config');
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  const updateConfig = useCallback(async (partial: Partial<ConfigSettings>) => {
    if (!user) {
      return null;
    }

    const current = config ?? createDefaultConfig();
    const candidate = sanitizeConfig({
      ...current,
      ...partial,
      openaiApiKey: ''
    });

    try {
      const { error: mutationError } = await supabase
        .from('user_configs')
        .upsert({
          user_id: user.id,
          min_study_time: candidate.minStudyTime,
          base_study_days: candidate.baseStudyDays,
          priority_variations: candidate.priorityVariations
        });

      if (mutationError) {
        throw mutationError;
      }

      setConfig(candidate);
      return candidate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating config');
      throw err;
    }
  }, [config, user]);

  const resetConfig = useCallback(async () => {
    const defaults = createDefaultConfig();
    await updateConfig(defaults);
    return defaults;
  }, [updateConfig]);

  return {
    config,
    loading,
    error,
    updateConfig,
    resetConfig,
    refetch: loadConfig
  } as const;
};
