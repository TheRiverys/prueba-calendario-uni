import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

import { toast } from '@/components/ui/sonner';
import { useSupabaseSemesterStart } from '@/hooks/supabase/useSupabaseSemesterStart';
import { useSemesterStart as useLocalSemesterStart } from '@/hooks/useSemesterStart';

import type { User } from '@supabase/supabase-js';

interface SemesterContextValue {
  semesterStart: string;
  setSemesterStart: (_value: string) => void;
  semesterStartVersion: number;
  newDateStart: string | null;
  updateNewDateStart: (_value: string | null) => Promise<void>;
  clearNewDateStart: () => Promise<void>;
}

const SemesterContext = createContext<SemesterContextValue | undefined>(undefined);

interface SemesterProviderProps {
  readonly children: ReactNode;
  readonly user: User | null;
}

export const SemesterProvider: React.FC<SemesterProviderProps> = ({ children, user }) => {
  const isAuthenticated = Boolean(user);

  const { semesterStart: localSemesterStart, setSemesterStart: setLocalSemesterStart } =
    useLocalSemesterStart();

  const {
    semesterStart: remoteSemesterStart,
    newDateStart: remoteNewDateStart,
    updateSemesterStart: updateRemoteSemesterStart,
    updateNewDateStart: updateRemoteNewDateStart,
    clearNewDateStart: clearRemoteNewDateStart,
  } = useSupabaseSemesterStart(user);

  const [semesterStartVersion, setSemesterStartVersion] = useState(0);

  const semesterStart = useMemo(() => {
    if (isAuthenticated) {
      const today = new Date().toISOString().split('T')[0];
      if (localSemesterStart && localSemesterStart !== today) {
        return localSemesterStart;
      }
      return remoteSemesterStart && remoteSemesterStart.trim() !== ''
        ? remoteSemesterStart
        : localSemesterStart;
    }
    return localSemesterStart;
  }, [isAuthenticated, remoteSemesterStart, localSemesterStart]);

  const setSemesterStart = useCallback(
    (value: string) => {
      setLocalSemesterStart(value);
      if (isAuthenticated) {
        void (async () => {
          try {
            await updateRemoteSemesterStart(value);
          } catch (error) {
            toast.error('No se pudo actualizar la fecha de inicio en Supabase', {
              description: error instanceof Error ? error.message : String(error),
            });
          }
        })();
      }
      setSemesterStartVersion(previous => previous + 1);
    },
    [isAuthenticated, updateRemoteSemesterStart, setLocalSemesterStart]
  );

  const updateNewDateStart = useCallback(
    async (value: string | null) => {
      if (isAuthenticated) {
        try {
          await updateRemoteNewDateStart(value);
        } catch (error) {
          toast.error('No se pudo actualizar la fecha dinámica en Supabase', {
            description: error instanceof Error ? error.message : String(error),
          });
          throw error;
        }
      }
      // Si no está autenticado, no hace nada (no usamos localStorage para esto)
    },
    [isAuthenticated, updateRemoteNewDateStart]
  );

  const clearNewDateStart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await clearRemoteNewDateStart();
      } catch (error) {
        toast.error('No se pudo limpiar la fecha dinámica en Supabase', {
          description: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    }
  }, [isAuthenticated, clearRemoteNewDateStart]);

  const value = useMemo<SemesterContextValue>(
    () => ({
      semesterStart,
      setSemesterStart,
      semesterStartVersion,
      newDateStart: isAuthenticated ? remoteNewDateStart : null,
      updateNewDateStart,
      clearNewDateStart,
    }),
    [
      semesterStart,
      setSemesterStart,
      semesterStartVersion,
      isAuthenticated,
      remoteNewDateStart,
      updateNewDateStart,
      clearNewDateStart,
    ]
  );

  return <SemesterContext.Provider value={value}>{children}</SemesterContext.Provider>;
};

export const useSemesterContext = (): SemesterContextValue => {
  const context = useContext(SemesterContext);
  if (!context) {
    throw new Error('useSemesterContext must be used within a SemesterProvider');
  }
  return context;
};
