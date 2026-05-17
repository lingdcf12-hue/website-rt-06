import { motion } from 'motion/react';
import { Users, TrendingUp, Calendar, Award, ArrowUpRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const NAMA_BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export function Statistics() {
  const TOTAL_WARGA = 256;
  const [counts, setCounts] = useState({
    schedules: 0, activities: 0, participation: 0, avgAttendees: 0,
    schedulesThisMonth: 0, activitiesThisMonth: 0
  });
  const [monthlyData, setMonthlyData] = useState<number[]>(Array(12).fill(0));
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
      const currentYear = now.getFullYear();
      const yearStart = new Date(currentYear, 0, 1).toISOString();
      const yearEnd   = new Date(currentYear, 11, 31, 23, 59, 59, 999).toISOString();

      const [schedulesRes, actAll, schedMonth, actMonth, schedulesByMonth, registrationsRes] = await Promise.all([
        supabase.from('schedules').select('attendees'),
        supabase.from('activities').select('*', { count: 'exact', head: true }),
        supabase.from('schedules').select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth).lte('created_at', endOfMonth),
        supabase.from('activities').select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth).lte('created_at', endOfMonth),
        // Ambil semua jadwal tahun ini untuk chart (untuk penyebut target)
        supabase.from('schedules').select('created_at, attendees')
          .gte('created_at', yearStart).lte('created_at', yearEnd),
        // Ambil semua pendaftaran (registrations) untuk pembilang
        supabase.from('registrations').select('created_at')
      ]);

      const schedulesData = schedulesRes.data || [];
      const totalSchedules = schedulesData.length;
      const totalAttendees = (registrationsRes.data || []).length;
      const avgAttendees = totalSchedules > 0 ? Math.round(totalAttendees / totalSchedules) : 0;

      const totalTarget = schedulesData.reduce((sum: number, s: any) => sum + (Number(s.attendees) || 0), 0);

      // Partisipasi keseluruhan (berdasarkan target peserta)
      const participation = totalTarget > 0
        ? Math.min(100, Math.ceil((totalAttendees / totalTarget) * 100))
        : totalSchedules > 0 ? Math.min(100, Math.ceil((totalAttendees / (totalSchedules * TOTAL_WARGA)) * 100)) : 0;

      // Hitung partisipasi per bulan untuk chart
      const monthBuckets: { totalAttendees: number; target: number; count: number }[] = Array.from({ length: 12 }, () => ({ totalAttendees: 0, target: 0, count: 0 }));
      
      // Jumlah jadwal & target per bulan
      (schedulesByMonth.data || []).forEach((s: any) => {
        const month = new Date(s.created_at).getMonth(); // 0-11
        monthBuckets[month].count += 1;
        monthBuckets[month].target += (Number(s.attendees) || 0);
      });
      
      // Jumlah pendaftar per bulan
      (registrationsRes.data || []).forEach((reg: any) => {
        const date = new Date(reg.created_at);
        if (date.getFullYear() === currentYear) {
          const month = date.getMonth();
          monthBuckets[month].totalAttendees += 1;
        }
      });

      const newMonthlyData = monthBuckets.map(({ totalAttendees: att, target, count }) => {
        if (count === 0) return 0;
        const validTarget = target > 0 ? target : (count * TOTAL_WARGA);
        return Math.min(100, Math.ceil((att / validTarget) * 100));
      });

      setMonthlyData(newMonthlyData);
      setCounts({
        schedules: totalSchedules,
        activities: actAll.count || 0,
        participation,
        avgAttendees,
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
    {
      icon: Users,
      value: '256',
      label: 'Total Warga',
      change: `+12 ${namaBulanIni}`,
      gradient: 'from-cyan-500 to-teal-500'
    },
    {
      icon: Calendar,
      value: counts.schedules.toString(),
      label: 'Jadwal Aktivitas',
      change: `+${counts.schedulesThisMonth} ${namaBulanIni}`,
      gradient: 'from-teal-500 to-emerald-500'
    },
    {
      icon: TrendingUp,
      value: counts.activities.toString(),
      label: 'Kegiatan Warga',
      change: `+${counts.activitiesThisMonth} ${namaBulanIni}`,
      gradient: 'from-emerald-500 to-cyan-500'
    },
    {
      icon: Award,
      value: `${counts.participation}%`,
      label: 'Partisipasi',
      change: `+${counts.avgAttendees} peserta/jadwal`,
      gradient: 'from-cyan-500 to-emerald-500'
    }
  ];

  return (
    <section className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-gradient-to-r from-cyan-900/40 to-teal-900/40 backdrop-blur-xl border border-cyan-500/30">
            <TrendingUp className="w-4 h-4 text-cyan-300" />
            <span className="text-cyan-200 text-sm">Dashboard Monitoring</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Statistik <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Real-Time</span>
          </h2>
          <p className="text-cyan-200/60 max-w-2xl mx-auto">
            Pantau pertumbuhan komunitas dan tingkat partisipasi warga secara transparan dan dinamis langsung dari database.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative p-6 rounded-[2rem] bg-gradient-to-br from-cyan-900/20 to-teal-900/10 backdrop-blur-xl border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)] overflow-hidden group"
            >
              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${stat.gradient} shadow-[0_0_20px_rgba(6,182,212,0.4)] mb-6`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>

                <div className={`text-4xl font-bold mb-1 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {isLoading && (stat.label === 'Jadwal Aktivitas' || stat.label === 'Kegiatan Warga' || stat.label === 'Partisipasi') ? (
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                  ) : (
                    stat.value
                  )}
                </div>

                <div className="text-cyan-100/70 font-medium mb-3">{stat.label}</div>

                <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{stat.change} bulan ini</span>
                </div>
              </div>
              
              <div className={`absolute bottom-0 left-6 right-6 h-1 rounded-full bg-gradient-to-r ${stat.gradient} opacity-30 group-hover:opacity-100 transition-opacity`} />
            </motion.div>
          ))}
        </div>

        {/* Participation Chart */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-cyan-900/20 to-teal-900/10 backdrop-blur-xl border border-cyan-500/20 shadow-[0_0_50px_rgba(0,0,0,0.3)]"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              Tren Partisipasi Warga
              <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-normal">
                Live Data
              </span>
            </h3>
            <div className="flex items-center gap-4 text-sm text-cyan-300/60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                <span>Kehadiran</span>
              </div>
              <div className="text-emerald-400 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                {(() => {
                  const activeMonths = monthlyData.filter(v => v > 0);
                  const avg = activeMonths.length > 0
                    ? Math.round(activeMonths.reduce((a, b) => a + b, 0) / activeMonths.length)
                    : 0;
                  return avg > 0 ? `Avg. ${avg}% / Bulan` : 'Belum ada data';
                })()}
              </div>
            </div>
          </div>

          <div className="relative pt-10">
            <div className="grid grid-cols-12 gap-3 md:gap-4 items-end h-64">
              {monthlyData.map((height, index) => (
                <div key={index} className="relative group h-full flex flex-col justify-end">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.8, ease: "easeOut" }}
                    className="relative w-full rounded-t-xl bg-gradient-to-t from-cyan-500 to-teal-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] group-hover:from-cyan-400 group-hover:to-teal-300 transition-all cursor-pointer"
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 px-2 py-1 rounded-md text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {height}%
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-6 px-1">
              {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'].map((month, i) => (
                <span key={i} className="text-[10px] md:text-xs text-cyan-300/40 font-medium uppercase tracking-wider">
                  {month}
                </span>
              ))}
            </div>

            <div className="absolute inset-0 -z-10 flex flex-col justify-between pointer-events-none pt-10 pb-6 opacity-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full h-px bg-white" />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
