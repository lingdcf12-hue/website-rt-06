import { useState, useEffect, memo } from 'react';
import { motion } from 'motion/react';
import { Home, Calendar, Bell, Image, Mail, Shield } from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { ActivitySchedule } from './components/sections/ActivitySchedule';
import { ActivityCards } from './components/sections/ActivityCards';
import { Statistics } from './components/sections/Statistics';
import { Gallery } from './components/sections/Gallery';
import { ContactSection } from './components/sections/ContactSection';
import { AdminModal } from './components/modals/AdminModal';
import { AuthModal } from './components/modals/AuthModal';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import { Toaster } from './components/ui/Sonner';
import { toast } from 'sonner';
import { ThemeProvider, useTheme } from './lib/ThemeContext';
import './styles/animations.css';

// ── Background layer — memo agar tidak re-render saat rainbow cycle tick ──
// Hanya re-render saat aurora class berubah (ganti tema manual)
const AppBackground = memo(function AppBackground({
  aurora1, aurora2, aurora3, primary,
}: {
  aurora1: string; aurora2: string; aurora3: string; primary: string;
}) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" style={{ contain: 'strict' }}>
      {/* Aurora blobs — blur dikurangi agar ringan, will-change di CSS */}
      <div className={`absolute -top-[20%] -left-[10%] w-[55%] h-[55%] rounded-full ${aurora1} blur-[100px] animate-aurora`} />
      <div className={`absolute top-[5%] -right-[15%] w-[60%] h-[60%] rounded-full ${aurora2} blur-[110px] animate-aurora-reverse`} />
      <div className={`absolute -bottom-[15%] left-[15%] w-[55%] h-[55%] rounded-full ${aurora3} blur-[100px] animate-aurora-slow`} />
      {/* Center glow — pakai CSS var agar tidak re-render saat rainbow */}
      <div
        className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse"
        style={{ background: `${primary}0e` }}
      />
    </div>
  );
});

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

function AppInner() {
  const [activeSection, setActiveSection] = useState('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'reset-password'>('login');
  const { user, loading: authLoading } = useAuth();
  const { theme, baseTheme } = useTheme();

  // Gunakan baseTheme untuk background agar tidak re-render tiap rainbow tick
  const bgTheme = baseTheme.id === 'rainbow-cycle' ? { primary: '#06b6d4', aurora1: 'bg-cyan-500/10', aurora2: 'bg-purple-500/10', aurora3: 'bg-pink-600/10' } : baseTheme;

  // Track active section via IntersectionObserver
  useEffect(() => {
    const sectionIds = ['home', 'about', 'jadwal', 'kegiatan', 'gallery', 'contact'];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Detect token dari URL setelah klik link di email
  useEffect(() => {
    const hash = window.location.hash;

    // ── RESET PASSWORD: klik link reset password ──
    if (hash.includes('type=recovery') && hash.includes('access_token')) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setAuthInitialMode('reset-password');
          setShowAuth(true);
          window.history.replaceState(null, '', window.location.pathname);
          subscription.unsubscribe();
        }
      });
      return;
    }

    // ── KONFIRMASI REGISTER: klik link aktivasi akun ──
    // Supabase kirim type=signup atau type=email di hash
    if (hash.includes('access_token') && (
      hash.includes('type=signup') ||
      hash.includes('type=email') ||
      hash.includes('type=magiclink')
    )) {
      // Bersihkan hash dulu
      window.history.replaceState(null, '', window.location.pathname);
      // Logout session yang otomatis dibuat, lalu arahkan ke login
      supabase.auth.signOut().then(() => {
        setAuthInitialMode('login');
        setShowAuth(true);
        toast.success('✅ Akun berhasil diaktifkan! Silakan login.');
      });
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Berhasil logout!');
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{
        background: `radial-gradient(ellipse at top right, color-mix(in srgb, ${bgTheme.primary} 10%, #000305) 0%, #000305 45%, #000000 100%)`,
      }}
    >
      <Toaster position="top-center" expand={true} richColors />

      {/* Background — memo, hanya re-render saat ganti tema manual */}
      <AppBackground
        aurora1={bgTheme.aurora1}
        aurora2={bgTheme.aurora2}
        aurora3={bgTheme.aurora3}
        primary={bgTheme.primary}
      />

      {/* Navbar */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        user={user}
        authLoading={authLoading}
        onLoginClick={() => setShowAuth(true)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="relative z-10">
        <Hero />
        <About />
        <ActivitySchedule onLoginRequired={() => setShowAuth(true)} />
        <ActivityCards />
        <Statistics />
        <Gallery onLoginRequired={() => setShowAuth(true)} />
        <ContactSection onLoginRequired={() => setShowAuth(true)} />
      </main>

      {/* Mobile Bottom Navigation */}
      <motion.nav
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-full backdrop-blur-xl border border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          style={{ background: `linear-gradient(135deg, ${theme.primary}22, ${theme.secondary}22)`, borderColor: `${theme.primary}40` }}
        >
          {[
            { icon: Home, label: 'Home', id: 'home' },
            { icon: Calendar, label: 'Jadwal', id: 'jadwal' },
            { icon: Bell, label: 'Kegiatan', id: 'kegiatan' },
            { icon: Image, label: 'Gallery', id: 'gallery' },
            { icon: Mail, label: 'Contact', id: 'contact' }
          ].map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const element = document.getElementById(item.id);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  setActiveSection(item.id);
                }
              }}
              className="p-3 rounded-full transition-all"
              style={activeSection === item.id ? {
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                boxShadow: `0 0 20px ${theme.glow}`,
              } : {}}
            >
              <item.icon className="w-5 h-5 text-white" />
            </motion.button>
          ))}
        </div>
      </motion.nav>

      {/* Tombol Admin Floating */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAdmin(true)}
        className="fixed bottom-24 md:bottom-8 right-6 z-50 p-3.5 rounded-2xl text-white cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
          boxShadow: `0 0 20px ${theme.glow}`,
        }}
        title="Admin Panel"
      >
        <Shield className="w-5 h-5" />
      </motion.button>

      {/* Admin Modal */}
      {showAdmin && <AdminModal onClose={() => setShowAdmin(false)} />}

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onClose={() => { setShowAuth(false); setAuthInitialMode('login'); }}
          initialMode={authInitialMode}
        />
      )}
    </div>
  );
}