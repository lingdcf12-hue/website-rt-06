import { motion } from 'motion/react';
import { Image as ImageIcon, Play, Heart } from 'lucide-react';

export function Gallery() {
  const galleryItems = [
    {
      type: 'image',
      title: 'Gotong Royong Bersih Lingkungan',
      likes: 42,
      gradient: 'from-cyan-500 to-teal-500'
    },
    {
      type: 'image',
      title: 'Lomba 17 Agustus',
      likes: 58,
      gradient: 'from-teal-500 to-emerald-500'
    },
    {
      type: 'video',
      title: 'Rapat RT Bulanan',
      likes: 35,
      gradient: 'from-emerald-500 to-cyan-500'
    },
    {
      type: 'image',
      title: 'Posyandu Balita',
      likes: 48,
      gradient: 'from-cyan-500 to-emerald-500'
    },
    {
      type: 'image',
      title: 'Senam Pagi Warga',
      likes: 63,
      gradient: 'from-teal-500 to-cyan-500'
    },
    {
      type: 'video',
      title: 'Peringatan Hari Besar',
      likes: 71,
      gradient: 'from-emerald-500 to-teal-500'
    }
  ];

  return (
    <section id="gallery" className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-gradient-to-r from-cyan-900/40 to-teal-900/40 backdrop-blur-xl border border-cyan-500/30">
            <ImageIcon className="w-4 h-4 text-cyan-300" />
            <span className="text-cyan-200 text-sm">Galeri Kegiatan</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Gallery</span> Kegiatan Warga
          </h2>
          <p className="text-cyan-200/60 max-w-2xl mx-auto">
            Dokumentasi momen berharga kegiatan RT 6 RW 1 yang telah kami laksanakan
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.03 }}
              className="relative aspect-[4/3] rounded-3xl bg-gradient-to-br from-cyan-900/30 to-teal-900/20 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)] overflow-hidden group cursor-pointer"
            >
              {/* Placeholder gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-30`} />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Play button for videos */}
              {item.type === 'video' && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                >
                  <div className={`p-4 rounded-full bg-gradient-to-r ${item.gradient} shadow-[0_0_30px_rgba(6,182,212,0.6)]`}>
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </motion.div>
              )}

              {/* Image icon for images */}
              {item.type === 'image' && (
                <div className="absolute top-4 right-4 p-2 rounded-full bg-white/10 backdrop-blur-xl border border-cyan-500/30">
                  <ImageIcon className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Info section */}
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-white font-bold mb-2">{item.title}</h3>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-teal-400 fill-teal-400" />
                  <span className="text-cyan-200 text-sm">{item.likes} likes</span>
                </div>
              </div>

              {/* Glow effect */}
              <div className={`absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-30 blur-3xl transition-opacity`} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(6,182,212,0.6)' }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white font-medium shadow-[0_0_30px_rgba(6,182,212,0.4)]"
          >
            Lihat Semua Gallery
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
