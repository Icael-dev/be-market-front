import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, Sparkles } from 'lucide-react';
import type { Product } from '../types';
import { formatPrice, cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

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

  const imageUrl = !imageError && product.images?.[0]
    ? product.images[0]
    : 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=800';

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
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 h-full flex flex-col">
          <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
            <motion.img
              src={imageUrl}
              alt={product.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.5 }}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            />

            {discount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg"
              >
                <Sparkles className="w-3 h-3" />
                -{discount}%
              </motion.div>
            )}

            {product.is_featured && (
              <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
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
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-medium transition-colors shadow-lg"
              >
                <ShoppingCart className="w-4 h-4" />
                Ajouter
              </button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleWishlist}
                className={cn(
                  'p-3 rounded-xl transition-colors shadow-lg',
                  isWishlisted
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:text-red-500'
                )}
              >
                <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
              </motion.button>
            </motion.div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            {product.specs?.brand && (
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                {product.specs.brand}
              </p>
            )}
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 flex-1">
              {product.name}
            </h3>

            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-3.5 h-3.5',
                    i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'
                  )}
                />
              ))}
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(24)</span>
            </div>

<div className="flex flex-col items-start mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
               {product.compare_price && (
                 <span className="text-sm text-gray-400 line-through mb-1">
                   {formatPrice(product.compare_price)}
                 </span>
               )}
               <span className="text-xl font-bold text-gray-900 dark:text-white">
                 {formatPrice(product.price)}
               </span>
             </div>
             <div className="flex items-center justify-end mt-2">
               {product.stock > 0 ? (
                 <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                   En stock
                 </span>
               ) : (
                 <span className="text-xs text-red-500 dark:text-red-400 font-medium bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                   Rupture
                 </span>
               )}
             </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}