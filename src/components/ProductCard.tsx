import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star, Sparkles, Zap } from "lucide-react";
import type { Product } from "../types";
import { formatPrice, cn, FALLBACK_IMAGE } from "../lib/utils";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { Card } from "./ui/Card";
import { memo, useState } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard = memo(function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const flashDiscount = product.flash_discount_percentage || 0;
  const displayDiscount = flashDiscount > 0 ? flashDiscount : discount;

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product.id, product);
  };

  const imageUrl = !imageError && product.images?.[0] ? product.images[0] : FALLBACK_IMAGE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Link
        to={`/product/${product.slug}`}
        className="group block h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card
          hover
          className="relative flex h-full flex-col overflow-hidden border-gray-100 shadow-sm duration-500 hover:shadow-2xl dark:border-gray-700"
        >
          <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
            <motion.img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
              className="h-full w-full object-cover"
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.5 }}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent dark:from-black/70"
            />

            {displayDiscount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`absolute left-3 top-3 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-lg ${flashDiscount > 0 ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gradient-to-r from-red-500 to-orange-500"}`}
              >
                {flashDiscount > 0 ? <Zap className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                -{displayDiscount}%
              </motion.div>
            )}

            {product.is_featured && (
              <div className="absolute right-3 top-3 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-primary-500">
                Vedette
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-4 left-4 right-4 flex gap-2"
            >
              <button
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-primary-700"
              >
                <ShoppingCart className="h-4 w-4" />
                Ajouter
              </button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleWishlist}
                className={cn(
                  "rounded-lg p-3 shadow-lg transition-colors",
                  isWishlisted
                    ? "bg-red-500 text-white"
                    : "bg-white/90 text-gray-600 hover:text-red-500 dark:bg-gray-800/90 dark:text-gray-300"
                )}
              >
                <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
              </motion.button>
            </motion.div>
          </div>

          <div className="flex flex-1 flex-col p-4">
            {product.specs?.brand && (
              <p className="mb-1 text-xs font-medium text-primary-600 dark:text-primary-400">
                {product.specs.brand}
              </p>
            )}
            <h3 className="line-clamp-2 flex-1 font-semibold text-gray-900 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
              {product.name}
            </h3>

            <div className="mt-2 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
                  )}
                />
              ))}
              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                ({product.reviews_count ?? 0})
              </span>
            </div>

            <div className="mt-3 flex flex-col items-start border-t border-gray-100 pt-3 dark:border-gray-700">
              {product.compare_price && (
                <span className="mb-1 text-sm text-gray-400 line-through dark:text-gray-500">
                  {formatPrice(product.compare_price)}
                </span>
              )}
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-end">
              {product.stock > 0 ? (
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  En stock
                </span>
              ) : (
                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-500 dark:bg-red-900/30 dark:text-red-400">
                  Rupture
                </span>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
});
