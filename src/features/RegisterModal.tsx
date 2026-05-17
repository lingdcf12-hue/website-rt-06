import { motion, AnimatePresence } from 'motion/react';
import { X, Send, User, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityTitle: string;
}

export function RegisterModal({ isOpen, onClose, activityTitle }: RegisterModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('registrations')
        .insert([
          { 
            activity_title: activityTitle, 
            full_name: formData.name, 
            phone_number: formData.phone, 
            address: formData.address 
          }
        ]);

      if (error) throw error;

      toast.success(`Selamat! ${formData.name} berhasil mendaftar untuk "${activityTitle}".`, {
        description: "Data pendaftaran telah tersimpan di sistem Josjis.",
        duration: 5000,
      });
      onClose();
      setFormData({ name: '', phone: '', address: '' });
    } catch (error: any) {
      toast.error("Gagal mendaftar: " + error.message);
      console.error('Error registering:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-lg pointer-events-auto"
            >
              <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#001a1a] to-[#003333] border border-cyan-500/30 shadow-[0_0_80px_rgba(6,182,212,0.3)] p-8 md:p-10">
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px]" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px]" />

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-cyan-300 transition-all border border-cyan-500/20"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 shadow-[0_0_30px_rgba(6,182,212,0.5)] mb-6">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Formulir Pendaftaran</h3>
                  <p className="text-cyan-300/60">
                    Mendaftar untuk: <span className="text-teal-400 font-semibold">{activityTitle}</span>
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-cyan-200 ml-1">Nama Lengkap</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-cyan-400 group-focus-within:text-teal-400 transition-colors" />
                      </div>
                      <input
                        required
                        type="text"
                        placeholder="Masukkan nama Anda"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-cyan-500/30 text-white placeholder-cyan-300/30 focus:outline-none focus:border-teal-500/50 focus:shadow-[0_0_25px_rgba(20,184,166,0.2)] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-cyan-200 ml-1">Nomor Telepon / WhatsApp</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="w-5 h-5 text-cyan-400 group-focus-within:text-teal-400 transition-colors" />
                      </div>
                      <input
                        required
                        type="tel"
                        placeholder="0812xxxx"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-cyan-500/30 text-white placeholder-cyan-300/30 focus:outline-none focus:border-teal-500/50 focus:shadow-[0_0_25px_rgba(20,184,166,0.2)] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-cyan-200 ml-1">Alamat / No. Rumah</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="w-5 h-5 text-cyan-400 group-focus-within:text-teal-400 transition-colors" />
                      </div>
                      <input
                        required
                        type="text"
                        placeholder="Contoh: Blok A No. 12"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-cyan-500/30 text-white placeholder-cyan-300/30 focus:outline-none focus:border-teal-500/50 focus:shadow-[0_0_25px_rgba(20,184,166,0.2)] transition-all"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(6,182,212,0.6)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 mt-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white font-bold shadow-[0_0_30_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Daftar Sekarang
                      </>
                    )}
                  </motion.button>
                </form>

                <p className="mt-6 text-center text-xs text-cyan-300/40">
                  Data Anda akan aman dan hanya digunakan untuk keperluan koordinasi warga.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
