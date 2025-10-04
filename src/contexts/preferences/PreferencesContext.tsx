import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

type ViewMode = 'list' | 'calendar' | 'gantt';
type Page = 'dashboard' | 'profile';
type SortOption = 'algorithm' | 'subject' | 'date';
type ThemeMode = 'light' | 'dark';

interface PreferencesContextValue {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  sortBy: SortOption;
  setSortBy: (option: SortOption) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

interface PreferencesProviderProps {
  children: ReactNode;
}

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({ children }) => {
  const [activeView, setActiveView] = useState<ViewMode>('list');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('algorithm');
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((previous) => (previous === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      activeView,
      setActiveView,
      currentPage,
      setCurrentPage,
      selectedSubject,
      setSelectedSubject,
      sortBy,
      setSortBy,
      theme,
      toggleTheme,
    }),
    [activeView, currentPage, selectedSubject, sortBy, theme, toggleTheme]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

export const usePreferencesContext = (): PreferencesContextValue => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferencesContext must be used within a PreferencesProvider');
  }
  return context;
};
