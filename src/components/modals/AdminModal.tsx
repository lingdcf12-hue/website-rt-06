import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import {
  Plus, Trash2, X, Calendar, Bell, Megaphone,
  Heart, Gift, Music, Book, Shield, LogOut, Loader2, Edit2, Check, Mail,
  MessageSquare, Image as ImageIcon, Settings, Camera, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../lib/ThemeContext';

const ADMIN_PASSWORD = 'rt6rw1admin';
const ICON_OPTIONS = ['Bell', 'Megaphone', 'Heart', 'Gift', 'Music', 'Book'];
const ICON_MAP: Record<string, any> = { Bell, Megaphone, Heart, Gift, Music, Book };

export function AdminModal({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme();
  const p = theme.primary;
  const s = theme.secondary;
  const glow = theme.glow;
  const glowL = theme.glowLight;
  const gf = theme.gradFrom;
  const gt = theme.gradTo;
  const defaultGrad = `from-${gf} to-${gt}`;

  // ── Reusable style factories ──────────────────────────────
  const S = {
    modal: {
      background: `linear-gradient(160deg,
        color-mix(in srgb, ${p} 14%, #020408) 0%,
        color-mix(in srgb, ${p} 7%, #030609) 30%,
        color-mix(in srgb, ${s} 5%, #020306) 65%,
        color-mix(in srgb, ${p} 9%, #010204) 100%)`,
      border: `1px solid ${p}35`,
      boxShadow: `0 0 120px ${glow}30, 0 0 60px ${glow}12, inset 0 1px 0 ${p}20, 0 50px 100px rgba(0,0,0,0.9)`,
    } as React.CSSProperties,
    blob1: {
      background: `radial-gradient(circle, ${p}30, transparent 70%)`,
    } as React.CSSProperties,
    blob2: {
      background: `radial-gradient(circle, ${s}25, transparent 70%)`,
    } as React.CSSProperties,
    blob3: {
      background: `radial-gradient(circle, ${p}15, transparent 60%)`,
    } as React.CSSProperties,
    header: {
      borderBottom: `1px solid ${p}22`,
      background: `linear-gradient(90deg, ${p}18 0%, ${s}08 50%, transparent 100%)`,
      backdropFilter: 'blur(20px)',
    } as React.CSSProperties,
    iconBadge: {
      background: `linear-gradient(135deg, ${p}, ${s})`,
      boxShadow: `0 0 28px ${glow}60, 0 4px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.25)`,
    } as React.CSSProperties,
    ghostBtn: {
      background: `${p}10`,
      border: `1px solid ${p}20`,
      color: 'rgba(255,255,255,0.6)',
    } as React.CSSProperties,
    card: {
      background: `linear-gradient(145deg, ${p}10 0%, ${s}06 50%, ${p}08 100%)`,
      border: `1px solid ${p}28`,
      backdropFilter: 'blur(16px)',
      boxShadow: `inset 0 1px 0 ${p}15, 0 4px 24px rgba(0,0,0,0.3)`,
    } as React.CSSProperties,
    input: {
      background: `${p}0a`,
      border: `1px solid ${p}28`,
      color: 'white',
      colorScheme: 'dark',
      transition: 'all 0.2s',
    } as React.CSSProperties,
    primaryBtn: {
      background: `linear-gradient(135deg, ${p}, ${s})`,
      boxShadow: `0 0 28px ${glow}50, 0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)`,
      color: 'white',
    } as React.CSSProperties,
    cancelBtn: {
      background: `${p}0c`,
      border: `1px solid ${p}20`,
      color: 'rgba(255,255,255,0.55)',
    } as React.CSSProperties,
    listItem: {
      background: `linear-gradient(135deg, ${p}0c 0%, ${s}06 100%)`,
      border: `1px solid ${p}20`,
    } as React.CSSProperties,
    editBtn: {
      background: `${p}1a`,
      color: p,
      border: `1px solid ${p}25`,
    } as React.CSSProperties,
    deleteBtn: {
      background: 'rgba(239,68,68,0.12)',
      color: '#f87171',
      border: '1px solid rgba(239,68,68,0.2)',
    } as React.CSSProperties,
    msgCard: {
      background: `linear-gradient(145deg, ${p}0e 0%, ${s}08 100%)`,
      border: `1px solid ${p}22`,
      backdropFilter: 'blur(12px)',
    } as React.CSSProperties,
    infoCard: {
      background: `linear-gradient(135deg, ${p}12 0%, ${s}08 100%)`,
      border: `1px solid ${p}30`,
      boxShadow: `inset 0 1px 0 ${p}15`,
    } as React.CSSProperties,
    tabBar: {
      background: `${p}0c`,
      border: `1px solid ${p}20`,
      backdropFilter: 'blur(12px)',
    } as React.CSSProperties,
    tabActive: {
      background: `linear-gradient(135deg, ${p}, ${s})`,
      boxShadow: `0 0 20px ${glow}45, 0 4px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)`,
      color: 'white',
    } as React.CSSProperties,
    tabInactive: {
      color: `${p}99`,
    } as React.CSSProperties,
    sectionInner: {
      background: `${p}0a`,
      border: `1px solid ${p}20`,
    } as React.CSSProperties,
    uploadZone: {
      border: `2px dashed ${p}40`,
      background: `${p}08`,
    } as React.CSSProperties,
    logoBadge: {
      background: `linear-gradient(135deg, ${p}, ${s})`,
      boxShadow: `0 0 40px ${glow}55, inset 0 1px 0 rgba(255,255,255,0.2)`,
    } as React.CSSProperties,
    sectionTitle: {
      color: 'white',
      borderBottom: `1px solid ${p}18`,
      paddingBottom: '12px',
      marginBottom: '16px',
    } as React.CSSProperties,
    badge: {
      background: `linear-gradient(135deg, ${p}20, ${s}15)`,
      border: `1px solid ${p}35`,
      color: p,
    } as React.CSSProperties,
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.border = `1px solid ${p}70`;
    e.target.style.background = 'rgba(255,255,255,0.07)';
    e.target.style.boxShadow = `0 0 0 3px ${p}18`;
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.border = `1px solid ${p}22`;
    e.target.style.background = 'rgba(255,255,255,0.04)';
    e.target.style.boxShadow = 'none';
  };
  const IC = 'w-full px-4 py-3 rounded-2xl text-white placeholder-white/20 focus:outline-none transition-all';
  const LC = 'block text-sm mb-1.5 font-medium';

  // ── State ────────────────────────────────────────────────
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('adminAuth') === 'true');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'schedules'|'activities'|'gallery'|'messages'|'settings'|'logo'>('schedules');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ title:'', date:'', time:'', location:'', attendees:0, color: defaultGrad });
  const [activityForm, setActivityForm] = useState({ title:'', description:'', badge:'Info', icon_name:'Bell', gradient: defaultGrad });
  const [galleryForm, setGalleryForm] = useState({ title:'', type:'image', gradient: defaultGrad, url:'', likes:0 });
  const [galleryFile, setGalleryFile] = useState<File|null>(null);
  const [galleryThumbnail, setGalleryThumbnail] = useState('');
  const [editingScheduleId, setEditingScheduleId] = useState<string|null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string|null>(null);
  const [editingGalleryId, setEditingGalleryId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [bgType, setBgType] = useState<'image'|'video'>('image');
  const [bgUrl, setBgUrl] = useState('');
  const [bgFile, setBgFile] = useState<File|null>(null);
  const [isBgUploading, setIsBgUploading] = useState(false);
  const [isBgSaving, setIsBgSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File|null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isLogoSaving, setIsLogoSaving] = useState(false);

  useEffect(() => { if (isLoggedIn) fetchAll(); }, [isLoggedIn]);

  const fetchAll = async () => {
    setIsLoading(true);
    const [sc, ac, mc, gc, bg, logo] = await Promise.all([
      supabase.from('schedules').select('*').order('created_at', { ascending: false }),
      supabase.from('activities').select('*').order('created_at', { ascending: false }),
      supabase.from('messages').select('*').order('created_at', { ascending: false }),
      supabase.from('gallery').select('*').order('created_at', { ascending: false }),
      supabase.from('site_settings').select('*').eq('key','hero_background').maybeSingle(),
      supabase.from('site_settings').select('*').eq('key','site_logo').maybeSingle(),
    ]);
    setSchedules(sc.data||[]); setActivities(ac.data||[]); setMessages(mc.data||[]); setGallery(gc.data||[]);
    if (bg.data?.value) { setBgType(bg.data.value.type||'image'); setBgUrl(bg.data.value.url||''); }
    if (logo.data?.value?.url) { setLogoUrl(logo.data.value.url); setLogoPreview(logo.data.value.url); }
    setIsLoading(false);
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) { setIsLoggedIn(true); sessionStorage.setItem('adminAuth','true'); toast.success('Login berhasil!'); }
    else toast.error('Password salah!');
  };
  const handleLogout = () => { setIsLoggedIn(false); sessionStorage.removeItem('adminAuth'); toast.success('Berhasil logout'); };

  // ── Schedule CRUD ─────────────────────────────────────────
  const saveSchedule = async () => {
    if (!scheduleForm.title||!scheduleForm.date||!scheduleForm.time||!scheduleForm.location) return toast.error('Semua field wajib diisi!');
    setSaving(true);
    if (editingScheduleId) {
      const { error } = await supabase.from('schedules').update(scheduleForm).eq('id', editingScheduleId);
      if (error) toast.error('Gagal update jadwal'); else { toast.success('Jadwal diupdate!'); setEditingScheduleId(null); }
    } else {
      const { error } = await supabase.from('schedules').insert(scheduleForm);
      if (error) toast.error('Gagal tambah jadwal'); else toast.success('Jadwal ditambahkan!');
    }
    setScheduleForm({ title:'', date:'', time:'', location:'', attendees:0, color: defaultGrad });
    setSaving(false); fetchAll();
  };
  const deleteSchedule = async (id: string, title: string) => {
    await supabase.from('registrations').delete().eq('activity_title', title);
    const { error } = await supabase.from('schedules').delete().eq('id', id);
    if (error) toast.error('Gagal hapus'); else { toast.success('Jadwal & Data Pendaftar dihapus'); fetchAll(); }
  };
  const editSchedule = (sc: any) => {
    setEditingScheduleId(sc.id);
    setScheduleForm({ title:sc.title, date:sc.date, time:sc.time, location:sc.location, attendees:sc.attendees, color:sc.color });
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  // ── Activity CRUD ─────────────────────────────────────────
  const saveActivity = async () => {
    if (!activityForm.title||!activityForm.description) return toast.error('Judul dan deskripsi wajib diisi!');
    setSaving(true);
    if (editingActivityId) {
      const { error } = await supabase.from('activities').update(activityForm).eq('id', editingActivityId);
      if (error) toast.error('Gagal update kegiatan'); else { toast.success('Kegiatan diupdate!'); setEditingActivityId(null); }
    } else {
      const { error } = await supabase.from('activities').insert(activityForm);
      if (error) toast.error('Gagal tambah kegiatan'); else toast.success('Kegiatan ditambahkan!');
    }
    setActivityForm({ title:'', description:'', badge:'Info', icon_name:'Bell', gradient: defaultGrad });
    setSaving(false); fetchAll();
  };
  const deleteActivity = async (id: string) => {
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) toast.error('Gagal hapus'); else { toast.success('Kegiatan dihapus'); fetchAll(); }
  };
  const editActivity = (a: any) => {
    setEditingActivityId(a.id);
    setActivityForm({ title:a.title, description:a.description, badge:a.badge, icon_name:a.icon_name, gradient:a.gradient });
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  // ── Gallery CRUD ──────────────────────────────────────────
  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('gallery').upload(fileName, file);
      if (error) {
        if (error.message.includes('not found')||error.message.includes('does not exist'))
          throw new Error("Bucket 'gallery' belum dibuat di Supabase Storage.");
        throw error;
      }
      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName);
      return publicUrl;
    } catch (err: any) {
      toast.error(err.message||"Gagal upload file."); return null;
    } finally { setIsUploading(false); }
  };

  const saveGalleryItem = async () => {
    if (!galleryForm.title) return toast.error('Judul galeri wajib diisi!');
    setSaving(true);
    let finalUrl = galleryForm.url;
    if (galleryFile) {
      const uploaded = await handleFileUpload(galleryFile);
      if (!uploaded) { setSaving(false); return; }
      finalUrl = uploaded;
    }
    if (!finalUrl) { setSaving(false); return toast.error('Harap pilih file atau masukkan URL!'); }
    if (galleryThumbnail.trim()) finalUrl = `${finalUrl.trim()}||thumb||${galleryThumbnail.trim()}`;
    const payload: any = { title:galleryForm.title, type:galleryForm.type, gradient:galleryForm.gradient, url:finalUrl, likes:galleryForm.likes||0, thumbnail_url:galleryThumbnail.trim()||null };
    const tryUpsert = async (data: any) => {
      if (editingGalleryId) {
        let { error } = await supabase.from('gallery').update(data).eq('id', editingGalleryId);
        if (error?.code==='42703') { const d={...data}; delete d.thumbnail_url; const r=await supabase.from('gallery').update(d).eq('id',editingGalleryId); error=r.error; }
        if (error) toast.error('Gagal update galeri'); else { toast.success('Galeri diupdate!'); setEditingGalleryId(null); }
      } else {
        let { error } = await supabase.from('gallery').insert(data);
        if (error?.code==='42703') { const d={...data}; delete d.thumbnail_url; const r=await supabase.from('gallery').insert(d); error=r.error; }
        if (error) toast.error('Gagal tambah galeri'); else toast.success('Galeri ditambahkan!');
      }
    };
    await tryUpsert(payload);
    setGalleryForm({ title:'', type:'image', gradient:defaultGrad, url:'', likes:0 });
    setGalleryFile(null); setGalleryThumbnail('');
    const fi = document.getElementById('gallery-file-input') as HTMLInputElement;
    if (fi) fi.value = '';
    setSaving(false); fetchAll();
  };

  const getGDriveUrl = (url: string, type: 'image'|'video' = 'image') => {
    if (!url) return '';
    const m = url.match(/\/d\/([a-zA-Z0-9-_]+)/)||url.match(/id=([a-zA-Z0-9-_]+)/);
    if (m?.[1]) return type==='video' ? `https://drive.google.com/uc?export=download&id=${m[1]}` : `https://lh3.googleusercontent.com/d/${m[1]}`;
    return url;
  };

  const deleteGalleryItem = async (id: string, url: string) => {
    if (url?.includes('/storage/v1/object/public/gallery/')) {
      const fp = url.split('/storage/v1/object/public/gallery/').pop();
      if (fp) await supabase.storage.from('gallery').remove([fp]);
    }
    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (error) toast.error('Gagal menghapus'); else { toast.success('Galeri dihapus'); fetchAll(); }
  };

  // ── Background & Logo ─────────────────────────────────────
  const saveBackgroundSetting = async () => {
    setIsBgSaving(true);
    let finalUrl = bgUrl;
    if (bgFile) {
      setIsBgUploading(true);
      const uploaded = await handleFileUpload(bgFile);
      setIsBgUploading(false);
      if (uploaded) { finalUrl = uploaded; setBgUrl(uploaded); } else { setIsBgSaving(false); return; }
    }
    if (!finalUrl.trim()) { setIsBgSaving(false); return toast.error('Harap masukkan URL atau upload file!'); }
    const { error } = await supabase.from('site_settings').upsert({ key:'hero_background', value:{ type:bgType, url:finalUrl.trim() } });
    setIsBgSaving(false);
    if (error) toast.error('Gagal menyimpan'); else { toast.success('Latar belakang disimpan!'); setBgFile(null); fetchAll(); }
  };

  const handleLogoFileChange = (file: File) => {
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const saveLogoSetting = async () => {
    setIsLogoSaving(true);
    let finalUrl = logoUrl;
    if (logoFile) {
      setIsLogoUploading(true);
      try {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `logo-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('site-assets').upload(fileName, logoFile, { upsert:true });
        if (uploadError) throw new Error(uploadError.message.includes('not found') ? "Bucket 'site-assets' belum dibuat." : uploadError.message);
        const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(fileName);
        finalUrl = publicUrl; setLogoUrl(publicUrl);
      } catch (err: any) { toast.error(err.message||'Gagal upload'); setIsLogoUploading(false); setIsLogoSaving(false); return; }
      finally { setIsLogoUploading(false); }
    }
    if (!finalUrl.trim()) { setIsLogoSaving(false); return toast.error('Harap upload foto atau masukkan URL!'); }
    const { error } = await supabase.from('site_settings').upsert({ key:'site_logo', value:{ url:finalUrl.trim(), type:'image' } });
    setIsLogoSaving(false);
    if (error) toast.error('Gagal menyimpan foto profil'); else { toast.success('Foto profil disimpan!'); setLogoFile(null); fetchAll(); }
  };

  const removeLogo = async () => {
    const { error } = await supabase.from('site_settings').upsert({ key:'site_logo', value:{ url:'', type:'image' } });
    if (error) toast.error('Gagal menghapus'); else { setLogoUrl(''); setLogoPreview(''); setLogoFile(null); toast.success('Foto profil dihapus'); fetchAll(); }
  };

  const deleteMessage = async (id: string) => {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) toast.error('Gagal menghapus pesan'); else { toast.success('Pesan dihapus'); fetchAll(); }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-8 px-4"
        style={{ background:`linear-gradient(135deg, rgba(0,0,0,0.88) 0%, ${p}12 50%, rgba(0,0,0,0.88) 100%)`, backdropFilter:'blur(16px)' }}>
        <motion.div initial={{ scale:0.92, opacity:0, y:24 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:0.92, opacity:0 }}
          className="relative w-full max-w-4xl rounded-3xl overflow-hidden"
          style={S.modal}>

          {/* Ambient blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-[0.12]" style={S.blob1} />
            <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-[0.10]" style={S.blob2} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-3xl opacity-[0.05]" style={S.blob3} />
            {/* Subtle top shimmer line */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${p}50, ${s}40, transparent)` }} />
          </div>

          {/* Header */}
          <div className="relative flex items-center justify-between px-8 py-5" style={S.header}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={S.iconBadge}>
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg tracking-tight">Admin Panel</h2>
                <p className="text-white/35 text-xs">RT 6 RW 1 Josjis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isLoggedIn && (
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all hover:text-white" style={S.ghostBtn}>
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              )}
              <button onClick={onClose} className="p-2 rounded-xl transition-all hover:text-red-400" style={S.ghostBtn}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── LOGIN ── */}
          {!isLoggedIn ? (
            <div className="relative flex flex-col items-center justify-center py-20 px-8 gap-6">
              <div className="p-5 rounded-3xl" style={{ background:`${p}18`, border:`1px solid ${p}35`, boxShadow:`0 0 40px ${glow}20` }}>
                <Shield className="w-12 h-12" style={{ color: p }} />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">Login Admin</h3>
                <p className="text-white/40 text-sm">Masukkan password untuk akses panel</p>
              </div>
              <div className="w-full max-w-sm flex flex-col gap-3">
                <input type="password" placeholder="Password admin..." value={password}
                  onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==='Enter' && handleLogin()}
                  className={IC} style={S.input} onFocus={onFocus} onBlur={onBlur} />
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={handleLogin}
                  className="py-3 rounded-2xl font-semibold" style={S.primaryBtn}>
                  Masuk
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="relative p-6 md:p-8">

              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-8 p-1.5 rounded-2xl w-fit"
                style={S.tabBar}>
                {([
                  { key:'schedules', label:'Jadwal Aktivitas', icon:Calendar },
                  { key:'activities', label:'Kegiatan & Pengumuman', icon:Bell },
                  { key:'gallery', label:'Galeri Warga', icon:ImageIcon },
                  { key:'messages', label:'Pesan Masuk', icon:Mail },
                  { key:'logo', label:'Foto Profil', icon:Camera },
                  { key:'settings', label:'Pengaturan Latar', icon:Settings },
                ] as const).map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => setTab(key)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={tab===key ? S.tabActive : S.tabInactive}>
                    <Icon className="w-4 h-4" />{label}
                  </button>
                ))}
              </div>

              {/* ── JADWAL TAB ── */}
              {tab==='schedules' && (
                <div className="space-y-8">
                  <div className="p-6 rounded-3xl" style={S.card}>
                    <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                      {editingScheduleId ? <><Edit2 className="w-4 h-4" style={{color:p}}/>Edit Jadwal</> : <><Plus className="w-4 h-4" style={{color:p}}/>Tambah Jadwal Baru</>}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className={LC} style={{color:`${p}cc`}}>Judul Kegiatan *</label>
                        <input className={IC} style={S.input} onFocus={onFocus} onBlur={onBlur} placeholder="cth: Rapat RT Bulanan" value={scheduleForm.title} onChange={e=>setScheduleForm({...scheduleForm,title:e.target.value})} />
                      </div>
                      <div>
                        <label className={LC} style={{color:`${p}cc`}}>Tanggal *</label>
                        <input className={IC} style={S.input} onFocus={onFocus} onBlur={onBlur} placeholder="cth: Sabtu, 15 Juni 2025" value={scheduleForm.date} onChange={e=>setScheduleForm({...scheduleForm,date:e.target.value})} />
                      </div>
                      <div>
                        <label className={LC} style={{color:`${p}cc`}}>Waktu *</label>
                        <input className={IC} style={S.input} onFocus={onFocus} onBlur={onBlur} placeholder="cth: 19:00 - 21:00 WIB" value={scheduleForm.time} onChange={e=>setScheduleForm({...scheduleForm,time:e.target.value})} />
                      </div>
                      <div>
                        <label className={LC} style={{color:`${p}cc`}}>Lokasi *</label>
                        <input className={IC} style={S.input} onFocus={onFocus} onBlur={onBlur} placeholder="cth: Balai RT 6" value={scheduleForm.location} onChange={e=>setScheduleForm({...scheduleForm,location:e.target.value})} />
                      </div>
                      <div>
                        <label className={LC} style={{color:`${p}cc`}}>Target Peserta</label>
                        <input type="number" min="0" className={IC} style={S.input} onFocus={onFocus} onBlur={onBlur} placeholder="0" value={scheduleForm.attendees} onChange={e=>setScheduleForm({...scheduleForm,attendees:Number(e.target.value)})} />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-5">
                      <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={saveSchedule} disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold disabled:opacity-50" style={S.primaryBtn}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : editingScheduleId ? <Check className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                        {editingScheduleId ? 'Simpan Perubahan' : 'Tambahkan'}
                      </motion.button>
                      {editingScheduleId && (
                        <button onClick={()=>{setEditingScheduleId(null);setScheduleForm({title:'',date:'',time:'',location:'',attendees:0,color:defaultGrad});}}
                          className="px-4 py-3 rounded-2xl text-sm transition-all hover:text-white" style={S.cancelBtn}>Batal</button>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-white font-semibold">Daftar Jadwal</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={S.badge}>{schedules.length}</span>
                    </div>
                    {isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin" style={{color:p}}/></div>
                    : schedules.length===0 ? <div className="text-center py-10 text-white/25">Belum ada jadwal</div>
                    : <div className="space-y-3">{schedules.map(sc=>(
                      <motion.div key={sc.id} layout className="flex items-center justify-between p-4 rounded-2xl transition-all" style={S.listItem}
                        onMouseEnter={e=>(e.currentTarget.style.border=`1px solid ${p}35`)} onMouseLeave={e=>(e.currentTarget.style.border='1px solid rgba(255,255,255,0.07)')}>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-10 rounded-full" style={{ background: `linear-gradient(to bottom, ${p}, ${s})` }}/>
                          <div>
                            <p className="text-white font-medium">{sc.title}</p>
                            <p className="text-white/40 text-xs">{sc.date} · {sc.time} · {sc.location} · Target: {sc.attendees} peserta</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={()=>editSchedule(sc)} className="p-2 rounded-xl transition-all" style={S.editBtn}
                            onMouseEnter={e=>(e.currentTarget.style.background=`${p}28`)} onMouseLeave={e=>(e.currentTarget.style.background=`${p}18`)}>
                            <Edit2 className="w-4 h-4"/>
                          </button>
                          <button onClick={()=>deleteSchedule(sc.id,sc.title)} className="p-2 rounded-xl transition-all" style={S.deleteBtn}
                            onMouseEnter={e=>(e.currentTarget.style.background='rgba(239,68,68,0.22)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(239,68,68,0.12)')}>
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                      </motion.div>
                    ))}</div>}
                  </div>
                </div>
              )}

              {/* ── KEGIATAN TAB ── */}
              {tab==='activities' && (
                <div className="space-y-8">
                  <div className="p-6 rounded-3xl" style={S.card}>
                    <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                      {editingActivityId ? <><Edit2 className="w-4 h-4" style={{color:p}}/>Edit Kegiatan</> : <><Plus className="w-4 h-4" style={{color:p}}/>Tambah Kegiatan / Pengumuman</>}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className={LC} style={{color:`${p}cc`}}>Judul *</label>
                        <input className={IC} style={S.input} onFocus={onFocus} onBlur={onBlur} placeholder="cth: Kerja Bakti Lingkungan" value={activityForm.title} onChange={e=>setActivityForm({...activityForm,title:e.target.value})} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={LC} style={{color:`${p}cc`}}>Deskripsi *</label>
                        <textarea rows={3} className={IC+' resize-none'} style={S.input} onFocus={onFocus} onBlur={onBlur} placeholder="Jelaskan detail kegiatan..." value={activityForm.description} onChange={e=>setActivityForm({...activityForm,description:e.target.value})} />
                      </div>
                      <div>
                        <label className={LC} style={{color:`${p}cc`}}>Badge / Label</label>
                        <input className={IC} style={S.input} onFocus={onFocus} onBlur={onBlur} placeholder="cth: Pengumuman, Info, Event" value={activityForm.badge} onChange={e=>setActivityForm({...activityForm,badge:e.target.value})} />
                      </div>
                      <div>
                        <label className={LC} style={{color:`${p}cc`}}>Ikon</label>
                        <div className="flex gap-2 flex-wrap mt-1">
                          {ICON_OPTIONS.map(ic=>{
                            const Ic=ICON_MAP[ic];
                            const active=activityForm.icon_name===ic;
                            return (
                              <button key={ic} onClick={()=>setActivityForm({...activityForm,icon_name:ic})}
                                className="p-2.5 rounded-xl transition-all"
                                style={active ? { background:`linear-gradient(135deg,${p},${s})`, color:'white', boxShadow:`0 0 12px ${glow}40` } : { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)' }}>
                                <Ic className="w-4 h-4"/>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-5">
                      <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={saveActivity} disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold disabled:opacity-50" style={S.primaryBtn}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : editingActivityId ? <Check className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                        {editingActivityId ? 'Simpan Perubahan' : 'Tambahkan'}
                      </motion.button>
                      {editingActivityId && (
                        <button onClick={()=>{setEditingActivityId(null);setActivityForm({title:'',description:'',badge:'Info',icon_name:'Bell',gradient:defaultGrad});}}
                          className="px-4 py-3 rounded-2xl text-sm transition-all hover:text-white" style={S.cancelBtn}>Batal</button>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-white font-semibold">Daftar Kegiatan</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={S.badge}>{activities.length}</span>
                    </div>
                    {isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin" style={{color:p}}/></div>
                    : activities.length===0 ? <div className="text-center py-10 text-white/25">Belum ada kegiatan</div>
                    : <div className="space-y-3">{activities.map(a=>{
                      const Ic=ICON_MAP[a.icon_name]||Bell;
                      return (
                        <motion.div key={a.id} layout className="flex items-center justify-between p-4 rounded-2xl transition-all" style={S.listItem}
                          onMouseEnter={e=>(e.currentTarget.style.border=`1px solid ${p}35`)} onMouseLeave={e=>(e.currentTarget.style.border='1px solid rgba(255,255,255,0.07)')}>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl" style={{ background: `linear-gradient(135deg, ${p}, ${s})` }}><Ic className="w-4 h-4 text-white"/></div>
                            <div>
                              <p className="text-white font-medium">{a.title}</p>
                              <p className="text-white/40 text-xs line-clamp-1">{a.description}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={()=>editActivity(a)} className="p-2 rounded-xl transition-all" style={S.editBtn}
                              onMouseEnter={e=>(e.currentTarget.style.background=`${p}28`)} onMouseLeave={e=>(e.currentTarget.style.background=`${p}18`)}>
                              <Edit2 className="w-4 h-4"/>
                            </button>
                            <button onClick={()=>deleteActivity(a.id)} className="p-2 rounded-xl transition-all" style={S.deleteBtn}
                              onMouseEnter={e=>(e.currentTarget.style.background='rgba(239,68,68,0.22)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(239,68,68,0.12)')}>
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}</div>}
                  </div>
                </div>
              )}

              {/* ── GALLERY TAB ── */}
              {tab==='gallery' && (
                <div className="space-y-8">
                  <div className="p-6 rounded-3xl" style={S.card}>
                    <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                      {editingGalleryId ? <><Edit2 className="w-4 h-4" style={{color:p}}/>Edit Galeri</> : <><Plus className="w-4 h-4" style={{color:p}}/>Tambah Foto / Video Baru</>}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className={LC} style={{color:`${p}cc`}}>Judul Dokumentasi *</label>
                        <input className={IC} style={S.input} onFocus={onFocus} onBlur={onBlur} placeholder="cth: Senam Pagi Bersama Warga" value={galleryForm.title} onChange={e=>setGalleryForm({...galleryForm,title:e.target.value})} />
                      </div>
                      <div>
                        <label className={LC} style={{color:`${p}cc`}}>Tipe Media *</label>
                        <select className={IC} style={S.input} onFocus={onFocus} onBlur={onBlur} value={galleryForm.type} onChange={e=>setGalleryForm({...galleryForm,type:e.target.value})}>
                          <option value="image">Foto (Image)</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                      <div>
                        <label className={LC} style={{color:`${p}cc`}}>Jumlah Likes Awal</label>
                        <input type="number" min="0" className={IC} style={S.input} onFocus={onFocus} onBlur={onBlur} placeholder="0" value={galleryForm.likes} onChange={e=>setGalleryForm({...galleryForm,likes:Number(e.target.value)})} />
                      </div>
                      <div className="md:col-span-2">
                        <div className="p-4 rounded-2xl space-y-4" style={S.sectionInner}>
                          <div className="flex gap-4">
                            <span className="font-semibold text-sm" style={{color:p}}>Metode Media:</span>
                            <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                              <input type="radio" name="media-method" defaultChecked onChange={()=>{
                                const eu=document.getElementById('media-url-container');
                                const ef=document.getElementById('media-file-container');
                                if(eu)eu.style.display='none'; if(ef)ef.style.display='block';
                              }}/> Upload File
                            </label>
                            <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                              <input type="radio" name="media-method" onChange={()=>{
                                const eu=document.getElementById('media-url-container');
                                const ef=document.getElementById('media-file-container');
                                if(eu)eu.style.display='block'; if(ef)ef.style.display='none';
                              }}/> Link URL Langsung
                            </label>
                          </div>
                          <div id="media-file-container">
                            <label className={LC} style={{color:`${p}cc`}}>Pilih File *</label>
                            <input id="gallery-file-input" type="file" accept={galleryForm.type==='video'?'video/*':'image/*'}
                              className={IC+' file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:text-white'}
                              style={{...S.input, ['--file-bg' as any]:`${p}`}}
                              onChange={e=>setGalleryFile(e.target.files?.[0]||null)} />
                            <p className="text-xs text-white/30 mt-1">Format: jpg, png, mp4, webm. Maks 50MB.</p>
                          </div>
                          <div id="media-url-container" style={{display:'none'}}>
                            <label className={LC} style={{color:`${p}cc`}}>Link URL Langsung *</label>
                            <input className={IC} style={S.input} onFocus={onFocus} onBlur={onBlur} placeholder="https://..." value={galleryForm.url} onChange={e=>setGalleryForm({...galleryForm,url:e.target.value})} />
                            <p className="text-xs text-white/30 mt-1">Link gambar/video langsung dari internet.</p>
                            <div className="mt-3">
                              <label className={LC} style={{color:`${p}cc`}}>Thumbnail (Opsional)</label>
                              <input className={IC} style={S.input} onFocus={onFocus} onBlur={onBlur} placeholder="https://..." value={galleryThumbnail} onChange={e=>setGalleryThumbnail(e.target.value)} />
                              <p className="text-xs text-white/30 mt-1">Cover thumbnail untuk video.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-5">
                      <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={saveGalleryItem} disabled={saving||isUploading}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold disabled:opacity-50" style={S.primaryBtn}>
                        {saving||isUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : editingGalleryId ? <Check className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                        {isUploading?'Mengupload...':saving?'Menyimpan...':editingGalleryId?'Simpan Perubahan':'Tambahkan'}
                      </motion.button>
                      {editingGalleryId && (
                        <button onClick={()=>{setEditingGalleryId(null);setGalleryForm({title:'',type:'image',gradient:defaultGrad,url:'',likes:0});setGalleryFile(null);}}
                          className="px-4 py-3 rounded-2xl text-sm transition-all hover:text-white" style={S.cancelBtn}>Batal</button>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-white font-semibold">Daftar Galeri</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={S.badge}>{gallery.length}</span>
                    </div>
                    {isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin" style={{color:p}}/></div>
                    : gallery.length===0 ? <div className="text-center py-10 text-white/25">Belum ada item galeri</div>
                    : <div className="space-y-3">{gallery.map(g=>(
                      <motion.div key={g.id} layout className="flex items-center justify-between p-4 rounded-2xl transition-all" style={S.listItem}
                        onMouseEnter={e=>(e.currentTarget.style.border=`1px solid ${p}35`)} onMouseLeave={e=>(e.currentTarget.style.border='1px solid rgba(255,255,255,0.07)')}>
                        <div className="flex items-center gap-3">
                          {g.url ? (()=>{
                            const parts=g.url.split('||thumb||');
                            const mediaUrl=parts[0];
                            const rawThumb=g.thumbnail_url||parts[1]||'';
                            const thumbUrl=rawThumb.includes('drive.google.com')?getGDriveUrl(rawThumb):rawThumb;
                            const finalMedia=mediaUrl.includes('drive.google.com')&&g.type==='image'?getGDriveUrl(mediaUrl):mediaUrl;
                            return thumbUrl ? <img src={thumbUrl} className="w-16 h-12 rounded-xl object-cover bg-black/40"/>
                              : g.type==='video' ? <video src={finalMedia} className="w-16 h-12 rounded-xl object-cover bg-black/40" muted/>
                              : <img src={finalMedia} className="w-16 h-12 rounded-xl object-cover bg-black/40"/>;
                          })() : <div className="w-12 h-12 rounded-xl opacity-40" style={{ background: `linear-gradient(135deg, ${p}, ${s})` }}/>}
                          <div>
                            <p className="text-white font-medium">{g.title}</p>
                            <p className="text-white/40 text-xs uppercase">{g.type} · {g.likes} likes</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={()=>{
                            setEditingGalleryId(g.id);
                            let mu=g.url||''; let tu=g.thumbnail_url||'';
                            if(mu.includes('||thumb||')){const pts=mu.split('||thumb||');mu=pts[0];if(!tu)tu=pts[1];}
                            setGalleryForm({title:g.title,type:g.type,gradient:g.gradient,url:mu,likes:g.likes});
                            setGalleryThumbnail(tu); window.scrollTo({top:0,behavior:'smooth'});
                          }} className="p-2 rounded-xl transition-all" style={S.editBtn}
                            onMouseEnter={e=>(e.currentTarget.style.background=`${p}28`)} onMouseLeave={e=>(e.currentTarget.style.background=`${p}18`)}>
                            <Edit2 className="w-4 h-4"/>
                          </button>
                          <button onClick={()=>deleteGalleryItem(g.id,g.url)} className="p-2 rounded-xl transition-all" style={S.deleteBtn}
                            onMouseEnter={e=>(e.currentTarget.style.background='rgba(239,68,68,0.22)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(239,68,68,0.12)')}>
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                      </motion.div>
                    ))}</div>}
                  </div>
                </div>
              )}

              {/* ── PESAN MASUK TAB ── */}
              {tab==='messages' && (
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <MessageSquare className="w-5 h-5" style={{color:p}}/>
                      <h3 className="text-white font-semibold">Kotak Masuk</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={S.badge}>{messages.length}</span>
                    </div>
                    {isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin" style={{color:p}}/></div>
                    : messages.length===0 ? <div className="text-center py-10 text-white/25">Belum ada pesan masuk</div>
                    : <div className="space-y-4">{messages.map(msg=>(
                      <motion.div key={msg.id} layout className="p-5 rounded-2xl transition-all" style={S.msgCard}
                        onMouseEnter={e=>(e.currentTarget.style.border=`1px solid ${p}35`)} onMouseLeave={e=>(e.currentTarget.style.border=`1px solid ${p}1a`)}>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl" style={{background:`linear-gradient(135deg,${p},${s})`,boxShadow:`0 0 14px ${glow}35`}}>
                              <Mail className="w-4 h-4 text-white"/>
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{msg.name}</h4>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40 mt-0.5">
                                <span>{msg.email}</span>
                                {msg.phone && <span>• {msg.phone}</span>}
                                <span>• {new Date(msg.created_at).toLocaleString('id-ID')}</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={()=>deleteMessage(msg.id)} className="p-2 rounded-xl transition-all shrink-0" style={S.deleteBtn}
                            onMouseEnter={e=>(e.currentTarget.style.background='rgba(239,68,68,0.22)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(239,68,68,0.12)')}>
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                        <div className="p-4 rounded-xl text-white/80 text-sm whitespace-pre-wrap break-words break-all"
                          style={{ background:`${p}0a`, border:`1px solid ${p}18` }}>
                          {msg.message}
                        </div>
                      </motion.div>
                    ))}</div>}
                  </div>
                </div>
              )}

              {/* ── FOTO PROFIL TAB ── */}
              {tab==='logo' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl" style={S.card}>
                    <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                      <Camera className="w-5 h-5" style={{color:p}}/> Foto Profil Website
                    </h3>
                    <p className="text-white/40 text-sm mb-6">Tampil di lingkaran logo navbar. Otomatis di-crop agar pas.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      <div className="flex flex-col items-center gap-4">
                        <p className="text-sm font-medium mb-1" style={{color:`${p}cc`}}>Pratinjau Logo</p>
                        <div className="relative group">
                          <div className="w-32 h-32 rounded-full p-0.5" style={S.logoBadge}>
                            <div className="w-full h-full rounded-full overflow-hidden bg-[#07101e] flex items-center justify-center">
                              {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover object-center"/>
                                : <span className="text-white font-bold text-3xl select-none">RT</span>}
                            </div>
                          </div>
                          <label htmlFor="logo-file-input" className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="w-8 h-8 text-white"/>
                          </label>
                        </div>
                        <p className="text-white/30 text-xs text-center">Hover untuk ganti · Ukuran apapun akan pas</p>
                        {logoPreview && (
                          <button onClick={removeLogo} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all" style={S.deleteBtn}
                            onMouseEnter={e=>(e.currentTarget.style.background='rgba(239,68,68,0.22)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(239,68,68,0.12)')}>
                            <Trash2 className="w-3.5 h-3.5"/> Hapus Foto
                          </button>
                        )}
                      </div>
                      <div className="space-y-5">
                        <div>
                          <label className={LC} style={{color:`${p}cc`}}>Upload Foto dari Perangkat</label>
                          <label htmlFor="logo-file-input" className="flex flex-col items-center justify-center gap-3 w-full py-8 rounded-2xl cursor-pointer transition-all group"
                            style={S.uploadZone}
                            onMouseEnter={e=>(e.currentTarget.style.border=`2px dashed ${p}60`)} onMouseLeave={e=>(e.currentTarget.style.border=`2px dashed ${p}35`)}>
                            <div className="p-3 rounded-2xl transition-all" style={{background:`${p}18`}}>
                              <Upload className="w-6 h-6" style={{color:p}}/>
                            </div>
                            <div className="text-center">
                              <p className="text-white text-sm font-medium">Klik untuk pilih foto</p>
                              <p className="text-white/30 text-xs mt-1">JPG, PNG, WebP, SVG · Maks 5MB</p>
                            </div>
                            {logoFile && <p className="text-xs font-medium px-3 py-1 rounded-full" style={{color:p,background:`${p}18`}}>✓ {logoFile.name}</p>}
                          </label>
                          <input id="logo-file-input" type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)handleLogoFileChange(f);}}/>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-white/10"/>
                          <span className="text-white/30 text-xs">atau</span>
                          <div className="flex-1 h-px bg-white/10"/>
                        </div>
                        <div>
                          <label className={LC} style={{color:`${p}cc`}}>Link URL Foto Langsung</label>
                          <input className={IC} style={S.input} onFocus={onFocus} onBlur={onBlur} placeholder="https://example.com/foto.png"
                            value={logoFile?'':logoUrl} disabled={!!logoFile}
                            onChange={e=>{setLogoUrl(e.target.value);setLogoPreview(e.target.value);}}/>
                          <p className="text-xs text-white/30 mt-1">Gunakan jika foto sudah ada di internet.</p>
                        </div>
                        <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={saveLogoSetting}
                          disabled={isLogoSaving||isLogoUploading||(!logoFile&&!logoUrl.trim())}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold disabled:opacity-40 transition-all" style={S.primaryBtn}>
                          {isLogoUploading ? <><Loader2 className="w-4 h-4 animate-spin"/> Mengunggah...</>
                            : isLogoSaving ? <><Loader2 className="w-4 h-4 animate-spin"/> Menyimpan...</>
                            : <><Check className="w-4 h-4"/> Simpan Foto Profil</>}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 rounded-3xl" style={S.infoCard}>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2" style={{color:p}}>
                      <ImageIcon className="w-4 h-4"/> Tips Foto Profil
                    </h4>
                    <ul className="text-white/45 text-xs space-y-1.5 list-disc list-inside">
                      <li>Gunakan foto persegi (1:1) agar hasil terbaik</li>
                      <li>Resolusi minimal 200×200 px untuk tampilan tajam</li>
                      <li>Format PNG dengan background transparan cocok untuk logo</li>
                      <li>Bucket <code className="bg-white/10 px-1 rounded">site-assets</code> harus sudah dibuat di Supabase Storage (Public)</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* ── PENGATURAN LATAR TAB ── */}
              {tab==='settings' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl" style={S.card}>
                    <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                      <Settings className="w-5 h-5" style={{color:p}}/> Pengaturan Latar Belakang Beranda
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className={LC} style={{color:`${p}cc`}}>Tipe Media *</label>
                        <select className={IC} style={S.input} onFocus={onFocus} onBlur={onBlur} value={bgType} onChange={e=>setBgType(e.target.value as any)}>
                          <option value="image">Foto (Image)</option>
                          <option value="video">Video (MP4 / WebM)</option>
                        </select>
                      </div>
                      <div className="p-4 rounded-2xl space-y-4" style={S.sectionInner}>
                        <div className="flex gap-4">
                          <span className="font-semibold text-sm" style={{color:p}}>Metode Media:</span>
                          <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                            <input type="radio" name="bg-media-method" defaultChecked onChange={()=>{
                              const eu=document.getElementById('bg-url-container');
                              const ef=document.getElementById('bg-file-container');
                              if(eu)eu.style.display='none'; if(ef)ef.style.display='block';
                            }}/> Upload File Baru
                          </label>
                          <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                            <input type="radio" name="bg-media-method" onChange={()=>{
                              const eu=document.getElementById('bg-url-container');
                              const ef=document.getElementById('bg-file-container');
                              if(eu)eu.style.display='block'; if(ef)ef.style.display='none';
                            }}/> Link URL Langsung
                          </label>
                        </div>
                        <div id="bg-file-container">
                          <label className={LC} style={{color:`${p}cc`}}>Upload File *</label>
                          <input id="bg-file-input" type="file" accept={bgType==='video'?'video/*':'image/*'}
                            className={IC+' file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:text-white'}
                            style={S.input} onChange={e=>setBgFile(e.target.files?.[0]||null)}/>
                          <p className="text-xs text-white/30 mt-1">Upload ke Supabase Storage. Otomatis menggantikan latar beranda.</p>
                        </div>
                        <div id="bg-url-container" style={{display:'none'}}>
                          <label className={LC} style={{color:`${p}cc`}}>Link URL Media *</label>
                          <input className={IC} style={S.input} onFocus={onFocus} onBlur={onBlur} placeholder="https://..." value={bgUrl} onChange={e=>setBgUrl(e.target.value)}/>
                          <p className="text-xs text-white/30 mt-1">Link langsung (.jpg, .png, .mp4, dll.)</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-6">
                      <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={saveBackgroundSetting} disabled={isBgSaving||isBgUploading}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold disabled:opacity-50" style={S.primaryBtn}>
                        {isBgSaving||isBgUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4"/>}
                        {isBgUploading?'Mengunggah...':isBgSaving?'Menyimpan...':'Simpan Pengaturan'}
                      </motion.button>
                    </div>
                  </div>
                  <div className="p-6 rounded-3xl" style={{ background:`linear-gradient(145deg, ${p}0e 0%, ${s}08 100%)`, border:`1px solid ${p}22` }}>
                    <h3 className="text-white font-semibold mb-4">Pratinjau Media Saat Ini</h3>
                    {bgUrl ? (
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
                        {bgType==='video' ? (()=>{
                          const ytMatch=bgUrl.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i);
                          if(ytMatch) return <iframe src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1`} className="w-full h-full" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen/>;
                          return <video src={bgUrl.includes('drive.google.com')?getGDriveUrl(bgUrl,'video'):bgUrl} className="w-full h-full object-cover" controls muted/>;
                        })() : <img src={bgUrl.includes('drive.google.com')?getGDriveUrl(bgUrl,'image'):bgUrl} alt="Preview" className="w-full h-full object-cover"/>}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-white/25 border border-dashed border-white/10 rounded-2xl">
                        Belum ada latar belakang yang diatur.
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
