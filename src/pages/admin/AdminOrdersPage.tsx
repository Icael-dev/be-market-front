import { toast } from 'react-hot-toast';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAdminOrders, updateAdminOrder, restoreAdminOrder } from '../../services/admin';
import { formatPrice, getStatusColor, getStatusLabel } from '../../lib/utils';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { Pagination } from '../../components/Pagination';
import type { Order, OrderStatus } from '../../types';
import {
  Package,
  Search,
  Eye,
  X,
  MapPin,
  CreditCard,
  Calendar,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchOrders = useCallback(async (page = 1) => {
    try {
      const result = await fetchAdminOrders({
        page,
        per_page: perPage,
        status: statusFilter || undefined
      });
      setOrders(result.data || []);
      setCurrentPage(result.current_page);
      setLastPage(result.last_page);
      setTotal(result.total);
    } catch (err) {
      console.error('Orders fetch error:', err);
      setOrders([]);
    }
  }, [statusFilter, perPage]);

  useEffect(() => {
    fetchOrders(1);
  }, [statusFilter, fetchOrders]);

  const handleRestoreOrder = async (orderId: string) => {
    setRestoringId(orderId);
    try {
      const restored = await restoreAdminOrder(orderId);
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, ...restored, deleted_at: null } : o)));
      toast.success('Commande restauree');
    } catch (error) {
      console.error('Order restore error:', error);
      toast.error('Erreur lors de la restauration');
    } finally {
      setRestoringId(null);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const updatedOrder = await updateAdminOrder(orderId, { status });
      setOrders(prev => prev.map(o =>
        o.id === orderId ? updatedOrder : o
      ));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Order status update error:', error);
      toast.error('Erreur lors de la mise a jour du statut');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery ||
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <AdminLayout>
      <MobileNotOptimizedBanner />
      <div className="p-6 lg:p-8">
        <PageHeader title="Commandes" subtitle={`${orders.length} commandes`} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-gray-500" />
              <input
                id="order-search"
                name="order-search"
                type="text"
                placeholder="Rechercher par numero..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            <select
              id="order-status-filter"
              name="order-status-filter"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 cursor-pointer"
            >
              <option value="">Tous les statuts</option>
              {statuses.map(status => (
                <option key={status} value={status}>{getStatusLabel(status)}</option>
              ))}
            </select>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Commande</th>
                  <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Client</th>
                  <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Montant</th>
                  <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Statut</th>
                  <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Paiement</th>
                  <th className="text-right px-6 py-4 text-sm font-medium dark:text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-gray-50 hover:dark:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium dark:text-white">{order.order_number}</p>
                      <p className="text-xs dark:text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </p>
                      {order.deleted_at && (
                        <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Supprime
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium dark:text-white">
                        {order.shipping_address?.full_name || '-'}
                      </p>
                      <p className="text-xs dark:text-gray-500">
                        {order.shipping_address?.phone || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium dark:text-white">{formatPrice(order.total)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        id={`order-status-${order.id}`}
                        name={`order-status-${order.id}`}
                        value={order.status}
                        onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer',
                          getStatusColor(order.status)
                        )}
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>{getStatusLabel(status)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'inline-flex px-3 py-1 rounded-lg text-sm font-medium',
                        getStatusColor(order.payment_status)
                      )}>
                        {getStatusLabel(order.payment_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {order.deleted_at && (
                          <button
                            onClick={() => handleRestoreOrder(order.id)}
                            disabled={restoringId === order.id}
                            className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg px-3 py-2 text-sm font-medium transition-colors dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 disabled:opacity-50"
                          >
                            {restoringId === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                            Restaurer
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          disabled={!!order.deleted_at}
                          className="p-2 hover:bg-gray-100 hover:dark:bg-gray-700 rounded-lg transition-colors disabled:opacity-40"
                        >
                          <Eye className="w-4 h-4 dark:text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 dark:text-gray-500 mx-auto mb-4" />
              <p className="dark:text-gray-500">Aucune commande trouvee</p>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
               className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white dark:bg-gray-800 z-50 overflow-y-auto"
            >
              <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800">
                <h2 className="text-xl font-bold dark:text-white">
                  {selectedOrder.order_number}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 hover:dark:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Calendar className="w-5 h-5 dark:text-gray-500" />
                  <div>
                    <p className="text-sm dark:text-gray-500">Date</p>
                    <p className="font-medium dark:text-white">
                      {new Date(selectedOrder.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium dark:text-white mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 dark:text-gray-500" />
                    Adresse de livraison
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="font-medium">{selectedOrder.shipping_address?.full_name}</p>
                    <p className="text-sm dark:text-gray-500">{selectedOrder.shipping_address?.phone}</p>
                    <p className="text-sm dark:text-gray-500 mt-1">
                      {selectedOrder.shipping_address?.address_line1}
                    </p>
                    <p className="text-sm dark:text-gray-500">
                      {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.region}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium dark:text-white mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 dark:text-gray-500" />
                    Paiement
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <div className="flex justify-between mb-2">
                      <span className="dark:text-gray-500">Methode</span>
                      <span className="font-medium">{getStatusLabel(selectedOrder.payment_method || '')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-gray-500">Statut</span>
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        getStatusColor(selectedOrder.payment_status)
                      )}>
                        {getStatusLabel(selectedOrder.payment_status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium dark:text-white mb-3">Articles</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map(item => (
                      <div key={item.id} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium dark:text-white">{item.product_name}</p>
                          <p className="text-sm dark:text-gray-500">x{item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatPrice(item.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between dark:text-gray-500">
                    <span>Sous-total</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Remise</span>
                      <span>-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between dark:text-gray-500">
                    <span>Livraison</span>
                    <span>{selectedOrder.shipping_fee === 0 ? 'Gratuite' : formatPrice(selectedOrder.shipping_fee)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold dark:text-white">
                    <span>Total</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          perPage={perPage}
          total={total}
          onPageChange={(page) => {
            setCurrentPage(page);
            fetchOrders(page);
          }}
        />
    </AdminLayout>
  );
}
