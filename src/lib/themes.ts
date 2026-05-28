// ─────────────────────────────────────────────
//  TEMA WARNA WEBSITE RT 6 RW 1 JOSJIS
//  12+ tema profesional dengan color grading
// ─────────────────────────────────────────────

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  // Tailwind gradient classes (from → to)
  gradFrom: string;   // e.g. 'cyan-500'
  gradTo: string;     // e.g. 'teal-500'
  gradVia?: string;   // optional middle stop
  // Raw hex/rgb for CSS variables & inline shadows
  primary: string;    // hex
  secondary: string;  // hex
  glow: string;       // rgba string for box-shadow
  glowLight: string;  // rgba string lighter
  // Background tint for cards/borders
  bgTint: string;     // e.g. 'cyan-900'
  bgTint2: string;    // e.g. 'teal-900'
  // Text accent
  textAccent: string; // e.g. 'cyan-400'
  textMuted: string;  // e.g. 'cyan-200'
  borderColor: string;// e.g. 'cyan-500'
  // Aurora blob colors for background
  aurora1: string;    // tailwind bg class
  aurora2: string;
  aurora3: string;
}

export const THEMES: Theme[] = [
  // 1. Cyan Teal (default)
  {
    id: 'cyan-teal',
    name: 'Cyan Teal',
    emoji: '🩵',
    gradFrom: 'cyan-500', gradTo: 'teal-500',
    primary: '#06b6d4', secondary: '#14b8a6',
    glow: 'rgba(6,182,212,0.6)', glowLight: 'rgba(6,182,212,0.2)',
    bgTint: 'cyan-900', bgTint2: 'teal-900',
    textAccent: 'cyan-400', textMuted: 'cyan-200', borderColor: 'cyan-500',
    aurora1: 'bg-cyan-500/10', aurora2: 'bg-emerald-500/10', aurora3: 'bg-teal-600/10',
  },
  // 2. Ocean Blue
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    emoji: '🌊',
    gradFrom: 'blue-500', gradTo: 'cyan-500',
    primary: '#3b82f6', secondary: '#06b6d4',
    glow: 'rgba(59,130,246,0.6)', glowLight: 'rgba(59,130,246,0.2)',
    bgTint: 'blue-900', bgTint2: 'cyan-900',
    textAccent: 'blue-400', textMuted: 'blue-200', borderColor: 'blue-500',
    aurora1: 'bg-blue-500/10', aurora2: 'bg-cyan-500/10', aurora3: 'bg-indigo-600/10',
  },
  // 3. Royal Purple
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    emoji: '💜',
    gradFrom: 'purple-500', gradTo: 'violet-500',
    primary: '#a855f7', secondary: '#8b5cf6',
    glow: 'rgba(168,85,247,0.6)', glowLight: 'rgba(168,85,247,0.2)',
    bgTint: 'purple-900', bgTint2: 'violet-900',
    textAccent: 'purple-400', textMuted: 'purple-200', borderColor: 'purple-500',
    aurora1: 'bg-purple-500/10', aurora2: 'bg-violet-500/10', aurora3: 'bg-fuchsia-600/10',
  },
  // 4. Sunset Rose
  {
    id: 'sunset-rose',
    name: 'Sunset Rose',
    emoji: '🌸',
    gradFrom: 'rose-500', gradTo: 'pink-500',
    primary: '#f43f5e', secondary: '#ec4899',
    glow: 'rgba(244,63,94,0.6)', glowLight: 'rgba(244,63,94,0.2)',
    bgTint: 'rose-900', bgTint2: 'pink-900',
    textAccent: 'rose-400', textMuted: 'rose-200', borderColor: 'rose-500',
    aurora1: 'bg-rose-500/10', aurora2: 'bg-pink-500/10', aurora3: 'bg-red-600/10',
  },
  // 5. Emerald Forest
  {
    id: 'emerald-forest',
    name: 'Emerald Forest',
    emoji: '🌿',
    gradFrom: 'emerald-500', gradTo: 'green-500',
    primary: '#10b981', secondary: '#22c55e',
    glow: 'rgba(16,185,129,0.6)', glowLight: 'rgba(16,185,129,0.2)',
    bgTint: 'emerald-900', bgTint2: 'green-900',
    textAccent: 'emerald-400', textMuted: 'emerald-200', borderColor: 'emerald-500',
    aurora1: 'bg-emerald-500/10', aurora2: 'bg-green-500/10', aurora3: 'bg-teal-600/10',
  },
  // 6. Golden Amber
  {
    id: 'golden-amber',
    name: 'Golden Amber',
    emoji: '✨',
    gradFrom: 'amber-500', gradTo: 'yellow-500',
    primary: '#f59e0b', secondary: '#eab308',
    glow: 'rgba(245,158,11,0.6)', glowLight: 'rgba(245,158,11,0.2)',
    bgTint: 'amber-900', bgTint2: 'yellow-900',
    textAccent: 'amber-400', textMuted: 'amber-200', borderColor: 'amber-500',
    aurora1: 'bg-amber-500/10', aurora2: 'bg-yellow-500/10', aurora3: 'bg-orange-600/10',
  },
  // 7. Neon Orange
  {
    id: 'neon-orange',
    name: 'Neon Orange',
    emoji: '🔥',
    gradFrom: 'orange-500', gradTo: 'red-500',
    primary: '#f97316', secondary: '#ef4444',
    glow: 'rgba(249,115,22,0.6)', glowLight: 'rgba(249,115,22,0.2)',
    bgTint: 'orange-900', bgTint2: 'red-900',
    textAccent: 'orange-400', textMuted: 'orange-200', borderColor: 'orange-500',
    aurora1: 'bg-orange-500/10', aurora2: 'bg-red-500/10', aurora3: 'bg-amber-600/10',
  },
  // 8. Indigo Galaxy
  {
    id: 'indigo-galaxy',
    name: 'Indigo Galaxy',
    emoji: '🌌',
    gradFrom: 'indigo-500', gradTo: 'purple-500',
    primary: '#6366f1', secondary: '#a855f7',
    glow: 'rgba(99,102,241,0.6)', glowLight: 'rgba(99,102,241,0.2)',
    bgTint: 'indigo-900', bgTint2: 'purple-900',
    textAccent: 'indigo-400', textMuted: 'indigo-200', borderColor: 'indigo-500',
    aurora1: 'bg-indigo-500/10', aurora2: 'bg-purple-500/10', aurora3: 'bg-blue-600/10',
  },
  // 9. Fuchsia Neon
  {
    id: 'fuchsia-neon',
    name: 'Fuchsia Neon',
    emoji: '💫',
    gradFrom: 'fuchsia-500', gradTo: 'pink-500',
    primary: '#d946ef', secondary: '#ec4899',
    glow: 'rgba(217,70,239,0.6)', glowLight: 'rgba(217,70,239,0.2)',
    bgTint: 'fuchsia-900', bgTint2: 'pink-900',
    textAccent: 'fuchsia-400', textMuted: 'fuchsia-200', borderColor: 'fuchsia-500',
    aurora1: 'bg-fuchsia-500/10', aurora2: 'bg-pink-500/10', aurora3: 'bg-purple-600/10',
  },
  // 10. Sky Breeze
  {
    id: 'sky-breeze',
    name: 'Sky Breeze',
    emoji: '☁️',
    gradFrom: 'sky-500', gradTo: 'blue-400',
    primary: '#0ea5e9', secondary: '#60a5fa',
    glow: 'rgba(14,165,233,0.6)', glowLight: 'rgba(14,165,233,0.2)',
    bgTint: 'sky-900', bgTint2: 'blue-900',
    textAccent: 'sky-400', textMuted: 'sky-200', borderColor: 'sky-500',
    aurora1: 'bg-sky-500/10', aurora2: 'bg-blue-400/10', aurora3: 'bg-cyan-600/10',
  },
  // 11. Lime Acid
  {
    id: 'lime-acid',
    name: 'Lime Acid',
    emoji: '⚡',
    gradFrom: 'lime-500', gradTo: 'green-400',
    primary: '#84cc16', secondary: '#4ade80',
    glow: 'rgba(132,204,22,0.6)', glowLight: 'rgba(132,204,22,0.2)',
    bgTint: 'lime-900', bgTint2: 'green-900',
    textAccent: 'lime-400', textMuted: 'lime-200', borderColor: 'lime-500',
    aurora1: 'bg-lime-500/10', aurora2: 'bg-green-400/10', aurora3: 'bg-emerald-600/10',
  },
  // 12. Crimson Red
  {
    id: 'crimson-red',
    name: 'Crimson Red',
    emoji: '❤️',
    gradFrom: 'red-500', gradTo: 'rose-600',
    primary: '#ef4444', secondary: '#f43f5e',
    glow: 'rgba(239,68,68,0.6)', glowLight: 'rgba(239,68,68,0.2)',
    bgTint: 'red-900', bgTint2: 'rose-900',
    textAccent: 'red-400', textMuted: 'red-200', borderColor: 'red-500',
    aurora1: 'bg-red-500/10', aurora2: 'bg-rose-500/10', aurora3: 'bg-orange-600/10',
  },
  // 13. Teal Mint
  {
    id: 'teal-mint',
    name: 'Teal Mint',
    emoji: '🌱',
    gradFrom: 'teal-400', gradTo: 'cyan-300',
    primary: '#2dd4bf', secondary: '#67e8f9',
    glow: 'rgba(45,212,191,0.6)', glowLight: 'rgba(45,212,191,0.2)',
    bgTint: 'teal-900', bgTint2: 'cyan-900',
    textAccent: 'teal-400', textMuted: 'teal-200', borderColor: 'teal-400',
    aurora1: 'bg-teal-400/10', aurora2: 'bg-cyan-300/10', aurora3: 'bg-emerald-500/10',
  },
  // 14. Rainbow Cycle — auto-rotates through all themes
  {
    id: 'rainbow-cycle',
    name: 'Rainbow Cycle',
    emoji: '🌈',
    gradFrom: 'cyan-500', gradTo: 'purple-500',
    primary: '#06b6d4', secondary: '#a855f7',
    glow: 'rgba(6,182,212,0.6)', glowLight: 'rgba(6,182,212,0.2)',
    bgTint: 'cyan-900', bgTint2: 'purple-900',
    textAccent: 'cyan-400', textMuted: 'cyan-200', borderColor: 'cyan-500',
    aurora1: 'bg-cyan-500/10', aurora2: 'bg-purple-500/10', aurora3: 'bg-pink-600/10',
  },
];

export const DEFAULT_THEME_ID = 'cyan-teal';

export function getThemeById(id: string): Theme {
  return THEMES.find(t => t.id === id) ?? THEMES[0];
}

// Inject CSS variables into :root for use in inline styles & CSS
export function applyThemeToCss(theme: Theme) {
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', theme.primary);
  root.style.setProperty('--theme-secondary', theme.secondary);
  root.style.setProperty('--theme-glow', theme.glow);
  root.style.setProperty('--theme-glow-light', theme.glowLight);
}
