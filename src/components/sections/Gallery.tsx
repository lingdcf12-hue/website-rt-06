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
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [tiktokThumbnails, setTiktokThumbnails] = useState<Record<string, string>>({});
  
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

  const handleImageError = (key: string) => {
    setImageErrors(prev => ({ ...prev, [key]: true }));
  };

  const parseGalleryUrl = (url: string) => {
    if (!url) return { mediaUrl: '', thumbnailUrl: '' };
    if (url.includes('||thumb||')) {
      const parts = url.split('||thumb||');
      return { mediaUrl: parts[0], thumbnailUrl: parts[1] };
    }
    return { mediaUrl: url, thumbnailUrl: '' };
  };

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

  const getGoogleDriveThumbnail = (url: string) => {
    if (!url) return null;
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w600`;
    }
    return null;
  };

  const getGoogleDriveImageUrl = (url: string) => {
    if (!url) return '';
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1600`;
    }
    return url;
  };

  const getInstagramThumbnail = (url: string) => {
    if (!url) return null;
    const match = url.match(/\/(p|reel|tv)\/([a-zA-Z0-9-_]+)/);
    if (match && match[2]) {
      return `https://www.instagram.com/p/${match[2]}/media/?size=l`;
    }
    return null;
  };

  const fetchTiktokThumbnail = async (id: string, url: string) => {
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://www.tiktok.com/oembed?url=' + url)}`);
      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.contents);
        if (parsed.thumbnail_url) {
          setTiktokThumbnails(prev => ({ ...prev, [id]: parsed.thumbnail_url }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch TikTok thumbnail:', err);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const { mediaUrl } = parseGalleryUrl(url);
    
    if (isYouTube(mediaUrl)) {
      let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      let match = mediaUrl.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
      }
      if (mediaUrl.includes('/shorts/')) {
        const shortsId = mediaUrl.split('/shorts/')[1]?.split('?')[0];
        if (shortsId) {
          return `https://www.youtube.com/embed/${shortsId}?autoplay=1`;
        }
      }
    }
    
    if (isGoogleDrive(mediaUrl)) {
      const fileIdMatch = mediaUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
      }
    }
    
    if (isTikTok(mediaUrl)) {
      const match = mediaUrl.match(/\/video\/([0-9]+)/);
      if (match && match[1]) {
        return `https://www.tiktok.com/embed/v2/${match[1]}`;
      }
    }
    
    if (isInstagram(mediaUrl)) {
      let cleanedUrl = mediaUrl.split('?')[0];
      if (cleanedUrl.endsWith('/')) {
        cleanedUrl = cleanedUrl.slice(0, -1);
      }
      return `${cleanedUrl}/embed`;
    }
    
    if (isFacebook(mediaUrl)) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(mediaUrl)}&show_text=0`;
    }
    
    return mediaUrl;
  };

  const totalPages = Math.ceil(galleryItems.length / ITEMS_PER_PAGE);
  const currentItems = galleryItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    currentItems.forEach((item, idx) => {
      const id = item.id || `temp-${idx}`;
      if (item.url && isTikTok(item.url) && !tiktokThumbnails[id] && !imageErrors[id]) {
        fetchTiktokThumbnail(id, item.url);
      }
    });
  }, [galleryItems, currentPage]);

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
                    {item.url ? (() => {
                      const { mediaUrl, thumbnailUrl } = parseGalleryUrl(item.url);
                      
                      // Prioritize custom thumbnail if present and hasn't failed to load
                      if (thumbnailUrl && !imageErrors[item.id || index]) {
                        return (
                          <img
                            src={thumbnailUrl}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                            onError={() => handleImageError(item.id || index)}
                          />
                        );
                      }

                      if (isYouTube(mediaUrl)) {
                        return (
                          <img
                            src={getYouTubeThumbnail(mediaUrl) || ''}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                        );
                      } else if (isGoogleDrive(mediaUrl)) {
                        return (!imageErrors[item.id || index] && getGoogleDriveThumbnail(mediaUrl)) ? (
                          <img
                            src={getGoogleDriveThumbnail(mediaUrl) || ''}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                            onError={() => handleImageError(item.id || index)}
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#02150a] to-[#040806] p-4 text-center overflow-hidden">
                            <div className="absolute inset-0 bg-[#0f9d58]/5 rounded-full blur-3xl animate-pulse" />
                            <div className="relative w-16 h-16 mb-4 flex items-center justify-center bg-[#0f9d58]/10 backdrop-blur-md rounded-2xl border border-[#0f9d58]/30 shadow-[0_0_20px_rgba(15,157,88,0.2)] group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-9 h-9 text-[#0f9d58]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46.18 14.25 0 14 0h-4c-.25 0-.46.18-.5.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
                              </svg>
                            </div>
                            <span className="text-white font-extrabold text-sm tracking-wide z-10">GOOGLE DRIVE</span>
                            <span className="text-[#0f9d58] text-xs mt-1 font-semibold tracking-wider animate-pulse z-10">KLIK UNTUK MEMUTAR</span>
                          </div>
                        );
                      } else if (isTikTok(mediaUrl)) {
                        return (!imageErrors[item.id || index] && tiktokThumbnails[item.id || index]) ? (
                          <img
                            src={tiktokThumbnails[item.id || index]}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                            onError={() => handleImageError(item.id || index)}
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#010101] via-[#051c24] to-[#1a0510] p-4 text-center overflow-hidden">
                            <div className="absolute top-1/4 -left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl animate-pulse" />
                            <div className="absolute bottom-1/4 -right-10 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
                            
                            <div className="relative w-16 h-16 mb-4 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(244,63,94,0.15)] group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-9 h-9 text-white filter drop-shadow-[2px_0_0_#00f2fe] drop-shadow-[-2px_0_0_#fe0979]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.51-.71-.53-1.3-1.22-1.74-2v7.92c0 2.02-.6 4.12-2.02 5.56-1.5 1.56-3.83 2.25-5.96 1.88-2.1-.34-4.01-1.78-4.89-3.73-.97-2.11-.75-4.75.61-6.65 1.34-1.9 3.73-2.92 6.06-2.58v4.13c-1.24-.26-2.61.12-3.46 1.07-.81.89-1.01 2.27-.47 3.39.52 1.09 1.75 1.83 2.95 1.71 1.2-.08 2.24-1.02 2.45-2.21.07-.46.06-.93.06-1.39V.02z"/>
                              </svg>
                            </div>
                            <span className="text-white font-extrabold text-sm tracking-wide z-10">VIDEO TIKTOK</span>
                            <span className="text-cyan-400 text-xs mt-1 font-semibold tracking-wider animate-pulse z-10">KLIK UNTUK MEMUTAR</span>
                          </div>
                        );
                      } else if (isInstagram(mediaUrl)) {
                        return (!imageErrors[item.id || index] && getInstagramThumbnail(mediaUrl)) ? (
                          <img
                            src={getInstagramThumbnail(mediaUrl) || ''}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                            onError={() => handleImageError(item.id || index)}
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-4 text-center overflow-hidden">
                            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
                            <div className="relative w-16 h-16 mb-4 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                              </svg>
                            </div>
                            <span className="text-white font-extrabold text-sm tracking-wide z-10">INSTAGRAM REEL</span>
                            <span className="text-white/90 text-xs mt-1 font-semibold tracking-wider animate-pulse z-10">KLIK UNTUK MELIHAT</span>
                          </div>
                        );
                      } else if (isFacebook(mediaUrl)) {
                        return (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0e1e38] to-[#0a1120] p-4 text-center overflow-hidden border-t border-blue-500/20">
                            <div className="absolute inset-0 bg-[#1877f2]/5 rounded-full blur-3xl animate-pulse" />
                            <div className="relative w-16 h-16 mb-4 flex items-center justify-center bg-[#1877f2]/10 backdrop-blur-md rounded-2xl border border-[#1877f2]/30 shadow-[0_0_20px_rgba(24,119,242,0.2)] group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-9 h-9 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                            </div>
                            <span className="text-white font-extrabold text-sm tracking-wide z-10">FACEBOOK VIDEO</span>
                            <span className="text-blue-400 text-xs mt-1 font-semibold tracking-wider animate-pulse z-10">KLIK UNTUK MEMUTAR</span>
                          </div>
                        );
                      }
                      
                      // Default / direct media URL image or video
                      if (item.type === 'video') {
                        return (
                          <video
                            src={mediaUrl}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            muted
                            loop
                            playsInline
                            onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                            onMouseLeave={(e) => e.currentTarget.pause()}
                          />
                        );
                      }

                      return (
                        <img
                          src={mediaUrl}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                          onError={() => handleImageError(item.id || index)}
                        />
                      );
                    })() : (
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
            {/* Viewport Fixed Close Button - Immune to overlap and 100% clickproof */}
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setSelectedItem(null)}
              className="fixed top-6 right-6 md:top-8 md:right-8 p-3 rounded-full bg-black/60 backdrop-blur-md border border-cyan-500/30 text-white hover:bg-red-500 hover:text-red-400 transition-all z-[120] shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              title="Tutup (Esc)"
            >
              <X className="w-6 h-6" />
            </motion.button>

            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`relative ${
                (isTikTok(selectedItem.url) || isInstagram(selectedItem.url) || selectedItem.url?.includes('/shorts/')) 
                  ? 'max-w-[390px] w-full' 
                  : selectedItem.type === 'image'
                  ? 'max-w-full sm:max-w-[90vw] md:max-w-2xl lg:max-w-3xl w-auto min-w-[300px] sm:min-w-[450px]'
                  : 'max-w-4xl w-full'
              } max-h-[90vh] flex flex-col bg-gradient-to-br from-[#000d14] to-[#001a24] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.3)] mx-auto`}
              onClick={e => e.stopPropagation()}
            >
              {/* Media Display Container */}
              <div className={`relative ${
                (isTikTok(selectedItem.url) || isInstagram(selectedItem.url) || selectedItem.url?.includes('/shorts/')) 
                  ? 'aspect-[9/16] max-h-[55vh] md:max-h-[62vh] w-full' 
                  : selectedItem.type === 'image'
                  ? 'max-h-[70vh] w-auto flex items-center justify-center bg-black/40'
                  : 'aspect-video w-full'
              } bg-black flex items-center justify-center overflow-hidden`}>
                {selectedItem.url ? (
                  ((isYouTube(selectedItem.url) || isTikTok(selectedItem.url) || isInstagram(selectedItem.url) || isFacebook(selectedItem.url) || isGoogleDrive(selectedItem.url)) && selectedItem.type !== 'image') ? (
                    <iframe
                      src={getEmbedUrl(selectedItem.url)}
                      title={selectedItem.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : selectedItem.type === 'video' ? (
                    isGoogleDrive(selectedItem.url) ? (
                      <iframe
                        src={getEmbedUrl(selectedItem.url)}
                        title={selectedItem.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={selectedItem.url}
                        className="w-full h-full object-contain"
                        controls
                        autoPlay
                      />
                    )
                  ) : (
                    <img
                      src={isGoogleDrive(selectedItem.url) ? getGoogleDriveImageUrl(selectedItem.url) : selectedItem.url}
                      alt={selectedItem.title}
                      className="max-h-[70vh] w-auto object-contain"
                    />
                  )
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${selectedItem.gradient} flex items-center justify-center opacity-70`}>
                    <span className="text-white font-bold text-xl">{selectedItem.title}</span>
                  </div>
                )}
              </div>

              {/* Info Bar */}
              <div className="p-5 border-t border-cyan-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-b from-transparent to-[#00080d]/60">
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-lg mb-1 truncate">{selectedItem.title}</h3>
                  <span className="text-cyan-300/60 text-xs uppercase font-semibold tracking-wider">
                    {isYouTube(selectedItem.url) ? 'Video YouTube' : isTikTok(selectedItem.url) ? 'Video TikTok' : isInstagram(selectedItem.url) ? 'Instagram Post' : isFacebook(selectedItem.url) ? 'Video Facebook' : selectedItem.type === 'video' ? 'Video' : 'Foto'}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const idx = galleryItems.findIndex(g => g.id === selectedItem.id || g.title === selectedItem.title);
                      if (idx !== -1) {
                        handleLike(selectedItem.id, selectedItem.likes, idx);
                        setSelectedItem({ ...selectedItem, likes: selectedItem.likes + 1 });
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-900/40 to-teal-900/40 border border-cyan-500/30 hover:border-red-500/30 hover:bg-red-500/10 text-cyan-200 hover:text-red-400 transition-all font-semibold text-sm"
                  >
                    <Heart className="w-4 h-4 text-teal-400 fill-teal-400" />
                    <span>{selectedItem.likes} Likes</span>
                  </button>

                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 text-white transition-all font-semibold text-sm"
                  >
                    Tutup
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
