import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, Facebook, Instagram, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) {
      return toast.error('Nama dan pesan wajib diisi!');
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('messages').insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message
        }
      ]);

      if (error) throw error;

      toast.success('Pesan berhasil terkirim!', {
        description: 'Terima kasih telah menghubungi kami. Pesan Anda akan segera dibaca oleh admin.'
      });
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Gagal mengirim pesan: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-gradient-to-r from-cyan-900/40 to-teal-900/40 backdrop-blur-xl border border-cyan-500/30">
            <Mail className="w-4 h-4 text-cyan-300" />
            <span className="text-cyan-200 text-sm">Hubungi Kami</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Contact</span> Us
          </h2>
          <p className="text-cyan-200/60 max-w-2xl mx-auto">
            Ada pertanyaan atau saran? Jangan ragu untuk menghubungi kami
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-900/30 to-teal-900/20 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)]">
              <h3 className="text-2xl font-bold text-white mb-6">Informasi Kontak</h3>

              <div className="space-y-4">
                {[
                  { icon: MapPin, label: 'Alamat', value: 'Sawojajar Gg. V, RT 06 RW 01, Kota Malang, Jawa Timur, Indonesia' },
                  { icon: Phone, label: 'Telepon', value: '+62 812 3456 7890' },
                  { icon: Mail, label: 'Email', value: 'info@rtrwdigital.id' },
                  { icon: WhatsAppIcon, label: 'WhatsApp', value: '+62 812 3456 7890' }
                ].map((contact, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 5 }}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                      <contact.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-cyan-300 text-sm mb-1">{contact.label}</div>
                      <div className="text-white font-medium">{contact.value}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social Media */}
              <div className="mt-8">
                <h4 className="text-white font-medium mb-4">Ikuti Kami</h4>
                <div className="flex items-center gap-3">
                  {[
                    { icon: Facebook, gradient: 'from-blue-600 to-blue-700' },
                    { icon: Instagram, gradient: 'from-pink-500 via-red-500 to-yellow-500' },
                    { icon: WhatsAppIcon, gradient: 'from-emerald-500 to-green-600' }
                  ].map((social, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.1, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-3 rounded-xl bg-gradient-to-r ${social.gradient} shadow-[0_0_20px_rgba(6,182,212,0.4)]`}
                    >
                      <social.icon className="w-5 h-5 text-white" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="p-6 rounded-3xl bg-gradient-to-br from-cyan-900/30 to-teal-900/20 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)]"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Kirim Pesan</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-cyan-200 mb-2">Nama Lengkap</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama Anda"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-cyan-500/30 text-white placeholder-cyan-300/50 focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                />
              </div>

              <div>
                <label className="block text-cyan-200 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-cyan-500/30 text-white placeholder-cyan-300/50 focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                />
              </div>

              <div>
                <label className="block text-cyan-200 mb-2">Nomor Telepon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+62 812 3456 7890"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-cyan-500/30 text-white placeholder-cyan-300/50 focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                />
              </div>

              <div>
                <label className="block text-cyan-200 mb-2">Pesan</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tulis pesan Anda di sini..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-cyan-500/30 text-white placeholder-cyan-300/50 focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all resize-none"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(6,182,212,0.6)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white font-medium shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="mt-20 pt-8 border-t border-cyan-500/20 text-center"
      >
        <p className="text-cyan-300/60">
          © 2026 RT 6 RW 1 Josjis. Platform Komunitas Warga RT 6 RW 1 Josjis.
        </p>
        <p className="text-cyan-300/40 text-sm mt-2">
          Dibuat dengan teknologi futuristik untuk kemudahan warga
        </p>
      </motion.div>
    </section>
  );
}
