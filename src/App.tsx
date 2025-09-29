import React from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { Controls } from './components/Controls';
import { Views } from './components/Views';
import { Modal } from './components/Modal';
import { ConfigModal } from './components/ConfigModal';
import { AuthDialog } from './features/auth/components/AuthDialog';
import { FeedbackPanel } from './components/FeedbackPanel';
import { useConsoleClear } from './hooks/useConsoleClear';
import { pickColorForSubject } from './utils';

const priorities: Array<{ value: 'low' | 'normal' | 'high'; label: string; color: string }> = [
  { value: 'low', label: 'Baja', color: 'bg-muted' },
  { value: 'normal', label: 'Normal', color: 'bg-chart-1' },
  { value: 'high', label: 'Alta', color: 'bg-destructive' }
];

const AppContent: React.FC = () => {
  // Hook para limpiar datos con comando de consola
  useConsoleClear();

  const {
    activeView,
    semesterStart,
    setSemesterStart,
    studySchedule,
    stats,
    subjects,
    deliveries,
    modalOpen,
    editingDelivery,
    formData,
    closeModal,
    handleInputChange,
    addDelivery,
    updateDelivery
  } = useAppContext();

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
      color
    };

    if (editingDelivery) {
      updateDelivery(editingDelivery.id, deliveryPayload);
    } else {
      addDelivery(deliveryPayload);
    }

    closeModal();
  };

  return (
    <div className='min-h-screen bg-background'>
      <Header />

      {/* Controles de planificación - antes de las métricas */}
      <div className="app-shell mt-6">
        <Controls
          semesterStart={semesterStart}
          onSemesterStartChange={setSemesterStart}
        />
      </div>

      {/* Franja superior de métricas */}
      <StatsOverview stats={stats} />

      {/* Área principal: vistas - ocupa todo el ancho */}
      <main className="app-shell mt-6 pb-12">
        <Views activeView={activeView} schedule={studySchedule} />
      </main>

      {/* Modales y paneles */}
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
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
