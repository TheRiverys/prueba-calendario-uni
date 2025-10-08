import React, { type ReactNode } from 'react';

import { AiProvider } from '@/contexts/ai/AiContext';
import { AuthProvider, useAuthContext } from '@/contexts/auth/AuthContext';
import { ConfigProvider } from '@/contexts/config/ConfigContext';
import { DeliveriesProvider } from '@/contexts/deliveries/DeliveriesContext';
import { PreferencesProvider } from '@/contexts/preferences/PreferencesContext';
import { ScheduleProvider } from '@/contexts/schedule/ScheduleContext';
import { SemesterProvider, useSemesterContext } from '@/contexts/semester/SemesterContext';

import type { User } from '@supabase/supabase-js';

interface AppProviderProps {
  readonly children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <AuthenticatedProviders>{children}</AuthenticatedProviders>
      </PreferencesProvider>
    </AuthProvider>
  );
};

const AuthenticatedProviders: React.FC<{ readonly children: ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();

  return (
    <ConfigProvider user={user}>
      <SemesterProvider user={user}>
        <SemesterBoundaries user={user}>{children}</SemesterBoundaries>
      </SemesterProvider>
    </ConfigProvider>
  );
};

const SemesterBoundaries: React.FC<{
  readonly children: ReactNode;
  readonly user: User | null;
}> = ({ children, user }) => {
  const { semesterStart, semesterStartVersion } = useSemesterContext();

  return (
    <DeliveriesProvider
      user={user}
      semesterStart={semesterStart}
      semesterStartVersion={semesterStartVersion}
    >
      <AiProvider>
        <ScheduleProvider>{children}</ScheduleProvider>
      </AiProvider>
    </DeliveriesProvider>
  );
};
