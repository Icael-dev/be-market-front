import { useEffect, useState, useCallback } from "react";
import { logger } from "../lib/logger";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Order } from "../types";
import { formatPrice, getStatusColor, getStatusLabel } from "../lib/utils";
import { CheckCircle, Package, MapPin, CreditCard, ShoppingBag } from "lucide-react";
import { PageLoading } from "../components/LoadingSpinner";
import { fetchOrderById } from "../services/orders";

export function OrderSuccessPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const orderData = await fetchOrderById(orderId);
      setOrder(orderData);
    } catch (err) {
      logger.error("Order fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) return <PageLoading />;

  if (!order) {
    return (
      <div className="page-bg flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <h2 className="mb-4 text-xl font-bold dark:text-white">Commande introuvable</h2>
          <Link to="/" className="text-primary-600 hover:underline">
            Retour a l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen">
      <div className="page-section max-w-3xl py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card overflow-hidden"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <CheckCircle className="h-12 w-12 text-green-600" />
            </motion.div>
            <h1 className="mb-2 text-2xl font-bold">Commande confirmee !</h1>
            <p className="text-green-100">
              Merci pour votre achat. Votre commande a ete enregistree.
            </p>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between border-b pb-6 dark:border-gray-700">
              <div>
                <p className="text-sm dark:text-gray-500">Numero de commande</p>
                <p className="text-lg font-bold dark:text-white">{order.order_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm dark:text-gray-500">Date</p>
                <p className="dark:text-white">
                  {new Date(order.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="grid gap-6 border-b py-6 dark:border-gray-700 md:grid-cols-2">
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-medium dark:text-white">
                  <MapPin className="h-4 w-4 dark:text-gray-500" />
                  Adresse de livraison
                </h3>
                <div className="space-y-1 text-sm dark:text-gray-500">
                  <p>{order.shipping_address?.full_name}</p>
                  <p>{order.shipping_address?.phone}</p>
                  <p>{order.shipping_address?.address_line1}</p>
                  {order.shipping_address?.address_line2 && (
                    <p>{order.shipping_address.address_line2}</p>
                  )}
                  <p>
                    {order.shipping_address?.city}
                    {order.shipping_address?.region && `, ${order.shipping_address.region}`}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-3 flex items-center gap-2 font-medium dark:text-white">
                  <CreditCard className="h-4 w-4 dark:text-gray-500" />
                  Paiement
                </h3>
                <div className="space-y-1 text-sm dark:text-gray-500">
                  <p className="font-medium">{getStatusLabel(order.payment_method || "")}</p>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.payment_status)}`}
                  >
                    {getStatusLabel(order.payment_status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-b py-6 dark:border-gray-700">
              <h3 className="mb-4 font-medium dark:text-white">Articles commandes</h3>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium dark:text-white">{item.product_name}</p>
                      <p className="text-sm dark:text-gray-500">Quantite: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatPrice(item.total)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 py-6">
              <div className="flex justify-between dark:text-gray-500">
                <span>Sous-total</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between dark:text-gray-500">
                <span>Livraison</span>
                <span>
                  {order.shipping_fee === 0 ? "Gratuite" : formatPrice(order.shipping_fee)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 text-lg font-bold dark:border-gray-700 dark:text-white">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            {order.payment_method !== "cash_on_delivery" && (
              <div className="mb-6 rounded-lg bg-primary-50 p-4 dark:bg-primary-900/30">
                <p className="text-sm dark:text-primary-300">
                  <strong>Instructions de paiement:</strong> Vous recevrez une notification sur
                  votre telephone pour confirmer le paiement{" "}
                  {order.payment_method === "tmoney" ? "Tmoney" : "Flooz"}.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/orders"
                className="btn-primary flex flex-1 items-center justify-center gap-2"
              >
                <Package className="h-5 w-5" />
                Voir mes commandes
              </Link>
              <Link
                to="/products"
                className="btn-ghost flex flex-1 items-center justify-center gap-2"
              >
                <ShoppingBag className="h-5 w-5" />
                Continuer les achats
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
