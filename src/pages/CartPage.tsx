import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../lib/utils';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  X
} from 'lucide-react';

export function CartPage() {
  const { items, count, total, loading, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();

  const shippingFee = total > 50000 ? 0 : 2500;
  const tax = Math.round(total * 0);
  const grandTotal = total + shippingFee + tax;

  const freeShippingRemaining = Math.max(0, 50000 - total);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 dark:border-gray-700 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold dark:text-white">Panier</h1>
            <p className="dark:text-gray-500 mt-1">
              {count === 0
                ? 'Votre panier est vide'
                : `${count} article${count > 1 ? 's' : ''} dans votre panier`}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-12 text-center"
            >
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-10 h-10 dark:text-gray-500" />
              </div>
              <h2 className="text-xl font-bold dark:text-white mb-2">
                Votre panier est vide
              </h2>
              <p className="dark:text-gray-500 mb-8">
                Ajoutez des articles pour commencer vos achats
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                Decouvrir nos produits
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 dark:border-gray-800 p-4 md:p-6"
                    >
                      <div className="flex gap-4 md:gap-6">
                        <Link
                          to={`/product/${item.product?.slug || '#'}`}
                          className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden"
                        >
                          <img
                            src={item.product?.images?.[0] || 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg'}
                            alt={item.product?.name || 'Produit'}
                            className="w-full h-full object-cover hover:scale-110 transition-transform"
                          />
                        </Link>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Link
                                to={`/product/${item.product?.slug || '#'}`}
                                className="font-medium dark:text-white hover:text-blue-600 transition-colors line-clamp-2"
                              >
                                {item.product?.name || 'Produit'}
                              </Link>
                              {item.product?.specs?.brand && (
                                <p className="text-sm dark:text-gray-500 mt-1">
                                  {item.product.specs.brand}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removeItem(item.product_id)}
                              className="p-2 dark:text-gray-500 hover:text-red-500 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="flex items-end justify-between mt-4">
                            <div className="flex items-center border dark:border-gray-700 rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="p-2 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-10 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                disabled={item.quantity >= (item.product?.stock || 99)}
                                className="p-2 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="font-bold dark:text-white">
                                {formatPrice((item.product?.price || 0) * item.quantity)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-sm dark:text-gray-500">
                                  {formatPrice(item.product?.price || 0)} / unite
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="flex justify-end">
                  <button
                    onClick={clearCart}
                    className="inline-flex items-center gap-2 text-red-600 text-sm font-medium hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Vider le panier
                  </button>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 dark:border-gray-800 p-6 sticky top-24">
                  <h2 className="text-lg font-bold dark:text-white dark:text-white mb-6">
                    Recapitulatif
                  </h2>

                  {freeShippingRemaining > 0 && (
                    <div className="mb-6 p-4 dark:bg-blue-900/20 rounded-xl">
                      <p className="text-sm text-blue-800">
                        Plus que <strong>{freeShippingRemaining}</strong> FCFA pour la livraison gratuite !
                      </p>
                      <div className="mt-2 h-2 bg-blue-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${(total / 50000) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 pb-6 border-b dark:border-gray-700">
                    <div className="flex justify-between dark:text-gray-500">
                      <span>Sous-total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between dark:text-gray-500">
                      <span>Livraison</span>
                      <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                        {shippingFee === 0 ? 'Gratuite' : formatPrice(shippingFee)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between py-6 text-lg font-bold dark:text-white">
                    <span>Total</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>

                  <Link
                    to={user ? '/checkout' : '/login?redirect=/checkout'}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    Passer commande
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  <Link
                    to="/products"
                    className="w-full flex items-center justify-center gap-2 mt-4 dark:text-gray-500 hover:dark:text-white font-medium transition-colors"
                  >
                    Continuer les achats
                  </Link>

                  <div className="mt-6 pt-6 border-t dark:border-gray-700">
                    <div className="flex items-center gap-3 text-sm dark:text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Paiement securise
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
