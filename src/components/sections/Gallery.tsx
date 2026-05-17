import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Play, Heart, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const DEFAULT_GALLERY = [
  {
    type: 'image',
    title: 'Gotong Royong Bersih Lingkungan',
    likes: 42,
    gradient: 'from-cyan-500 to-teal-500',
    url: ''
  },
  {
    type: 'image',
    title: 'Lomba 17 Agustus',
    likes: 58,
    gradient: 'from-teal-500 to-emerald-500',
    url: ''
  },
  {
    type: 'video',
    title: 'Rapat RT Bulanan',
    likes: 35,
    gradient: 'from-emerald-500 to-cyan-500',
    url: ''
  },
  {
    type: 'image',
    title: 'Posyandu Balita',
    likes: 48,
    gradient: 'from-cyan-500 to-emerald-500',
    url: ''
  },
  {
    type: 'image',
    title: 'Senam Pagi Warga',
    likes: 63,
    gradient: 'from-teal-500 to-cyan-500',
    url: ''
  },
  {
    type: 'video',
    title: 'Peringatan Hari Besar',
    likes: 71,
    gradient: 'from-emerald-500 to-teal-500',
    url: ''
  },
  {
    type: 'image',
    title: 'Pos Ronda Malam Warga',
    likes: 52,
    gradient: 'from-cyan-500 to-teal-500',
    url: ''
  },
  {
    type: 'image',
    title: 'Kerja Bakti Saluran Air',
    likes: 45,
    gradient: 'from-teal-500 to-emerald-500',
    url: ''
  }
];

