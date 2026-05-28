import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Play, Heart, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { useTheme } from '../../lib/ThemeContext';

const DEFAULT_GALLERY = [
  { type: 'image', title: 'Gotong Royong Bersih Lingkungan', likes: 42, gradient: 'from-cyan-500 to-teal-500', url: '' },
  { type: 'image', title: 'Lomba 17 Agustus', likes: 58, gradient: 'from-teal-500 to-emerald-500', url: '' },
  { type: 'video', title: 'Rapat RT Bulanan', likes: 35, gradient: 'from-emerald-500 to-cyan-500', url: '' },
  { type: 'image', title: 'Posyandu Balita', likes: 48, gradient: 'from-cyan-500 to-emerald-500', url: '' },
  { type: 'image', title: 'Senam Pagi Warga', likes: 63, gradient: 'from-teal-500 to-cyan-500', url: '' },
  { type: 'video', title: 'Peringatan Hari Besar', likes: 71, gradient: 'from-emerald-500 to-teal-500', url: '' },
  { type: 'image', title: 'Pos Ronda Malam Warga', likes: 52, gradient: 'from-cyan-500 to-teal-500', url: '' },
  { type: 'image', title: 'Kerja Bakti Saluran Air', likes: 45, gradient: 'from-teal-500 to-emerald-500', url: '' },
];

