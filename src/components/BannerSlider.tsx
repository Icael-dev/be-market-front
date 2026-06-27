import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchBanners as fetchBannersService } from '../services/content';
import type { Banner } from '../types';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import image1 from '../assets/images/image1.jpg';

export function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1 && isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners, isAutoPlaying]);

  const loadBanners = async () => {
    try {
      const data = await fetchBannersService();
      setBanners(data);
    } catch (error) {
      console.error('Failed to load banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const goTo = useCallback((index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  const goToPrev = useCallback(() => {
    goTo((currentIndex - 1 + banners.length) % banners.length);
  }, [currentIndex, banners.length, goTo]);

  const goToNext = useCallback(() => {
    goTo((currentIndex + 1) % banners.length);
  }, [currentIndex, banners.length, goTo]);

  if (loading) return (
    <div className="w-full h-72 sm:h-80 md:h-[34rem] lg:h-[40rem] xl:h-[46rem] rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
  );

  if (banners.length === 0) return (
    <div className="w-full h-72 sm:h-80 md:h-[34rem] lg:h-[40rem] xl:h-[46rem] rounded-2xl overflow-hidden relative">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${image1})` }} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center text-white text-center px-8">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full mb-4"
          >
            <Sparkles className="w-4 h-4" />
            Offres exclusives
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            Bienvenue chez Electronica
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 mb-6"
          >
            Decouvrez les meilleurs accessoires electroniques au Togo
          </motion.p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold dark:hover:bg-gray-700 transition-colors">
            Voir les produits
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="relative w-full h-72 sm:h-80 md:h-[34rem] lg:h-[40rem] xl:h-[46rem] overflow-hidden rounded-2xl group"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-blue-700/80 to-cyan-600/80" />

      <AnimatePresence mode="wait">
        <motion.div
          key={banners[currentIndex].id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <div className="relative w-full h-full">
            <img
              src={banners[currentIndex].image_url}
              alt={banners[currentIndex].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
            <div className="absolute inset-0 flex items-center px-8 md:px-16">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="max-w-xl text-white"
              >
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm mb-4"
                >
                  <Sparkles className="w-4 h-4" />
                  Offre speciale
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
                >
                  {banners[currentIndex].title}
                </motion.h2>
                {banners[currentIndex].subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-lg md:text-xl mb-6 text-gray-200"
                  >
                    {banners[currentIndex].subtitle}
                  </motion.p>
                )}
                {banners[currentIndex].link_url && banners[currentIndex].button_text && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Link
                      to={banners[currentIndex].link_url!}
                      className="inline-flex items-center gap-2 bg-white dark:text-white px-6 py-3 rounded-xl font-semibold dark:hover:bg-gray-700 transition-all hover:scale-105 shadow-lg"
                    >
                      {banners[currentIndex].button_text}
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6 dark:text-gray-300" />
          </motion.button>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-6 h-6 dark:text-gray-300" />
          </motion.button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}