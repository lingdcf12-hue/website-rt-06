import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import {
  Plus, Trash2, X, Calendar, Bell, Megaphone,
  Heart, Gift, Music, Book, Shield, LogOut, Loader2, Edit2, Check, Mail, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

const ADMIN_PASSWORD = 'rt6rw1admin';

const GRADIENT_OPTIONS = [
  { label: 'Cyan → Teal', value: 'from-cyan-500 to-teal-500' },
  { label: 'Teal → Emerald', value: 'from-teal-500 to-emerald-500' },
  { label: 'Emerald → Cyan', value: 'from-emerald-500 to-cyan-500' },
  { label: 'Cyan → Emerald', value: 'from-cyan-500 to-emerald-500' },
  { label: 'Purple → Cyan', value: 'from-purple-500 to-cyan-500' },
  { label: 'Blue → Teal', value: 'from-blue-500 to-teal-500' },
];

const ICON_OPTIONS = ['Bell', 'Megaphone', 'Heart', 'Gift', 'Music', 'Book'];
const ICON_MAP: Record<string, any> = { Bell, Megaphone, Heart, Gift, Music, Book };

const emptySchedule = { title: '', date: '', time: '', location: '', attendees: 0, color: 'from-cyan-500 to-teal-500' };
const emptyActivity = { title: '', description: '', badge: 'Info', icon_name: 'Bell', gradient: 'from-cyan-500 to-teal-500' };

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('adminAuth') === 'true');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'schedules' | 'activities' | 'messages'>('schedules');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scheduleForm, setScheduleForm] = useState(emptySchedule);
  const [activityForm, setActivityForm] = useState(emptyActivity);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoggedIn) fetchAll();
  }, [isLoggedIn]);

  const fetchAll = async () => {
    setIsLoading(true);
    const [s, a, m] = await Promise.all([
      supabase.from('schedules').select('*').order('created_at', { ascending: false }),
      supabase.from('activities').select('*').order('created_at', { ascending: false }),
      supabase.from('messages').select('*').order('created_at', { ascending: false }),
    ]);
    setSchedules(s.data || []);
    setActivities(a.data || []);
    setMessages(m.data || []);
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
    setScheduleForm(emptySchedule);
    setSaving(false);
    fetchAll();
  };

  const deleteSchedule = async (id: string, title: string) => {
    // 1. Hapus semua pendaftar yang terkait dengan jadwal ini
    await supabase.from('registrations').delete().eq('activity_title', title);
    
    // 2. Hapus jadwal utamanya
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
    setActivityForm(emptyActivity);
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

  // ── MESSAGES ──
  const deleteMessage = async (id: string) => {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) toast.error('Gagal menghapus pesan'); 
    else { toast.success('Pesan dihapus'); fetchAll(); }
  };

  // ── INPUT STYLE ──
  const inputClass = "w-full px-4 py-3 rounded-2xl bg-white/5 border border-cyan-500/20 text-white placeholder-cyan-300/30 focus:outline-none focus:border-cyan-500/60 focus:bg-white/10 transition-all";
  const labelClass = "block text-cyan-300/70 text-sm mb-1 font-medium";

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
          className="relative w-full max-w-4xl bg-gradient-to-br from-[#000d14] to-[#001a24] border border-cyan-500/20 rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.2)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-cyan-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Admin Panel</h2>
                <p className="text-cyan-300/50 text-xs">RT 6 RW 1 Josjis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isLoggedIn && (
                <button onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 text-sm transition-all">
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
              <div className="p-4 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/20">
                <Shield className="w-12 h-12 text-cyan-400" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-1">Login Admin</h3>
                <p className="text-cyan-300/50 text-sm">Masukkan password untuk akses panel</p>
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
                  className="py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                  Masuk
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="p-6 md:p-8">
              {/* Tabs */}
              <div className="flex gap-2 mb-8 p-1 rounded-2xl bg-white/5 border border-white/5 w-fit">
                {[
                  { key: 'schedules', label: 'Jadwal Aktivitas', icon: Calendar },
                  { key: 'activities', label: 'Kegiatan & Pengumuman', icon: Bell },
                  { key: 'messages', label: 'Pesan Masuk', icon: Mail },
                ].map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => setTab(key as any)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      tab === key
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : 'text-cyan-300/60 hover:text-cyan-300'
                    }`}>
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* ── JADWAL TAB ── */}
              {tab === 'schedules' && (
                <div className="space-y-8">
                  {/* Form */}
                  <div className="p-6 rounded-3xl bg-white/3 border border-cyan-500/10">
                    <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                      {editingScheduleId ? <><Edit2 className="w-4 h-4 text-cyan-400"/>Edit Jadwal</> : <><Plus className="w-4 h-4 text-cyan-400"/>Tambah Jadwal Baru</>}
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
                      <div className="md:col-span-2">
                        <label className={labelClass}>Warna Kartu</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {GRADIENT_OPTIONS.map(g => (
                            <button key={g.value} onClick={() => setScheduleForm({ ...scheduleForm, color: g.value })}
                              className={`px-3 py-1.5 rounded-xl text-xs border transition-all bg-gradient-to-r ${g.value} ${scheduleForm.color === g.value ? 'ring-2 ring-white scale-105' : 'opacity-60 hover:opacity-100'}`}>
                              {g.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-5">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveSchedule} disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingScheduleId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {editingScheduleId ? 'Simpan Perubahan' : 'Tambahkan'}
                      </motion.button>
                      {editingScheduleId && (
                        <button onClick={() => { setEditingScheduleId(null); setScheduleForm(emptySchedule); }}
                          className="px-4 py-3 rounded-2xl bg-white/10 text-cyan-300 hover:bg-white/20 transition-all text-sm">
                          Batal
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List */}
                  <div>
                    <h3 className="text-white font-semibold mb-4">Daftar Jadwal ({schedules.length})</h3>
                    {isLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>
                    ) : schedules.length === 0 ? (
                      <div className="text-center py-10 text-cyan-300/40">Belum ada jadwal</div>
                    ) : (
                      <div className="space-y-3">
                        {schedules.map(s => (
                          <motion.div key={s.id} layout
                            className="flex items-center justify-between p-4 rounded-2xl bg-white/3 border border-white/5 hover:border-cyan-500/20 transition-all">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-10 rounded-full bg-gradient-to-b ${s.color}`} />
                              <div>
                                <p className="text-white font-medium">{s.title}</p>
                                <p className="text-cyan-300/50 text-xs">{s.date} · {s.time} · {s.location} · Target: {s.attendees} peserta</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => editSchedule(s)}
                                className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-all">
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
                  <div className="p-6 rounded-3xl bg-white/3 border border-cyan-500/10">
                    <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                      {editingActivityId ? <><Edit2 className="w-4 h-4 text-cyan-400"/>Edit Kegiatan</> : <><Plus className="w-4 h-4 text-cyan-400"/>Tambah Kegiatan / Pengumuman</>}
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
                                className={`p-2.5 rounded-xl border transition-all ${activityForm.icon_name === ic ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-white/5 border-white/10 text-cyan-300/60 hover:border-cyan-500/30'}`}>
                                <Ic className="w-4 h-4" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>Warna Kartu</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {GRADIENT_OPTIONS.map(g => (
                            <button key={g.value} onClick={() => setActivityForm({ ...activityForm, gradient: g.value })}
                              className={`px-3 py-1.5 rounded-xl text-xs border transition-all bg-gradient-to-r ${g.value} ${activityForm.gradient === g.value ? 'ring-2 ring-white scale-105' : 'opacity-60 hover:opacity-100'}`}>
                              {g.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-5">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveActivity} disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingActivityId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {editingActivityId ? 'Simpan Perubahan' : 'Tambahkan'}
                      </motion.button>
                      {editingActivityId && (
                        <button onClick={() => { setEditingActivityId(null); setActivityForm(emptyActivity); }}
                          className="px-4 py-3 rounded-2xl bg-white/10 text-cyan-300 hover:bg-white/20 transition-all text-sm">
                          Batal
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List */}
                  <div>
                    <h3 className="text-white font-semibold mb-4">Daftar Kegiatan ({activities.length})</h3>
                    {isLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>
                    ) : activities.length === 0 ? (
                      <div className="text-center py-10 text-cyan-300/40">Belum ada kegiatan</div>
                    ) : (
                      <div className="space-y-3">
                        {activities.map(a => {
                          const Ic = ICON_MAP[a.icon_name] || Bell;
                          return (
                            <motion.div key={a.id} layout
                              className="flex items-center justify-between p-4 rounded-2xl bg-white/3 border border-white/5 hover:border-cyan-500/20 transition-all">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl bg-gradient-to-r ${a.gradient}`}>
                                  <Ic className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-white font-medium">{a.title}</p>
                                  <p className="text-cyan-300/50 text-xs line-clamp-1">{a.description}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => editActivity(a)}
                                  className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-all">
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

              {/* ── PESAN MASUK TAB ── */}
              {tab === 'messages' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-cyan-400" />
                      Kotak Masuk ({messages.length})
                    </h3>
                    {isLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-10 text-cyan-300/40">Belum ada pesan masuk</div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map(msg => (
                          <motion.div key={msg.id} layout
                            className="p-5 rounded-2xl bg-white/5 border border-cyan-500/10 hover:border-cyan-500/30 transition-all">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                  <Mail className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-white font-medium">{msg.name}</h4>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cyan-300/60 mt-0.5">
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
                            <div className="p-4 rounded-xl bg-black/20 text-cyan-100/90 text-sm whitespace-pre-wrap break-words break-all border border-white/5">
                              {msg.message}
                            </div>
                          </motion.div>
                        ))}
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
