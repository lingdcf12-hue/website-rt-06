import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { THEMES, DEFAULT_THEME_ID, getThemeById, applyThemeToCss, type Theme } from './themes';

interface ThemeContextValue {
  theme: Theme;
  setThemeById: (id: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: THEMES[0],
  setThemeById: () => {},
  themes: THEMES,
});

const STORAGE_KEY = 'rt6-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? getThemeById(saved) : getThemeById(DEFAULT_THEME_ID);
  });

  useEffect(() => {
    applyThemeToCss(theme);
    localStorage.setItem(STORAGE_KEY, theme.id);
  }, [theme]);

  const setThemeById = (id: string) => {
    setTheme(getThemeById(id));
  };

  return (
    <ThemeContext.Provider value={{ theme, setThemeById, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
