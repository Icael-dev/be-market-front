import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice, FALLBACK_IMAGE } from '../lib/utils';
import { useEscape } from '../hooks/useKeyPress';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WishlistDrawer({ isOpen, onClose }: WishlistDrawerProps) {
  const { items, toggleItem } = useWishlist();
  useEscape(onClose, isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-900 z-50 shadow-premium"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-bold dark:text-white">Mes favoris</h2>
                  <span className="text-sm text-gray-400 dark:text-gray-500">({items.length})</span>
                </div>
                <button
                  onClick={onClose}
                  className="icon-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Aucun favori</p>
                    <Link
                      to="/products"
                      onClick={onClose}
                      className="text-primary-400 dark:text-primary-400 font-medium hover:underline"
                    >
                      Decouvrir nos produits
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.slice(0, 6).map(item => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                      >
                        <Link
                          to={`/product/${item.product?.slug || item.product_id}`}
                          onClick={onClose}
                          className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden flex-shrink-0"
                        >
                          <img
                            src={item.product?.images?.[0] || FALLBACK_IMAGE}
                            alt={item.product?.name || 'Produit'}
                            className="w-full h-full object-cover"
                          />
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${item.product?.slug || item.product_id}`}
                            onClick={onClose}
                            className="font-medium dark:text-white hover:dark:text-primary-400 line-clamp-2"
                          >
                            {item.product?.name || 'Produit'}
                          </Link>
                          <p className="text-sm dark:text-gray-400 mt-1">
                            {item.product?.specs?.brand || ''}
                          </p>
                          <p className="font-bold dark:text-white mt-2">
                            {item.product ? formatPrice(item.product.price) : ''}
                          </p>
                        </div>

                        <button
                          onClick={() => toggleItem(item.product_id)}
                          className="p-2 text-red-500 dark:hover:bg-red-900/30 rounded-lg transition-colors self-start"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <Link
                        to="/wishlist"
                        onClick={onClose}
                        className="block text-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline pt-2"
                      >
                        Voir tous les favoris ({items.length})
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}