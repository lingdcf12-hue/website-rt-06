import { motion } from 'motion/react';
import { Users, TrendingUp, Calendar, Award, ArrowUpRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../lib/ThemeContext';

const NAMA_BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export function Statistics() {
  const TOTAL_WARGA = 256;
  const { theme } = useTheme();
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

  useEffect(() => { fetchCounts(); }, []);

  const fetchCounts = async () => {
    try {
      const currentYear = now.getFullYear();
      const yearStart = new Date(currentYear, 0, 1).toISOString();
      const yearEnd   = new Date(currentYear, 11, 31, 23, 59, 59, 999).toISOString();

      const [schedulesRes, actAll, schedMonth, actMonth, schedulesByMonth, registrationsRes] = await Promise.all([
        supabase.from('schedules').select('attendees'),
        supabase.from('activities').select('*', { count: 'exact', head: true }),
        supabase.from('schedules').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth).lte('created_at', endOfMonth),
        supabase.from('activities').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth).lte('created_at', endOfMonth),
        supabase.from('schedules').select('created_at, attendees').gte('created_at', yearStart).lte('created_at', yearEnd),
        supabase.from('registrations').select('created_at')
      ]);

      const schedulesData = schedulesRes.data || [];
      const totalSchedules = schedulesData.length;
      const totalAttendees = (registrationsRes.data || []).length;
      const avgAttendees = totalSchedules > 0 ? Math.round(totalAttendees / totalSchedules) : 0;
      const totalTarget = schedulesData.reduce((sum: number, s: any) => sum + (Number(s.attendees) || 0), 0);
      const participation = totalTarget > 0
        ? Math.min(100, Math.ceil((totalAttendees / totalTarget) * 100))
        : totalSchedules > 0 ? Math.min(100, Math.ceil((totalAttendees / (totalSchedules * TOTAL_WARGA)) * 100)) : 0;

      const monthBuckets: { totalAttendees: number; target: number; count: number }[] = Array.from({ length: 12 }, () => ({ totalAttendees: 0, target: 0, count: 0 }));
      (schedulesByMonth.data || []).forEach((s: any) => {
        const month = new Date(s.created_at).getMonth();
        monthBuckets[month].count += 1;
        monthBuckets[month].target += (Number(s.attendees) || 0);
      });
      (registrationsRes.data || []).forEach((reg: any) => {
        const date = new Date(reg.created_at);
        if (date.getFullYear() === currentYear) monthBuckets[date.getMonth()].totalAttendees += 1;
      });

      const newMonthlyData = monthBuckets.map(({ totalAttendees: att, target, count }) => {
        if (count === 0) return 0;
        const validTarget = target > 0 ? target : (count * TOTAL_WARGA);
        return Math.min(100, Math.ceil((att / validTarget) * 100));
      });

      setMonthlyData(newMonthlyData);
      setCounts({ schedules: totalSchedules, activities: actAll.count || 0, participation, avgAttendees, schedulesThisMonth: schedMonth.count || 0, activitiesThisMonth: actMonth.count || 0 });
    } catch (error) {
      console.error('Error fetching counts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { icon: Users,      value: '256',                        label: 'Total Warga',      change: `+12 ${namaBulanIni}` },
    { icon: Calendar,   value: counts.schedules.toString(),  label: 'Jadwal Aktivitas', change: `+${counts.schedulesThisMonth} ${namaBulanIni}` },
    { icon: TrendingUp, value: counts.activities.toString(), label: 'Kegiatan Warga',   change: `+${counts.activitiesThisMonth} ${namaBulanIni}` },
    { icon: Award,      value: `${counts.participation}%`,  label: 'Partisipasi',      change: `+${counts.avgAttendees} peserta/jadwal` },
  ];

  const cardStyle = {
    background: `linear-gradient(135deg, ${theme.primary}15, ${theme.secondary}08)`,
    borderColor: `${theme.primary}25`,
    boxShadow: `0 0 30px ${theme.glowLight}`,
  };

  return (
    <section className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full backdrop-blur-xl border"
            style={{ background: `${theme.primary}18`, borderColor: `${theme.primary}40` }}>
            <TrendingUp className="w-4 h-4" style={{ color: theme.primary }} />
            <span className="text-sm" style={{ color: theme.primary }}>Dashboard Monitoring</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Statistik{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}>
              Real-Time
            </span>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            Pantau pertumbuhan komunitas dan tingkat partisipasi warga secara transparan dan dinamis langsung dari database.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div key={index} initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: index * 0.1 }} whileHover={{ y: -5, scale: 1.02 }}
              className="relative p-6 rounded-[2rem] backdrop-blur-xl border overflow-hidden group"
              style={cardStyle}
            >
              <div className="relative z-10">
                <div className="inline-flex p-3 rounded-2xl mb-6"
                  style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, boxShadow: `0 0 20px ${theme.glowLight}` }}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl font-bold mb-1 bg-clip-text text-transparent"
                  style={{ backgroundImage: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}>
                  {isLoading && (stat.label !== 'Total Warga') ? (
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.primary }} />
                  ) : stat.value}
                </div>
                <div className="text-white/70 font-medium mb-3">{stat.label}</div>
                <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: theme.secondary }}>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{stat.change} bulan ini</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-6 right-6 h-1 rounded-full opacity-30 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }} />
            </motion.div>
          ))}
        </div>

        {/* Participation Chart */}
        <motion.div initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
          className="p-8 md:p-10 rounded-[2.5rem] backdrop-blur-xl border shadow-[0_0_50px_rgba(0,0,0,0.3)]"
          style={cardStyle}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              Tren Partisipasi Warga
              <span className="text-xs px-3 py-1 rounded-full border font-normal"
                style={{ background: `${theme.primary}15`, borderColor: `${theme.primary}30`, color: theme.primary }}>
                Live Data
              </span>
            </h3>
            <div className="flex items-center gap-4 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: theme.primary, boxShadow: `0 0 10px ${theme.glow}` }} />
                <span>Kehadiran</span>
              </div>
              <div className="font-semibold flex items-center gap-1" style={{ color: theme.secondary }}>
                <ArrowUpRight className="w-4 h-4" />
                {(() => {
                  const activeMonths = monthlyData.filter(v => v > 0);
                  const avg = activeMonths.length > 0 ? Math.round(activeMonths.reduce((a, b) => a + b, 0) / activeMonths.length) : 0;
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
                    className="relative w-full rounded-t-xl cursor-pointer transition-all"
                    style={{
                      background: `linear-gradient(to top, ${theme.primary}, ${theme.secondary})`,
                      boxShadow: `0 0 20px ${theme.glowLight}`,
                    }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 px-2 py-1 rounded-md text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {height}%
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6 px-1">
              {['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'].map((month, i) => (
                <span key={i} className="text-[10px] md:text-xs text-white/30 font-medium uppercase tracking-wider">{month}</span>
              ))}
            </div>
            <div className="absolute inset-0 -z-10 flex flex-col justify-between pointer-events-none pt-10 pb-6 opacity-5">
              {[1,2,3,4].map(i => <div key={i} className="w-full h-px bg-white" />)}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
