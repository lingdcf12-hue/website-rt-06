import { motion } from 'motion/react';
import { ChevronRight, MapPin, Users, Calendar, Bell, ArrowUpRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../lib/ThemeContext';

// Nama bulan dalam Bahasa Indonesia
const NAMA_BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

// Menghasilkan daftar URL alternatif untuk Google Drive image
const getGoogleDriveUrls = (url: string): string[] => {
  if (!url) return [];
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/) || url.match(/(?:^|[?&])id=([a-zA-Z0-9-_]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    return [
      `https://drive.google.com/uc?export=view&id=${fileId}`,
      `https://lh3.googleusercontent.com/d/${fileId}`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w1920`,
    ];
  }
  return [url];
};

const getGoogleDriveImageUrl = (url: string, type: 'image' | 'video' = 'image') => {
  if (!url) return '';
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/) || url.match(/(?:^|[?&])id=([a-zA-Z0-9-_]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    return type === 'video'
      ? `https://drive.google.com/uc?export=download&id=${fileId}`
      : `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  return url;
};

export function Hero() {
  const [counts, setCounts] = useState({
    schedules: 0, activities: 0,
    schedulesThisMonth: 0, activitiesThisMonth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [bgSetting, setBgSetting] = useState({ 
    type: 'image', 
    url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=1920' 
  });
  const [imgFallbackIndex, setImgFallbackIndex] = useState(0);
  const { theme } = useTheme();

  const now = new Date();
  const namaBulanIni = NAMA_BULAN[now.getMonth()];
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

  useEffect(() => {
    fetchCounts();
    fetchBackgroundSetting();
  }, []);

  const fetchBackgroundSetting = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'hero_background')
        .maybeSingle();

      if (data && data.value) {
        setBgSetting({
          type: data.value.type || 'image',
          url: data.value.url || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=1920'
        });
        setImgFallbackIndex(0); // reset fallback setiap kali setting dimuat ulang
      }
    } catch (err) {
      console.error("Gagal memuat latar belakang:", err);
    }
  };

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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const stats = [
    { label: 'Total Warga', value: '256', icon: Users, change: `+12 ${namaBulanIni}` },
    { label: 'Jadwal Aktivitas', value: counts.schedules.toString(), icon: Calendar, change: `+${counts.schedulesThisMonth} ${namaBulanIni}` },
    { label: 'Kegiatan Warga', value: counts.activities.toString(), icon: Bell, change: `+${counts.activitiesThisMonth} ${namaBulanIni}` }
  ];

  return (
    <section id="home" className="relative min-h-screen pt-32 pb-24 px-6 flex flex-col justify-center bg-[#000a0f] overflow-hidden">
      
      {/* ── DYNAMIC BACKGROUND MEDIA (IMAGE / VIDEO) ── */}
      <div className="absolute inset-0 z-0">
        {bgSetting.type === 'video' ? (
          (() => {
            const ytMatch = bgSetting.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
            if (ytMatch) {
              return (
                <>
                  {/* iframe YouTube tanpa pointer-events-none di wrapper agar overlay bisa bekerja */}
                  <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents: 'none' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${ytMatch[1]}&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&fs=0&enablejsapi=0`}
                      className="absolute top-1/2 left-1/2 w-[150vw] h-[150vh] -translate-x-1/2 -translate-y-1/2 opacity-90 scale-[1.35]"
                      style={{ border: 'none', pointerEvents: 'none' }}
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                    />
                  </div>
                  {/* Overlay LUAR: mencegat semua klik agar tombol pause YouTube tidak muncul */}
                  <div
                    className="absolute inset-0"
                    style={{ zIndex: 1, background: 'transparent', pointerEvents: 'all', cursor: 'default' }}
                  />
                </>
              );
            }
            return (
              <video
                src={bgSetting.url.includes('drive.google.com') ? getGoogleDriveImageUrl(bgSetting.url, 'video') : bgSetting.url}
                className="absolute inset-0 w-full h-full object-cover opacity-90 pointer-events-none"
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture
                controls={false}
              />
            );
          })()
        ) : (() => {
          const isDrive = bgSetting.url.includes('drive.google.com') || bgSetting.url.includes('googleapis.com');
          const fallbackUrls = isDrive
            ? getGoogleDriveUrls(bgSetting.url)
            : [bgSetting.url];
          const currentSrc = fallbackUrls[imgFallbackIndex] || bgSetting.url;

          return (
            <img
              key={currentSrc}
              src={currentSrc}
              alt="Latar Belakang Beranda"
              className="absolute inset-0 w-full h-full object-cover opacity-90 pointer-events-none"
              onError={() => {
                console.warn(`[BG] Gagal load URL ke-${imgFallbackIndex + 1}: ${currentSrc}`);
                if (imgFallbackIndex < fallbackUrls.length - 1) {
                  setImgFallbackIndex(prev => prev + 1);
                } else {
                  console.error('[BG] Semua URL Google Drive gagal. Pastikan file dishare publik.');
                }
              }}
              onLoad={() => console.log(`[BG] Foto berhasil dimuat: ${currentSrc}`)}
            />
          );
        })()}
        {/* Dark overlays to match the Visit Luwu premium aesthetics */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#000a0f]/70 via-[#000a0f]/40 to-[#000a0f]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_transparent_30%,_#000a0f_80%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#000a0f]/50 via-transparent to-[#000a0f]/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Main Content */}
        <div className="lg:col-span-12 flex flex-col items-start text-left">
          
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <MapPin className="w-4 h-4" style={{ color: theme.primary }} />
            <span className="text-white/70 text-xs tracking-wider font-medium">
              Sawojajar Gg. V, RT 06 RW 01, Kota Malang, Jawa Timur
            </span>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight uppercase leading-none"
          >
            <span className="opacity-90 block text-white">Selamat Datang di</span>
            <span
              className="bg-clip-text text-transparent block font-black mt-2"
              style={{ backgroundImage: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
            >
              RT 06 RW 01 Josjis
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/70 text-base md:text-lg max-w-2xl leading-relaxed mb-8"
          >
            Platform komunitas digital untuk efisiensi informasi lingkungan. Akses jadwal ronda, kegiatan sosial, dan pengumuman resmi warga secara real-time.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection('kegiatan')}
              className="w-full sm:w-auto group px-8 py-3.5 rounded-full text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                boxShadow: `0 0 30px ${theme.glowLight}`,
              }}
            >
              Lihat Kegiatan
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection('about')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-bold text-sm uppercase tracking-wider backdrop-blur-md transition-all duration-300 cursor-pointer flex items-center justify-center"
            >
              Tentang Kami
            </motion.button>
          </motion.div>

        </div>

      </div>

      {/* ── STATS CARDS GRID (PREMIUM GLASSMORPHIC STYLE) ── */}
      <div className="relative z-10 max-w-7xl mx-auto w-full mt-16 md:mt-24">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -5 }}
              className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl flex items-center gap-6 group transition-all duration-300"
              style={{ '--hover-border': `${theme.primary}60` } as any}
            >
              <div
                className="relative p-3.5 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  boxShadow: `0 0 20px ${theme.glowLight}`,
                }}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>

              <div>
                <div
                  className="text-3xl font-extrabold mb-0.5 bg-clip-text text-transparent"
                  style={{ backgroundImage: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
                >
                  {isLoading && (stat.label === 'Jadwal Aktivitas' || stat.label === 'Kegiatan Warga') ? (
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: theme.primary }} />
                  ) : (
                    stat.value
                  )}
                </div>
                <div className="text-white/60 text-xs font-semibold tracking-wider uppercase">{stat.label}</div>
                <div className="flex items-center gap-1 text-[10px] font-bold mt-1 uppercase tracking-wide" style={{ color: theme.secondary }}>
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
