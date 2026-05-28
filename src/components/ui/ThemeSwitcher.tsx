import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '../../lib/ThemeContext';

export function ThemeSwitcher() {
  const { theme, setThemeById, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all backdrop-blur-md"
        style={{ boxShadow: `0 0 16px ${theme.glowLight}` }}
        title="Ganti Tema Warna"
      >
        {/* Live color dot */}
        <span
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
        />
        <Palette className="w-4 h-4 opacity-70" />
        <span className="hidden sm:inline">{theme.name}</span>
      </motion.button>

      {/* Dropdown Panel — terbuka ke bawah */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 350 }}
            className="absolute top-full mt-3 right-0 w-72 rounded-3xl bg-[#000d14]/95 backdrop-blur-2xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden z-[200]"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5">
              <p className="text-white font-semibold text-sm flex items-center gap-2">
                <Palette className="w-4 h-4" style={{ color: theme.primary }} />
                Pilih Tema Warna
              </p>
              <p className="text-white/40 text-xs mt-0.5">13 tema profesional tersedia</p>
            </div>

            {/* Theme Grid */}
            <div className="p-3 grid grid-cols-1 gap-1 max-h-80 overflow-y-auto custom-scrollbar">
              {themes.map(t => (
                <motion.button
                  key={t.id}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setThemeById(t.id); setOpen(false); }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl transition-all text-left ${
                    theme.id === t.id
                      ? 'bg-white/10 border border-white/15'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {/* Gradient swatch */}
                  <span
                    className="w-8 h-8 rounded-xl flex-shrink-0 shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`,
                      boxShadow: theme.id === t.id ? `0 0 12px ${t.glow}` : undefined,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium leading-tight">
                      {t.emoji} {t.name}
                    </p>
                    <p className="text-white/30 text-[10px] font-mono mt-0.5">{t.primary}</p>
                  </div>
                  {theme.id === t.id && (
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: t.primary }} />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 border-t border-white/5">
              <p className="text-white/25 text-[10px] text-center">Tema tersimpan otomatis di browser</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
