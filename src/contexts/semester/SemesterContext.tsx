import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from 'react';
import { useSemesterStart as useLocalSemesterStart } from '@/hooks/useSemesterStart';
import { useSupabaseSemesterStart } from '@/hooks/supabase/useSupabaseSemesterStart';
import { useAuthContext } from '@/contexts/auth/AuthContext';

interface SemesterContextValue {
  semesterStart: string;
  setSemesterStart: (value: string) => void;
  semesterStartVersion: number;
}

const SemesterContext = createContext<SemesterContextValue | undefined>(undefined);

interface SemesterProviderProps {
  children: ReactNode;
}

export const SemesterProvider: React.FC<SemesterProviderProps> = ({ children }) => {
  const { user } = useAuthContext();
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
            console.error('No se pudo actualizar la fecha de inicio en Supabase', error);
          }
        })();
      }
      setSemesterStartVersion((previous) => previous + 1);
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
