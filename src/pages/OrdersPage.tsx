import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import type { Order } from '../types';
import { formatPrice, getStatusColor, getStatusLabel } from '../lib/utils';
import { Package, ChevronRight, Search, Filter, ShoppingBag, ArrowLeft } from 'lucide-react';
import { PageLoading } from '../components/LoadingSpinner';
import { cn } from '../lib/utils';
import { fetchOrders as fetchOrdersService, fetchOrderById } from '../services/orders';

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const data = await fetchOrdersService();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery || order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (loading) return <PageLoading />;

  return (
    <div className="min-h-screen dark:bg-gray-900">
      <div className="dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold dark:text-white">Mes commandes</h1>
            <p className="dark:text-gray-500 mt-1">
              {orders.length === 0 ? 'Aucune commande' : `${orders.length} commande${orders.length > 1 ? 's' : ''}`}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 mb-6"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher par numero..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800 cursor-pointer"
                >
                  <option value="">Tous les statuts</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-gray-500 pointer-events-none" />
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {filteredOrders.length === 0 ? (
            orders.length === 0 ? (
              <div className="dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-12 text-center">
                <div className="w-16 h-16 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 dark:text-gray-500" />
                </div>
                <h2 className="text-lg font-bold dark:text-white mb-2">
                  Aucune commande
                </h2>
                <p className="dark:text-gray-500 mb-6">
                  Vous n'avez pas encore passe de commande
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Decouvrir nos produits
                </Link>
              </div>
            ) : (
              <div className="dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-12 text-center">
                <h2 className="text-lg font-bold dark:text-white mb-2">
                  Aucun resultat
                </h2>
                <p className="dark:text-gray-500">
                  Aucune commande ne correspond a votre recherche
                </p>
              </div>
            )
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/orders/${order.id}`}
                      className="block dark:bg-gray-800 dark:bg-gray-900 rounded-2xl border dark:border-gray-700 dark:border-gray-800 p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium dark:text-white">{order.order_number}</p>
                            <p className="text-sm dark:text-gray-500">
                              {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className="w-5 h-5 dark:text-gray-500" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.payment_status)}`}>
                            {getStatusLabel(order.payment_status)}
                          </span>
                        </div>

                        <p className="font-bold dark:text-white">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id, user]);

  const fetchOrder = async () => {
    if (!id || !user) return;
    try {
      const orderData = await fetchOrderById(id);
      setOrder(orderData);
    } catch (err) {
      console.error('Order fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoading />;

  if (!order) {
    return (
      <div className="min-h-screen dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold dark:text-white mb-4">Commande introuvable</h2>
          <Link to="/orders" className="text-blue-600 hover:underline">
            Retour aux commandes
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { status: 'pending', label: 'En attente' },
    { status: 'confirmed', label: 'Confirmee' },
    { status: 'processing', label: 'En traitement' },
    { status: 'shipped', label: 'Expediee' },
    { status: 'delivered', label: 'Livre' }
  ];

  const currentStepIndex = steps.findIndex(s => s.status === order.status);

  return (
    <div className="min-h-screen dark:bg-gray-900">
      <div className="dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/orders"
              className="p-2 hover:dark:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 dark:text-gray-500" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold dark:text-white">{order.order_number}</h1>
              <p className="dark:text-gray-500">
                {new Date(order.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {order.status !== 'cancelled' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="dark:bg-gray-800 dark:bg-gray-900 rounded-2xl border dark:border-gray-700 dark:border-gray-800 p-6 mb-6 overflow-x-auto"
          >
            <div className="flex items-center justify-between min-w-[500px]">
              {steps.map((step, index) => (
                <div key={step.status} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                      index <= currentStepIndex
                        ? 'bg-blue-600 text-white'
                        : 'dark:bg-gray-700 dark:text-gray-500'
                    )}>
                      {index <= currentStepIndex ? (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={cn(
                      'text-xs mt-2 text-center',
                      index <= currentStepIndex ? 'dark:text-white font-medium' : 'dark:text-gray-500'
                    )}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      'w-16 h-0.5 mx-1',
                      index < currentStepIndex ? 'bg-blue-600' : 'dark:bg-gray-700'
                    )} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="dark:bg-gray-800 dark:bg-gray-900 rounded-2xl border dark:border-gray-700 dark:border-gray-800 p-6"
          >
            <h2 className="font-bold dark:text-white mb-4">Articles commandes</h2>
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

            <div className="mt-6 pt-6 border-t dark:border-gray-700 space-y-2">
              <div className="flex justify-between dark:text-gray-500">
                <span>Sous-total</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between dark:text-gray-500">
                <span>Livraison</span>
                <span>{order.shipping_fee === 0 ? 'Gratuite' : formatPrice(order.shipping_fee)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold dark:text-white pt-2">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="dark:bg-gray-800 dark:bg-gray-900 rounded-2xl border dark:border-gray-700 dark:border-gray-800 p-6"
            >
              <h2 className="font-bold dark:text-white mb-4">Adresse de livraison</h2>
              <div className="dark:text-gray-500 space-y-1">
                <p className="font-medium dark:text-white">{order.shipping_address?.full_name}</p>
                <p>{order.shipping_address?.phone}</p>
                <p>{order.shipping_address?.address_line1}</p>
                {order.shipping_address?.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                <p>{order.shipping_address?.city}, {order.shipping_address?.region}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="dark:bg-gray-800 dark:bg-gray-900 rounded-2xl border dark:border-gray-700 dark:border-gray-800 p-6"
            >
              <h2 className="font-bold dark:text-white mb-4">Paiement</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="dark:text-gray-500">Methode</span>
                  <span className="font-medium dark:text-white">
                    {getStatusLabel(order.payment_method || '')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-500">Statut</span>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                    {getStatusLabel(order.payment_status)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
