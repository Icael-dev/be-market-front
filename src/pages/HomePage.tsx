import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchCategories, fetchFeaturedProducts } from '../services/products';
 import { fetchTestimonials } from '../services/content';
 import type { Product, Category, Testimonial } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductsGridSkeleton } from '../components/LoadingSpinner';
import { BannerSlider } from '../components/BannerSlider';
import { FlashSaleSection } from '../components/FlashSaleSection';

import {
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Speaker,
  Battery,
  ArrowRight,
  Truck,
  Shield,
  CreditCard,
  Headset,
  Zap,
  Globe,
  Monitor,
  Camera,
  Gamepad2,
  Tablet,
  Wifi,
  HardDrive,
  Keyboard,
} from 'lucide-react';

import image3 from '../assets/images/image3.jpg';
import image4 from '../assets/images/image4.jpg';
import image1 from '../assets/images/image1.jpg';
import image2 from '../assets/images/image2.jpg';

export function HomePage() {
   const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
   const [categories, setCategories] = useState<Category[]>([]);
   const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
   const [loading, setLoading] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const posRef = useRef(0);
  const pausedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const didDragRef = useRef(false);
  const startPosRef = useRef(0);
  const startOffsetRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

useEffect(() => {
     async function fetchData() {
       try {
         const [products, categories, testimonials] = await Promise.all([
           fetchFeaturedProducts(8),
           fetchCategories(),
           fetchTestimonials()
         ]);

         setFeaturedProducts(products);
         setCategories(categories);
         setTestimonials(testimonials);
       } catch (error) {
         console.error('Error fetching data:', error);
       } finally {
         setLoading(false);
       }
     }

      fetchData();
    }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || categories.length === 0) return;

    const speed = 0.6;

    const animate = () => {
      if (!pausedRef.current) {
        posRef.current -= speed;
        const halfWidth = track.scrollWidth / 2;
        if (Math.abs(posRef.current) >= halfWidth) {
          posRef.current = 0;
        }
        track.style.transform = `translateX(${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [categories]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    didDragRef.current = false;
    startPosRef.current = e.clientX;
    startOffsetRef.current = posRef.current;
    pausedRef.current = true;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const delta = e.clientX - startPosRef.current;
    if (Math.abs(delta) > 3) didDragRef.current = true;
    posRef.current = startOffsetRef.current + delta;
    const track = trackRef.current;
    if (track) {
      const halfWidth = track.scrollWidth / 2;
      if (posRef.current > 0) posRef.current -= halfWidth;
      if (posRef.current < -halfWidth) posRef.current += halfWidth;
      track.style.transform = `translateX(${posRef.current}px)`;
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    pausedRef.current = false;
    setIsDragging(false);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (didDragRef.current) {
      didDragRef.current = false;
      e.preventDefault();
    }
  };

  const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    telephones: Smartphone,
    'ordinateurs-portables': Laptop,
    'ordinateurs-de-bureau': Monitor,
    'pochettes-coques-telephone': Smartphone,
    'casques-audio': Headphones,
    'airpods-ecouteurs': Headset,
    'baffles-enceintes': Speaker,
    'huffers-power-banks': Battery,
    'montres-connectees': Watch,
    tablettes: Tablet,
    'appareils-photo': Camera,
    gaming: Gamepad2,
    'reseau-wifi': Wifi,
    stockage: HardDrive,
    peripheriques: Keyboard,
    'logiciels-abonnements': Globe,
  };

  const features = [
    {
      icon: Truck,
      title: 'Livraison Rapide',
      description: 'Dans tout le Togo sous 24-48h',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Paiement Securise',
      description: 'Tmoney, Flooz et livraison',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: CreditCard,
      title: 'Meilleurs Prix',
      description: 'Qualite et prix competitives',
      color: 'from-orange-500 to-amber-500'
    },
    {
      icon: Headset,
      title: 'Support 24/7',
      description: 'Assistance a votre ecoute',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Banner with background image */}
      <section className="relative pt-4 md:pt-6 lg:pt-8 pb-6 md:pb-8 lg:pb-10 pl-0 pr-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 -z-10"
          style={{ backgroundImage: `url(${image1})` }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center block"
          style={{ backgroundImage: `url(${image2})` }}
        />
        <BannerSlider />

        {/* Decorative images with subtle float and glow */}
        <div className="absolute left-[5%] top-[22%] w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-36 lg:h-36 xl:w-44 xl:h-44 2xl:w-52 2xl:h-52 z-10 flex items-center justify-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 bg-blue-400/40 rounded-full blur-[3rem]" />
        </div>
        <motion.img
          src={image3}
          alt=""
          className="absolute left-[5%] top-[22%] w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 xl:w-44 xl:h-44 2xl:w-52 2xl:h-52 object-cover opacity-95 z-20"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="absolute right-[5%] bottom-[22%] w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 xl:w-48 xl:h-48 z-10 flex items-center justify-center">
          <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-32 xl:h-32 bg-cyan-400/40 rounded-full blur-[3rem]" />
        </div>
        <motion.img
          src={image4}
          alt=""
          className="absolute right-[5%] bottom-[22%] w-20 h-20 sm:w-24 sm:h-24 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-48 xl:h-48 object-cover opacity-95 z-20"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </section>

      {/* Features Bar */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
              >
                <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm md:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold mb-4">
              Explorer
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Categories populaires
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Trouvez exactement ce que vous cherchez parmi nos categories soigneusement selectionnees
            </p>
          </motion.div>

          <div className="relative">
            <div className="overflow-hidden">
              <div
                ref={trackRef}
                onMouseEnter={() => { if (!isDraggingRef.current) pausedRef.current = true; }}
                onMouseLeave={() => { if (!isDraggingRef.current) pausedRef.current = false; }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={`flex gap-4 md:gap-5 will-change-transform select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{ display: 'flex', width: 'max-content', touchAction: 'none' }}
              >
                {[...categories, ...categories].map((category, index) => {
                  const Icon = categoryIcons[category.slug] || Smartphone;
                  return (
                    <Link
                      key={`${category.id}-${index}`}
                      to={`/products?category=${category.slug}`}
                      onClick={handleLinkClick}
                      className="group flex-shrink-0 w-32 sm:w-40 md:w-44 flex flex-col items-center p-3 sm:p-4 md:p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl transition-all duration-300 no-underline"
                    >
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-center text-sm">
                        {category.name}
                      </h3>
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-50 dark:from-gray-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-50 dark:from-gray-950 to-transparent z-10 pointer-events-none" />
          </div>

          <div className="text-center mt-10">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:gap-3 transition-all"
            >
              Voir toutes les categories
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 md:mb-12"
          >
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-sm font-semibold mb-4">
                <Zap className="w-4 h-4" />
                Selection
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Produits en vedette
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-lg">
                Les meilleurs produits selectionnes par notre equipe pour leur qualite exceptionnelle
              </p>
            </div>
            <Link
              to="/products"
              className="hidden sm:inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
            >
              Voir tout
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {loading ? (
            <ProductsGridSkeleton count={8} />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {featuredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
              <div className="mt-10 text-center sm:hidden">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold"
                >
                  Voir tous les produits
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <FlashSaleSection />

      {/* Quality Guarantee */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-white"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                Notre engagement
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Garantie qualite et satisfaction
              </h2>
              <p className="text-blue-100 text-lg md:text-xl mb-8 max-w-lg">
                Tous nos produits sont soigneusement selectionnes et verifies pour vous garantir la meilleure qualite.
              </p>

              <div className="space-y-5">
                {[
                  { num: '01', text: 'Garantie 1 an sur tous les produits' },
                  { num: '02', text: 'Retour gratuit sous 7 jours' },
                  { num: '03', text: 'Support technique dedie' }
                ].map((item) => (
                  <motion.div
                    key={item.num}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-sm font-bold border border-white/20">
                      {item.num}
                    </div>
                    <span className="text-lg font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-white/10 rounded-3xl blur-2xl" />
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-10 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Offre speciale</h3>
                  <p className="text-gray-500 dark:text-gray-400">Reduction exclusive pour les nouveaux clients</p>
                </div>

                <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-8 text-center mb-6 overflow-hidden">
                  <div className="absolute top-3 right-3 text-xs text-blue-400 font-medium">LIMITEE</div>
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 mb-2">
                    -15%
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">Sur votre premiere commande</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Utilisez le code promo</p>
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white rounded-xl">
                    <span className="font-mono font-bold text-white dark:text-gray-900 text-lg tracking-wider">
                      WELCOME15
                    </span>
                    <Globe className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-sm font-semibold mb-4">
              Temoignages
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Ce que disent nos clients
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Rejoignez des milliers de clients satisfaits qui nous font confiance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-800 transition-all duration-300"
              >
                <div className="absolute top-6 right-8 text-6xl text-blue-100 dark:text-blue-900/30 font-serif leading-none">
                  &ldquo;
                </div>

                <div className="flex items-center gap-1 mb-5">
                  {[...Array(review.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed relative z-10">
                  {review.comment}
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {review.full_name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{review.full_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{review.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="relative py-16 md:py-20 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 dark:bg-blue-800/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-200/30 dark:bg-cyan-800/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Restez informe
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
              Recevez nos offres exclusives et les dernieres nouveautes directement dans votre boite mail
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-6 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-sm"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 whitespace-nowrap"
              >
                S'inscrire
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
