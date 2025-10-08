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

  const { semesterStart: remoteSemesterStart, updateSemesterStart: updateRemoteSemesterStart } =
    useSupabaseSemesterStart(user);

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

  const value = useMemo<SemesterContextValue>(
    () => ({
      semesterStart,
      setSemesterStart,
      semesterStartVersion,
    }),
    [semesterStart, setSemesterStart, semesterStartVersion]
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
