import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, LogIn, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../lib/ThemeContext';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  user?: SupabaseUser | null;
  authLoading?: boolean;
  onLoginClick?: () => void;
  onLogout?: () => void;
}

export function Navbar({
  activeSection,
  setActiveSection,
  user,
  authLoading,
  onLoginClick,
  onLogout,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [siteLogo, setSiteLogo] = useState<string>('');
  const { theme } = useTheme();

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'site_logo')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value?.url) setSiteLogo(data.value.url);
      });
  }, []);

  const navItems = [
    { label: 'Beranda', id: 'home' },
    { label: 'Tentang kami', id: 'about' },
    { label: 'Jadwal Aktivitas', id: 'jadwal' },
    { label: 'Kegiatan', id: 'kegiatan' },
    { label: 'Gallery', id: 'gallery' },
    { label: 'Contact', id: 'contact' }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    onLogout?.();
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#000a0f]/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
        style={{ borderBottomColor: `${theme.primary}30` }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-3">

            {/* Logo */}
            <motion.div className="flex items-center gap-3 shrink-0" whileHover={{ scale: 1.05 }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  boxShadow: `0 0 20px ${theme.glow}`,
                }}
              >
                {siteLogo ? (
                  <img
                    src={siteLogo}
                    alt="Logo RT 6"
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">RT</span>
                )}
              </div>
              <div className="hidden sm:block">
                <h1
                  className="text-white text-lg font-bold bg-clip-text text-transparent leading-tight"
                  style={{ backgroundImage: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
                >
                  RT 6 RW 1 Josjis
                </h1>
                <p className="text-xs opacity-60" style={{ color: theme.primary }}>Core-06</p>
              </div>
            </motion.div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    activeSection === item.id
                      ? 'text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                  style={activeSection === item.id ? {
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                    boxShadow: `0 0 20px ${theme.glow}`,
                  } : {}}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>

            {/* Theme Switcher + Auth Button */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Theme Switcher — desktop only */}
              <div className="hidden md:block">
                <ThemeSwitcher />
              </div>

              {!authLoading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border"
                        style={{ background: `${theme.primary}15`, borderColor: `${theme.primary}40` }}
                      >
                        {user.user_metadata?.avatar_url ? (
                          <img
                            src={user.user_metadata.avatar_url}
                            alt="avatar"
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4" style={{ color: theme.primary }} />
                        )}
                        <span className="text-white text-xs font-medium max-w-[80px] truncate hidden sm:block">
                          {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowLogoutConfirm(true)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all"
                        title="Logout"
                      >
                        <LogOut className="w-4 h-4" />
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onLoginClick}
                      className="flex items-center gap-2 px-4 py-2 rounded-2xl text-white text-sm font-semibold transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                        boxShadow: `0 0 15px ${theme.glowLight}`,
                      }}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </motion.button>
                  )}
                </>
              )}

              {/* Mobile hamburger */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-full text-white"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  boxShadow: `0 0 20px ${theme.glow}`,
                }}
              >
                {isOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t border-white/10"
              style={{ borderTopColor: `${theme.primary}20` }}
            >
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      scrollToSection(item.id);
                      setIsOpen(false);
                    }}
                    className={`px-4 py-2 rounded-full text-sm text-left transition-all ${
                      activeSection === item.id ? 'text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                    style={activeSection === item.id ? {
                      background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                      boxShadow: `0 0 20px ${theme.glow}`,
                    } : {}}
                  >
                    {item.label}
                  </motion.button>
                ))}
                {/* Theme Switcher di mobile menu */}
                <div className="pt-2 border-t border-white/10 mt-1" style={{ borderTopColor: `${theme.primary}20` }}>
                  <ThemeSwitcher />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* ── LOGOUT CONFIRMATION POPUP ── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={(e) => e.target === e.currentTarget && setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative w-full max-w-sm bg-gradient-to-br from-[#000d14] to-[#001a24] border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden"
              style={{ borderColor: `${theme.primary}20` }}
            >
              {/* Glow decorations */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-red-500/10 blur-[60px] pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-cyan-500/10 blur-[60px] pointer-events-none" />

              <div className="relative z-10 p-8 text-center">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5"
                >
                  <LogOut className="w-7 h-7 text-red-400" />
                </motion.div>

                {/* Text */}
                <h3 className="text-white font-bold text-xl mb-2">Yakin mau logout?</h3>
                <p className="text-white/40 text-sm mb-7">
                  Kamu akan keluar dari akun{' '}
                  <span className="font-medium" style={{ color: theme.primary }}>
                    {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
                  </span>
                  . Bisa login lagi kapan saja.
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 py-3 rounded-2xl bg-white/8 hover:bg-white/12 border border-white/10 text-white font-medium text-sm transition-all"
                  >
                    Batal
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(239,68,68,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogoutConfirm}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-500 hover:to-red-600 border border-red-500/40 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Ya, Logout
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
