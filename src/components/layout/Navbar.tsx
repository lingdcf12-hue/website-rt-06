import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function Navbar({ activeSection, setActiveSection }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="relative px-6 py-4 rounded-full bg-gradient-to-r from-cyan-900/30 via-teal-900/20 to-emerald-900/30 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                <span className="text-white font-bold">RT</span>
              </div>
              <div>
                <h1 className="text-white text-lg font-bold bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent">
                  RT 6 RW 1 Josjis
                </h1>
                <p className="text-cyan-300/60 text-xs">Core-06</p>
              </div>
            </motion.div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                      : 'text-cyan-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </motion.button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t border-cyan-500/20"
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
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                        : 'text-cyan-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
