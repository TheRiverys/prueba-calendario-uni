import React, { useEffect } from 'react';

import { ConfigModal } from './components/ConfigModal';
import { Controls } from './components/Controls';
import { CookieConsentBanner } from './components/gdpr/CookieConsentBanner';
import { PrivacyPolicy } from './components/gdpr/PrivacyPolicy';
import { Header } from './components/Header';
import { HelpPage } from './components/help/HelpPage';
import { Modal } from './components/Modal';
import { Profile } from './components/Profile';
import { StatsOverview } from './components/StatsOverview';
import { FeedbackPanel } from './components/ui/FeedbackPanel';
import { Toaster } from './components/ui/sonner';
import { Views } from './components/Views';
import { AppProvider } from './contexts/AppContext';
import { useDeliveriesContext } from './contexts/deliveries/DeliveriesContext';
import { GdprProvider } from './contexts/gdpr/GdprContext';
import { usePreferencesContext } from './contexts/preferences/PreferencesContext';
import { useScheduleContext } from './contexts/schedule/ScheduleContext';
import { useSemesterContext } from './contexts/semester/SemesterContext';
import { AuthDialog } from './features/auth/components/AuthDialog';
import { useAppTour } from './hooks/useAppTour';
import { useConsoleClear } from './hooks/useConsoleClear';
import { pickColorForSubject } from './utils/colors';
import { trackUserAccess } from './utils/storage';

const priorities: Array<{ value: 'low' | 'normal' | 'high'; label: string; color: string }> = [
  { value: 'low', label: 'Baja', color: 'bg-muted' },
  { value: 'normal', label: 'Normal', color: 'bg-chart-1' },
  { value: 'high', label: 'Alta', color: 'bg-destructive' },
];

const AppContent: React.FC = () => {
  useConsoleClear();
  useAppTour();

  // Registrar acceso de usuario único en analíticas al montar la aplicación
  useEffect(() => {
    trackUserAccess();
  }, []);

  const { activeView, currentPage } = usePreferencesContext();
  const { semesterStart, setSemesterStart } = useSemesterContext();
  const { studySchedule, stats } = useScheduleContext();
  const {
    deliveries,
    subjects,
    modalOpen,
    editingDelivery,
    formData,
    closeModal,
    handleInputChange,
    addDelivery,
    updateDelivery,
  } = useDeliveriesContext();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const subject = formData.subject.trim();
    const name = formData.name.trim();

    if (!subject || !name) {
      return;
    }

    const color = pickColorForSubject(subject, deliveries);

    const deliveryPayload = {
      subject,
      name,
      date: formData.date,
      priority: formData.priority,
      color,
    };

    if (editingDelivery) {
      updateDelivery(editingDelivery.id, deliveryPayload);
    } else {
      addDelivery(deliveryPayload);
    }

    closeModal();
  };

  return (
    <div className='bg-background min-h-screen'>
      <Header />

      {currentPage === 'profile' ? (
        <Profile />
      ) : currentPage === 'help' ? (
        <HelpPage />
      ) : currentPage === 'privacy-policy' ? (
        <PrivacyPolicy />
      ) : (
        <>
          <div className='app-shell mt-6'>
            <Controls semesterStart={semesterStart} onSemesterStartChange={setSemesterStart} />
          </div>

          <StatsOverview stats={stats} />

          <main className='app-shell mt-6 pb-12'>
            <Views activeView={activeView} schedule={studySchedule} />
          </main>
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        editingDelivery={editingDelivery}
        formData={formData}
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
        subjectOptions={subjects}
        priorities={priorities}
      />

      <ConfigModal />
      <AuthDialog />
      <FeedbackPanel />
      <CookieConsentBanner />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GdprProvider>
      <AppProvider>
        <AppContent />
        <Toaster />
      </AppProvider>
    </GdprProvider>
  );
};

export default App;
