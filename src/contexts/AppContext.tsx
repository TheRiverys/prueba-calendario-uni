import React, { type ReactNode } from 'react';

import { AiProvider } from '@/contexts/ai/AiContext';
import { AuthProvider } from '@/contexts/auth/AuthContext';
import { ConfigProvider } from '@/contexts/config/ConfigContext';
import { DeliveriesProvider } from '@/contexts/deliveries/DeliveriesContext';
import { PreferencesProvider } from '@/contexts/preferences/PreferencesContext';
import { ScheduleProvider } from '@/contexts/schedule/ScheduleContext';
import { SemesterProvider } from '@/contexts/semester/SemesterContext';

interface AppProviderProps {
  readonly children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <ConfigProvider>
          <SemesterProvider>
            <DeliveriesProvider>
              <AiProvider>
                <ScheduleProvider>{children}</ScheduleProvider>
              </AiProvider>
            </DeliveriesProvider>
          </SemesterProvider>
        </ConfigProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
};
