import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { fetchAdminOrders, updateAdminOrder } from '../../services/admin';
import { formatPrice, getStatusColor, getStatusLabel } from '../../lib/utils';
import { cn } from '../../lib/utils';
import type { Order } from '../../types';
import {
  Package,
  MapPin,
  CreditCard,
  Calendar,
  ArrowLeft,
  Save,
  Check,
  XCircle,
  Truck,
  PackageCheck,
  Clock,
  AlertCircle
} from 'lucide-react';

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

const paymentStatusIcons: Record<string, typeof Check> = {
  paid: Check,
  failed: XCircle,
  processing: Clock,
  pending: AlertCircle,
  refunded: PackageCheck,
};

export function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    status: '' as Order['status'],
    payment_status: '' as Order['payment_status'],
    notes: '',
  });

  useEffect(() => {
    if (id) {
      fetchOrder(id);
    }
  }, [id]);

  const fetchOrder = async (orderId: string) => {
    try {
      const orders = await fetchAdminOrders();
      const found = orders.find(o => o.id === orderId);
      if (found) {
        setOrder(found);
        setFormData({
          status: found.status,
          payment_status: found.payment_status as Order['payment_status'],
          notes: found.notes || '',
        });
      }
    } catch (err) {
      console.error('Order fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!order) return;

    setSaving(true);
    try {
      const updated = await updateAdminOrder(order.id, formData);
      setOrder(updated);
    } catch (err) {
      console.error('Update error:', err);
      alert('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const updateOrderStatusAndSave = async (orderId: string, status: Order['status']) => {
    setSaving(true);
    try {
      const updated = await updateAdminOrder(orderId, { status, ...formData });
      setOrder(updated);
      setFormData({ ...formData, status });
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-xl font-bold dark:text-white">Commande introuvable</h1>
          <Link to="/admin/orders" className="text-blue-600 hover:underline mt-4 inline-block">
            Retour aux commandes
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/admin/orders"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold dark:text-white">{order.order_number}</h1>
              <p className="dark:text-gray-500">
                {new Date(order.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6">
              <h2 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Articles commandés
              </h2>
              <div className="space-y-3">
                {order.items?.map(item => (
                  <div key={item.id} className="flex justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                      <p className="font-medium dark:text-white">{item.product_name}</p>
                      <p className="text-sm dark:text-gray-500">x{item.quantity}</p>
                      {item.product_sku && (
                        <p className="text-xs dark:text-gray-500">SKU: {item.product_sku}</p>
                      )}
                    </div>
                    <p className="font-medium">{formatPrice(item.total)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t dark:border-gray-700 space-y-2">
                <div className="flex justify-between dark:text-gray-500">
                  <span>Sous-total</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Remise</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between dark:text-gray-500">
                  <span>Livraison</span>
                  <span>{order.shipping_fee === 0 ? 'Gratuite' : formatPrice(order.shipping_fee)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold dark:text-white">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6">
              <h2 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Adresse de livraison
              </h2>
              <div className="dark:text-gray-500 space-y-1">
                <p className="font-medium dark:text-white">{order.shipping_address?.full_name}</p>
                <p>{order.shipping_address?.phone}</p>
                <p>{order.shipping_address?.address_line1}</p>
                {order.shipping_address?.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                <p>{order.shipping_address?.city}, {order.shipping_address?.region}</p>
                <p>{order.shipping_address?.country}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6">
              <h2 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Paiement
              </h2>
              <div className="space-y-3">
                <p className="text-sm dark:text-gray-500">
                  Méthode: {getStatusLabel(order.payment_method || '')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'processing', 'paid', 'failed', 'refunded'].map(status => {
                    const Icon = paymentStatusIcons[status];
                    const isActive = formData.payment_status === status;
                    return (
                      <button
                        key={status}
                        onClick={() => setFormData({ ...formData, payment_status: status as Order['payment_status'] })}
                        className={cn(
                          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                          isActive
                            ? cn('ring-2 ring-offset-2', getStatusColor(status).replace('bg-', 'ring-').replace('text-', ''))
                            : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {getStatusLabel(status)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6">
              <h2 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Statut de la commande
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium dark:text-gray-500 mb-2">Statut actuel</p>
                  <span className={cn(
                    'inline-flex px-3 py-1.5 rounded-lg text-sm font-medium',
                    getStatusColor(formData.status)
                  )}>
                    {getStatusLabel(formData.status)}
                  </span>
                </div>

                {statusTransitions[formData.status] && statusTransitions[formData.status].length > 0 && (
                  <div>
                    <p className="text-sm font-medium dark:text-gray-500 mb-2">Actions disponibles</p>
                    <div className="flex flex-wrap gap-2">
                      {statusTransitions[formData.status].map(nextStatus => {
                        const Icon = statusIcons[nextStatus];
                        return (
                          <button
                            key={nextStatus}
                            onClick={() => updateOrderStatusAndSave(order.id, nextStatus)}
                            disabled={saving}
                            className={cn(
                              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50',
                              {
                                'bg-green-100 text-green-700 hover:bg-green-200': nextStatus === 'confirmed' || nextStatus === 'delivered' || nextStatus === 'shipped',
                                'bg-red-100 text-red-700 hover:bg-red-200': nextStatus === 'cancelled',
                                'bg-blue-100 text-blue-700 hover:bg-blue-200': nextStatus === 'processing',
                              }
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            {nextStatus === 'confirmed' && 'Confirmer'}
                            {nextStatus === 'processing' && 'Traiter'}
                            {nextStatus === 'shipped' && 'Expedier'}
                            {nextStatus === 'delivered' && 'Livrer'}
                            {nextStatus === 'cancelled' && 'Annuler'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium dark:text-gray-500 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="Ajouter des notes..."
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Sauvegarde...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}