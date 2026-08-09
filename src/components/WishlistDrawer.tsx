import { motion, AnimatePresence } from "framer-motion";
import { X, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { formatPrice, FALLBACK_IMAGE } from "../lib/utils";
import { useEscape } from "../hooks/useKeyPress";

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
            className="fixed inset-0 z-40 bg-black/50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-md bg-white shadow-premium dark:bg-gray-900"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <h2 className="text-lg font-bold dark:text-white">Mes favoris</h2>
                  <span className="text-sm text-gray-400 dark:text-gray-500">({items.length})</span>
                </div>
                <button onClick={onClose} className="icon-btn">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="py-12 text-center">
                    <Heart className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                    <p className="mb-4 text-gray-500 dark:text-gray-400">Aucun favori</p>
                    <Link
                      to="/products"
                      onClick={onClose}
                      className="font-medium text-primary-400 hover:underline dark:text-primary-400"
                    >
                      Decouvrir nos produits
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
                      >
                        <Link
                          to={`/product/${item.product?.slug || item.product_id}`}
                          onClick={onClose}
                          className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900"
                        >
                          <img
                            src={item.product?.images?.[0] || FALLBACK_IMAGE}
                            alt={item.product?.name || "Produit"}
                            className="h-full w-full object-cover"
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/product/${item.product?.slug || item.product_id}`}
                            onClick={onClose}
                            className="line-clamp-2 font-medium dark:text-white hover:dark:text-primary-400"
                          >
                            {item.product?.name || "Produit"}
                          </Link>
                          <p className="mt-1 text-sm dark:text-gray-400">
                            {item.product?.specs?.brand || ""}
                          </p>
                          <p className="mt-2 font-bold dark:text-white">
                            {item.product ? formatPrice(item.product.price) : ""}
                          </p>
                        </div>

                        <button
                          onClick={() => toggleItem(item.product_id)}
                          className="self-start rounded-lg p-2 text-red-500 transition-colors dark:hover:bg-red-900/30"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <Link
                        to="/wishlist"
                        onClick={onClose}
                        className="block pt-2 text-center text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
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
