import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { formatPrice, FALLBACK_IMAGE } from '../lib/utils';
import { PageLoading } from '../components/LoadingSpinner';
import { Heart, Trash2, ShoppingCart, ArrowRight, PackageOpen } from 'lucide-react';

export function WishlistPage() {
  const { items, loading, toggleItem } = useWishlist();
  const { addItem } = useCart();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  const handleRemove = async (itemId: string, productId: string) => {
    setRemovingId(itemId);
    try {
      await toggleItem(productId);
      toast.success('Retire des favoris');
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (productId: string) => {
    const item = items.find(i => i.product_id === productId);
    if (!item?.product) return;

    setAddingToCartId(productId);
    try {
      await addItem(item.product, 1);
      toast.success('Ajoute au panier');
    } catch {
      toast.error('Erreur lors de l\'ajout au panier');
    } finally {
      setAddingToCartId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen page-bg">
        <div className="page-section py-8">
          <div className="flex items-center justify-center py-20">
            <PageLoading />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg">
      <div className="page-header">
        <div className="page-section py-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold dark:text-white">Mes favoris</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {items.length === 0
              ? 'Vous n\'avez pas encore de favoris'
              : `${items.length} article${items.length > 1 ? 's' : ''} enregistre${items.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div className="page-section py-8">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-12 text-center max-w-lg mx-auto"
          >
            <PackageOpen className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h2 className="text-xl font-bold dark:text-white mb-2">Aucun favori</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Explorez nos produits et ajoutez vos coups de coeur en cliquant sur le coeur.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              Decouvrir nos produits
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden group"
                >
                  <Link
                    to={`/product/${item.product?.slug || item.product_id}`}
                    className="block aspect-square bg-gray-100 dark:bg-gray-900 relative overflow-hidden"
                  >
                    <img
                      src={item.product?.images?.[0] || FALLBACK_IMAGE}
                      alt={item.product?.name || 'Produit'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.product?.stock === 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-lg">
                        Rupture
                      </span>
                    )}
                  </Link>

                  <div className="p-4">
                    <Link
                      to={`/product/${item.product?.slug || item.product_id}`}
                      className="font-medium dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-2 mb-1"
                    >
                      {item.product?.name || 'Produit'}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {item.product?.specs?.brand || ''}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-lg dark:text-white">
                        {item.product ? formatPrice(item.product.price) : ''}
                      </span>
                      {item.product?.compare_price && item.product.compare_price > item.product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(item.product.compare_price)}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item.product_id)}
                        disabled={addingToCartId === item.product_id || item.product?.stock === 0}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {addingToCartId === item.product_id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Ajout...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            {item.product?.stock === 0 ? 'Indisponible' : 'Ajouter'}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleRemove(item.id, item.product_id)}
                        disabled={removingId === item.id}
                        className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors disabled:opacity-50"
                        title="Retirer des favoris"
                      >
                        {removingId === item.id ? (
                          <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
