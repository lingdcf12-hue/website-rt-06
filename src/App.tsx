import { useState, useEffect } from 'react';
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
  const { theme } = useTheme();

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
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#000305] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#001a24] via-[#000305] to-[#000000]">
      <Toaster position="top-center" expand={true} richColors />
      
      {/* ── PREMIUM AESTHETIC BACKGROUND (GLOBAL) ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        
        {/* Subtle grid pattern for texture */}
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-screen"
          style={{ 
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
          }}
        />

        {/* Animated Aurora Glows */}
        <div className={`absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full ${theme.aurora1} blur-[130px] animate-aurora`} />
        <div className={`absolute top-[10%] -right-[20%] w-[70%] h-[70%] rounded-full ${theme.aurora2} blur-[140px] animate-aurora-reverse`} />
        <div className={`absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full ${theme.aurora3} blur-[130px] animate-aurora-slow`} />
        <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[150px] animate-pulse" />

        {/* Premium Noise Overlay for Glassmorphism effect */}
        <div 
          className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
          }}
        />
      </div>

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