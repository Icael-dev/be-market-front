import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { formatPrice, FALLBACK_IMAGE } from "../lib/utils";
import { PageLoading } from "../components/LoadingSpinner";
import { Heart, Trash2, ShoppingCart, ArrowRight, PackageOpen } from "lucide-react";

export function WishlistPage() {
  const { items, loading, toggleItem } = useWishlist();
  const { addItem } = useCart();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  const handleRemove = async (itemId: string, productId: string) => {
    setRemovingId(itemId);
    try {
      await toggleItem(productId);
      toast.success("Retire des favoris");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (productId: string) => {
    const item = items.find((i) => i.product_id === productId);
    if (!item?.product) return;

    setAddingToCartId(productId);
    try {
      await addItem(item.product, 1);
      toast.success("Ajoute au panier");
    } catch {
      toast.error("Erreur lors de l'ajout au panier");
    } finally {
      setAddingToCartId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-bg min-h-screen">
        <div className="page-section py-8">
          <div className="flex items-center justify-center py-20">
            <PageLoading />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen">
      <div className="page-header">
        <div className="page-section py-8">
          <div className="mb-2 flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold dark:text-white">Mes favoris</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {items.length === 0
              ? "Vous n'avez pas encore de favoris"
              : `${items.length} article${items.length > 1 ? "s" : ""} enregistre${items.length > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div className="page-section py-8">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mx-auto max-w-lg p-12 text-center"
          >
            <PackageOpen className="mx-auto mb-6 h-20 w-20 text-gray-300 dark:text-gray-600" />
            <h2 className="mb-2 text-xl font-bold dark:text-white">Aucun favori</h2>
            <p className="mb-8 text-gray-500 dark:text-gray-400">
              Explorez nos produits et ajoutez vos coups de coeur en cliquant sur le coeur.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700"
            >
              Decouvrir nos produits
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  className="group overflow-hidden rounded-lg border bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Link
                    to={`/product/${item.product?.slug || item.product_id}`}
                    className="relative block aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900"
                  >
                    <img
                      src={item.product?.images?.[0] || FALLBACK_IMAGE}
                      alt={item.product?.name || "Produit"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {item.product?.stock === 0 && (
                      <span className="absolute left-3 top-3 rounded-lg bg-red-500 px-2 py-1 text-xs font-medium text-white">
                        Rupture
                      </span>
                    )}
                  </Link>

                  <div className="p-4">
                    <Link
                      to={`/product/${item.product?.slug || item.product_id}`}
                      className="mb-1 line-clamp-2 font-medium hover:text-primary-600 dark:text-white dark:hover:text-primary-400"
                    >
                      {item.product?.name || "Produit"}
                    </Link>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      {item.product?.specs?.brand || ""}
                    </p>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-lg font-bold dark:text-white">
                        {item.product ? formatPrice(item.product.price) : ""}
                      </span>
                      {item.product?.compare_price &&
                        item.product.compare_price > item.product.price && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(item.product.compare_price)}
                          </span>
                        )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item.product_id)}
                        disabled={addingToCartId === item.product_id || item.product?.stock === 0}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {addingToCartId === item.product_id ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Ajout...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4" />
                            {item.product?.stock === 0 ? "Indisponible" : "Ajouter"}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleRemove(item.id, item.product_id)}
                        disabled={removingId === item.id}
                        className="rounded-lg p-2.5 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-900/30"
                        title="Retirer des favoris"
                      >
                        {removingId === item.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500/30 border-t-red-500" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
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
