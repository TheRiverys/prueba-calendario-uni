
import React, { createContext, useContext, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { differenceInCalendarDays, format, isValid, parseISO } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { useDeliveries } from '../hooks/useDeliveries';
import { useSupabaseDeliveries } from '../hooks/useSupabaseDeliveries';
import { useStudySchedule } from '../hooks/useStudySchedule';
import { useStats } from '../hooks/useStats';
import { useModal } from '../hooks/useModal';
import { useSemesterStart } from '../hooks/useSemesterStart';
import { useSupabaseSemesterStart } from '../hooks/useSupabaseSemesterStart';
import { useAI } from '../hooks/useAI';
import { useConfig } from '../hooks/useConfig';
import { useSupabaseConfig } from '../hooks/useSupabaseConfig';
import { createDefaultConfig } from '../utils';
import type {
  Delivery,
  StudySchedule,
  FormData,
  StudyStats,
  ConfigSettings,
  AiDetailedEntry,
  AiScheduleResult,
  AiScheduleOverride
} from '../types';

interface AppContextType {
  // Estado general
  activeView: 'list' | 'calendar' | 'gantt';
  setActiveView: (view: 'list' | 'calendar' | 'gantt') => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  sortBy: 'algorithm' | 'subject' | 'date';
  setSortBy: (sort: 'algorithm' | 'subject' | 'date') => void;
  semesterStart: string;
  setSemesterStart: (date: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Autenticación
  user: User | null;
  authLoading: boolean;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
  signOut: () => Promise<string | null>;

  // Datos
  deliveries: Delivery[];
  studySchedule: StudySchedule[];
  fullSchedule: StudySchedule[];
  stats: StudyStats;
  subjects: string[];

  // Modal de entrega
  modalOpen: boolean;
  editingDelivery: Delivery | null;
  formData: FormData;
  openModal: (delivery?: Delivery | null) => void;
  closeModal: () => void;
  handleInputChange: (field: keyof FormData, value: string) => void;
  setFormData: (data: FormData) => void;

  // CRUD
  addDelivery: (delivery: Omit<Delivery, 'id' | 'completed'>) => void;
  addDeliveries: (deliveries: Omit<Delivery, 'id' | 'completed'>[]) => void;
  updateDelivery: (id: Delivery['id'], updates: Partial<Delivery>) => void;
  deleteDelivery: (id: Delivery['id']) => void;
  toggleCompleted: (id: Delivery['id']) => void;

  // IA
  generateStudySchedule: () => Promise<AiScheduleResult>;
  analyzeProgress: () => Promise<string>;
  clearAiSchedule: () => void;
  aiScheduleApplied: boolean;
  aiLoading: boolean;
  aiError: string | null;

  // Configuración
  config: ConfigSettings;
  updateConfig: (config: Partial<ConfigSettings>) => void;
  resetConfig: () => void;
  openConfigModal: () => void;
  closeConfigModal: () => void;
  configModalOpen: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

const normalizeIsoDate = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const parsed = parseISO(trimmed);
  if (!isValid(parsed)) {
    return null;
  }
  return format(parsed, 'yyyy-MM-dd');
};

const buildDeliveryKey = (subject: string, name: string, date: string): string => {
  return `${subject.trim().toLowerCase()}|${name.trim().toLowerCase()}|${date}`;
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [activeView, setActiveView] = React.useState<'list' | 'calendar' | 'gantt'>('list');
  const [selectedSubject, setSelectedSubject] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<'algorithm' | 'subject' | 'date'>('algorithm');
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [configModalOpen, setConfigModalOpen] = React.useState(false);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [aiOverrides, setAiOverrides] = React.useState<Map<Delivery['id'], AiScheduleOverride>>(() => new Map());

  const auth = useAuth();
  const isAuthenticated = Boolean(auth.user);

  const {
    deliveries: localDeliveries,
    addDelivery: addLocalDelivery,
    addDeliveries: addLocalDeliveries,
    updateDelivery: updateLocalDelivery,
    deleteDelivery: deleteLocalDelivery,
    toggleCompleted: toggleLocalCompleted
  } = useDeliveries();

  const {
    config: localConfig,
    updateConfig: updateLocalConfig,
    resetConfig: resetLocalConfig
  } = useConfig();

  const {
    semesterStart: localSemesterStart,
    setSemesterStart: setLocalSemesterStart
  } = useSemesterStart();

  const {
    deliveries: remoteDeliveries,
    addDelivery: addRemoteDelivery,
    addDeliveries: addRemoteDeliveries,
    updateDelivery: updateRemoteDelivery,
    deleteDelivery: deleteRemoteDelivery,
    toggleCompleted: toggleRemoteCompleted
  } = useSupabaseDeliveries(auth.user);

  const {
    config: remoteConfig,
    updateConfig: updateRemoteConfig,
    resetConfig: resetRemoteConfig
  } = useSupabaseConfig(auth.user);

  const {
    semesterStart: remoteSemesterStart,
    updateSemesterStart: updateRemoteSemesterStart
  } = useSupabaseSemesterStart(auth.user);

  const deliveries = isAuthenticated ? remoteDeliveries : localDeliveries;

  const semesterStart = React.useMemo(() => {
    if (isAuthenticated) {
      // Si el usuario local tiene un valor específico (no la fecha por defecto),
      // priorizarlo sobre el remoto para evitar que se resetee
      const today = new Date().toISOString().split('T')[0];
      if (localSemesterStart && localSemesterStart !== today) {
        return localSemesterStart;
      }
      // Si el remoto tiene un valor válido, usarlo; de lo contrario, usar el local
      return (remoteSemesterStart && remoteSemesterStart.trim() !== '')
        ? remoteSemesterStart
        : localSemesterStart;
    }
    return localSemesterStart;
  }, [isAuthenticated, remoteSemesterStart, localSemesterStart]);

  const baseConfig = React.useMemo(() => {
    if (isAuthenticated) {
      return remoteConfig ?? createDefaultConfig();
    }
    return localConfig;
  }, [isAuthenticated, remoteConfig, localConfig]);

  const config = React.useMemo<ConfigSettings>(() => ({
    ...baseConfig,
    openaiApiKey: localConfig.openaiApiKey
  }), [baseConfig, localConfig.openaiApiKey]);

  const updateConfig = React.useCallback((partial: Partial<ConfigSettings>) => {
    if (isAuthenticated) {
      const { openaiApiKey, ...rest } = partial;
      if (openaiApiKey !== undefined) {
        updateLocalConfig({ openaiApiKey });
      }
      if (Object.keys(rest).length > 0) {
        void (async () => {
          try {
            await updateRemoteConfig(rest);
          } catch (error) {
            console.error('No se pudo actualizar la configuración en Supabase', error);
          }
        })();
      }
    } else {
      updateLocalConfig(partial);
    }
  }, [isAuthenticated, updateLocalConfig, updateRemoteConfig]);

  const resetConfig = React.useCallback(() => {
    if (isAuthenticated) {
      void (async () => {
        try {
          await resetRemoteConfig();
        } catch (error) {
          console.error('No se pudo restaurar la configuración en Supabase', error);
        }
      })();
      const defaults = createDefaultConfig();
      updateLocalConfig({
        baseStudyDays: defaults.baseStudyDays,
        minStudyTime: defaults.minStudyTime,
        priorityVariations: defaults.priorityVariations
      });
    } else {
      resetLocalConfig();
    }
  }, [isAuthenticated, resetRemoteConfig, updateLocalConfig, resetLocalConfig]);

  const addDelivery = React.useCallback((delivery: Omit<Delivery, 'id' | 'completed'>) => {
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
  }, [isAuthenticated, addRemoteDelivery, addLocalDelivery]);

  const addDeliveries = React.useCallback((entries: Omit<Delivery, 'id' | 'completed'>[]) => {
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
  }, [isAuthenticated, addRemoteDeliveries, addLocalDeliveries]);

  const updateDelivery = React.useCallback((id: Delivery['id'], updates: Partial<Delivery>) => {
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
  }, [isAuthenticated, updateRemoteDelivery, updateLocalDelivery]);

  const deleteDelivery = React.useCallback((id: Delivery['id']) => {
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
  }, [isAuthenticated, deleteRemoteDelivery, deleteLocalDelivery]);

  const toggleCompleted = React.useCallback((id: Delivery['id']) => {
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
  }, [isAuthenticated, toggleRemoteCompleted, toggleLocalCompleted]);

  const baseSchedule = useStudySchedule(deliveries, semesterStart, config);

  const fullSchedule = React.useMemo(() => {
    if (aiOverrides.size === 0) {
      return baseSchedule;
    }

    return baseSchedule.map(item => {
      const override = aiOverrides.get(item.id);
      if (!override) {
        return item;
      }

      const start = parseISO(override.startDate);
      const end = parseISO(override.endDate);
      if (!isValid(start) || !isValid(end) || end.getTime() < start.getTime()) {
        return item;
      }

      const studyDays = Math.max(1, differenceInCalendarDays(end, start) + 1);
      const dueDate = parseISO(item.date);
      const warning = end.getTime() > dueDate.getTime();

      return {
        ...item,
        studyStart: format(start, 'yyyy-MM-dd'),
        startDate: start,
        endDate: end,
        studyDays,
        allocatedDays: studyDays,
        warning
      } satisfies StudySchedule;
    });
  }, [baseSchedule, aiOverrides]);

  const { generateStudyPlan, generateDetailedSchedule, analyzeProgress, isLoading: aiLoading, error: aiError } = useAI();

  const stats = useStats(fullSchedule);
  const modal = useModal(semesterStart);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const filteredSchedule = React.useMemo(() => {
    let source = selectedSubject === 'all'
      ? fullSchedule
      : fullSchedule.filter(item => item.subject === selectedSubject);

    if (sortBy === 'algorithm' || sortBy === 'date') {
      source = [...source].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'subject') {
      source = [...source].sort((a, b) => {
        if (a.subject !== b.subject) {
          return a.subject.localeCompare(b.subject);
        }
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    }

    return source;
  }, [fullSchedule, selectedSubject, sortBy]);

  const subjects = React.useMemo(() => {
    return [...new Set(deliveries.map(d => d.subject))];
  }, [deliveries]);

  const toggleTheme = React.useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const openConfigModal = React.useCallback(() => {
    setConfigModalOpen(true);
  }, []);

  const closeConfigModal = React.useCallback(() => {
    setConfigModalOpen(false);
  }, []);

  const openAuthModal = React.useCallback(() => {
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = React.useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const clearAiSchedule = React.useCallback(() => {
    setAiOverrides(prev => (prev.size === 0 ? prev : new Map()));
  }, []);


  const setSemesterStart = React.useCallback((value: string) => {
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
    clearAiSchedule();
  }, [isAuthenticated, updateRemoteSemesterStart, setLocalSemesterStart, clearAiSchedule]);

  const generateStudySchedule = React.useCallback(async (): Promise<AiScheduleResult> => {
    try {
      const studyPlan = await generateStudyPlan(deliveries, semesterStart);

      if (studyPlan.length === 0) {
        clearAiSchedule();
        return { entries: [], applied: false } satisfies AiScheduleResult;
      }

      const deliveryKeyIndex = new Map<string, Delivery['id']>();
      deliveries.forEach(delivery => {
        const normalizedDate = normalizeIsoDate(delivery.date);
        if (!normalizedDate) {
          return;
        }
        const key = buildDeliveryKey(delivery.subject, delivery.name, normalizedDate);
        if (!deliveryKeyIndex.has(key)) {
          deliveryKeyIndex.set(key, delivery.id);
        }
      });

      const overrides = new Map<Delivery['id'], AiScheduleOverride>();
      studyPlan.forEach(planEntry => {
        const deliveryDate = normalizeIsoDate(planEntry.deliveryDate);
        const startDate = normalizeIsoDate(planEntry.startDate);
        const endDate = normalizeIsoDate(planEntry.endDate);
        if (!deliveryDate || !startDate || !endDate) {
          return;
        }
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        if (!isValid(start) || !isValid(end) || end.getTime() < start.getTime()) {
          return;
        }
        const key = buildDeliveryKey(planEntry.subject ?? '', planEntry.name ?? '', deliveryDate);
        const deliveryId = deliveryKeyIndex.get(key);
        if (!deliveryId) {
          return;
        }
        overrides.set(deliveryId, { startDate, endDate });
      });

      setAiOverrides(prev => {
        if (overrides.size === 0 && prev.size === 0) {
          return prev;
        }
        return overrides.size === 0 ? new Map() : new Map(overrides);
      });

      const detailedSchedule = generateDetailedSchedule(studyPlan) as AiDetailedEntry[];
      return {
        entries: detailedSchedule,
        applied: overrides.size > 0
      } satisfies AiScheduleResult;
    } catch (error) {
      console.error('Error generando horario con IA:', error);
      clearAiSchedule();
      return { entries: [], applied: false } satisfies AiScheduleResult;
    }
  }, [generateStudyPlan, generateDetailedSchedule, deliveries, semesterStart, clearAiSchedule]);

  const analyzeProgressWrapper = React.useCallback(async () => {
    const completed = deliveries.filter(d => d.completed);
    const upcoming = deliveries.filter(d => !d.completed);
    return analyzeProgress(completed, upcoming);
  }, [analyzeProgress, deliveries]);

  const aiScheduleApplied = aiOverrides.size > 0;

  const handleSignIn = React.useCallback(async (email: string, password: string) => {
    const { error } = await auth.signIn(email, password);
    if (error) {
      return error.message;
    }
    setAuthModalOpen(false);
    return null;
  }, [auth]);

  const handleSignUp = React.useCallback(async (email: string, password: string) => {
    const { error } = await auth.signUp(email, password);
    if (error) {
      return error.message;
    }
    setAuthModalOpen(false);
    return null;
  }, [auth]);

  const handleResetPassword = React.useCallback(async (email: string) => {
    const { error } = await auth.resetPassword(email);
    if (error) {
      return error.message;
    }
    return null;
  }, [auth]);

  const handleSignOut = React.useCallback(async () => {
    const { error } = await auth.signOut();
    if (error) {
      return error.message;
    }
    return null;
  }, [auth]);

  const contextValue: AppContextType = {
    activeView,
    setActiveView,
    selectedSubject,
    setSelectedSubject,
    sortBy,
    setSortBy,
    theme,
    toggleTheme,
    semesterStart,
    setSemesterStart,
    user: auth.user,
    authLoading: auth.loading,
    authModalOpen,
    openAuthModal,
    closeAuthModal,
    signIn: handleSignIn,
    signUp: handleSignUp,
    resetPassword: handleResetPassword,
    signOut: handleSignOut,
    deliveries,
    studySchedule: filteredSchedule,
    fullSchedule,
    stats,
    subjects,
    ...modal,
    addDelivery,
    addDeliveries,
    updateDelivery,
    deleteDelivery,
    toggleCompleted,
    generateStudySchedule,
    analyzeProgress: analyzeProgressWrapper,
    clearAiSchedule,
    aiScheduleApplied,
    aiLoading,
    aiError,
    config,
    updateConfig,
    resetConfig,
    openConfigModal,
    closeConfigModal,
    configModalOpen
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
