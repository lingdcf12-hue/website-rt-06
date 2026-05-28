import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import {
  Plus, Trash2, X, Calendar, Bell, Megaphone,
  Heart, Gift, Music, Book, Shield, LogOut, Loader2, Edit2, Check, Mail, MessageSquare, Image as ImageIcon, Settings, Camera, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../lib/ThemeContext';

const ADMIN_PASSWORD = 'rt6rw1admin';

const ICON_OPTIONS = ['Bell', 'Megaphone', 'Heart', 'Gift', 'Music', 'Book'];
const ICON_MAP: Record<string, any> = { Bell, Megaphone, Heart, Gift, Music, Book };



export function AdminModal({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme();

  // Dynamic theme-aware class helpers
  const t = theme.textAccent;           // e.g. 'cyan-400'
  const b = theme.borderColor;          // e.g. 'cyan-500'
  const gf = theme.gradFrom;            // e.g. 'cyan-500'
  const gt = theme.gradTo;              // e.g. 'teal-500'
  const defaultGrad = `from-${gf} to-${gt}`;

  const inputClass = `w-full px-4 py-3 rounded-2xl bg-white/5 border border-${b}/20 text-white placeholder-${t}/30 focus:outline-none focus:border-${b}/60 focus:bg-white/10 transition-all`;
  const labelClass = `block text-${t}/70 text-sm mb-1 font-medium`;
  const btnPrimary = `bg-gradient-to-r from-${gf} to-${gt} text-white`;
  const shadowGlow = { boxShadow: `0 0 20px ${theme.glowLight}` };
  const shadowGlowMd = { boxShadow: `0 0 15px ${theme.glowLight}` };

  const emptyScheduleThemed = { title: '', date: '', time: '', location: '', attendees: 0, color: defaultGrad };
  const emptyActivityThemed = { title: '', description: '', badge: 'Info', icon_name: 'Bell', gradient: defaultGrad };
  const emptyGalleryThemed = { title: '', type: 'image', gradient: defaultGrad, url: '', likes: 0 };

  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('adminAuth') === 'true');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'schedules' | 'activities' | 'gallery' | 'messages' | 'settings' | 'logo'>('schedules');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scheduleForm, setScheduleForm] = useState(emptyScheduleThemed);
  const [activityForm, setActivityForm] = useState(emptyActivityThemed);
  const [galleryForm, setGalleryForm] = useState(emptyGalleryThemed);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryThumbnail, setGalleryThumbnail] = useState('');
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // States for Hero background settings
  const [bgType, setBgType] = useState<'image' | 'video'>('image');
  const [bgUrl, setBgUrl] = useState('');
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [isBgUploading, setIsBgUploading] = useState(false);
  const [isBgSaving, setIsBgSaving] = useState(false);

  // States for Site Logo / Profile Photo
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isLogoSaving, setIsLogoSaving] = useState(false);

  useEffect(() => {
    if (isLoggedIn) fetchAll();
  }, [isLoggedIn]);

  const fetchAll = async () => {
    setIsLoading(true);
    const [s, a, m, g, bg, logo] = await Promise.all([
      supabase.from('schedules').select('*').order('created_at', { ascending: false }),
      supabase.from('activities').select('*').order('created_at', { ascending: false }),
      supabase.from('messages').select('*').order('created_at', { ascending: false }),
      supabase.from('gallery').select('*').order('created_at', { ascending: false }),
      supabase.from('site_settings').select('*').eq('key', 'hero_background').maybeSingle(),
      supabase.from('site_settings').select('*').eq('key', 'site_logo').maybeSingle(),
    ]);
    setSchedules(s.data || []);
    setActivities(a.data || []);
    setMessages(m.data || []);
    setGallery(g.data || []);
    if (bg.data && bg.data.value) {
      setBgType(bg.data.value.type || 'image');
      setBgUrl(bg.data.value.url || '');
    }
    if (logo.data && logo.data.value?.url) {
      setLogoUrl(logo.data.value.url);
      setLogoPreview(logo.data.value.url);
    }
    setIsLoading(false);
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      sessionStorage.setItem('adminAuth', 'true');
      toast.success('Login berhasil!');
    } else {
      toast.error('Password salah!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('adminAuth');
    toast.success('Berhasil logout');
  };

  // ── SCHEDULE CRUD ──
  const saveSchedule = async () => {
    if (!scheduleForm.title || !scheduleForm.date || !scheduleForm.time || !scheduleForm.location) {
      return toast.error('Semua field wajib diisi!');
    }
    setSaving(true);
    if (editingScheduleId) {
      const { error } = await supabase.from('schedules').update(scheduleForm).eq('id', editingScheduleId);
      if (error) toast.error('Gagal update jadwal');
      else { toast.success('Jadwal diupdate!'); setEditingScheduleId(null); }
    } else {
      const { error } = await supabase.from('schedules').insert(scheduleForm);
      if (error) toast.error('Gagal tambah jadwal');
      else toast.success('Jadwal ditambahkan!');
    }
    setScheduleForm(emptyScheduleThemed);
    setSaving(false);
    fetchAll();
  };

  const deleteSchedule = async (id: string, title: string) => {
    await supabase.from('registrations').delete().eq('activity_title', title);
    const { error } = await supabase.from('schedules').delete().eq('id', id);
    if (error) toast.error('Gagal hapus'); else { toast.success('Jadwal & Data Pendaftar dihapus'); fetchAll(); }
  };

  const editSchedule = (s: any) => {
    setEditingScheduleId(s.id);
    setScheduleForm({ title: s.title, date: s.date, time: s.time, location: s.location, attendees: s.attendees, color: s.color });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── ACTIVITY CRUD ──
  const saveActivity = async () => {
    if (!activityForm.title || !activityForm.description) {
      return toast.error('Judul dan deskripsi wajib diisi!');
    }
    setSaving(true);
    if (editingActivityId) {
      const { error } = await supabase.from('activities').update(activityForm).eq('id', editingActivityId);
      if (error) toast.error('Gagal update kegiatan');
      else { toast.success('Kegiatan diupdate!'); setEditingActivityId(null); }
    } else {
      const { error } = await supabase.from('activities').insert(activityForm);
      if (error) toast.error('Gagal tambah kegiatan');
      else toast.success('Kegiatan ditambahkan!');
    }
    setActivityForm(emptyActivityThemed);
    setSaving(false);
    fetchAll();
  };

  const deleteActivity = async (id: string) => {
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) toast.error('Gagal hapus'); else { toast.success('Kegiatan dihapus'); fetchAll(); }
  };

  const editActivity = (a: any) => {
    setEditingActivityId(a.id);
    setActivityForm({ title: a.title, description: a.description, badge: a.badge, icon_name: a.icon_name, gradient: a.gradient });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── GALLERY CRUD ──
  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);

      if (error) {
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          throw new Error("Bucket 'gallery' belum dibuat di Supabase Storage kamu. Harap buat bucket bernama 'gallery' terlebih dahulu di dashboard Supabase dan set aksesnya ke Publik.");
        }
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Gagal meng-upload file. Coba gunakan metode Input Link URL.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const saveGalleryItem = async () => {
    if (!galleryForm.title) {
      return toast.error('Judul galeri wajib diisi!');
    }
    
    setSaving(true);
    let finalUrl = galleryForm.url;

    if (galleryFile) {
      const uploadedUrl = await handleFileUpload(galleryFile);
      if (!uploadedUrl) {
        setSaving(false);
        return; 
      }
      finalUrl = uploadedUrl;
    }

    if (!finalUrl) {
      setSaving(false);
      return toast.error('Harap pilih file untuk di-upload atau masukkan Link URL!');
    }

    // Append optional thumbnail URL if present
    if (galleryThumbnail.trim()) {
      finalUrl = `${finalUrl.trim()}||thumb||${galleryThumbnail.trim()}`;
    }

    const payload: any = {
      title: galleryForm.title,
      type: galleryForm.type,
      gradient: galleryForm.gradient,
      url: finalUrl,
      likes: galleryForm.likes || 0,
      thumbnail_url: galleryThumbnail.trim() || null
    };

    if (editingGalleryId) {
      let { error } = await supabase.from('gallery').update(payload).eq('id', editingGalleryId);
      if (error && (error.message.includes('column') || error.message.includes('tidak ada') || error.code === '42703')) {
        // Fallback retry without thumbnail_url column
        const fallbackPayload = { ...payload };
        delete fallbackPayload.thumbnail_url;
        const retry = await supabase.from('gallery').update(fallbackPayload).eq('id', editingGalleryId);
        error = retry.error;
      }
      
      if (error) toast.error('Gagal update galeri');
      else { toast.success('Galeri diupdate!'); setEditingGalleryId(null); }
    } else {
      let { error } = await supabase.from('gallery').insert(payload);
      if (error && (error.message.includes('column') || error.message.includes('tidak ada') || error.code === '42703')) {
        // Fallback retry without thumbnail_url column
        const fallbackPayload = { ...payload };
        delete fallbackPayload.thumbnail_url;
        const retry = await supabase.from('gallery').insert(fallbackPayload);
        error = retry.error;
      }
      
      if (error) toast.error('Gagal tambah galeri');
      else toast.success('Galeri ditambahkan!');
    }

    setGalleryForm(emptyGalleryThemed);
    setGalleryFile(null);
    setGalleryThumbnail('');
    const fileInput = document.getElementById('gallery-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    setSaving(false);
    fetchAll();
  };

  const getGoogleDriveImageUrl = (url: string, type: 'image' | 'video' = 'image') => {
    if (!url) return '';
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/) || url.match(/id=([a-zA-Z0-9-_]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      return type === 'video'
        ? `https://drive.google.com/uc?export=download&id=${fileId}`
        : `https://lh3.googleusercontent.com/d/${fileId}`;
    }
    return url;
  };

  const deleteGalleryItem = async (id: string, url: string) => {
    if (url && url.includes('/storage/v1/object/public/gallery/')) {
      const filePath = url.split('/storage/v1/object/public/gallery/').pop();
      if (filePath) {
        await supabase.storage.from('gallery').remove([filePath]);
      }
    }

    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (error) toast.error('Gagal menghapus'); 
    else { toast.success('Galeri dihapus'); fetchAll(); }
  };

  // ── BACKGROUND MEDIA CONFIG CRUD ──
  const saveBackgroundSetting = async () => {
    setIsBgSaving(true);
    let finalUrl = bgUrl;

    if (bgFile) {
      setIsBgUploading(true);
      const uploadedUrl = await handleFileUpload(bgFile);
      setIsBgUploading(false);
      if (uploadedUrl) {
        finalUrl = uploadedUrl;
        setBgUrl(uploadedUrl);
      } else {
        setIsBgSaving(false);
        return;
      }
    }

    if (!finalUrl.trim()) {
      setIsBgSaving(false);
      return toast.error('Harap masukkan URL media atau upload file!');
    }

    const payload = {
      type: bgType,
      url: finalUrl.trim()
    };

    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'hero_background', value: payload });

    setIsBgSaving(false);

    if (error) {
      toast.error('Gagal menyimpan pengaturan latar belakang');
      console.error(error);
    } else {
      toast.success('Pengaturan latar belakang berhasil disimpan!');
      setBgFile(null);
      const fileInput = document.getElementById('bg-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      fetchAll();
    }
  };

  // ── LOGO / PROFILE PHOTO ──
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

        const { error: uploadError } = await supabase.storage
          .from('site-assets')
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) {
          if (uploadError.message.includes('not found') || uploadError.message.includes('does not exist')) {
            throw new Error("Bucket 'site-assets' belum dibuat. Buat bucket bernama 'site-assets' di Supabase Storage dan set ke Publik.");
          }
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('site-assets')
          .getPublicUrl(fileName);

        finalUrl = publicUrl;
        setLogoUrl(publicUrl);
      } catch (err: any) {
        toast.error(err.message || 'Gagal upload foto profil');
        setIsLogoUploading(false);
        setIsLogoSaving(false);
        return;
      } finally {
        setIsLogoUploading(false);
      }
    }

    if (!finalUrl.trim()) {
      setIsLogoSaving(false);
      return toast.error('Harap upload foto atau masukkan URL foto profil!');
    }

    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'site_logo', value: { url: finalUrl.trim(), type: 'image' } });

    setIsLogoSaving(false);

    if (error) {
      toast.error('Gagal menyimpan foto profil');
      console.error(error);
    } else {
      toast.success('Foto profil website berhasil disimpan!');
      setLogoFile(null);
      const fileInput = document.getElementById('logo-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      fetchAll();
    }
  };

  const removeLogo = async () => {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'site_logo', value: { url: '', type: 'image' } });

    if (error) {
      toast.error('Gagal menghapus foto profil');
    } else {
      setLogoUrl('');
      setLogoPreview('');
      setLogoFile(null);
      toast.success('Foto profil dihapus, kembali ke inisial RT');
      fetchAll();
    }
  };

  // ── MESSAGES ──
  const deleteMessage = async (id: string) => {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) toast.error('Gagal menghapus pesan'); 
    else { toast.success('Pesan dihapus'); fetchAll(); }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-start justify-center overflow-y-auto py-8 px-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`relative w-full max-w-4xl bg-gradient-to-br from-[#000d14] to-[#001a24] border border-${b}/20 rounded-3xl overflow-hidden`}
          style={{ boxShadow: `0 0 80px ${theme.glowLight}` }}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-8 py-5 border-b border-${b}/10`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-gradient-to-br from-${gf} to-${gt}`} style={shadowGlow}>
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Admin Panel</h2>
                <p className={`text-${t}/50 text-xs`}>RT 6 RW 1 Josjis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isLoggedIn && (
                <button onClick={handleLogout}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-${t} text-sm transition-all`}>
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              )}
              <button onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white hover:text-red-400 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* LOGIN */}
          {!isLoggedIn ? (
            <div className="flex flex-col items-center justify-center py-20 px-8 gap-6">
              <div className={`p-4 rounded-3xl bg-gradient-to-br from-${gf}/20 to-${gt}/10 border border-${b}/20`}>
                <Shield className={`w-12 h-12 text-${t}`} />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-1">Login Admin</h3>
                <p className={`text-${t}/50 text-sm`}>Masukkan password untuk akses panel</p>
              </div>
              <div className="w-full max-w-sm flex flex-col gap-3">
                <input
                  type="password"
                  placeholder="Password admin..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className={inputClass}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleLogin}
                  className={`py-3 rounded-2xl ${btnPrimary} font-semibold`}
                  style={shadowGlow}
                >
                  Masuk
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="p-6 md:p-8">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-8 p-1 rounded-2xl bg-white/5 border border-white/5 w-fit">
                {[
                  { key: 'schedules', label: 'Jadwal Aktivitas', icon: Calendar },
                  { key: 'activities', label: 'Kegiatan & Pengumuman', icon: Bell },
                  { key: 'gallery', label: 'Galeri Warga', icon: ImageIcon },
                  { key: 'messages', label: 'Pesan Masuk', icon: Mail },
                  { key: 'logo', label: 'Foto Profil', icon: Camera },
                  { key: 'settings', label: 'Pengaturan Latar', icon: Settings },
                ].map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => setTab(key as any)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      tab === key
                        ? `${btnPrimary}`
                        : `text-${t}/60 hover:text-${t}`
                    }`}
                    style={tab === key ? shadowGlowMd : undefined}>
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* ── JADWAL TAB ── */}
              {tab === 'schedules' && (
                <div className="space-y-8">
                  {/* Form */}
                  <div className={`p-6 rounded-3xl bg-white/3 border border-${b}/10`}>
                    <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                      {editingScheduleId ? <><Edit2 className={`w-4 h-4 text-${t}`}/>Edit Jadwal</> : <><Plus className={`w-4 h-4 text-${t}`}/>Tambah Jadwal Baru</>}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className={labelClass}>Judul Kegiatan *</label>
                        <input className={inputClass} placeholder="cth: Rapat RT Bulanan" value={scheduleForm.title} onChange={e => setScheduleForm({ ...scheduleForm, title: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelClass}>Tanggal *</label>
                        <input className={inputClass} placeholder="cth: Sabtu, 15 Juni 2025" value={scheduleForm.date} onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelClass}>Waktu *</label>
                        <input className={inputClass} placeholder="cth: 19:00 - 21:00 WIB" value={scheduleForm.time} onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelClass}>Lokasi *</label>
                        <input className={inputClass} placeholder="cth: Balai RT 6" value={scheduleForm.location} onChange={e => setScheduleForm({ ...scheduleForm, location: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelClass}>Target Peserta</label>
                        <input type="number" min="0" className={inputClass} placeholder="0" value={scheduleForm.attendees} onChange={e => setScheduleForm({ ...scheduleForm, attendees: Number(e.target.value) })} />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-5">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveSchedule} disabled={saving}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl ${btnPrimary} font-semibold disabled:opacity-50`}
                        style={shadowGlow}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingScheduleId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {editingScheduleId ? 'Simpan Perubahan' : 'Tambahkan'}
                      </motion.button>
                      {editingScheduleId && (
                        <button onClick={() => { setEditingScheduleId(null); setScheduleForm(emptyScheduleThemed); }}
                          className={`px-4 py-3 rounded-2xl bg-white/10 text-${t} hover:bg-white/20 transition-all text-sm`}>
                          Batal
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List */}
                  <div>
                    <h3 className="text-white font-semibold mb-4">Daftar Jadwal ({schedules.length})</h3>
                    {isLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className={`w-8 h-8 animate-spin text-${t}`} /></div>
                    ) : schedules.length === 0 ? (
                      <div className={`text-center py-10 text-${t}/40`}>Belum ada jadwal</div>
                    ) : (
                      <div className="space-y-3">
                        {schedules.map(s => (
                          <motion.div key={s.id} layout
                            className={`flex items-center justify-between p-4 rounded-2xl bg-white/3 border border-white/5 hover:border-${b}/20 transition-all`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-10 rounded-full bg-gradient-to-b ${s.color}`} />
                              <div>
                                <p className="text-white font-medium">{s.title}</p>
                                <p className={`text-${t}/50 text-xs`}>{s.date} · {s.time} · {s.location} · Target: {s.attendees} peserta</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => editSchedule(s)}
                                className={`p-2 rounded-xl bg-${b}/10 hover:bg-${b}/20 text-${t} transition-all`}>
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteSchedule(s.id, s.title)}
                                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── KEGIATAN TAB ── */}
              {tab === 'activities' && (
                <div className="space-y-8">
                  {/* Form */}
                  <div className={`p-6 rounded-3xl bg-white/3 border border-${b}/10`}>
                    <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                      {editingActivityId ? <><Edit2 className={`w-4 h-4 text-${t}`}/>Edit Kegiatan</> : <><Plus className={`w-4 h-4 text-${t}`}/>Tambah Kegiatan / Pengumuman</>}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className={labelClass}>Judul *</label>
                        <input className={inputClass} placeholder="cth: Kerja Bakti Lingkungan" value={activityForm.title} onChange={e => setActivityForm({ ...activityForm, title: e.target.value })} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>Deskripsi *</label>
                        <textarea rows={3} className={inputClass + ' resize-none'} placeholder="Jelaskan detail kegiatan..." value={activityForm.description} onChange={e => setActivityForm({ ...activityForm, description: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelClass}>Badge / Label</label>
                        <input className={inputClass} placeholder="cth: Pengumuman, Info, Event" value={activityForm.badge} onChange={e => setActivityForm({ ...activityForm, badge: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelClass}>Ikon</label>
                        <div className="flex gap-2 flex-wrap mt-1">
                          {ICON_OPTIONS.map(ic => {
                            const Ic = ICON_MAP[ic];
                            return (
                              <button key={ic} onClick={() => setActivityForm({ ...activityForm, icon_name: ic })}
                                className={`p-2.5 rounded-xl border transition-all ${activityForm.icon_name === ic ? `bg-${gf} border-${gf} text-white` : `bg-white/5 border-white/10 text-${t}/60 hover:border-${b}/30`}`}>
                                <Ic className="w-4 h-4" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-5">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveActivity} disabled={saving}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl ${btnPrimary} font-semibold disabled:opacity-50`}
                        style={shadowGlow}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingActivityId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {editingActivityId ? 'Simpan Perubahan' : 'Tambahkan'}
                      </motion.button>
                      {editingActivityId && (
                        <button onClick={() => { setEditingActivityId(null); setActivityForm(emptyActivityThemed); }}
                          className={`px-4 py-3 rounded-2xl bg-white/10 text-${t} hover:bg-white/20 transition-all text-sm`}>
                          Batal
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List */}
                  <div>
                    <h3 className="text-white font-semibold mb-4">Daftar Kegiatan ({activities.length})</h3>
                    {isLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className={`w-8 h-8 animate-spin text-${t}`} /></div>
                    ) : activities.length === 0 ? (
                      <div className={`text-center py-10 text-${t}/40`}>Belum ada kegiatan</div>
                    ) : (
                      <div className="space-y-3">
                        {activities.map(a => {
                          const Ic = ICON_MAP[a.icon_name] || Bell;
                          return (
                            <motion.div key={a.id} layout
                              className={`flex items-center justify-between p-4 rounded-2xl bg-white/3 border border-white/5 hover:border-${b}/20 transition-all`}>
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl bg-gradient-to-r ${a.gradient}`}>
                                  <Ic className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-white font-medium">{a.title}</p>
                                  <p className={`text-${t}/50 text-xs line-clamp-1`}>{a.description}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => editActivity(a)}
                                  className={`p-2 rounded-xl bg-${b}/10 hover:bg-${b}/20 text-${t} transition-all`}>
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => deleteActivity(a.id)}
                                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── GALLERY TAB ── */}
              {tab === 'gallery' && (
                <div className="space-y-8">
                  {/* Form */}
                  <div className={`p-6 rounded-3xl bg-white/3 border border-${b}/10`}>
                    <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                      {editingGalleryId ? <><Edit2 className={`w-4 h-4 text-${t}`}/>Edit Galeri</> : <><Plus className={`w-4 h-4 text-${t}`}/>Tambah Foto / Video Baru</>}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className={labelClass}>Judul Dokumentasi *</label>
                        <input className={inputClass} placeholder="cth: Senam Pagi Bersama Warga" value={galleryForm.title} onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })} />
                      </div>
                      
                      <div>
                        <label className={labelClass}>Tipe Media *</label>
                        <select 
                          className={inputClass} 
                          value={galleryForm.type} 
                          onChange={e => setGalleryForm({ ...galleryForm, type: e.target.value })}
                        >
                          <option value="image">Foto (Image)</option>
                          <option value="video">Video</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>Jumlah Likes Awal</label>
                        <input type="number" min="0" className={inputClass} placeholder="0" value={galleryForm.likes} onChange={e => setGalleryForm({ ...galleryForm, likes: Number(e.target.value) })} />
                      </div>

                      <div className="md:col-span-2">
                        <div className={`p-4 rounded-2xl bg-white/5 border border-${b}/10 space-y-4`}>
                          <div className="flex gap-4">
                            <span className={`text-${t} font-semibold text-sm`}>Metode Media:</span>
                            <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                              <input type="radio" name="media-method" defaultChecked onChange={() => {
                                const elUrl = document.getElementById('media-url-container');
                                const elFile = document.getElementById('media-file-container');
                                if (elUrl) elUrl.style.display = 'none';
                                if (elFile) elFile.style.display = 'block';
                              }} />
                              Upload File
                            </label>
                            <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                              <input type="radio" name="media-method" onChange={() => {
                                const elUrl = document.getElementById('media-url-container');
                                const elFile = document.getElementById('media-file-container');
                                if (elUrl) elUrl.style.display = 'block';
                                if (elFile) elFile.style.display = 'none';
                              }} />
                              Link URL Langsung
                            </label>
                          </div>

                          <div id="media-file-container">
                            <label className={labelClass}>Pilih File (Foto / Video) *</label>
                            <input 
                              id="gallery-file-input"
                              type="file" 
                              accept={galleryForm.type === 'video' ? 'video/*' : 'image/*'} 
                              className={inputClass + ` file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-${gf} file:text-white hover:file:opacity-80`} 
                              onChange={e => setGalleryFile(e.target.files?.[0] || null)} 
                            />
                            <p className={`text-xs text-${t}/40 mt-1`}>Format didukung: jpg, png, mp4, webm, dll. Maksimal 50MB (Batas Supabase).</p>
                          </div>

                          <div id="media-url-container" style={{ display: 'none' }}>
                            <label className={labelClass}>Link URL Langsung *</label>
                            <input className={inputClass} placeholder="cth: https://images.unsplash.com/... atau link mp4" value={galleryForm.url} onChange={e => setGalleryForm({ ...galleryForm, url: e.target.value })} />
                            <p className={`text-xs text-${t}/40 mt-1`}>Gunakan ini jika ingin menempelkan link gambar/video langsung dari internet.</p>
                            
                            <div className="mt-3">
                              <label className={labelClass}>Link Gambar Thumbnail (Opsional)</label>
                              <input className={inputClass} placeholder="cth: https://images.unsplash.com/... atau upload di tempat lain" value={galleryThumbnail} onChange={e => setGalleryThumbnail(e.target.value)} />
                              <p className={`text-xs text-${t}/40 mt-1`}>Sangat cocok untuk video TikTok, Instagram, atau Google Drive agar langsung memiliki cover thumbnail yang indah.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-5">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveGalleryItem} disabled={saving || isUploading}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl ${btnPrimary} font-semibold disabled:opacity-50`}
                        style={shadowGlow}>
                        {saving || isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingGalleryId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {isUploading ? 'Mengupload File...' : saving ? 'Menyimpan...' : editingGalleryId ? 'Simpan Perubahan' : 'Tambahkan'}
                      </motion.button>
                      {editingGalleryId && (
                        <button onClick={() => { setEditingGalleryId(null); setGalleryForm(emptyGalleryThemed); setGalleryFile(null); }}
                          className={`px-4 py-3 rounded-2xl bg-white/10 text-${t} hover:bg-white/20 transition-all text-sm`}>
                          Batal
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List */}
                  <div>
                    <h3 className="text-white font-semibold mb-4">Daftar Galeri ({gallery.length})</h3>
                    {isLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className={`w-8 h-8 animate-spin text-${t}`} /></div>
                    ) : gallery.length === 0 ? (
                      <div className={`text-center py-10 text-${t}/40`}>Belum ada item galeri di database (menampilkan default fallback di halaman utama)</div>
                    ) : (
                      <div className="space-y-3">
                        {gallery.map(g => (
                          <motion.div key={g.id} layout
                            className={`flex items-center justify-between p-4 rounded-2xl bg-white/3 border border-white/5 hover:border-${b}/20 transition-all`}>
                            <div className="flex items-center gap-3">
                              {g.url ? (() => {
                                const parts = g.url.split('||thumb||');
                                const mediaUrl = parts[0];
                                const rawThumbUrl = g.thumbnail_url || parts[1] || '';
                                const thumbUrl = rawThumbUrl.includes('drive.google.com')
                                  ? getGoogleDriveImageUrl(rawThumbUrl)
                                  : rawThumbUrl;
                                const finalMediaUrl = mediaUrl.includes('drive.google.com') && g.type === 'image'
                                  ? getGoogleDriveImageUrl(mediaUrl)
                                  : mediaUrl;
                                return thumbUrl ? (
                                  <img src={thumbUrl} className="w-16 h-12 rounded-xl object-cover bg-black/40" />
                                ) : g.type === 'video' ? (
                                  <video src={finalMediaUrl} className="w-16 h-12 rounded-xl object-cover bg-black/40" muted />
                                ) : (
                                  <img src={finalMediaUrl} className="w-16 h-12 rounded-xl object-cover bg-black/40" />
                                );
                              })() : (
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${g.gradient || `from-${gf} to-${gt}`} opacity-40`} />
                              )}
                              <div>
                                <p className="text-white font-medium">{g.title}</p>
                                <p className={`text-${t}/50 text-xs uppercase`}>{g.type} · {g.likes} likes · {g.url ? 'URL' : 'Gradient Only'}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => {
                                setEditingGalleryId(g.id);
                                let mediaUrl = g.url || '';
                                let thumbUrl = g.thumbnail_url || '';
                                if (mediaUrl.includes('||thumb||')) {
                                  const parts = mediaUrl.split('||thumb||');
                                  mediaUrl = parts[0];
                                  if (!thumbUrl) {
                                    thumbUrl = parts[1];
                                  }
                                }
                                setGalleryForm({ title: g.title, type: g.type, gradient: g.gradient, url: mediaUrl, likes: g.likes });
                                setGalleryThumbnail(thumbUrl);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                                className={`p-2 rounded-xl bg-${b}/10 hover:bg-${b}/20 text-${t} transition-all`}>
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteGalleryItem(g.id, g.url)}
                                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── PESAN MASUK TAB ── */}
              {tab === 'messages' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <MessageSquare className={`w-5 h-5 text-${t}`} />
                      Kotak Masuk ({messages.length})
                    </h3>
                    {isLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className={`w-8 h-8 animate-spin text-${t}`} /></div>
                    ) : messages.length === 0 ? (
                      <div className={`text-center py-10 text-${t}/40`}>Belum ada pesan masuk</div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map(msg => (
                          <motion.div key={msg.id} layout
                            className={`p-5 rounded-2xl bg-white/5 border border-${b}/10 hover:border-${b}/30 transition-all`}>
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl bg-gradient-to-r from-${gf} to-${gt}`} style={shadowGlowMd}>
                                  <Mail className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-white font-medium">{msg.name}</h4>
                                  <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-${t}/60 mt-0.5`}>
                                    <span>{msg.email}</span>
                                    {msg.phone && <span>• {msg.phone}</span>}
                                    <span>• {new Date(msg.created_at).toLocaleString('id-ID')}</span>
                                  </div>
                                </div>
                              </div>
                              <button onClick={() => deleteMessage(msg.id)}
                                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all shrink-0">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="p-4 rounded-xl bg-black/20 text-white/80 text-sm whitespace-pre-wrap break-words break-all border border-white/5">
                              {msg.message}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── LOGO / FOTO PROFIL TAB ── */}
              {tab === 'logo' && (
                <div className="space-y-8 animate-fade-in">
                  {/* Upload Section */}
                  <div className={`p-6 rounded-3xl bg-white/3 border border-${b}/10`}>
                    <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Camera className={`w-5 h-5 text-${t}`} />
                      Foto Profil Website
                    </h3>
                    <p className={`text-${t}/50 text-sm mb-6`}>
                      Foto ini akan tampil di lingkaran logo navbar. Foto akan otomatis di-crop agar pas tanpa terpotong.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      {/* Preview */}
                      <div className="flex flex-col items-center gap-4">
                        <p className={labelClass}>Pratinjau Logo</p>
                        <div className="relative group">
                          {/* Outer glow ring */}
                          <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-${gf} to-${gt} p-0.5`} style={{ boxShadow: `0 0 30px ${theme.glowLight}` }}>
                            <div className="w-full h-full rounded-full overflow-hidden bg-[#000d14] flex items-center justify-center">
                              {logoPreview ? (
                                <img
                                  src={logoPreview}
                                  alt="Logo Preview"
                                  className="w-full h-full object-cover object-center"
                                />
                              ) : (
                                <span className="text-white font-bold text-3xl select-none">RT</span>
                              )}
                            </div>
                          </div>
                          {/* Overlay hint */}
                          <label
                            htmlFor="logo-file-input"
                            className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Camera className="w-8 h-8 text-white" />
                          </label>
                        </div>
                        <p className={`text-${t}/40 text-xs text-center`}>
                          Hover foto untuk ganti · Ukuran apapun akan pas
                        </p>
                        {logoPreview && (
                          <button
                            onClick={removeLogo}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus Foto
                          </button>
                        )}
                      </div>

                      {/* Upload Controls */}
                      <div className="space-y-5">
                        {/* File Upload */}
                        <div>
                          <label className={labelClass}>Upload Foto dari Perangkat</label>
                          <label
                            htmlFor="logo-file-input"
                            className={`flex flex-col items-center justify-center gap-3 w-full py-8 rounded-2xl border-2 border-dashed border-${b}/30 hover:border-${b}/60 bg-white/3 hover:bg-white/5 cursor-pointer transition-all group`}
                          >
                            <div className={`p-3 rounded-2xl bg-${b}/10 group-hover:bg-${b}/20 transition-all`}>
                              <Upload className={`w-6 h-6 text-${t}`} />
                            </div>
                            <div className="text-center">
                              <p className="text-white text-sm font-medium">Klik untuk pilih foto</p>
                              <p className={`text-${t}/40 text-xs mt-1`}>JPG, PNG, WebP, SVG · Maks 5MB</p>
                            </div>
                            {logoFile && (
                              <p className={`text-${t} text-xs font-medium px-3 py-1 rounded-full bg-${b}/10`}>
                                ✓ {logoFile.name}
                              </p>
                            )}
                          </label>
                          <input
                            id="logo-file-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleLogoFileChange(file);
                            }}
                          />
                        </div>

                        {/* OR divider */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-white/10" />
                          <span className={`text-${t}/40 text-xs`}>atau</span>
                          <div className="flex-1 h-px bg-white/10" />
                        </div>

                        {/* URL Input */}
                        <div>
                          <label className={labelClass}>Link URL Foto Langsung</label>
                          <input
                            className={inputClass}
                            placeholder="https://example.com/foto-logo.png"
                            value={logoFile ? '' : logoUrl}
                            disabled={!!logoFile}
                            onChange={e => {
                              setLogoUrl(e.target.value);
                              setLogoPreview(e.target.value);
                            }}
                          />
                          <p className={`text-xs text-${t}/40 mt-1`}>
                            Gunakan jika foto sudah ada di internet (Google Drive, Imgur, dll.)
                          </p>
                        </div>

                        {/* Save Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={saveLogoSetting}
                          disabled={isLogoSaving || isLogoUploading || (!logoFile && !logoUrl.trim())}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl ${btnPrimary} font-semibold disabled:opacity-40 transition-all`}
                          style={shadowGlow}
                        >
                          {isLogoUploading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Mengunggah foto...</>
                          ) : isLogoSaving ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                          ) : (
                            <><Check className="w-4 h-4" /> Simpan Foto Profil</>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Info Card */}
                  <div className={`p-5 rounded-3xl bg-${b}/5 border border-${b}/20`}>
                    <h4 className={`text-${t} font-semibold text-sm mb-2 flex items-center gap-2`}>
                      <ImageIcon className="w-4 h-4" />
                      Tips Foto Profil
                    </h4>
                    <ul className={`text-${t}/60 text-xs space-y-1.5 list-disc list-inside`}>
                      <li>Gunakan foto persegi (1:1) agar hasil terbaik</li>
                      <li>Resolusi minimal 200×200 px untuk tampilan tajam</li>
                      <li>Format PNG dengan background transparan sangat cocok untuk logo</li>
                      <li>Foto akan otomatis di-crop ke lingkaran tanpa terpotong</li>
                      <li>Bucket <code className="bg-white/10 px-1 rounded">site-assets</code> harus sudah dibuat di Supabase Storage (Public)</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* ── SETTINGS TAB ── */}
              {tab === 'settings' && (
                <div className="space-y-8 animate-fade-in">
                  <div className={`p-6 rounded-3xl bg-white/3 border border-${b}/10`}>
                    <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                      <Settings className={`w-5 h-5 text-${t}`} />
                      Pengaturan Latar Belakang Beranda
                    </h3>

                    <div className="grid grid-cols-1 gap-6">
                      
                      <div>
                        <label className={labelClass}>Tipe Media *</label>
                        <select 
                          className={inputClass} 
                          value={bgType} 
                          onChange={e => setBgType(e.target.value as any)}
                        >
                          <option value="image">Foto (Image)</option>
                          <option value="video">Video (MP4 / WebM)</option>
                        </select>
                      </div>

                      <div className={`p-4 rounded-2xl bg-white/5 border border-${b}/10 space-y-4`}>
                        <div className="flex gap-4">
                          <span className={`text-${t} font-semibold text-sm`}>Metode Media:</span>
                          <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                            <input 
                              type="radio" 
                              name="bg-media-method" 
                              defaultChecked 
                              onChange={() => {
                                const elUrl = document.getElementById('bg-url-container');
                                const elFile = document.getElementById('bg-file-container');
                                if (elUrl) elUrl.style.display = 'none';
                                if (elFile) elFile.style.display = 'block';
                              }} 
                            />
                            Upload File Baru
                          </label>
                          <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                            <input 
                              type="radio" 
                              name="bg-media-method" 
                              onChange={() => {
                                const elUrl = document.getElementById('bg-url-container');
                                const elFile = document.getElementById('bg-file-container');
                                if (elUrl) elUrl.style.display = 'block';
                                if (elFile) elFile.style.display = 'none';
                              }} 
                            />
                            Link URL Langsung
                          </label>
                        </div>

                        <div id="bg-file-container">
                          <label className={labelClass}>Upload File (Foto / Video) *</label>
                          <input 
                            id="bg-file-input"
                            type="file" 
                            accept={bgType === 'video' ? 'video/*' : 'image/*'} 
                            className={inputClass + ` file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-${gf} file:text-white hover:file:opacity-80`} 
                            onChange={e => setBgFile(e.target.files?.[0] || null)} 
                          />
                          <p className={`text-xs text-${t}/40 mt-1`}>Upload ke storage Supabase. File akan otomatis menggantikan latar belakang beranda saat disimpan.</p>
                        </div>

                        <div id="bg-url-container" style={{ display: 'none' }}>
                          <label className={labelClass}>Link URL Media *</label>
                          <input 
                            className={inputClass} 
                            placeholder="cth: https://images.unsplash.com/... atau link mp4" 
                            value={bgUrl} 
                            onChange={e => setBgUrl(e.target.value)} 
                          />
                          <p className={`text-xs text-${t}/40 mt-1`}>Gunakan link langsung (.jpg, .png, .mp4, dll.) dari host luar.</p>
                        </div>
                      </div>

                    </div>

                    <div className="flex gap-2 mt-6">
                      <motion.button 
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }} 
                        onClick={saveBackgroundSetting} 
                        disabled={isBgSaving || isBgUploading}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl ${btnPrimary} font-semibold disabled:opacity-50`}
                        style={shadowGlow}
                      >
                        {isBgSaving || isBgUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        {isBgUploading ? 'Mengunggah file...' : isBgSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                      </motion.button>
                    </div>
                  </div>

                  {/* Preview Container */}
                  <div className="p-6 rounded-3xl bg-white/3 border border-white/5">
                    <h3 className="text-white font-semibold mb-4">Pratinjau Media Saat Ini</h3>
                    {bgUrl ? (
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
                        {bgType === 'video' ? (
                          (() => {
                            const ytMatch = bgUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
                            if (ytMatch) {
                              return (
                                <iframe
                                  src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1`}
                                  className="w-full h-full object-cover"
                                  frameBorder="0"
                                  allow="autoplay; encrypted-media"
                                  allowFullScreen
                                />
                              );
                            }
                            return (
                              <video 
                                src={bgUrl.includes('drive.google.com') ? getGoogleDriveImageUrl(bgUrl, 'video') : bgUrl} 
                                className="w-full h-full object-cover" 
                                controls 
                                muted
                              />
                            );
                          })()
                        ) : (
                          <img 
                            src={bgUrl.includes('drive.google.com') ? getGoogleDriveImageUrl(bgUrl, 'image') : bgUrl} 
                            alt="Background Preview" 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ) : (
                      <div className={`text-center py-10 text-${t}/40 border border-dashed border-white/10 rounded-2xl`}>
                        Belum ada latar belakang yang diatur, sistem menggunakan default gambar bawaan.
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
