import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import type { FlashSale, Product } from '../types';
import { formatPrice } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { Flame, Clock, Zap, ShoppingCart, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

interface FlashSaleWithProduct extends FlashSale {
  product: Product;
}

export function FlashSaleSection() {
  const [flashSales, setFlashSales] = useState<FlashSaleWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();

  useEffect(() => {
    fetchFlashSales();
  }, []);

  useEffect(() => {
    if (flashSales.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const endTime = new Date(flashSales[0].ends_at);
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
  }, [flashSales]);

  const fetchFlashSales = async () => {
    try {
      const now = new Date().toISOString();

      const { data: salesData } = await supabase
        .from('flash_sales')
        .select('*')
        .eq('is_active', true)
        .lte('starts_at', now)
        .gt('ends_at', now)
        .limit(4);

      if (!salesData || salesData.length === 0) {
        setLoading(false);
        return;
      }

      const productIds = salesData.map((s: any) => s.product_id);
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (salesData && productsData) {
        const merged = salesData.map((sale: any) => ({
          ...sale,
          product: productsData.find((p: any) => p.id === sale.product_id)
        })).filter((s: any) => s.product);
        setFlashSales(merged as FlashSaleWithProduct[]);
      }
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
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-red-600/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"
            >
              <Flame className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white">Flash Sales</h2>
              <p className="text-white/80 text-sm">Offres limitees - Ne ratez pas !</p>
            </div>
          </div>

          {timeLeft && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3"
            >
              <Clock className="w-5 h-5 text-white" />
              <div className="flex gap-2 font-mono">
                {[
                  { value: timeLeft.hours, label: 'H' },
                  { value: timeLeft.minutes, label: 'M' },
                  { value: timeLeft.seconds, label: 'S' }
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <motion.span
                      key={item.value}
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="block text-2xl font-bold text-white"
                    >
                      {item.value.toString().padStart(2, '0')}
                    </motion.span>
                    <span className="text-xs text-white/60">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
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
                className="relative bg-white rounded-2xl overflow-hidden shadow-xl"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
                  className="absolute top-3 left-3 z-10 bg-white text-red-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg"
                >
                  <Zap className="w-3 h-3" />
                  -{sale.discount_percentage}%
                </motion.div>

                <Link to={`/product/${sale.product.slug}`}>
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={sale.product.images?.[0] || 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg'}
                      alt={sale.product.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </Link>

                <div className="p-3">
                  <Link to={`/product/${sale.product.slug}`}>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 hover:text-blue-600 transition-colors">
                      {sale.product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-red-600">
                      {formatPrice(discountedPrice)}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(sale.product.price)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => addItem(productWithDiscount, 1)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Ajouter
                    </button>
                    <button
                      onClick={() => toggleItem(sale.product.id, sale.product)}
                      className={`p-2 rounded-lg transition-colors ${
                        isInWishlist(sale.product.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:text-red-500'
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
            className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
          >
            Voir toutes les offres
            <Flame className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}