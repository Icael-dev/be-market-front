import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchFlashSales as fetchFlashSalesService } from '../services/content';
import type { FlashSale, Product } from '../types';
import { formatPrice, FALLBACK_IMAGE } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { Flame, Clock, Zap, ShoppingCart, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

interface FlashSaleWithProduct extends FlashSale {
  product: Product;
}

function CountdownTimer({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const endTime = new Date(endsAt);
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
      <Clock className="w-3 h-3" />
      <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
      <span>:</span>
      <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
      <span>:</span>
      <span>{timeLeft.seconds.toString().padStart(2, '0')}</span>
    </div>
  );
}

export function FlashSaleSection() {
  const [flashSales, setFlashSales] = useState<FlashSaleWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();

  useEffect(() => {
    loadFlashSales();
  }, []);

  const loadFlashSales = async () => {
    try {
      const data = await fetchFlashSalesService();
      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      const merged = data.map(sale => ({
        ...sale,
        product: sale.product
      })) as FlashSaleWithProduct[];

      setFlashSales(merged);
    } catch (err) {
      console.error('FlashSales fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || flashSales.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 dark:bg-red-700/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-12 h-12 rounded-full bg-gray-100/20 dark:bg-gray-800/20 flex items-center justify-center"
          >
            <Flame className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white">Flash Sales</h2>
            <p className="text-white/80 text-sm">Offres limitees - Ne ratez pas !</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {flashSales.map((sale, index) => {
            const discountedPrice = sale.product.price * (1 - sale.discount_percentage / 100);
            const productWithDiscount = {
              ...sale.product,
              compare_price: sale.product.price,
              price: discountedPrice
            };

            return (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
                  className="absolute top-3 left-3 z-10 bg-red-500 dark:bg-gray-800 dark:text-red-400 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg"
                >
                  <Zap className="w-3 h-3" />
                  -{sale.discount_percentage}%
                </motion.div>

                <div className="absolute top-3 right-3 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-2 py-1">
                  <CountdownTimer endsAt={sale.ends_at} />
                </div>

                <Link to={`/product/${sale.product.slug}`}>
                  <div className="aspect-square overflow-hidden">
                  <img
                    src={sale.product.images?.[0] || FALLBACK_IMAGE}
                    alt={sale.product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  </div>
                </Link>

                <div className="p-3">
                  <Link to={`/product/${sale.product.slug}`}>
                    <h3 className="font-semibold dark:text-white text-sm line-clamp-2 mb-1 hover:text-primary-600 transition-colors">
                      {sale.product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold dark:text-red-400">
                      {formatPrice(discountedPrice)}
                    </span>
                    <span className="text-sm text-gray-400 dark:text-gray-400 line-through">
                      {formatPrice(sale.product.price)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => addItem(productWithDiscount, 1)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white py-2 rounded-lg text-xs font-medium transition-colors"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Ajouter
                    </button>
                    <button
                      onClick={() => toggleItem(sale.product.id, sale.product)}
                      className={`p-2 rounded-lg transition-colors ${
                        isInWishlist(sale.product.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:text-red-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(sale.product.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/products?flash_sale=true"
            className="inline-flex items-center gap-2 bg-red-50 dark:bg-gray-800 text-red-600 dark:text-red-400 px-8 py-3 rounded-xl font-semibold hover:bg-red-100 hover:dark:bg-gray-800 transition-all hover:scale-105 shadow-lg"
          >
            Voir toutes les offres
            <Flame className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}