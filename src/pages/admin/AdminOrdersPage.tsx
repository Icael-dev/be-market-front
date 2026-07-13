import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchAdminOrders, updateAdminOrder } from '../../services/admin';
import { formatPrice, getStatusColor, getStatusLabel } from '../../lib/utils';
import { AdminLayout } from '../../components/admin/AdminLayout';
import type { Order } from '../../types';
import { Package, Search, Eye, Check, XCircle, Truck, PackageCheck, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const statusTransitions: Record<string, Order['status'][]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

const statusIcons: Record<string, typeof Check> = {
  confirmed: Check,
  cancelled: XCircle,
  shipped: Truck,
  delivered: PackageCheck,
  processing: Clock,
  pending: AlertCircle,
};

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setOrders(await fetchAdminOrders());
    } catch (err) {
      console.error('Orders fetch error:', err);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setUpdatingOrder(orderId);
    try {
      const updated = await updateAdminOrder(orderId, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery ||
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold dark:text-white">Commandes</h1>
          <p className="dark:text-gray-500 mt-1">{orders.length} commandes</p>
        </motion.div>

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
                type="text"
                placeholder="Rechercher par numero..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800 cursor-pointer"
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
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'inline-flex px-3 py-1 rounded-lg text-sm font-medium',
                          getStatusColor(order.status)
                        )}>
                          {getStatusLabel(order.status)}
                        </span>
                        {statusTransitions[order.status] && statusTransitions[order.status].length > 0 && (
                          <div className="flex items-center gap-1">
                            {statusTransitions[order.status].map(nextStatus => {
                              const Icon = statusIcons[nextStatus];
                              return (
                                <button
                                  key={nextStatus}
                                  onClick={() => updateOrderStatus(order.id, nextStatus)}
                                  disabled={updatingOrder === order.id}
                                  className={cn(
                                    'p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50',
                                    {
                                      'text-green-600': nextStatus === 'confirmed' || nextStatus === 'delivered' || nextStatus === 'shipped',
                                      'text-red-600': nextStatus === 'cancelled',
                                      'text-blue-600': nextStatus === 'processing',
                                    }
                                  )}
                                  title={`Passer à: ${getStatusLabel(nextStatus)}`}
                                >
                                  <Icon className="w-4 h-4" />
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
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
                      <div className="flex items-center justify-end">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="p-2 hover:bg-gray-100 hover:dark:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 dark:text-gray-500" />
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 dark:text-gray-500 mx-auto mb-4" />
            <p className="dark:text-gray-500">Aucune commande trouvee</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
