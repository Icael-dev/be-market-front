import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchCategories, fetchFeaturedProducts } from '../services/products';
import type { Product, Category } from '../types';
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
  Headset
} from 'lucide-react';

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [products, categories] = await Promise.all([
          fetchFeaturedProducts(8),
          fetchCategories()
        ]);

        setFeaturedProducts(products);
        setCategories(categories);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    telephones: Smartphone,
    ordinateurs: Laptop,
    chargeurs: Battery,
    ecouteurs: Headphones,
    'casques-audio': Headphones,
    enceintes: Speaker,
    'montres-connectees': Watch
  };

  const features = [
    {
      icon: Truck,
      title: 'Livraison Rapide',
      description: 'Dans tout le Togo sous 24-48h'
    },
    {
      icon: Shield,
      title: 'Paiement Securise',
      description: 'Tmoney, Flooz et livraison'
    },
    {
      icon: CreditCard,
      title: 'Meilleurs Prix',
      description: 'Qualite et prix competitives'
    },
    {
      icon: Headset,
      title: 'Support 24/7',
      description: 'Assistance a votre ecoute'
    }
  ];

  return (
    <div className="min-h-screen">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BannerSlider />
      </section>

      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white"
            >
              <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-4">
                Les meilleurs accessoires electroniques
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Decouvrez la technologie de demain
              </h1>
              <p className="text-blue-100 text-lg md:text-xl mb-8 max-w-lg">
                Smartphones, ordinateurs, ecouteurs, montres connectees... Tous vos accessoires preferees au meilleurs prix au Togo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Voir les produits
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/products?category=telephones"
                  className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                >
                  Smartphones
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-white/10 rounded-3xl blur-2xl" />
                <img
                  src="https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Smartphone"
                  className="relative rounded-3xl shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Categories</h2>
              <p className="text-gray-500 mt-1">Explorez par categorie</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {categories.map((category, index) => {
              const Icon = categoryIcons[category.slug] || Smartphone;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/products?category=${category.slug}`}
                    className="group flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-medium text-gray-900 text-center text-sm">
                      {category.name}
                    </h3>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Produits en vedette</h2>
              <p className="text-gray-500 mt-1">Nos meilleurs selections</p>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              Voir tout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <ProductsGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-blue-600 font-medium"
            >
              Voir tous les produits
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <FlashSaleSection />

      <section className="py-16 bg-gradient-to-br from-blue-600 to-cyan-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-white"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Garantie qualite et satisfaction
              </h2>
              <p className="text-blue-100 text-lg mb-6">
                Tous nos produits sont soigneusement selectionnes et verifies pour vous garantir la meilleure qualite.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-sm">1</span>
                  </div>
                  <span>Garantie 1 an sur tous les produits</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-sm">2</span>
                  </div>
                  <span>Retour gratuit sous 7 jours</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-sm">3</span>
                  </div>
                  <span>Support technique dedie</span>
                </li>
              </ul>
            </motion.div>

            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-3xl blur-2xl" />
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Offre speciale</h3>
                  <p className="text-gray-500">Reduction exclusive pour les nouveaux clients</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">-15%</div>
                  <p className="text-gray-600">Sur votre premiere commande</p>
                </div>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Utilisez le code: <span className="font-mono font-bold text-blue-600">WELCOME15</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Ce que disent nos clients</h2>
            <p className="text-gray-500 mt-2">Des milliers de clients satisfaits au Togo</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                full_name: 'Kossi Mensah',
                role: 'Entrepreneur',
                comment: 'Service exceptionnel! J\'ai achete un MacBook et la livraison a ete rapide. Le produit etait exactement comme decrit.',
                rating: 5
              },
              {
                full_name: 'Ami Togo',
                role: 'Designer',
                comment: 'J\'adore faire mes achats ici. Les prix sont competitifs et le support client est tres reactif.',
                rating: 5
              },
              {
                full_name: 'Yao Kudjo',
                role: 'Developpeur',
                comment: 'Excellente qualite de produits. Mon AirPods Pro fonctionne parfaitement depuis 6 mois.',
                rating: 5
              }
            ].map((review, index) => (
              <motion.div
                key={review.full_name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{review.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-medium">
                    {review.full_name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{review.full_name}</p>
                    <p className="text-sm text-gray-500">{review.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Restez informe</h3>
              <p className="text-gray-500">Recevez nos offres exclusives par email</p>
            </div>
            <form className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 md:w-80 px-6 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                S'inscrire
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
