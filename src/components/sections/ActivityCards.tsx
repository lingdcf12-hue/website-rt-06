import { motion, AnimatePresence } from 'motion/react';
import { Bell, Megaphone, Heart, Gift, Music, Book, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../lib/ThemeContext';

const iconMap: Record<string, any> = {
  Bell,
  Megaphone,
  Heart,
  Gift,
  Music,
  Book
};

const TITLE_LIMIT = 60;
const DESC_LIMIT = 120;

export function ActivityCards() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { theme } = useTheme();

  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE);
  const currentActivities = activities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <section id="kegiatan" className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full backdrop-blur-xl border"
            style={{ background: `${theme.primary}18`, borderColor: `${theme.primary}40` }}
          >
            <Bell className="w-4 h-4" style={{ color: theme.primary }} />
            <span className="text-sm" style={{ color: theme.primary }}>Kegiatan & Pengumuman ({activities.length})</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}>Kegiatan</span> Warga Terbaru
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            Informasi terkini seputar kegiatan, pengumuman, dan program RT 6 RW 1 untuk warga
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-cyan-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg font-medium">Memuat Pengumuman Terbaru...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-20 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <Megaphone className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: theme.primary }} />
            <h3 className="text-2xl font-bold text-white mb-2">Belum Ada Pengumuman</h3>
            <p className="text-white/50">Pengumuman dan kegiatan terbaru akan muncul di sini.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {currentActivities.map((activity, index) => {
                  const IconComponent = iconMap[activity.icon_name] || Bell;
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      whileHover={{ y: -15, scale: 1.05 }}
                      className="relative p-6 rounded-[2rem] bg-gradient-to-b from-[#001a24] to-[#000a0f] backdrop-blur-2xl border-[3px] border-white/5 overflow-hidden group cursor-pointer transition-all duration-300"
                      style={{ boxShadow: `inset 0 3px 1px rgba(255,255,255,0.15), inset 0 -8px 15px rgba(0,0,0,0.8), 0 15px 30px rgba(0,0,0,0.8), 0 0 30px ${theme.glowLight}` }}
                    >
                      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500 z-0"
                        style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }} />
                      <div className="absolute inset-0 opacity-35 mix-blend-screen group-hover:opacity-60 transition-all duration-700 group-hover:scale-110 z-0"
                        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1555502699-1bdc57659dc4?auto=format&fit=crop&q=80&w=600')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: `hue-rotate(${index * 65}deg) saturate(2)` }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#000a0f] via-[#000a0f]/70 to-transparent z-0" />
                      <div className="absolute -top-10 -right-10 w-48 h-48 opacity-20 blur-[60px] group-hover:opacity-40 group-hover:scale-150 transition-all duration-700 z-0 rounded-full"
                        style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }} />
                      <div className="absolute inset-1.5 rounded-[1.6rem] border border-white/10 group-hover:border-white/30 transition-colors pointer-events-none z-10" />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-5">
                          <div className="p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"
                            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, boxShadow: `inset 0 2px 0 rgba(255,255,255,0.3), 0 10px 20px rgba(0,0,0,0.5)` }}>
                            <IconComponent className="w-7 h-7 text-white drop-shadow-md" />
                          </div>
                          <span className="px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md text-white/80 font-semibold text-xs border border-white/10 shadow-inner group-hover:bg-white/10 transition-colors">
                            {activity.badge}
                          </span>
                        </div>

                        <h3 className="text-2xl font-black text-white mb-3 tracking-wide drop-shadow-md">
                          {activity.title.length > TITLE_LIMIT && expandedId !== activity.id
                            ? activity.title.slice(0, TITLE_LIMIT) + '…'
                            : activity.title}
                        </h3>
                        <p className="text-white/60 text-sm leading-relaxed font-medium">
                          {activity.description && activity.description.length > DESC_LIMIT && expandedId !== activity.id
                            ? activity.description.slice(0, DESC_LIMIT) + '…'
                            : activity.description}
                        </p>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => { e.stopPropagation(); setExpandedId(prev => prev === activity.id ? null : activity.id); }}
                          className="mt-4 w-full py-3 rounded-xl text-white font-bold text-sm border-t border-white/30 opacity-80 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, boxShadow: `inset 0 -3px 0 rgba(0,0,0,0.3), 0 5px 15px rgba(0,0,0,0.4)` }}
                        >
                          {expandedId === activity.id ? '↑ Tutup' : 'Selengkapnya'}
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <motion.button whileHover={currentPage > 1 ? { scale: 1.05 } : {}} whileTap={currentPage > 1 ? { scale: 0.95 } : {}}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}
                  className="p-3 rounded-xl border text-white/70 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ borderColor: `${theme.primary}40`, background: `${theme.primary}10` }}>
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <motion.button key={page} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(page)}
                    className="w-11 h-11 rounded-xl font-medium border transition-all text-white"
                    style={currentPage === page ? {
                      background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                      borderColor: theme.primary, boxShadow: `0 0 20px ${theme.glowLight}`,
                    } : { background: `${theme.primary}10`, borderColor: `${theme.primary}30`, color: 'rgba(255,255,255,0.6)' }}>
                    {page}
                  </motion.button>
                ))}
                <motion.button whileHover={currentPage < totalPages ? { scale: 1.05 } : {}} whileTap={currentPage < totalPages ? { scale: 0.95 } : {}}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}
                  className="p-3 rounded-xl border text-white/70 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ borderColor: `${theme.primary}40`, background: `${theme.primary}10` }}>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
