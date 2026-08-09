import { useEffect, useRef, useState } from "react";
import { logger } from "../lib/logger";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchCategories, fetchFeaturedProducts } from "../services/products";
import { fetchTestimonials, subscribeNewsletter } from "../services/content";
import type { Product, Category, Testimonial } from "../types";
import { ProductCard } from "../components/ProductCard";
import { ProductsGridSkeleton } from "../components/LoadingSpinner";
import { BannerSlider } from "../components/BannerSlider";
import { FlashSaleSection } from "../components/FlashSaleSection";
import { PageTitle } from "../hooks/usePageTitle";

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
  Sparkles,
  ChevronRight,
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
} from "lucide-react";

import image3 from "../assets/images/image3.jpg";
import image4 from "../assets/images/image4.jpg";
import image1 from "../assets/images/image1.jpg";
import image2 from "../assets/images/image2.jpg";

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [newsletterSuccess, setNewsletterSuccess] = useState<string | null>(null);
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
          fetchTestimonials(),
        ]);

        setFeaturedProducts(products);
        setCategories(categories);
        setTestimonials(testimonials);
      } catch (error) {
        logger.error("Error fetching data:", error);
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
    "ordinateurs-portables": Laptop,
    "ordinateurs-de-bureau": Monitor,
    "pochettes-coques-telephone": Smartphone,
    "casques-audio": Headphones,
    "airpods-ecouteurs": Headset,
    "baffles-enceintes": Speaker,
    "huffers-power-banks": Battery,
    "montres-connectees": Watch,
    tablettes: Tablet,
    "appareils-photo": Camera,
    gaming: Gamepad2,
    "reseau-wifi": Wifi,
    stockage: HardDrive,
    peripheriques: Keyboard,
    "logiciels-abonnements": Globe,
  };

  const features = [
    {
      icon: Truck,
      title: "Livraison Rapide",
      description: "Dans tout le Togo sous 24-48h",
      color: "from-primary-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Paiement Securise",
      description: "Tmoney, Flooz et livraison",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: CreditCard,
      title: "Meilleurs Prix",
      description: "Qualite et prix competitives",
      color: "from-orange-500 to-amber-500",
    },
    {
      icon: Headset,
      title: "Support 24/7",
      description: "Assistance a votre ecoute",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <>
      <PageTitle
        title="Accueil"
        description="Bienvenue sur Be Market, votre boutique en ligne de confiance"
      />
      <div className="min-h-screen">
        {/* Hero Banner with background image */}
        <section className="relative min-h-[30rem] overflow-hidden pb-10 pt-4 sm:min-h-[38rem] md:min-h-[46rem] md:pb-14 md:pt-6 lg:min-h-[54rem] lg:pb-20 lg:pt-8">
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${image2})` }}
          />
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${image1})` }}
          />
          <div className="absolute inset-0 z-[5] bg-black/45" />

          {/* Decorative images with subtle float and glow */}
          <div className="absolute left-[5%] top-[22%] z-10 flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-36 lg:w-36 xl:h-44 xl:w-44 2xl:h-52 2xl:w-52">
            <div className="h-12 w-12 rounded-full bg-primary-400/40 blur-[3rem] sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 xl:h-28 xl:w-28" />
          </div>
          <motion.img
            src={image3}
            alt=""
            className="absolute left-[5%] top-[22%] z-20 h-16 w-16 rounded-lg object-cover opacity-95 sm:h-20 sm:w-20 md:h-28 md:w-28 lg:h-36 lg:w-36 xl:h-44 xl:w-44 2xl:h-52 2xl:w-52"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="absolute bottom-[22%] right-[5%] z-10 flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20 md:h-28 md:w-28 lg:h-36 lg:w-36 xl:h-48 xl:w-48">
            <div className="h-10 w-10 rounded-full bg-cyan-400/40 blur-[3rem] sm:h-14 sm:w-14 md:h-20 md:w-20 lg:h-24 lg:w-24 xl:h-32 xl:w-32" />
          </div>
          <motion.img
            src={image4}
            alt=""
            className="absolute bottom-[22%] right-[5%] z-20 h-20 w-20 rounded-lg object-cover opacity-95 sm:h-24 sm:w-24 md:h-36 md:w-36 lg:h-40 lg:w-40 xl:h-48 xl:w-48"
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="absolute inset-0 z-30 flex items-center justify-center">
            <div className="mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 inline-flex items-center gap-2 bg-white/15 px-4 py-2 backdrop-blur-sm"
              >
                <Sparkles className="h-4 w-4 text-white" />
                <span className="text-white">Offres exclusives</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-4 text-3xl font-bold tracking-tightest text-white md:text-5xl"
              >
                Bienvenue chez BE-Market
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6 text-lg text-white/80 md:text-xl"
              >
                Decouvrez les meilleurs accessoires electroniques au Togo
              </motion.p>
              <Link to="/products" className="btn-gold group/cta">
                Voir les produits
                <ChevronRight className="h-5 w-5 transition-transform group-hover/cta:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Bar */}
        <section className="page-bg border-b border-gray-100 dark:border-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
            <div className="grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="card-hover group relative flex flex-col items-center gap-3 rounded-lg p-3 transition-all duration-300 hover:bg-white focus-visible:bg-white active:bg-white dark:hover:bg-gray-900 dark:focus-visible:bg-gray-900 dark:active:bg-gray-900 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                >
                  <div
                    className={`relative h-12 w-12 rounded-lg bg-gradient-to-br sm:h-14 sm:w-14 ${feature.color} flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-focus-visible:scale-110 group-active:scale-110`}
                  >
                    <feature.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xs font-bold text-gray-900 transition-colors group-hover:text-primary-600 group-focus-visible:text-primary-600 group-active:text-primary-600 dark:text-white dark:group-hover:text-primary-400 dark:group-focus-visible:text-primary-400 dark:group-active:text-primary-400 sm:text-sm md:text-base">
                      {feature.title}
                    </h3>
                    <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs md:text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Banners */}
        <section className="page-bg">
          <div className="mx-auto max-w-[100rem] px-4 pt-10 sm:px-6 md:pt-14 lg:px-8">
            <BannerSlider />
          </div>
        </section>

        {/* Categories */}
        <section className="page-bg py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 text-center md:mb-12"
            >
              <span className="mb-4 inline-block rounded-full bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                Explorer
              </span>
              <h2 className="mb-3 text-3xl font-bold tracking-tightest text-gray-900 dark:text-white md:text-4xl">
                Categories populaires
              </h2>
              <p className="mx-auto max-w-2xl text-gray-500 dark:text-gray-400">
                Trouvez exactement ce que vous cherchez parmi nos categories soigneusement
                selectionnees
              </p>
            </motion.div>

            <div className="relative">
              <div className="overflow-hidden">
                <div
                  ref={trackRef}
                  onMouseEnter={() => {
                    if (!isDraggingRef.current) pausedRef.current = true;
                  }}
                  onMouseLeave={() => {
                    if (!isDraggingRef.current) pausedRef.current = false;
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className={`flex select-none gap-4 will-change-transform md:gap-5 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                  style={{ display: "flex", width: "max-content", touchAction: "none" }}
                >
                  {[...categories, ...categories].map((category, index) => {
                    const Icon = categoryIcons[category.slug] || Smartphone;
                    return (
                      <Link
                        key={`${category.id}-${index}`}
                        to={`/products?category=${category.slug}`}
                        onClick={handleLinkClick}
                        className="group flex w-32 flex-shrink-0 flex-col items-center rounded-lg border border-gray-100 bg-white p-3 no-underline transition-all duration-300 hover:border-primary-200 hover:shadow-premium dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-800 sm:w-40 sm:p-4 md:w-44 md:p-5"
                      >
                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary-50 to-cyan-50 text-primary-600 transition-transform group-hover:scale-110 dark:from-primary-900/20 dark:to-cyan-900/20 dark:text-primary-400 sm:mb-3 sm:h-14 sm:w-14 md:h-16 md:w-16">
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                        </div>
                        <h3 className="text-center text-sm font-semibold text-gray-900 dark:text-white">
                          {category.name}
                        </h3>
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-24 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-950" />
              <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-24 bg-gradient-to-l from-gray-50 to-transparent dark:from-gray-950" />
            </div>

            <div className="mt-10 text-center">
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 font-semibold text-primary-600 transition-all hover:gap-3 dark:text-primary-400"
              >
                Voir toutes les categories
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="bg-white py-16 dark:bg-gray-900 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end md:mb-12"
            >
              <div>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-gold-50 px-4 py-1.5 text-sm font-semibold text-gold-600 dark:bg-gold-900/30 dark:text-gold-400">
                  <Zap className="h-4 w-4" />
                  Selection
                </span>
                <h2 className="text-3xl font-bold tracking-tightest text-gray-900 dark:text-white md:text-4xl">
                  Produits en vedette
                </h2>
                <p className="mt-2 max-w-lg text-gray-500 dark:text-gray-400">
                  Les meilleurs produits selectionnes par notre equipe pour leur qualite
                  exceptionnelle
                </p>
              </div>
              <Link to="/products" className="btn-primary hidden items-center gap-2 sm:inline-flex">
                Voir tout
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>

            {loading ? (
              <ProductsGridSkeleton count={8} />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
                  {featuredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
                <div className="mt-10 text-center sm:hidden">
                  <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                    Voir tous les produits
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        <FlashSaleSection />

        {/* Quality Guarantee */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-cyan-600 py-20 md:py-28">
          <div className="absolute inset-0">
            <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="text-white"
              >
                <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                  <Shield className="h-4 w-4" />
                  Notre engagement
                </span>
                <h2 className="mb-6 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                  Garantie qualite et satisfaction
                </h2>
                <p className="mb-8 max-w-lg text-lg text-primary-100 md:text-xl">
                  Tous nos produits sont soigneusement selectionnes et verifies pour vous garantir
                  la meilleure qualite.
                </p>

                <div className="space-y-5">
                  {[
                    { num: "01", text: "Garantie 1 an sur tous les produits" },
                    { num: "02", text: "Retour gratuit sous 7 jours" },
                    { num: "03", text: "Support technique dedie" },
                  ].map((item) => (
                    <motion.div
                      key={item.num}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/15 text-sm font-bold backdrop-blur-sm">
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
                <div className="absolute -inset-4 rounded-lg bg-white/10 blur-2xl" />
                <div className="relative rounded-lg bg-white p-8 shadow-2xl dark:bg-gray-800 md:p-10">
                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                      Offre speciale
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Reduction exclusive pour les nouveaux clients
                    </p>
                  </div>

                  <div className="relative mb-6 overflow-hidden rounded-lg bg-gradient-to-br from-primary-50 to-cyan-50 p-8 text-center dark:from-primary-900/20 dark:to-cyan-900/20">
                    <div className="absolute right-3 top-3 text-xs font-medium text-primary-400">
                      LIMITEE
                    </div>
                    <div className="mb-2 bg-gradient-to-r from-primary-600 to-cyan-600 bg-clip-text text-6xl font-black text-transparent">
                      -15%
                    </div>
                    <p className="font-medium text-gray-600 dark:text-gray-300">
                      Sur votre premiere commande
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      Utilisez le code promo
                    </p>
                    <div className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 dark:bg-white">
                      <span className="font-mono text-lg font-bold tracking-wider text-white dark:text-gray-900">
                        WELCOME15
                      </span>
                      <Globe className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="page-bg py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 text-center md:mb-12"
            >
              <span className="mb-4 inline-block rounded-full bg-purple-50 px-4 py-1.5 text-sm font-semibold text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                Temoignages
              </span>
              <h2 className="mb-3 text-3xl font-bold tracking-tightest text-gray-900 dark:text-white md:text-4xl">
                Ce que disent nos clients
              </h2>
              <p className="mx-auto max-w-2xl text-gray-500 dark:text-gray-400">
                Rejoignez des milliers de clients satisfaits qui nous font confiance
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              {testimonials.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative rounded-lg border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-primary-100 hover:shadow-premium dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-800 md:p-8"
                >
                  <div className="absolute right-8 top-6 font-serif text-6xl leading-none text-primary-100 dark:text-primary-900/30">
                    &ldquo;
                  </div>

                  <div className="mb-5 flex items-center gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-5 w-5 fill-amber-400 text-amber-400"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p className="relative z-10 mb-6 leading-relaxed text-gray-600 dark:text-gray-300">
                    {review.comment}
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="brand-gradient flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white shadow-md">
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
        <section className="relative overflow-hidden border-t border-gray-100 bg-white py-16 dark:border-gray-800 dark:bg-gray-900 md:py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-cyan-50 dark:from-primary-950/30 dark:to-cyan-950/30" />
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary-200/30 blur-3xl dark:bg-primary-800/10" />
          <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl dark:bg-cyan-800/10" />

          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="brand-gradient mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg shadow-lg shadow-primary-500/30">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tightest text-gray-900 dark:text-white md:text-4xl">
                Restez informe
              </h2>
              <p className="mx-auto mb-8 max-w-lg text-gray-500 dark:text-gray-400">
                Recevez nos offres exclusives et les dernieres nouveautes directement dans votre
                boite mail
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newsletterEmail.trim()) return;
                  setNewsletterLoading(true);
                  setNewsletterError(null);
                  setNewsletterSuccess(null);
                  try {
                    await subscribeNewsletter(newsletterEmail.trim());
                    setNewsletterEmail("");
                    setNewsletterSuccess("Inscription reussie !");
                  } catch (err) {
                    setNewsletterError(
                      err instanceof Error ? err.message : "Erreur lors de l'inscription"
                    );
                  } finally {
                    setNewsletterLoading(false);
                  }
                }}
                className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row"
              >
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  className="input-premium flex-1"
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="btn-primary whitespace-nowrap disabled:opacity-50"
                >
                  {newsletterLoading ? "..." : "S'inscrire"}
                </button>
              </form>
              {newsletterError && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">{newsletterError}</p>
              )}
              {newsletterSuccess && (
                <p className="mt-3 text-sm text-green-600 dark:text-green-400">
                  {newsletterSuccess}
                </p>
              )}
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
