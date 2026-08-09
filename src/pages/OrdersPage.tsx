import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '../lib/logger';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { Order, Product } from '../types';
import { formatPrice, getStatusColor, getStatusLabel } from '../lib/utils';
import { Package, ChevronRight, Search, Filter, ShoppingBag, ArrowLeft, XCircle, Download } from 'lucide-react';
import { PageLoading } from '../components/LoadingSpinner';
import { cn } from '../lib/utils';
import { fetchOrders as fetchOrdersService, fetchOrderById, cancelOrder } from '../services/orders';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    try {
      const data = await fetchOrdersService();
      setOrders(data);
    } catch (err) {
      logger.error('Error fetching orders:', err);
      setError('Impossible de charger les commandes. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Etes-vous sûr de vouloir annuler cette commande ?')) return;

    try {
      const updated = await cancelOrder(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    } catch (err) {
      logger.error('Error cancelling order:', err);
      alert('Impossible d\'annuler la commande. Veuillez réessayer.');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery || order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (loading) return <PageLoading />;

  if (error) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-4">{error}</p>
          <button onClick={fetchOrders} className="btn-primary">
            Reessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg">
      <div className="page-header">
        <div className="page-section py-8">
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

      <div className="page-section py-8">
        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-4 mb-6"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher par numero..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                   className="appearance-none pl-4 pr-10 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white cursor-pointer"
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
              <div className="card p-12 text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  className="inline-flex items-center gap-2 btn-primary"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Decouvrir nos produits
                </Link>
              </div>
            ) : (
              <div className="card p-12 text-center">
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
                    <div
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="block card p-6 hover:shadow-premium transition-all cursor-pointer"
                    >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
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

                      <div className="flex items-center gap-3">
                        <p className="font-bold dark:text-white">
                          {formatPrice(order.total)}
                        </p>

                        {['pending', 'confirmed', 'processing'].includes(order.status) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelOrder(order.id);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Annuler la commande"
                          >
                            <XCircle className="w-4 h-4" />
                            Annuler
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
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
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!id || !user) return;
    try {
      const orderData = await fetchOrderById(id);
      setOrder(orderData);
    } catch (err) {
      logger.error('Order fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCancelOrder = async () => {
    if (!order || !confirm('Etes-vous sûr de vouloir annuler cette commande ?')) return;

    try {
      const updated = await cancelOrder(order.id);
      setOrder(updated);
    } catch (err) {
      logger.error('Error cancelling order:', err);
      alert('Impossible d\'annuler la commande. Veuillez réessayer.');
    }
  };

  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleDownloadInvoice = async () => {
    if (!invoiceRef.current || !order) return;
    try {
      const canvas = await html2canvas(invoiceRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`facture-${order.order_number}.pdf`);
    } catch (err) {
      logger.error('Invoice PDF generation error:', err);
      alert('Impossible de generer la facture. Veuillez reessayer.');
    }
  };

  if (loading) return <PageLoading />;

  if (!order) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold dark:text-white mb-4">Commande introuvable</h2>
          <Link to="/orders" className="text-primary-600 hover:underline">
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
    <div className="min-h-screen page-bg">
      <div className="page-header">
        <div className="page-section py-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/orders"
              className="p-2 hover:bg-gray-50 hover:dark:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 dark:text-gray-500" />
            </Link>
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
            >
              <Download className="w-5 h-5" />
              Telecharger la facture
            </button>
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

      <div className="page-section py-8">
        {order.status !== 'cancelled' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 mb-6 overflow-x-auto"
          >
            <div className="flex items-center justify-between min-w-[500px]">
              {steps.map((step, index) => (
                <div key={step.status} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                      index <= currentStepIndex
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
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
                       index < currentStepIndex ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-800'
                    )} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {order.status !== 'cancelled' && ['pending', 'confirmed', 'processing'].includes(order.status) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={handleCancelOrder}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <XCircle className="w-5 h-5" />
              Annuler la commande
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={async () => {
              if (!order.items?.length) return;
              for (const item of order.items) {
                await addItem({ ...item, id: item.product_id } as unknown as Product, item.quantity);
              }
              navigate('/cart');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            Recommander
          </button>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
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
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Remise</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between dark:text-gray-500">
                <span>Livraison</span>
                <span>{order.shipping_fee === 0 ? 'Gratuite' : formatPrice(order.shipping_fee)}</span>
              </div>
              <div className="flex justify-between dark:text-gray-500">
                <span>Taxe (TVA 10%)</span>
                <span>{formatPrice(order.tax)}</span>
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
              className="card p-6"
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

            {order.billing_address && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="card p-6"
              >
                <h2 className="font-bold dark:text-white mb-4">Adresse de facturation</h2>
                <div className="dark:text-gray-500 space-y-1">
                  <p className="font-medium dark:text-white">{order.billing_address?.full_name}</p>
                  <p>{order.billing_address?.phone}</p>
                  <p>{order.billing_address?.address_line1}</p>
                  {order.billing_address?.address_line2 && <p>{order.billing_address.address_line2}</p>}
                  <p>{order.billing_address?.city}, {order.billing_address?.region}</p>
                </div>
              </motion.div>
            )}

            {order.notes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.27 }}
                className="card p-6"
              >
                <h2 className="font-bold dark:text-white mb-2">Note de commande</h2>
                <p className="text-sm dark:text-gray-400">{order.notes}</p>
              </motion.div>
            )}

            {order.payments && order.payments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-6"
              >
                <h2 className="font-bold dark:text-white mb-4">Paiements</h2>
                <div className="space-y-3">
                  {order.payments.map(p => (
                    <div key={p.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0">
                      <div>
                        <p className="font-medium dark:text-white">{formatPrice(p.amount)}</p>
                        <p className="text-sm dark:text-gray-500">
                          {getStatusLabel(p.payment_method || '')} · Ref: {p.reference || '—'}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(p.status)}`}>
                        {getStatusLabel(p.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
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

      <div ref={invoiceRef} className="fixed left-[-9999px] top-0 bg-white p-8" style={{ width: '210mm' }}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Be Market</h1>
          <p className="text-gray-600">Votre boutique en ligne de confiance</p>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Facture</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="font-medium">Commande:</p>
              <p>{order.order_number}</p>
            </div>
            <div>
              <p className="font-medium">Date:</p>
              <p>{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <h3 className="font-bold mb-2">Articles</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Produit</th>
                <th className="border border-gray-300 p-2 text-right">Quantite</th>
                <th className="border border-gray-300 p-2 text-right">Prix</th>
                <th className="border border-gray-300 p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map(item => (
                <tr key={item.id}>
                  <td className="border border-gray-300 p-2">{item.product_name}</td>
                  <td className="border border-gray-300 p-2 text-right">{item.quantity}</td>
                  <td className="border border-gray-300 p-2 text-right">{formatPrice(item.price)}</td>
                  <td className="border border-gray-300 p-2 text-right">{formatPrice(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mb-8">
          <h3 className="font-bold mb-2">Totaux</h3>
          <div className="space-y-1">
            <div className="flex justify-between"><span>Sous-total</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between"><span>Remise</span><span>-{formatPrice(order.discount)}</span></div>}
            <div className="flex justify-between"><span>Livraison</span><span>{order.shipping_fee === 0 ? 'Gratuite' : formatPrice(order.shipping_fee)}</span></div>
            <div className="flex justify-between"><span>Taxe</span><span>{formatPrice(order.tax)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>{formatPrice(order.total)}</span></div>
          </div>
        </div>
         <div className="text-sm text-gray-600">
           <p>Merci pour votre commande!</p>
         </div>
       </div>
     </div>
   );
 }
