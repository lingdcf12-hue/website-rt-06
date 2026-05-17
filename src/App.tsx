import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Home, Calendar, Bell, Image, Mail, Users,
  TrendingUp, Menu, X, ChevronRight, MapPin,
  Clock, Star, Shield
} from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { ActivitySchedule } from './components/sections/ActivitySchedule';
import { ActivityCards } from './components/sections/ActivityCards';
import { Statistics } from './components/sections/Statistics';
import { Gallery } from './components/sections/Gallery';
import { ContactSection } from './components/sections/ContactSection';
import { AdminPanel } from './features/AdminPanel';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import './styles/animations.css';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#000a0f] bg-[radial-gradient(circle_at_top_right,_#003d5b,_transparent_50%),_radial-gradient(circle_at_bottom_left,_#001219,_transparent_50%)]">
      <Toaster position="top-center" expand={true} richColors />
      {/* Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse delay-2000" />
      </div>

      {/* Navbar */}
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Main Content */}
      <main className="relative z-10">
        <Hero />
        <About />
        <ActivitySchedule />
        <ActivityCards />
        <Statistics />
        <Gallery />
        <ContactSection />
      </main>

      {/* Mobile Bottom Navigation */}
      <motion.nav
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-900/40 to-teal-900/40 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
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
              className={`p-3 rounded-full transition-all ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                  : 'hover:bg-white/10'
              }`}
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
        whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(6,182,212,0.8)' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAdmin(true)}
        className="fixed bottom-24 md:bottom-8 right-6 z-50 p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
        title="Admin Panel"
      >
        <Shield className="w-5 h-5" />
      </motion.button>

      {/* Admin Panel Modal */}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
}