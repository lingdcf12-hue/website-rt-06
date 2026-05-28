import {
  createContext, useContext, useState, useEffect,
  useRef, useTransition, type ReactNode,
} from 'react';
import { THEMES, DEFAULT_THEME_ID, getThemeById, applyThemeToCss, type Theme } from './themes';

interface ThemeContextValue {
  theme: Theme;           // live theme (changes each tick during rainbow)
  baseTheme: Theme;       // actually selected theme
  setThemeById: (id: string) => void;
  themes: Theme[];
  livePrimary: string;
  liveSecondary: string;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: THEMES[0],
  baseTheme: THEMES[0],
  setThemeById: () => {},
  themes: THEMES,
  livePrimary: THEMES[0].primary,
  liveSecondary: THEMES[0].secondary,
});

const STORAGE_KEY = 'rt6-theme';
const CYCLE_THEMES = THEMES.filter(t => t.id !== 'rainbow-cycle');
const CYCLE_INTERVAL = 2200; // ms — lebih lambat = lebih smooth, lebih ringan

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [baseTheme, setBaseTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? getThemeById(saved) : getThemeById(DEFAULT_THEME_ID);
  });

  const [liveTheme, setLiveTheme] = useState<Theme>(
    baseTheme.id === 'rainbow-cycle' ? CYCLE_THEMES[0] : baseTheme
  );

  const cycleIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, baseTheme.id);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (baseTheme.id !== 'rainbow-cycle') {
      applyThemeToCss(baseTheme);
      setLiveTheme(baseTheme);
      return;
    }

    // Rainbow cycle — CSS vars update immediately (no React re-render cost)
    // React state update wrapped in startTransition = low priority, won't block scroll
    cycleIndexRef.current = 0;

    const tick = () => {
      const current = CYCLE_THEMES[cycleIndexRef.current % CYCLE_THEMES.length];
      // CSS vars update is instant and cheap — no React involved
      applyThemeToCss(current);
      // React state update is low-priority — won't block scroll/interaction
      startTransition(() => {
        setLiveTheme(current);
      });
      cycleIndexRef.current++;
    };

    tick();
    intervalRef.current = setInterval(tick, CYCLE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [baseTheme]);

  const setThemeById = (id: string) => {
    setBaseTheme(getThemeById(id));
  };

  return (
    <ThemeContext.Provider value={{
      theme: liveTheme,
      baseTheme,
      setThemeById,
      themes: THEMES,
      livePrimary: liveTheme.primary,
      liveSecondary: liveTheme.secondary,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
