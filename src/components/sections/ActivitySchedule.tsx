import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, MapPin, Users, Plus, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { RegisterModal } from '../../features/RegisterModal';
import { supabase } from '../../lib/supabase';

export function ActivitySchedule() {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const [schedulesRes, registrationsRes] = await Promise.all([
        supabase.from('schedules').select('*').order('created_at', { ascending: false }),
        supabase.from('registrations').select('activity_title')
      ]);

      if (schedulesRes.error) throw schedulesRes.error;

      // Hitung pendaftar tiap kegiatan
      const regCount: Record<string, number> = {};
      (registrationsRes.data || []).forEach((reg: any) => {
        regCount[reg.activity_title] = (regCount[reg.activity_title] || 0) + 1;
      });

      const schedulesWithCounts = (schedulesRes.data || []).map((s: any) => ({
        ...s,
        registeredCount: regCount[s.title] || 0
      }));

      setSchedules(schedulesWithCounts);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = (title: string) => {
    setSelectedActivity(title);
    setIsModalOpen(true);
  };

  const showMore = () => {
    setVisibleCount(prev => prev + 4);
  };

  return (
    <section id="jadwal" className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-gradient-to-r from-cyan-900/40 to-teal-900/40 backdrop-blur-xl border border-cyan-500/30">
            <Calendar className="w-4 h-4 text-cyan-300" />
            <span className="text-cyan-200 text-sm">Jadwal Kegiatan ({schedules.length})</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Jadwal <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Aktivitas Warga</span>
          </h2>
          <p className="text-cyan-200/60 max-w-2xl mx-auto">
            Pantau jadwal kegiatan RT 6 RW 1 terbaru dan jangan lewatkan momen penting bersama komunitas
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-cyan-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg font-medium">Menghubungkan ke Database Cloud...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-20 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <Calendar className="w-16 h-16 text-cyan-500/30 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Belum Ada Jadwal</h3>
            <p className="text-cyan-200/60">Data jadwal akan muncul di sini setelah diinput melalui dashboard admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {schedules.slice(0, visibleCount).map((schedule, index) => (
                <motion.div
                  key={schedule.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="relative p-6 rounded-3xl bg-gradient-to-br from-cyan-900/30 to-teal-900/20 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)] overflow-hidden group"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${schedule.color} opacity-20 blur-3xl group-hover:opacity-30 transition-opacity`} />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">{schedule.title}</h3>
                      <div className={`p-2 rounded-full bg-gradient-to-r ${schedule.color} shadow-[0_0_20px_rgba(6,182,212,0.4)]`}>
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-cyan-200/80">
                        <div className="p-2 rounded-lg bg-white/5">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <span>{schedule.date}</span>
                      </div>

                      <div className="flex items-center gap-3 text-cyan-200/80">
                        <div className="p-2 rounded-lg bg-white/5">
                          <Clock className="w-4 h-4" />
                        </div>
                        <span>{schedule.time}</span>
                      </div>

                      <div className="flex items-center gap-3 text-cyan-200/80">
                        <div className="p-2 rounded-lg bg-white/5">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span>{schedule.location}</span>
                      </div>

                      <div className="flex items-center gap-3 text-cyan-200/80">
                        <div className="p-2 rounded-lg bg-white/5">
                          <Users className="w-4 h-4" />
                        </div>
                        <span>{schedule.registeredCount} peserta terdaftar</span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRegisterClick(schedule.title)}
                      className={`mt-6 w-full py-3 rounded-full bg-gradient-to-r ${schedule.color} text-white font-medium shadow-[0_0_20px_rgba(6,182,212,0.4)]`}
                    >
                      Daftar Sekarang
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {visibleCount < schedules.length && (
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
              Lihat Lebih Banyak ({schedules.length - visibleCount} lagi)
            </motion.button>
          </motion.div>
        )}
      </div>

      <RegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activityTitle={selectedActivity || ''}
      />
    </section>
  );
}
