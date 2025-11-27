import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Récupérer le thème sauvegardé ou utiliser le défaut
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('qwonen-theme') as Theme;
      return saved || defaultTheme;
    }
    return defaultTheme;
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  // Fonction pour déterminer le thème effectif
  const getEffectiveTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return currentTheme;
  };

  // Fonction pour appliquer le thème au DOM
  const applyTheme = (newEffectiveTheme: 'light' | 'dark') => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newEffectiveTheme);
    
    // Mettre à jour l'attribut data-theme pour compatibilité
    root.setAttribute('data-theme', newEffectiveTheme);
    
    // Mettre à jour la couleur de la barre de statut mobile
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', newEffectiveTheme === 'dark' ? '#0a0a0a' : '#ffffff');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = newEffectiveTheme === 'dark' ? '#0a0a0a' : '#ffffff';
      document.head.appendChild(meta);
    }
  };

  // Fonction pour définir le thème
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('qwonen-theme', newTheme);
    
    const newEffectiveTheme = getEffectiveTheme(newTheme);
    setEffectiveTheme(newEffectiveTheme);
    applyTheme(newEffectiveTheme);
    
    // Déclencher un événement personnalisé pour notifier d'autres composants
    window.dispatchEvent(new CustomEvent('qwonen-theme-change', {
      detail: { theme: newTheme, effectiveTheme: newEffectiveTheme }
    }));
  };

  // Fonction pour basculer entre clair et sombre
  const toggleTheme = () => {
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Effet pour initialiser le thème au chargement
  useEffect(() => {
    const initialEffectiveTheme = getEffectiveTheme(theme);
    setEffectiveTheme(initialEffectiveTheme);
    applyTheme(initialEffectiveTheme);
  }, []);

  // Effet pour écouter les changements de préférence système
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const newEffectiveTheme = e.matches ? 'dark' : 'light';
      setEffectiveTheme(newEffectiveTheme);
      applyTheme(newEffectiveTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Effet pour mettre à jour le thème quand la préférence change
  useEffect(() => {
    if (theme === 'system') {
      const newEffectiveTheme = getEffectiveTheme(theme);
      if (newEffectiveTheme !== effectiveTheme) {
        setEffectiveTheme(newEffectiveTheme);
        applyTheme(newEffectiveTheme);
      }
    }
  }, [theme, effectiveTheme]);

  const value: ThemeContextType = {
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook pour détecter les changements de thème
export function useThemeListener(callback: (theme: 'light' | 'dark') => void) {
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      callback(event.detail.effectiveTheme);
    };

    window.addEventListener('qwonen-theme-change', handleThemeChange as EventListener);
    return () => window.removeEventListener('qwonen-theme-change', handleThemeChange as EventListener);
  }, [callback]);
}

// Utilitaire pour obtenir le thème actuel sans hook
export function getCurrentTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

// Utilitaire pour forcer un thème spécifique (utile pour les tests)
export function forceTheme(theme: 'light' | 'dark') {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  root.setAttribute('data-theme', theme);
}