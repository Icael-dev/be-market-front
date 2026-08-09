import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice, FALLBACK_IMAGE } from "../lib/utils";
import type { CouponValidation } from "../types";
import { validateCoupon } from "../services/content";
import { useEnter } from "../hooks/useKeyPress";
import { useState } from "react";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag, X } from "lucide-react";

export function CartPage() {
  const { items, count, total, loading, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();

  const shippingFee = total > 50000 ? 0 : 2500;
  const tax = Math.round(total * 0);
  const grandTotal = total + shippingFee + tax;

  const freeShippingRemaining = Math.max(0, 50000 - total);

  const [couponCode, setCouponCode] = useState("");
  const [couponValidation, setCouponValidation] = useState<CouponValidation | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEnter(() => {
    if (couponCode.trim()) handleApplyCoupon();
  }, couponCode.trim().length > 0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponValidation(null);
    try {
      const result = await validateCoupon(couponCode.trim(), total);
      setCouponValidation(result);
    } catch (error) {
      setCouponValidation({
        valid: false,
        message: error instanceof Error ? error.message : "Erreur lors de la validation du coupon",
        discount_amount: 0,
      });
    } finally {
      setCouponLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-bg flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-primary-600 dark:border-gray-700" />
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen">
      <div className="page-header">
        <div className="page-header-inner">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold dark:text-white">Panier</h1>
            <p className="mt-1 dark:text-gray-500">
              {count === 0
                ? "Votre panier est vide"
                : `${count} article${count > 1 ? "s" : ""} dans votre panier`}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="page-section py-8">
        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card p-12 text-center"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <ShoppingCart className="h-10 w-10 dark:text-gray-500" />
              </div>
              <h2 className="mb-2 text-xl font-bold dark:text-white">Votre panier est vide</h2>
              <p className="mb-8 dark:text-gray-500">
                Ajoutez des articles pour commencer vos achats
              </p>
              <Link to="/products" className="btn-primary">
                <ShoppingBag className="h-5 w-5" />
                Decouvrir nos produits
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-8 lg:grid-cols-3"
            >
              <div className="space-y-4 lg:col-span-2">
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className="card p-4 md:p-6"
                    >
                      <div className="flex gap-4 md:gap-6">
                        <Link
                          to={`/product/${item.product?.slug || "#"}`}
                          className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800 md:h-32 md:w-32"
                        >
                          <img
                            src={item.product?.images?.[0] || FALLBACK_IMAGE}
                            alt={item.product?.name || "Produit"}
                            className="h-full w-full object-cover transition-transform hover:scale-110"
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Link
                                to={`/product/${item.product?.slug || "#"}`}
                                className="line-clamp-2 font-medium transition-colors hover:text-primary-600 dark:text-white"
                              >
                                {item.product?.name || "Produit"}
                              </Link>
                              {item.product?.specs?.brand && (
                                <p className="mt-1 text-sm dark:text-gray-500">
                                  {item.product.specs.brand}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removeItem(item.product_id)}
                              className="icon-btn"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="mt-4 flex items-end justify-between">
                            <div className="flex items-center rounded-lg border dark:border-gray-700">
                              <button
                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-900"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-10 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                disabled={item.quantity >= (item.product?.stock || 99)}
                                className="p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-900"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="font-bold dark:text-white">
                                {formatPrice(
                                  (item.product?.effective_price ?? item.product?.price ?? 0) *
                                    item.quantity
                                )}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-sm dark:text-gray-500">
                                  {formatPrice(
                                    item.product?.effective_price ?? item.product?.price ?? 0
                                  )}{" "}
                                  / unite
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
                    className="inline-flex items-center gap-2 text-sm font-medium text-red-600 transition-colors hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Vider le panier
                  </button>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="card sticky top-24 p-6">
                  <h2 className="mb-6 text-lg font-bold dark:text-white">Recapitulatif</h2>

                  {freeShippingRemaining > 0 && (
                    <div className="mb-6 rounded-lg bg-primary-50 p-4 dark:bg-primary-900/20">
                      <p className="text-sm text-primary-700 dark:text-primary-300">
                        Plus que <strong>{freeShippingRemaining}</strong> FCFA pour la livraison
                        gratuite !
                      </p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-100 dark:bg-primary-900/40">
                        <div
                          className="h-full rounded-full bg-primary-600 transition-all"
                          style={{ width: `${(total / 50000) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 border-b pb-6 dark:border-gray-700">
                    <div className="flex justify-between dark:text-gray-500">
                      <span>Sous-total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between dark:text-gray-500">
                      <span>Livraison</span>
                      <span className={shippingFee === 0 ? "font-medium text-green-600" : ""}>
                        {shippingFee === 0 ? "Gratuite" : formatPrice(shippingFee)}
                      </span>
                    </div>

                    <div className="border-t border-dashed pt-3 dark:border-gray-700">
                      <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Code promo
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Entrez votre code"
                          className="flex-1 rounded-lg border px-3 py-2 text-sm uppercase tracking-wider dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
                        >
                          {couponLoading ? "..." : "Appliquer"}
                        </button>
                      </div>
                      {couponValidation && (
                        <p
                          className={`mt-2 text-xs ${couponValidation.valid ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {couponValidation.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between py-6 text-lg font-bold dark:text-white">
                    <span>Total</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>

                  <Link
                    to={
                      user
                        ? `/checkout?coupon=${encodeURIComponent(couponCode)}`
                        : `/login?redirect=/checkout`
                    }
                    className="btn-primary w-full"
                  >
                    Passer commande
                    <ArrowRight className="h-5 w-5" />
                  </Link>

                  <Link
                    to="/products"
                    className="mt-4 flex w-full items-center justify-center gap-2 font-medium transition-colors dark:text-gray-500 hover:dark:text-white"
                  >
                    Continuer les achats
                  </Link>

                  <div className="mt-6 border-t pt-6 dark:border-gray-700">
                    <div className="flex items-center gap-3 text-sm dark:text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
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
