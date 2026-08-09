import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Heart, Minus, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import type { Product } from "../types";
import { formatPrice, cn, FALLBACK_IMAGE } from "../lib/utils";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useEscape } from "../hooks/useKeyPress";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  useEscape(onClose, isOpen);

  if (!product) return null;

  const images = product.images?.length > 0 ? product.images : [FALLBACK_IMAGE];

  const handleAddToCart = () => {
    addItem(product, quantity);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-lg bg-white shadow-premium dark:bg-gray-900 md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[90vh] md:w-full md:max-w-4xl md:-translate-x-1/2 md:-translate-y-1/2"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 p-4 dark:border-gray-800">
              <h2 className="text-lg font-bold dark:text-white">Apercu rapide</h2>
              <button onClick={onClose} className="icon-btn">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                    <img
                      src={images[selectedImage]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(i)}
                          className={cn(
                            "h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2",
                            selectedImage === i
                              ? "border-primary-600"
                              : "border-gray-200 dark:border-gray-700"
                          )}
                        >
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {product.specs?.brand && (
                    <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                      {product.specs.brand}
                    </p>
                  )}
                  <h3 className="text-xl font-bold dark:text-white">{product.name}</h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold dark:text-white">
                      {formatPrice(product.price)}
                    </span>
                    {product.compare_price && (
                      <span className="text-lg text-gray-400 line-through dark:text-gray-500">
                        {formatPrice(product.compare_price)}
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-3 text-sm text-gray-500 dark:text-gray-400">
                    {product.description}
                  </p>
                  {product.stock > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Quantite:</span>
                      <div className="flex items-center rounded-lg border-2 border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center font-medium">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className="btn-primary flex-1"
                    >
                      <ShoppingCart className="h-5 w-5" /> Ajouter
                    </button>
                    <button
                      onClick={() => toggleItem(product.id, product)}
                      className={cn(
                        "rounded-lg p-3 transition-colors",
                        isInWishlist(product.id)
                          ? "bg-red-500 text-white"
                          : "border-2 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-500 dark:hover:bg-gray-800"
                      )}
                    >
                      <Heart
                        className={cn("h-5 w-5", isInWishlist(product.id) && "fill-current")}
                      />
                    </button>
                  </div>
                  <Link
                    to={`/product/${product.slug}`}
                    onClick={onClose}
                    className="block text-center font-medium text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Voir les details
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
