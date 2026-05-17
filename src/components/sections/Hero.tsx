import { motion } from 'motion/react';
import { ChevronRight, MapPin, Users, Calendar, Bell, ArrowUpRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// Nama bulan dalam Bahasa Indonesia
const NAMA_BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export function Hero() {
  const [counts, setCounts] = useState({
    schedules: 0, activities: 0,
    schedulesThisMonth: 0, activitiesThisMonth: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const now = new Date();
  const namaBulanIni = NAMA_BULAN[now.getMonth()];
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const [schedAll, schedMonth, actAll, actMonth] = await Promise.all([
        supabase.from('schedules').select('*', { count: 'exact', head: true }),
        supabase.from('schedules').select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth).lte('created_at', endOfMonth),
        supabase.from('activities').select('*', { count: 'exact', head: true }),
        supabase.from('activities').select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth).lte('created_at', endOfMonth)
      ]);

      setCounts({
        schedules: schedAll.count || 0,
        activities: actAll.count || 0,
        schedulesThisMonth: schedMonth.count || 0,
        activitiesThisMonth: actMonth.count || 0
      });
    } catch (error) {
      console.error('Error fetching counts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { label: 'Total Warga', value: '256', gradient: 'from-cyan-500 to-teal-500', icon: Users, change: `+12 ${namaBulanIni}` },
    { label: 'Jadwal Aktivitas', value: counts.schedules.toString(), gradient: 'from-teal-500 to-emerald-500', icon: Calendar, change: `+${counts.schedulesThisMonth} ${namaBulanIni}` },
    { label: 'Kegiatan Warga', value: counts.activities.toString(), gradient: 'from-emerald-500 to-cyan-500', icon: Bell, change: `+${counts.activitiesThisMonth} ${namaBulanIni}` }
  ];

  return (
    <section id="home" className="relative pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-cyan-900/40 to-teal-900/40 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
          >
            <MapPin className="w-4 h-4 text-cyan-300" />
            <span className="text-cyan-200 text-sm">Sawojajar Gg. V, RT 06 RW 01,Kota Malang, Jawa Timur, Indonesia</span>
          </motion.div>

          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="text-white">Selamat Datang di</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
              RT 06 RW 01 Josjis
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-cyan-200/80 text-lg md:text-xl max-w-2xl mx-auto mb-8"
          >
            Platform komunitas digital untuk efisiensi informasi lingkungan. Akses jadwal ronda, kegiatan sosial, dan pengumuman resmi secara real-time.
          </motion.p>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(6,182,212,0.8)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const element = document.getElementById('kegiatan');
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="group px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white font-medium shadow-[0_0_30px_rgba(6,182,212,0.6)] flex items-center gap-2 cursor-pointer"
            >
              Lihat Kegiatan
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const element = document.getElementById('about');
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-xl border border-cyan-500/30 text-white font-medium hover:bg-white/20 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              Tentang Kami
            </motion.button>
          </motion.div>
        </div>

        {/* Floating Stats Cards */}
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative p-6 rounded-3xl bg-gradient-to-br from-cyan-900/30 to-teal-900/20 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)] overflow-hidden group flex items-center gap-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                   style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
              
              <div className={`relative z-10 p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-[0_0_20px_rgba(6,182,212,0.4)]`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>

              <div className="relative z-10">
                <div className={`text-4xl font-bold mb-1 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {isLoading && (stat.label === 'Jadwal Aktivitas' || stat.label === 'Kegiatan Warga') ? (
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                  ) : (
                    stat.value
                  )}
                </div>
                <div className="text-cyan-200/60 text-sm font-medium mb-2">{stat.label}</div>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>{stat.change}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