export function Gallery({ onLoginRequired }: { onLoginRequired?: () => void }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [modalImageError, setModalImageError] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [tiktokThumbnails, setTiktokThumbnails] = useState<Record<string, string>>({});
  const [instagramThumbnails, setInstagramThumbnails] = useState<Record<string, string>>({});

  const ITEMS_PER_PAGE = 6;

  useEffect(() => { fetchGallery(); }, []);

  useEffect(() => {
    if (selectedItem) setModalImageError(false);
  }, [selectedItem]);

  useEffect(() => {
    galleryItems.forEach((item, index) => {
      const { mediaUrl } = parseGalleryUrl(item.url, item.thumbnail_url);
      if (isTikTok(mediaUrl)) {
        const itemId = item.id || `item-${index}`;
        if (!tiktokThumbnails[itemId]) fetchTiktokThumbnail(itemId, mediaUrl);
      }
    });
  }, [galleryItems]);

  const fetchGallery = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setGalleryItems(data && data.length > 0 ? data : DEFAULT_GALLERY);
    } catch {
      setGalleryItems(DEFAULT_GALLERY);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (id: string | undefined, currentLikes: number, index: number) => {
    if (!user) {
      toast.error('Login dulu untuk memberi like!', {
        description: 'Kamu perlu login untuk bisa like.',
        action: { label: 'Login', onClick: () => onLoginRequired?.() }
      });
      return;
    }
    const newLikes = currentLikes + 1;
    const updated = [...galleryItems];
    const actualIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
    if (updated[actualIndex]) {
      updated[actualIndex] = { ...updated[actualIndex], likes: newLikes };
      setGalleryItems(updated);
    }
    if (id) {
      try { await supabase.from('gallery').update({ likes: newLikes }).eq('id', id); } catch {}
    }
  };

  const isYouTube = (url: string) => url && (url.includes('youtube.com') || url.includes('youtu.be'));
  const isGoogleDrive = (url: string) => url && url.includes('drive.google.com');
  const isTikTok = (url: string) => url && url.includes('tiktok.com');
  const isInstagram = (url: string) => url && url.includes('instagram.com');
  const isFacebook = (url: string) => url && url.includes('facebook.com');

  const handleImageError = (key: string) => setImageErrors(prev => ({ ...prev, [key]: true }));

  const parseGalleryUrl = (url: string, dbThumbnailUrl?: string) => {
    if (!url) return { mediaUrl: '', thumbnailUrl: '' };
    if (dbThumbnailUrl) return { mediaUrl: url, thumbnailUrl: dbThumbnailUrl };
    if (url.includes('||thumb||')) {
      const parts = url.split('||thumb||');
      return { mediaUrl: parts[0], thumbnailUrl: parts[1] };
    }
    return { mediaUrl: url, thumbnailUrl: '' };
  };

  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) return match[2];
    if (url.includes('/shorts/')) {
      const shortsId = url.split('/shorts/')[1]?.split('?')[0];
      if (shortsId) return shortsId;
    }
    return null;
  };

  const getGoogleDriveImageUrl = (url: string) => {
    if (!url) return '';
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/) || url.match(/id=([a-zA-Z0-9-_]+)/);
    if (fileIdMatch && fileIdMatch[1]) return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
    return url;
  };

  const getInstagramThumbnail = (url: string) => {
    if (!url) return null;
    const match = url.match(/\/(p|reel|tv)\/([a-zA-Z0-9-_]+)/);
    if (match && match[2]) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(`https://www.instagram.com/p/${match[2]}/media/?size=l`)}`;
    }
    return null;
  };

  const getSuggestedThumbnail = (title: string): string => {
    const t = (title || '').toLowerCase();
    if (t.includes('bakti') || t.includes('gotong') || t.includes('bersih'))
      return 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=800';
    if (t.includes('kegiatan') || t.includes('senam') || t.includes('sehat'))
      return 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800';
    if (t.includes('rapat') || t.includes('musyawarah') || t.includes('rt'))
      return 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800';
    if (t.includes('lomba') || t.includes('tujuh') || t.includes('agustus'))
      return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800';
    return 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800';
  };

  const fetchTiktokThumbnail = async (id: string, url: string) => {
    try {
      const response = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent('https://www.tiktok.com/oembed?url=' + url)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.thumbnail_url) {
          setTiktokThumbnails(prev => ({ ...prev, [id]: `https://images.weserv.nl/?url=${encodeURIComponent(data.thumbnail_url)}` }));
        }
      }
    } catch {}
  };

  const fetchInstagramThumbnail = async (id: string, url: string) => {
    try {
      let cleanUrl = url.split('?')[0];
      if (!cleanUrl.endsWith('/')) cleanUrl += '/';
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(cleanUrl)}`);
      if (response.ok) {
        const data = await response.json();
        const html = data.contents || '';
        const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/) ||
                             html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/);
        if (ogImageMatch && ogImageMatch[1]) {
          setInstagramThumbnails(prev => ({ ...prev, [id]: ogImageMatch[1].replace(/&amp;/g, '&') }));
        }
      }
    } catch {}
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const { mediaUrl } = parseGalleryUrl(url);
    if (isYouTube(mediaUrl)) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = mediaUrl.match(regExp);
      if (match && match[2].length === 11) return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
      if (mediaUrl.includes('/shorts/')) {
        const shortsId = mediaUrl.split('/shorts/')[1]?.split('?')[0];
        if (shortsId) return `https://www.youtube.com/embed/${shortsId}?autoplay=1`;
      }
    }
    if (isGoogleDrive(mediaUrl)) {
      const fileIdMatch = mediaUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (fileIdMatch && fileIdMatch[1]) return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
    if (isTikTok(mediaUrl)) {
      const match = mediaUrl.match(/\/video\/([0-9]+)/);
      if (match && match[1]) return `https://www.tiktok.com/embed/v2/${match[1]}`;
    }
    if (isInstagram(mediaUrl)) {
      let cleanedUrl = mediaUrl.split('?')[0];
      if (cleanedUrl.endsWith('/')) cleanedUrl = cleanedUrl.slice(0, -1);
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
      if (item.url && isTikTok(item.url) && !tiktokThumbnails[id]) fetchTiktokThumbnail(id, item.url);
      if (item.url && isInstagram(item.url) && !instagramThumbnails[id]) fetchInstagramThumbnail(id, item.url);
    });
  }, [galleryItems, currentPage]);

  // ── Helper: render thumbnail inside card media box ──
  const renderCardMedia = (item: any, index: number) => {
    if (!item.url) {
      return <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient || 'from-cyan-500 to-teal-500'} opacity-40`} />;
    }
    const { mediaUrl, thumbnailUrl } = parseGalleryUrl(item.url, item.thumbnail_url);
    const imgClass = 'absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500';

    // Custom thumbnail
    if (thumbnailUrl && !imageErrors[item.id || index]) {
      const src = isGoogleDrive(thumbnailUrl) ? getGoogleDriveImageUrl(thumbnailUrl) : thumbnailUrl;
      return <img src={src} alt={item.title} className={imgClass} loading="lazy" onError={() => handleImageError(item.id || index)} />;
    }

    // YouTube
    if (isYouTube(mediaUrl)) {
      const ytId = getYouTubeVideoId(mediaUrl);
      if (!ytId) return null;
      const src = imageErrors[item.id || `yt-${index}`]
        ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
        : `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      return <img src={src} alt={item.title} className="absolute w-full h-[135%] -top-[17.5%] left-0 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onError={() => handleImageError(item.id || `yt-${index}`)} />;
    }

    // Google Drive
    if (isGoogleDrive(mediaUrl)) {
      const fileIdMatch = mediaUrl.match(/\/d\/([a-zA-Z0-9-_]+)/) || mediaUrl.match(/id=([a-zA-Z0-9-_]+)/);
      const fileId = fileIdMatch?.[1];
      const driveThumbUrl = fileId
        ? (item.type === 'image' ? `https://lh3.googleusercontent.com/d/${fileId}` : `https://lh3.googleusercontent.com/d/${fileId}=w600`)
        : null;
      if (!imageErrors[item.id || index] && driveThumbUrl) {
        return <img src={driveThumbUrl} alt={item.title} className={imgClass} loading="lazy" onError={() => handleImageError(item.id || index)} />;
      }
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#02150a] to-[#040806] gap-1">
          <span className="text-white font-bold text-sm">Google Drive</span>
          <span className="text-[#0f9d58] text-xs">Klik untuk membuka</span>
        </div>
      );
    }

    // TikTok
    if (isTikTok(mediaUrl)) {
      const thumb = tiktokThumbnails[item.id || `item-${index}`] || getSuggestedThumbnail(item.title);
      return <img src={thumb} alt={item.title} className={imgClass} loading="lazy" />;
    }

    // Instagram
    if (isInstagram(mediaUrl)) {
      const thumb = instagramThumbnails[item.id || `ig-${index}`] || getInstagramThumbnail(mediaUrl) || getSuggestedThumbnail(item.title);
      return <img src={thumb} alt={item.title} className={imgClass} loading="lazy" />;
    }

    // Facebook
    if (isFacebook(mediaUrl)) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0e1e38] to-[#0a1120] gap-1">
          <span className="text-white font-bold text-sm">Facebook Video</span>
          <span className="text-blue-400 text-xs">Klik untuk membuka</span>
        </div>
      );
    }

    // Video file langsung
    if (item.type === 'video') {
      return (
        <video
          src={mediaUrl}
          className={imgClass}
          muted loop playsInline
          onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
          onMouseLeave={(e) => e.currentTarget.pause()}
        />
      );
    }

    // Gambar langsung
    return <img src={mediaUrl} alt={item.title} className={imgClass} loading="lazy" onError={() => handleImageError(item.id || index)} />;
  };

  const isVideoItem = (item: any) =>
    item.type === 'video' || isYouTube(item.url) || isTikTok(item.url) || isInstagram(item.url) || isFacebook(item.url);

  return (
    <section id="gallery" className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full backdrop-blur-xl border"
            style={{ background: `${theme.primary}18`, borderColor: `${theme.primary}40` }}>
            <ImageIcon className="w-4 h-4" style={{ color: theme.primary }} />
            <span className="text-sm" style={{ color: theme.primary }}>Galeri Kegiatan ({galleryItems.length})</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}>Gallery</span> Kegiatan Warga
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            Dokumentasi momen berharga kegiatan RT 6 RW 1 yang telah kami laksanakan
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20" style={{ color: theme.primary }}>
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg font-medium">Memuat Galeri...</p>
          </div>
        ) : (
          <>
            {/* ── CARD GRID ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {currentItems.map((item, index) => (
                  <motion.div
                    key={item.id || index}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 40, opacity: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    onClick={() => setSelectedItem(item)}
                    className="relative rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden group cursor-pointer flex flex-col transition-all duration-300"
                    style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 20px 60px ${theme.glowLight}, 0 8px 40px rgba(0,0,0,0.5)`)}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.5)')}
                  >
                    {/* ── MEDIA AREA (dengan margin agar terlihat seperti card) ── */}
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] m-3 bg-black/30">
                      {renderCardMedia(item, index)}

                      {/* Play icon overlay untuk video */}
                      {isVideoItem(item) && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                          <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg">
                            <Play className="w-5 h-5 text-white ml-0.5" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── INFO BAR ── */}
                    <div className="flex items-center justify-between px-5 pb-5 pt-2 gap-3">
                      {/* Judul */}
                      <h3 className="text-white font-bold text-sm truncate flex-1 group-hover:text-white transition-colors">
                        {item.title}
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); handleLike(item.id, item.likes, index); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all shrink-0"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current transition-colors" style={{ color: theme.primary }} />
                        <span className="text-xs font-semibold">{item.likes}</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <motion.button whileHover={currentPage > 1 ? { scale: 1.05 } : {}} whileTap={currentPage > 1 ? { scale: 0.95 } : {}}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}
                  className="p-3 rounded-xl border text-white/70 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ borderColor: `${theme.primary}40`, background: `${theme.primary}10` }}>
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <motion.button key={page} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(page)}
                    className="w-11 h-11 rounded-xl font-medium border transition-all text-white"
                    style={currentPage === page ? {
                      background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                      borderColor: theme.primary, boxShadow: `0 0 20px ${theme.glowLight}`,
                    } : { background: `${theme.primary}10`, borderColor: `${theme.primary}30`, color: 'rgba(255,255,255,0.6)' }}>
                    {page}
                  </motion.button>
                ))}
                <motion.button whileHover={currentPage < totalPages ? { scale: 1.05 } : {}} whileTap={currentPage < totalPages ? { scale: 0.95 } : {}}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}
                  className="p-3 rounded-xl border text-white/70 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ borderColor: `${theme.primary}40`, background: `${theme.primary}10` }}>
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
            className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 pt-24 md:pt-28 pb-10"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`relative ${
                (isTikTok(selectedItem.url) || isInstagram(selectedItem.url) || selectedItem.url?.includes('/shorts/'))
                  ? 'max-w-[390px] w-full'
                  : selectedItem.type === 'image' && !modalImageError
                  ? 'w-fit max-w-[95vw] lg:max-w-6xl min-w-[300px]'
                  : 'max-w-4xl w-full'
              } max-h-[75vh] flex flex-col bg-gradient-to-br from-[#000d14] to-[#001a24] border rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] mx-auto`}
              style={{ borderColor: `${theme.primary}40` }}
              onClick={e => e.stopPropagation()}
            >
              {/* Media Display */}
              <div className={`relative ${
                (isTikTok(selectedItem.url) || isInstagram(selectedItem.url) || selectedItem.url?.includes('/shorts/'))
                  ? 'aspect-[9/16] max-h-[55vh] md:max-h-[62vh] w-full'
                  : selectedItem.type === 'image' && !modalImageError
                  ? 'w-full'
                  : 'aspect-video w-full'
              } bg-black flex items-center justify-center overflow-hidden`}>
                {selectedItem.url ? (
                  (((isYouTube(selectedItem.url) || isTikTok(selectedItem.url) || isInstagram(selectedItem.url) || isFacebook(selectedItem.url) || isGoogleDrive(selectedItem.url)) && selectedItem.type !== 'image') || (isGoogleDrive(selectedItem.url) && modalImageError)) ? (
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
                      <video src={selectedItem.url} className="w-full h-full object-contain" controls autoPlay />
                    )
                  ) : (() => {
                    const { mediaUrl } = parseGalleryUrl(selectedItem.url, selectedItem.thumbnail_url);
                    return (
                      <img
                        src={isGoogleDrive(mediaUrl) ? getGoogleDriveImageUrl(mediaUrl) : mediaUrl}
                        alt={selectedItem.title}
                        className="max-h-[50vh] md:max-h-[55vh] lg:max-h-[60vh] w-auto max-w-full object-contain block"
                        onError={() => setModalImageError(true)}
                      />
                    );
                  })()
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${selectedItem.gradient} flex items-center justify-center opacity-70`}>
                    <span className="text-white font-bold text-xl">{selectedItem.title}</span>
                  </div>
                )}
              </div>

              {/* Info Bar Modal */}
              <div className="p-5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-b from-transparent to-[#00080d]/60"
                style={{ borderTopColor: `${theme.primary}20` }}>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-lg mb-1 truncate">{selectedItem.title}</h3>
                  <span className="text-xs uppercase font-semibold tracking-wider" style={{ color: `${theme.primary}99` }}>
                    {isYouTube(selectedItem.url) ? 'Video YouTube'
                      : isTikTok(selectedItem.url) ? 'Video TikTok'
                      : isInstagram(selectedItem.url) ? 'Instagram Post'
                      : isFacebook(selectedItem.url) ? 'Video Facebook'
                      : selectedItem.type === 'video' ? 'Video' : 'Foto'}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const idx = galleryItems.findIndex(g => g.id === selectedItem.id || g.title === selectedItem.title);
                      if (idx !== -1) { handleLike(selectedItem.id, selectedItem.likes, idx); setSelectedItem({ ...selectedItem, likes: selectedItem.likes + 1 }); }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 text-white transition-all font-semibold text-sm"
                    style={{ background: `${theme.primary}15` }}
                  >
                    <Heart className="w-4 h-4 fill-current" style={{ color: theme.primary }} />
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
