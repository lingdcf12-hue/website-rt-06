import { motion, AnimatePresence } from 'motion/react';
import { X, Send, User, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../lib/ThemeContext';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityTitle: string;
}

export function RegisterModal({ isOpen, onClose, activityTitle }: RegisterModalProps) {
  const { theme } = useTheme();
  const p = theme.primary;
  const s = theme.secondary;
  const glow = theme.glow;
  const glowL = theme.glowLight;

  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('registrations').insert([{
        activity_title: activityTitle,
        full_name: formData.name,
        phone_number: formData.phone,
        address: formData.address
      }]);
      if (error) throw error;
      toast.success(`Selamat! ${formData.name} berhasil mendaftar untuk "${activityTitle}".`, {
        description: 'Data pendaftaran telah tersimpan di sistem Josjis.',
        duration: 5000,
      });
      onClose();
      setFormData({ name: '', phone: '', address: '' });
    } catch (error: any) {
      toast.error('Gagal mendaftar: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${p}35`,
    color: 'white',
  } as React.CSSProperties;

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = `1px solid ${p}70`;
    e.target.style.boxShadow = `0 0 20px ${glowL}`;
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = `1px solid ${p}35`;
    e.target.style.boxShadow = 'none';
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
              <div
                className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-10"
                style={{
                  background: `linear-gradient(135deg, #07101e 0%, #0b1628 100%)`,
                  border: `1px solid ${p}30`,
                  boxShadow: `0 0 80px ${glow}25, 0 40px 80px rgba(0,0,0,0.7)`,
                }}
              >
                {/* Decorative blobs */}
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] pointer-events-none"
                  style={{ background: `${p}18` }} />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-[80px] pointer-events-none"
                  style={{ background: `${s}14` }} />

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/50 transition-all"
                  style={{ border: `1px solid ${p}20` }}
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                  <div
                    className="inline-flex p-4 rounded-2xl mb-6"
                    style={{
                      background: `linear-gradient(135deg, ${p}, ${s})`,
                      boxShadow: `0 0 30px ${glow}50`,
                    }}
                  >
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Formulir Pendaftaran</h3>
                  <p className="text-white/50 text-sm">
                    Mendaftar untuk:{' '}
                    <span className="font-semibold" style={{ color: p }}>{activityTitle}</span>
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {[
                    { label: 'Nama Lengkap', icon: User, key: 'name', type: 'text', placeholder: 'Masukkan nama Anda' },
                    { label: 'Nomor Telepon / WhatsApp', icon: Phone, key: 'phone', type: 'tel', placeholder: '0812xxxx' },
                    { label: 'Alamat / No. Rumah', icon: MapPin, key: 'address', type: 'text', placeholder: 'Contoh: Blok A No. 12' },
                  ].map(({ label, icon: Icon, key, type, placeholder }) => (
                    <div key={key} className="space-y-2">
                      <label className="text-sm font-medium ml-1" style={{ color: `${p}cc` }}>{label}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Icon className="w-5 h-5" style={{ color: `${p}80` }} />
                        </div>
                        <input
                          required
                          type={type}
                          placeholder={placeholder}
                          value={(formData as any)[key]}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl text-white placeholder-white/20 focus:outline-none transition-all"
                          style={inputStyle}
                          onFocus={onFocus}
                          onBlur={onBlur}
                        />
                      </div>
                    </div>
                  ))}

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 mt-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${p}, ${s})`,
                      boxShadow: `0 0 30px ${glow}45`,
                    }}
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

                <p className="mt-6 text-center text-xs text-white/30">
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
