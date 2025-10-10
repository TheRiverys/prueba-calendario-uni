import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

import { toast } from '@/components/ui/sonner';
import { useSupabaseConfig } from '@/hooks/supabase/useSupabaseConfig';
import { useConfig as useLocalConfig } from '@/hooks/useConfig';
import type { ConfigSettings } from '@/types';
import { createDefaultConfig } from '@/utils/config';

import type { User } from '@supabase/supabase-js';

interface ConfigContextValue {
  config: ConfigSettings;
  updateConfig: (_partial: Partial<ConfigSettings>) => void;
  resetConfig: () => void;
  configModalOpen: boolean;
  openConfigModal: () => void;
  closeConfigModal: () => void;
}

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

interface ConfigProviderProps {
  readonly children: ReactNode;
  readonly user: User | null;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children, user }) => {
  const isAuthenticated = Boolean(user);

  const [configModalOpen, setConfigModalOpen] = useState(false);

  const {
    config: localConfig,
    updateConfig: updateLocalConfig,
    resetConfig: resetLocalConfig,
  } = useLocalConfig();

  const {
    config: remoteConfig,
    updateConfig: updateRemoteConfig,
    resetConfig: resetRemoteConfig,
  } = useSupabaseConfig(user);

  const baseConfig = useMemo<ConfigSettings>(() => {
    if (isAuthenticated) {
      return remoteConfig ?? createDefaultConfig();
    }
    return localConfig;
  }, [isAuthenticated, remoteConfig, localConfig]);

  const config = useMemo<ConfigSettings>(
    () => ({
      ...baseConfig,
      openaiApiKey: localConfig.openaiApiKey,
    }),
    [baseConfig, localConfig.openaiApiKey]
  );

  const updateConfig = useCallback(
    (partial: Partial<ConfigSettings>) => {
      if (isAuthenticated) {
        const { openaiApiKey, ...rest } = partial;
        if (openaiApiKey !== undefined) {
          updateLocalConfig({ openaiApiKey });
        }
        if (Object.keys(rest).length > 0) {
          void (async () => {
            try {
              await updateRemoteConfig(rest);
            } catch (error) {
              toast.error('No se pudo actualizar la configuración en Supabase', {
                description: error instanceof Error ? error.message : String(error),
              });
            }
          })();
        }
      } else {
        updateLocalConfig(partial);
      }
    },
    [isAuthenticated, updateLocalConfig, updateRemoteConfig]
  );

  const resetConfig = useCallback(() => {
    if (isAuthenticated) {
      void (async () => {
        try {
          await resetRemoteConfig();
        } catch (error) {
          toast.error('No se pudo restaurar la configuración en Supabase', {
            description: error instanceof Error ? error.message : String(error),
          });
        }
      })();
      const defaults = createDefaultConfig();
      updateLocalConfig({
        baseStudyDays: defaults.baseStudyDays,
        minStudyTime: defaults.minStudyTime,
        priorityVariations: defaults.priorityVariations,
      });
    } else {
      resetLocalConfig();
    }
  }, [isAuthenticated, resetRemoteConfig, updateLocalConfig, resetLocalConfig]);

  const openConfigModal = useCallback(() => {
    setConfigModalOpen(true);
  }, []);

  const closeConfigModal = useCallback(() => {
    setConfigModalOpen(false);
  }, []);

  const value = useMemo<ConfigContextValue>(
    () => ({
      config,
      updateConfig,
      resetConfig,
      configModalOpen,
      openConfigModal,
      closeConfigModal,
    }),
    [config, updateConfig, resetConfig, configModalOpen, openConfigModal, closeConfigModal]
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export const useConfigContext = (): ConfigContextValue => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfigContext must be used within a ConfigProvider');
  }
  return context;
};
