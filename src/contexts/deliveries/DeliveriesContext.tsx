import { createContext, useContext, useMemo, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useDeliveries as useLocalDeliveries } from '@/hooks/useDeliveries';
import { useSupabaseDeliveries } from '@/hooks/supabase/useSupabaseDeliveries';
import { useModal } from '@/hooks/useModal';
import { useAuthContext } from '@/contexts/auth/AuthContext';
import { useSemesterContext } from '@/contexts/semester/SemesterContext';
import type { Delivery, FormData } from '@/types';

interface DeliveriesContextValue {
  deliveries: Delivery[];
  deliveriesVersion: number;
  subjects: string[];
  addDelivery: (delivery: Omit<Delivery, 'id' | 'completed'>) => void;
  addDeliveries: (entries: Omit<Delivery, 'id' | 'completed'>[]) => void;
  updateDelivery: (id: Delivery['id'], updates: Partial<Delivery>) => void;
  deleteDelivery: (id: Delivery['id']) => void;
  toggleCompleted: (id: Delivery['id']) => void;
  modalOpen: boolean;
  editingDelivery: Delivery | null;
  formData: FormData;
  openModal: (delivery?: Delivery | null) => void;
  closeModal: () => void;
  handleInputChange: (field: keyof FormData, value: string) => void;
  setFormData: (data: FormData) => void;
}

const DeliveriesContext = createContext<DeliveriesContextValue | undefined>(undefined);

interface DeliveriesProviderProps {
  children: ReactNode;
}

export const DeliveriesProvider: React.FC<DeliveriesProviderProps> = ({ children }) => {
  const { user } = useAuthContext();
  const isAuthenticated = Boolean(user);
  const { semesterStart } = useSemesterContext();

  const {
    deliveries: localDeliveries,
    addDelivery: addLocalDelivery,
    addDeliveries: addLocalDeliveries,
    updateDelivery: updateLocalDelivery,
    deleteDelivery: deleteLocalDelivery,
    toggleCompleted: toggleLocalCompleted,
  } = useLocalDeliveries();

  const {
    deliveries: remoteDeliveries,
    addDelivery: addRemoteDelivery,
    addDeliveries: addRemoteDeliveries,
    updateDelivery: updateRemoteDelivery,
    deleteDelivery: deleteRemoteDelivery,
    toggleCompleted: toggleRemoteCompleted,
  } = useSupabaseDeliveries(user);

  const deliveries = useMemo(() => {
    return isAuthenticated ? remoteDeliveries : localDeliveries;
  }, [isAuthenticated, remoteDeliveries, localDeliveries]);

  const [deliveriesVersion, setDeliveriesVersion] = useState(0);

  const modal = useModal(semesterStart);

  const incrementVersion = useCallback(() => {
    setDeliveriesVersion((previous) => previous + 1);
  }, []);

  // Escuchar cambios en semesterStart para forzar recálculo del algoritmo
  useEffect(() => {
    if (semesterStart) {
      incrementVersion();
    }
  }, [semesterStart, incrementVersion]);

  const addDelivery = useCallback(
    (delivery: Omit<Delivery, 'id' | 'completed'>) => {
      if (isAuthenticated) {
        void (async () => {
          try {
            await addRemoteDelivery(delivery);
          } catch (error) {
            console.error('No se pudo crear la entrega en Supabase', error);
          }
        })();
      } else {
        addLocalDelivery(delivery);
      }
      incrementVersion();
    },
    [isAuthenticated, addRemoteDelivery, addLocalDelivery, incrementVersion]
  );

  const addDeliveries = useCallback(
    (entries: Omit<Delivery, 'id' | 'completed'>[]) => {
      if (entries.length === 0) {
        return;
      }
      if (isAuthenticated) {
        void (async () => {
          try {
            await addRemoteDeliveries(entries);
          } catch (error) {
            console.error('No se pudo importar entregas en Supabase', error);
          }
        })();
      } else {
        addLocalDeliveries(entries);
      }
      incrementVersion();
    },
    [isAuthenticated, addRemoteDeliveries, addLocalDeliveries, incrementVersion]
  );

  const updateDelivery = useCallback(
    (id: Delivery['id'], updates: Partial<Delivery>) => {
      if (isAuthenticated) {
        void (async () => {
          try {
            await updateRemoteDelivery(id, updates);
          } catch (error) {
            console.error('No se pudo actualizar la entrega en Supabase', error);
          }
        })();
      } else {
        updateLocalDelivery(id, updates);
      }
      incrementVersion();
    },
    [isAuthenticated, updateRemoteDelivery, updateLocalDelivery, incrementVersion]
  );

  const deleteDelivery = useCallback(
    (id: Delivery['id']) => {
      if (isAuthenticated) {
        void (async () => {
          try {
            await deleteRemoteDelivery(id);
          } catch (error) {
            console.error('No se pudo eliminar la entrega en Supabase', error);
          }
        })();
      } else {
        deleteLocalDelivery(id);
      }
      incrementVersion();
    },
    [isAuthenticated, deleteRemoteDelivery, deleteLocalDelivery, incrementVersion]
  );

  const toggleCompleted = useCallback(
    (id: Delivery['id']) => {
      if (isAuthenticated) {
        void (async () => {
          try {
            await toggleRemoteCompleted(id);
          } catch (error) {
            console.error('No se pudo actualizar el estado de la entrega en Supabase', error);
          }
        })();
      } else {
        toggleLocalCompleted(id);
      }
      incrementVersion();
    },
    [isAuthenticated, toggleRemoteCompleted, toggleLocalCompleted, incrementVersion]
  );

  const subjects = useMemo(() => {
    return [...new Set(deliveries.map((delivery) => delivery.subject))];
  }, [deliveries]);

  const value = useMemo<DeliveriesContextValue>(
    () => ({
      deliveries,
      deliveriesVersion,
      subjects,
      addDelivery,
      addDeliveries,
      updateDelivery,
      deleteDelivery,
      toggleCompleted,
      modalOpen: modal.modalOpen,
      editingDelivery: modal.editingDelivery,
      formData: modal.formData,
      openModal: modal.openModal,
      closeModal: modal.closeModal,
      handleInputChange: modal.handleInputChange,
      setFormData: modal.setFormData,
    }),
    [
      deliveries,
      deliveriesVersion,
      subjects,
      addDelivery,
      addDeliveries,
      updateDelivery,
      deleteDelivery,
      toggleCompleted,
      modal.modalOpen,
      modal.editingDelivery,
      modal.formData,
      modal.openModal,
      modal.closeModal,
      modal.handleInputChange,
      modal.setFormData,
    ]
  );

  return <DeliveriesContext.Provider value={value}>{children}</DeliveriesContext.Provider>;
};

export const useDeliveriesContext = (): DeliveriesContextValue => {
  const context = useContext(DeliveriesContext);
  if (!context) {
    throw new Error('useDeliveriesContext must be used within a DeliveriesProvider');
  }
  return context;
};
