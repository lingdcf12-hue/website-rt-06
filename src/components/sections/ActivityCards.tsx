import { motion, AnimatePresence } from 'motion/react';
import { Bell, Megaphone, Heart, Gift, Music, Book, Plus, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const iconMap: Record<string, any> = {
  Bell,
  Megaphone,
  Heart,
  Gift,
  Music,
  Book
};

export function ActivityCards() {
  const [visibleCount, setVisibleCount] = useState(6);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const showMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  return (
    <section id="kegiatan" className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-gradient-to-r from-cyan-900/40 to-teal-900/40 backdrop-blur-xl border border-cyan-500/30">
            <Bell className="w-4 h-4 text-cyan-300" />
            <span className="text-cyan-200 text-sm">Kegiatan & Pengumuman ({activities.length})</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Kegiatan</span> Warga Terbaru
          </h2>
          <p className="text-cyan-200/60 max-w-2xl mx-auto">
            Informasi terkini seputar kegiatan, pengumuman, and program RT 6 RW 1 untuk warga
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-cyan-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg font-medium">Memuat Pengumuman Terbaru...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-20 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <Megaphone className="w-16 h-16 text-cyan-500/30 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Belum Ada Pengumuman</h3>
            <p className="text-cyan-200/60">Pengumuman dan kegiatan terbaru akan muncul di sini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {activities.slice(0, visibleCount).map((activity, index) => {
                const IconComponent = iconMap[activity.icon_name] || Bell;
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -10, scale: 1.03 }}
                    className="relative p-6 rounded-3xl bg-gradient-to-br from-cyan-900/30 to-teal-900/20 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)] overflow-hidden group cursor-pointer"
                  >
                    <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${activity.gradient} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-2xl bg-gradient-to-r ${activity.gradient} shadow-[0_0_20px_rgba(6,182,212,0.4)]`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs border border-cyan-500/30">
                          {activity.badge}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3">{activity.title}</h3>
                      <p className="text-cyan-200/70 text-sm leading-relaxed">{activity.description}</p>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-6 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-cyan-200 hover:text-white text-sm border border-cyan-500/30 transition-all"
                      >
                        Selengkapnya
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {visibleCount < activities.length && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-12 text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(6,182,212,0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={showMore}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium flex items-center gap-2 mx-auto shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <Plus className="w-5 h-5" />
              Lihat Lebih Banyak ({activities.length - visibleCount} lagi)
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
