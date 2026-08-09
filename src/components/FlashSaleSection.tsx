import { useEffect, useState } from "react";
import { logger } from "../lib/logger";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchFlashSales as fetchFlashSalesService } from "../services/content";
import type { FlashSale, Product } from "../types";
import { formatPrice, FALLBACK_IMAGE } from "../lib/utils";
import { useCart } from "../context/CartContext";
import { Flame, Clock, Zap, ShoppingCart, Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";

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
      <Clock className="h-3 w-3" />
      <span>{timeLeft.hours.toString().padStart(2, "0")}</span>
      <span>:</span>
      <span>{timeLeft.minutes.toString().padStart(2, "0")}</span>
      <span>:</span>
      <span>{timeLeft.seconds.toString().padStart(2, "0")}</span>
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

      const merged = data.map((sale) => ({
        ...sale,
        product: sale.product,
      })) as FlashSaleWithProduct[];

      setFlashSales(merged);
    } catch (err) {
      logger.error("FlashSales fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || flashSales.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 py-12">
      <div className="absolute inset-0">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-yellow-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full blur-3xl dark:bg-red-700/30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 flex items-center gap-3"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100/20 dark:bg-gray-800/20"
          >
            <Flame className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white">Flash Sales</h2>
            <p className="text-sm text-white/80">Offres limitees - Ne ratez pas !</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {flashSales.map((sale, index) => {
            const basePrice = sale.product.price;
            const discountedPrice =
              sale.product.effective_price ??
              (sale.discount_percentage != null
                ? basePrice * (1 - sale.discount_percentage / 100)
                : basePrice);
            const productWithDiscount = {
              ...sale.product,
              compare_price: basePrice,
              price: discountedPrice,
            };

            return (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative overflow-hidden rounded-lg bg-white shadow-card transition-all duration-300 hover:shadow-hover dark:bg-gray-800"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
                  className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg dark:bg-gray-800 dark:text-red-400"
                >
                  <Zap className="h-3 w-3" />-{sale.discount_percentage}%
                </motion.div>

                <div className="absolute right-3 top-3 z-10 rounded-lg bg-white/90 px-2 py-1 backdrop-blur-sm dark:bg-gray-800/90">
                  <CountdownTimer endsAt={sale.ends_at} />
                </div>

                <Link to={`/product/${sale.product.slug}`}>
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={sale.product.images?.[0] || FALLBACK_IMAGE}
                      alt={sale.product.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                </Link>

                <div className="p-3">
                  <Link to={`/product/${sale.product.slug}`}>
                    <h3 className="mb-1 line-clamp-2 text-sm font-semibold transition-colors hover:text-primary-600 dark:text-white">
                      {sale.product.name}
                    </h3>
                  </Link>

                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg font-bold dark:text-red-400">
                      {formatPrice(discountedPrice)}
                    </span>
                    <span className="text-sm text-gray-400 line-through dark:text-gray-400">
                      {formatPrice(sale.product.price)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => addItem(productWithDiscount, 1)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-600 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                    >
                      <ShoppingCart className="h-3 w-3" />
                      Ajouter
                    </button>
                    <button
                      onClick={() => toggleItem(sale.product.id, sale.product)}
                      className={`rounded-lg p-2 transition-colors ${
                        isInWishlist(sale.product.id)
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-red-400"
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 ${isInWishlist(sale.product.id) ? "fill-current" : ""}`}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/products?flash_sale=true"
            className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-8 py-3 font-semibold text-red-600 shadow-lg transition-all hover:scale-105 hover:bg-red-100 dark:bg-gray-800 dark:text-red-400 hover:dark:bg-gray-800"
          >
            Voir toutes les offres
            <Flame className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
