import React from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { Controls } from './components/Controls';
import { Views } from './components/Views';
import { Modal } from './components/Modal';
import { ConfigModal } from './components/ConfigModal';
import { AuthDialog } from './features/auth/components/AuthDialog';
import { useConsoleClear } from './hooks/useConsoleClear';
import { pickColorForSubject, parseDeliveriesFile, createIcsCalendar } from './utils';

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
    setActiveView,
    selectedSubject,
    setSelectedSubject,
    semesterStart,
    setSemesterStart,
    studySchedule,
    fullSchedule,
    stats,
    subjects,
    deliveries,
    addDeliveries,
    modalOpen,
    editingDelivery,
    formData,
    openModal,
    closeModal,
    handleInputChange,
    addDelivery,
    updateDelivery
  } = useAppContext();

  const importInputRef = React.useRef<HTMLInputElement | null>(null);

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

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const rows = await parseDeliveriesFile(file);
      if (rows.length === 0) {
        window.alert('No se encontraron filas válidas en el archivo.');
        return;
      }

      const newDeliveries = rows.map(row => ({
        subject: row.subject,
        name: row.name,
        date: row.dueDate,
        priority: 'normal' as const,
        color: pickColorForSubject(row.subject, deliveries)
      }));

      addDeliveries(newDeliveries);
      window.alert(`Se importaron ${newDeliveries.length} entregas correctamente.`);
    } catch (error) {
      console.error('Error al importar entregas', error);
      window.alert(error instanceof Error ? error.message : 'No se pudo importar el archivo.');
    } finally {
      event.target.value = '';
    }
  };

  const handleExport = () => {
    if (fullSchedule.length === 0) {
      window.alert('No hay entregas para exportar.');
      return;
    }

    const calendar = createIcsCalendar(fullSchedule);
    const blob = new Blob([calendar], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `entregas-${semesterStart || 'calendario'}.ics`;
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='min-h-screen bg-background'>
      <Header />
      <StatsOverview stats={stats} />

      <Controls
        activeView={activeView}
        onViewChange={setActiveView}
        onAddClick={() => openModal()}
        selectedSubject={selectedSubject}
        subjects={subjects}
        onSubjectChange={setSelectedSubject}
        semesterStart={semesterStart}
        onSemesterStartChange={setSemesterStart}
        onImportClick={handleImportClick}
        onExportClick={handleExport}
        disableExport={fullSchedule.length === 0}
      />

      <input
        ref={importInputRef}
        type='file'
        accept='.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        className='hidden'
        onChange={handleFileChange}
      />

      <Views activeView={activeView} schedule={studySchedule} />

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
