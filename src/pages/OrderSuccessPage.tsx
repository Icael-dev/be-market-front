import { useEffect, useState, useCallback } from 'react';
import { logger } from '../lib/logger';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Order } from '../types';
import { formatPrice, getStatusColor, getStatusLabel } from '../lib/utils';
import {
  CheckCircle,
  Package,
  MapPin,
  CreditCard,
  ShoppingBag
} from 'lucide-react';
import { PageLoading } from '../components/LoadingSpinner';
import { fetchOrderById } from '../services/orders';

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
      logger.error('Order fetch error:', err);
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
      <div className="min-h-screen page-bg flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold dark:text-white mb-4">Commande introuvable</h2>
          <Link to="/" className="text-primary-600 hover:underline">
            Retour a l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg">
      <div className="page-section max-w-3xl py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card overflow-hidden"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>
            <h1 className="text-2xl font-bold mb-2">Commande confirmee !</h1>
            <p className="text-green-100">
              Merci pour votre achat. Votre commande a ete enregistree.
            </p>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between pb-6 border-b dark:border-gray-700">
              <div>
                <p className="text-sm dark:text-gray-500">Numero de commande</p>
                <p className="text-lg font-bold dark:text-white">{order.order_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm dark:text-gray-500">Date</p>
                <p className="dark:text-white">
                  {new Date(order.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 py-6 border-b dark:border-gray-700">
              <div>
                <h3 className="flex items-center gap-2 font-medium dark:text-white mb-3">
                  <MapPin className="w-4 h-4 dark:text-gray-500" />
                  Adresse de livraison
                </h3>
                <div className="text-sm dark:text-gray-500 space-y-1">
                  <p>{order.shipping_address?.full_name}</p>
                  <p>{order.shipping_address?.phone}</p>
                  <p>{order.shipping_address?.address_line1}</p>
                  {order.shipping_address?.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                  <p>
                    {order.shipping_address?.city}
                    {order.shipping_address?.region && `, ${order.shipping_address.region}`}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="flex items-center gap-2 font-medium dark:text-white mb-3">
                  <CreditCard className="w-4 h-4 dark:text-gray-500" />
                  Paiement
                </h3>
                <div className="text-sm dark:text-gray-500 space-y-1">
                  <p className="font-medium">
                    {getStatusLabel(order.payment_method || '')}
                  </p>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                    {getStatusLabel(order.payment_status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="py-6 border-b dark:border-gray-700">
              <h3 className="font-medium dark:text-white mb-4">
                Articles commandes
              </h3>
              <div className="space-y-4">
                {order.items?.map(item => (
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

            <div className="py-6 space-y-2">
              <div className="flex justify-between dark:text-gray-500">
                <span>Sous-total</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between dark:text-gray-500">
                <span>Livraison</span>
                <span>{order.shipping_fee === 0 ? 'Gratuite' : formatPrice(order.shipping_fee)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold dark:text-white pt-2 border-t dark:border-gray-700">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            {order.payment_method !== 'cash_on_delivery' && (
              <div className="bg-primary-50 dark:bg-primary-900/30 rounded-xl p-4 mb-6">
                <p className="text-sm dark:text-primary-300">
                  <strong>Instructions de paiement:</strong> Vous recevrez une notification sur votre telephone pour confirmer le paiement {order.payment_method === 'tmoney' ? 'Tmoney' : 'Flooz'}.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/orders"
                className="flex-1 flex items-center justify-center gap-2 btn-primary"
              >
                <Package className="w-5 h-5" />
                Voir mes commandes
              </Link>
              <Link
                to="/products"
                className="flex-1 flex items-center justify-center gap-2 btn-ghost"
              >
                <ShoppingBag className="w-5 h-5" />
                Continuer les achats
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
