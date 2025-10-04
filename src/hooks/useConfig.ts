import { useState, useCallback } from 'react';
import type { ConfigSettings } from '../types';
import { createDefaultConfig, persistConfig, sanitizeConfig } from '../utils';

export const useConfig = () => {
  const [config, setConfig] = useState<ConfigSettings>(() => {
    try {
      const saved = localStorage.getItem('app-config');
      if (!saved) {
        const defaults = createDefaultConfig();
        persistConfig(defaults);
        return defaults;
      }
      const parsed = JSON.parse(saved);
      const sanitized = sanitizeConfig(parsed);
      persistConfig(sanitized);
      return sanitized;
    } catch {
      const defaults = createDefaultConfig();
      persistConfig(defaults);
      return defaults;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateConfig = useCallback((partial: Partial<ConfigSettings>) => {
    setConfig((previous) => {
      const candidate = {
        ...previous,
        ...partial,
        priorityVariations: {
          ...previous.priorityVariations,
          ...(partial.priorityVariations ?? {}),
        },
      };
      const sanitized = sanitizeConfig(candidate);
      persistConfig(sanitized);
      return sanitized;
    });
  }, []);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const resetConfig = useCallback(() => {
    const defaults = createDefaultConfig();
    setConfig(defaults);
    persistConfig(defaults);
  }, []);

  return {
    config,
    updateConfig,
    isModalOpen,
    openModal,
    closeModal,
    resetConfig,
  };
};

export type { ConfigSettings };
