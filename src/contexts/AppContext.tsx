import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/auth/AuthContext';
import { PreferencesProvider } from '@/contexts/preferences/PreferencesContext';
import { ConfigProvider } from '@/contexts/config/ConfigContext';
import { SemesterProvider } from '@/contexts/semester/SemesterContext';
import { DeliveriesProvider } from '@/contexts/deliveries/DeliveriesContext';
import { AiProvider } from '@/contexts/ai/AiContext';
import { ScheduleProvider } from '@/contexts/schedule/ScheduleContext';

interface AppProviderProps {
  children: ReactNode;
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
