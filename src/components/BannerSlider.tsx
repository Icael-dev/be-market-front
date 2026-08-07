import { useEffect, useState, useCallback } from 'react';
import { logger } from '../lib/logger';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchBanners as fetchBannersService } from '../services/content';
import type { Banner } from '../types';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { getImageUrl } from '../lib/imageUrl';

export function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [banners.length]);

  const loadBanners = async () => {
    try {
      const data = await fetchBannersService();
      const banners = Array.isArray(data) ? data.filter((banner) => banner && banner.id && banner.image_url) : [];
      setBanners(banners);
    } catch (error) {
      logger.error('Failed to load banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goToPrev = useCallback(() => {
    goTo((currentIndex - 1 + banners.length) % banners.length);
  }, [currentIndex, banners.length, goTo]);

  const goToNext = useCallback(() => {
    goTo((currentIndex + 1) % banners.length);
  }, [currentIndex, banners.length, goTo]);

  const handleImageError = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % banners.length);
  }, [banners.length]);

  if (loading) return (
    <div className="w-full h-[32rem] sm:h-[36rem] md:h-[40rem] lg:h-[46rem] rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
  );

  if (banners.length === 0) return null;

  const banner = banners[currentIndex];

  if (!banner) return null;

  return (
    <div
      className="relative w-full h-[32rem] sm:h-[36rem] md:h-[40rem] lg:h-[46rem] overflow-hidden rounded-3xl shadow-premium group"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={banner.id}
          initial={{ x: '100%' }}
          animate={{ x: '0%' }}
          exit={{ x: '-100%' }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <motion.img
            src={getImageUrl(banner.image_url, 'banners')}
            alt={banner.title}
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: 'linear' }}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/85 via-gray-900/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 via-transparent to-transparent" />

          <div className="absolute inset-0 flex items-center pl-12 md:pl-24 lg:pl-32 pr-8 md:pr-16 z-30">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.6, ease: 'easeOut' }}
              className="max-w-xl text-white"
            >
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="inline-flex items-center gap-2 border border-white/30 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium mb-5 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Offre speciale
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.55 }}
                className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight tracking-tight"
              >
                {banner.title}
              </motion.h2>
              {banner.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, duration: 0.55 }}
                  className="text-lg md:text-xl mb-7 text-gray-100/90 font-light"
                >
                  {banner.subtitle}
                </motion.p>
              )}
              {banner.link_url && banner.button_text && (
                <motion.div
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75, duration: 0.55 }}
                >
                  <Link
                    to={banner.link_url}
                    className="group/cta inline-flex items-center gap-2 bg-white text-gray-900 px-7 py-3.5 font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/30"
                  >
                    {banner.button_text}
                    <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover/cta:translate-x-1" />
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <motion.button
            initial={{ opacity: 0, y: '-50%' }}
            animate={{ opacity: 1, y: '-50%' }}
            whileHover={{ scale: 1.12, y: '-50%' }}
            whileTap={{ scale: 0.92, y: '-50%' }}
            onClick={goToPrev}
            aria-label="Bannière précédente"
            style={{ top: '50%' }}
            className="absolute left-5 w-12 h-12 rounded-full bg-white/70 hover:bg-white border border-white/40 backdrop-blur-md flex items-center justify-center shadow-lg shadow-black/10 z-40"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: '-50%' }}
            animate={{ opacity: 1, y: '-50%' }}
            whileHover={{ scale: 1.12, y: '-50%' }}
            whileTap={{ scale: 0.92, y: '-50%' }}
            onClick={goToNext}
            aria-label="Bannière suivante"
            style={{ top: '50%' }}
            className="absolute right-5 w-12 h-12 rounded-full bg-white/70 hover:bg-white border border-white/40 backdrop-blur-md flex items-center justify-center shadow-lg shadow-black/10 z-40"
          >
            <ChevronRight className="w-6 h-6 text-gray-900" />
          </motion.button>

          <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-40">
            {banners.map((_, index) => (
              <button
                key={index}
                aria-label={`Aller à la bannière ${index + 1}`}
                onClick={() => goTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ease-out ${
                  index === currentIndex
                    ? 'w-9 bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
