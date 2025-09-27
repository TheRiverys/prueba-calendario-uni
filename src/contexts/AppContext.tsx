import React, { createContext, useContext, ReactNode } from 'react';
import { useDeliveries } from '../hooks/useDeliveries';
import { useStudySchedule } from '../hooks/useStudySchedule';
import { useStats } from '../hooks/useStats';
import { useModal } from '../hooks/useModal';
import { useSemesterStart } from '../hooks/useSemesterStart';
import type { Delivery, StudySchedule, FormData, StudyStats } from '../types';

interface AppContextType {
  // Estado de la aplicación
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

  // Datos
  deliveries: Delivery[];
  studySchedule: StudySchedule[];
  fullSchedule: StudySchedule[];
  stats: StudyStats;
  subjects: string[];

  // Modal
  modalOpen: boolean;
  editingDelivery: Delivery | null;
  formData: FormData;
  openModal: (delivery?: Delivery | null) => void;
  closeModal: () => void;
  handleInputChange: (field: keyof FormData, value: string) => void;
  setFormData: (data: FormData) => void;

  // CRUD operations
  addDelivery: (delivery: Omit<Delivery, 'id' | 'completed'>) => void;
  addDeliveries: (deliveries: Omit<Delivery, 'id' | 'completed'>[]) => void;
  updateDelivery: (id: number, updates: Partial<Delivery>) => void;
  deleteDelivery: (id: number) => void;
  toggleCompleted: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [activeView, setActiveView] = React.useState<'list' | 'calendar' | 'gantt'>('list');
  const [selectedSubject, setSelectedSubject] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<'algorithm' | 'subject' | 'date'>('algorithm');
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  const { deliveries, addDelivery, addDeliveries, updateDelivery, deleteDelivery, toggleCompleted } = useDeliveries();
  const { semesterStart, setSemesterStart } = useSemesterStart();
  const fullSchedule = useStudySchedule(deliveries, semesterStart);
  const stats = useStats(fullSchedule);
  const modal = useModal(semesterStart);

  const filteredSchedule = React.useMemo(() => {
    let filtered = selectedSubject === 'all' ? fullSchedule : fullSchedule.filter(item => item.subject === selectedSubject);

    if (sortBy !== 'algorithm') {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'subject':
            if (a.subject !== b.subject) {
              return a.subject.localeCompare(b.subject);
            }
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          case 'date':
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [fullSchedule, selectedSubject, sortBy, semesterStart]);

  const subjects = React.useMemo(() => {
    const uniqueSubjects = [...new Set(deliveries.map(d => d.subject))];
    return uniqueSubjects;
  }, [deliveries]);

  const toggleTheme = React.useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

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
    deliveries,
    studySchedule: filteredSchedule,
    fullSchedule,
    stats,
    ...modal,
    addDelivery,
    addDeliveries,
    updateDelivery,
    deleteDelivery,
    toggleCompleted,
    subjects
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