export function Gallery() {
  const [currentPage, setCurrentPage] = useState(1);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setGalleryItems(data);
      } else {
        setGalleryItems(DEFAULT_GALLERY);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setGalleryItems(DEFAULT_GALLERY);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (id: string | undefined, currentLikes: number, index: number) => {
    const newLikes = currentLikes + 1;
    
    // Update local state optimistically
    const updated = [...galleryItems];
    const actualIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
    if (updated[actualIndex]) {
      updated[actualIndex] = { ...updated[actualIndex], likes: newLikes };
      setGalleryItems(updated);
    }

    if (id) {
      try {
        await supabase.from('gallery').update({ likes: newLikes }).eq('id', id);
      } catch (err) {
        console.error('Failed to update likes in DB:', err);
      }
    }
  };

  const isYouTube = (url: string) => url && (url.includes('youtube.com') || url.includes('youtu.be'));
  const isGoogleDrive = (url: string) => url && url.includes('drive.google.com');
  const isTikTok = (url: string) => url && url.includes('tiktok.com');
  const isInstagram = (url: string) => url && url.includes('instagram.com');
  const isFacebook = (url: string) => url && url.includes('facebook.com');

  const getYouTubeThumbnail = (url: string) => {
    if (!url) return null;
    let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    let match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
    }
    if (url.includes('/shorts/')) {
      const shortsId = url.split('/shorts/')[1]?.split('?')[0];
      if (shortsId) {
        return `https://img.youtube.com/vi/${shortsId}/hqdefault.jpg`;
      }
    }
    return null;
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    if (isYouTube(url)) {
      let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      let match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
      }
      if (url.includes('/shorts/')) {
        const shortsId = url.split('/shorts/')[1]?.split('?')[0];
        if (shortsId) {
          return `https://www.youtube.com/embed/${shortsId}?autoplay=1`;
        }
      }
    }
    
    if (isGoogleDrive(url)) {
      const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
      }
    }
    
    if (isTikTok(url)) {
      const match = url.match(/\/video\/([0-9]+)/);
      if (match && match[1]) {
        return `https://www.tiktok.com/embed/v2/${match[1]}`;
      }
    }
    
    if (isInstagram(url)) {
      let cleanedUrl = url.split('?')[0];
      if (cleanedUrl.endsWith('/')) {
        cleanedUrl = cleanedUrl.slice(0, -1);
      }
      return `${cleanedUrl}/embed`;
    }
    
    if (isFacebook(url)) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0`;
    }
    
    return url;
  };

  const totalPages = Math.ceil(galleryItems.length / ITEMS_PER_PAGE);
  const currentItems = galleryItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
            <span className="text-cyan-200 text-sm">Galeri Kegiatan ({galleryItems.length})</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Gallery</span> Kegiatan Warga
          </h2>
          <p className="text-cyan-200/60 max-w-2xl mx-auto">
            Dokumentasi momen berharga kegiatan RT 6 RW 1 yang telah kami laksanakan
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-cyan-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg font-medium">Memuat Galeri...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {currentItems.map((item, index) => (
                  <motion.div
                    key={item.id || index}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -10, scale: 1.03 }}
                    onClick={() => setSelectedItem(item)}
                    className="relative aspect-[4/3] rounded-3xl bg-gradient-to-br from-cyan-900/30 to-teal-900/20 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)] overflow-hidden group cursor-pointer"
                  >
                    {/* Media render (Image or Video) */}
                    {item.url ? (
                      isYouTube(item.url) ? (
                        <img
                          src={getYouTubeThumbnail(item.url) || ''}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : isGoogleDrive(item.url) ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-cyan-950/40 p-4 text-center">
                          <Play className="w-10 h-10 text-cyan-400 mb-2 animate-pulse" />
                          <span className="text-cyan-200 text-xs font-semibold">Video Google Drive</span>
                        </div>
                      ) : isTikTok(item.url) ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#010101] via-[#0b0e14] to-[#121212] p-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                            <Play className="w-5 h-5 text-cyan-400 fill-cyan-400" />
                          </div>
                          <span className="text-white font-bold text-sm">Video TikTok</span>
                          <span className="text-cyan-300/60 text-xs mt-1">Klik untuk memutar</span>
                        </div>
                      ) : isInstagram(item.url) ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] opacity-80 p-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 mb-3 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            <Play className="w-5 h-5 text-white fill-white" />
                          </div>
                          <span className="text-white font-bold text-sm">Postingan Instagram</span>
                          <span className="text-white/80 text-xs mt-1">Klik untuk melihat</span>
                        </div>
                      ) : isFacebook(item.url) ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1877f2]/20 to-[#1877f2]/40 p-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-[#1877f2]/10 flex items-center justify-center border border-[#1877f2]/30 mb-3 shadow-[0_0_15px_rgba(24,119,242,0.3)]">
                            <Play className="w-5 h-5 text-[#1877f2] fill-[#1877f2]" />
                          </div>
                          <span className="text-white font-bold text-sm">Video Facebook</span>
                          <span className="text-cyan-300/60 text-xs mt-1">Klik untuk memutar</span>
                        </div>
                      ) : item.type === 'video' ? (
                        <video
                          src={item.url}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          muted
                          loop
                          playsInline
                          onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                          onMouseLeave={(e) => e.currentTarget.pause()}
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      )
                    ) : (
                      /* Fallback Gradient */
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-30`} />
                    )}

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 group-hover:via-black/50 transition-all duration-300" />

                    {/* Play icon badge for videos (Top-left) */}
                    {(item.type === 'video' || isYouTube(item.url) || isGoogleDrive(item.url) || isTikTok(item.url) || isInstagram(item.url) || isFacebook(item.url)) && (
                      <div className="absolute top-4 left-4 p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-cyan-500/30 z-20">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    )}

                    {/* Image icon badge for images (Top-right) */}
                    {item.type === 'image' && !isYouTube(item.url) && !isInstagram(item.url) && (
                      <div className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-cyan-500/30 z-20">
                        <ImageIcon className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Hover instructions for video */}
                    {item.type === 'video' && item.url && !isYouTube(item.url) && !isGoogleDrive(item.url) && !isTikTok(item.url) && !isInstagram(item.url) && !isFacebook(item.url) && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300 z-10">
                        <span className="px-3 py-1.5 rounded-full bg-cyan-950/80 backdrop-blur-sm border border-cyan-500/30 text-xs text-cyan-300 font-medium">
                          Arahkan kursor untuk memutar video
                        </span>
                      </div>
                    )}

                    {(isYouTube(item.url) || isGoogleDrive(item.url) || isTikTok(item.url) || isInstagram(item.url) || isFacebook(item.url)) && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <span className="px-3 py-1.5 rounded-full bg-cyan-950/85 backdrop-blur-sm border border-cyan-500/30 text-xs text-cyan-300 font-medium group-hover:scale-105 transition-transform duration-300">
                          Klik untuk putar video
                        </span>
                      </div>
                    )}

                    {/* Info section (Always visible) */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <h3 className="text-white font-bold text-lg mb-2 line-clamp-1 group-hover:text-cyan-200 transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        {/* Like Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(item.id, item.likes, index);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-cyan-200 hover:text-red-400 transition-all"
                        >
                          <Heart className="w-4 h-4 text-teal-400 fill-teal-400 group-hover:text-red-400 group-hover:fill-red-400" />
                          <span className="text-sm font-medium">{item.likes} likes</span>
                        </motion.button>

                        <span className="text-cyan-300/40 text-xs uppercase tracking-wider font-semibold">
                          {(isYouTube(item.url) || isGoogleDrive(item.url) || isTikTok(item.url) || isInstagram(item.url) || isFacebook(item.url)) ? 'Video Medsos' : item.type === 'video' ? 'Video' : 'Foto'}
                        </span>
                      </div>
                    </div>

                    {/* Glow effect on card hover */}
                    <div className={`absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br ${item.gradient || 'from-cyan-500 to-teal-500'} opacity-0 group-hover:opacity-25 blur-3xl transition-opacity pointer-events-none`} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <motion.button
                  whileHover={currentPage > 1 ? { scale: 1.05 } : {}}
                  whileTap={currentPage > 1 ? { scale: 0.95 } : {}}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-3 rounded-xl border border-cyan-500/30 text-cyan-200 transition-all duration-300 ${
                    currentPage === 1
                      ? 'opacity-40 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-900/40 to-teal-900/40 hover:bg-cyan-500/10 hover:text-white shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <motion.button
                    key={page}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(page)}
                    className={`w-11 h-11 rounded-xl font-medium border transition-all duration-300 ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                        : 'bg-gradient-to-r from-cyan-900/40 to-teal-900/40 border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/10 hover:text-white'
                    }`}
                  >
                    {page}
                  </motion.button>
                ))}

                <motion.button
                  whileHover={currentPage < totalPages ? { scale: 1.05 } : {}}
                  whileTap={currentPage < totalPages ? { scale: 0.95 } : {}}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-3 rounded-xl border border-cyan-500/30 text-cyan-200 transition-all duration-300 ${
                    currentPage === totalPages
                      ? 'opacity-40 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-900/40 to-teal-900/40 hover:bg-cyan-500/10 hover:text-white shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── DETAIL MODAL POPUP ── */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-gradient-to-br from-[#000d14] to-[#001a24] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.3)]"
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-cyan-500/30 text-white hover:bg-red-500/20 hover:text-red-400 transition-all z-50 animate-pulse"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Media Display Container */}
              <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                {selectedItem.url ? (
                  (isYouTube(selectedItem.url) || isGoogleDrive(selectedItem.url) || isTikTok(selectedItem.url) || isInstagram(selectedItem.url) || isFacebook(selectedItem.url)) ? (
                    <iframe
                      src={getEmbedUrl(selectedItem.url)}
                      title={selectedItem.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : selectedItem.type === 'video' ? (
                    <video
                      src={selectedItem.url}
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                    />
                  ) : (
                    <img
                      src={selectedItem.url}
                      alt={selectedItem.title}
                      className="w-full h-full object-contain"
                    />
                  )
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${selectedItem.gradient} flex items-center justify-center opacity-70`}>
                    <span className="text-white font-bold text-xl">{selectedItem.title}</span>
                  </div>
                )}
              </div>

              {/* Info Bar */}
              <div className="p-6 border-t border-cyan-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-white font-bold text-xl mb-1">{selectedItem.title}</h3>
                  <span className="text-cyan-300/60 text-sm uppercase font-semibold tracking-wider">
                    {isYouTube(selectedItem.url) ? 'Video YouTube' : isTikTok(selectedItem.url) ? 'Video TikTok' : isInstagram(selectedItem.url) ? 'Instagram Post' : isFacebook(selectedItem.url) ? 'Video Facebook' : selectedItem.type === 'video' ? 'Video' : 'Foto'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const idx = galleryItems.findIndex(g => g.id === selectedItem.id || g.title === selectedItem.title);
                      if (idx !== -1) {
                        handleLike(selectedItem.id, selectedItem.likes, idx);
                        setSelectedItem({ ...selectedItem, likes: selectedItem.likes + 1 });
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-900/40 to-teal-900/40 border border-cyan-500/30 hover:border-red-500/30 hover:bg-red-500/10 text-cyan-200 hover:text-red-400 transition-all font-semibold"
                  >
                    <Heart className="w-5 h-5 text-teal-400 fill-teal-400" />
                    <span>{selectedItem.likes} Likes</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
