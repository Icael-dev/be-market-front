import { useEffect, useState, useCallback } from 'react';
import { logger } from '../../lib/logger';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  fetchAdminCustomer,
  fetchAdminCustomerOrders,
  fetchAdminCustomerLoyalty,
  fetchAdminCustomerPayments
} from '../../services/admin';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { AdminTable, type Column } from '../../components/admin/AdminTable';
import { Package, Gift, CreditCard, Loader2, ArrowLeft } from 'lucide-react';
import type { Order, LoyaltyPoints, LoyaltyTransaction, Payment, AdminCustomer } from '../../types';
import { formatPrice } from '../../lib/utils';
import { format } from 'date-fns';

type Tab = 'orders' | 'loyalty' | 'payments';

export function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>('orders');
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<AdminCustomer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loyalty, setLoyalty] = useState<{ points: LoyaltyPoints | null; transactions: LoyaltyTransaction[] }>({ points: null, transactions: [] });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [customerData, ordersData, loyaltyData, paymentsData] = await Promise.all([
        fetchAdminCustomer(id),
        fetchAdminCustomerOrders(id),
        fetchAdminCustomerLoyalty(id),
        fetchAdminCustomerPayments(id),
      ]);
      setCustomer(customerData);
      setOrders(ordersData);
      setLoyalty(loyaltyData);
      setPayments(paymentsData);
    } catch (error) {
      logger.error('Failed to load customer detail:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const totalOrderPages = Math.max(1, Math.ceil(orders.length / perPage));
  const paginatedOrders = orders.slice((currentPage - 1) * perPage, currentPage * perPage);

  const totalPaymentPages = Math.max(1, Math.ceil(payments.length / perPage));
  const paginatedPayments = payments.slice((currentPage - 1) * perPage, currentPage * perPage);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'orders', label: 'Commandes', icon: <Package className="w-4 h-4" /> },
    { key: 'loyalty', label: 'Points fidelite', icon: <Gift className="w-4 h-4" /> },
    { key: 'payments', label: 'Paiements', icon: <CreditCard className="w-4 h-4" /> },
  ];

  const orderColumns: Column<Order>[] = [
    {
      key: 'order_number',
      label: 'Commande',
      render: (order) => (
        <p className="font-medium dark:text-white">{order.order_number}</p>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (order) => (
        <span className="text-sm dark:text-gray-500">{format(new Date(order.created_at), 'dd/MM/yyyy')}</span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (order) => (
        <StatusBadge label={order.status} variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : order.status === 'pending' ? 'warning' : 'info'} />
      ),
    },
    {
      key: 'payment_status',
      label: 'Paiement',
      render: (order) => (
        <StatusBadge label={order.payment_status} variant={order.payment_status === 'paid' ? 'success' : order.payment_status === 'failed' || order.payment_status === 'refunded' ? 'danger' : 'warning'} />
      ),
    },
    {
      key: 'total',
      label: 'Total',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (order) => <span className="font-medium dark:text-white">{formatPrice(order.total)}</span>,
    },
  ];

  const paymentColumns: Column<Payment>[] = [
    {
      key: 'reference',
      label: 'Reference',
      render: (p) => <span className="font-mono text-sm dark:text-white">{p.reference || '—'}</span>,
    },
    {
      key: 'payment_method',
      label: 'Methode',
      render: (p) => <span className="text-sm dark:text-gray-500">{p.payment_method}</span>,
    },
    {
      key: 'amount',
      label: 'Montant',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (p) => <span className="text-sm font-medium dark:text-white">{formatPrice(p.amount)}</span>,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (p) => (
        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
          {p.status}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (p) => <span className="text-sm text-gray-500 dark:text-gray-500">{format(new Date(p.created_at), 'dd/MM/yyyy HH:mm')}</span>,
    },
  ];

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader
          title={customer?.full_name || 'Detail client'}
          subtitle={customer?.email || ''}
        >
          <Link
            to="/admin/customers"
            className="flex items-center gap-2 px-4 py-2.5 border dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        </PageHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-6">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => { setCurrentPage(1); setTab(t.key); }}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${tab === t.key
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'orders' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <AdminTable
                  data={paginatedOrders}
                  columns={orderColumns}
                  keyExtractor={(order) => order.id}

                  emptyIcon={Package}
                  emptyMessage="Aucune commande"
                  total={orders.length}
                  perPage={perPage}
                  currentPage={currentPage}
                  lastPage={totalOrderPages}
                  onPageChange={setCurrentPage}
                />
              </motion.div>
            )}

            {tab === 'loyalty' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="card p-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Points disponibles</p>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{loyalty.points?.points || 0}</p>
                  </div>
                  <div className="card p-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total gagnes</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{loyalty.points?.total_earned || 0}</p>
                  </div>
                  <div className="card p-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total utilises</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{loyalty.points?.total_redeemed || 0}</p>
                  </div>
                </div>

                <div className="card overflow-hidden">
                  <div className="px-6 py-4 border-b dark:border-gray-700">
                    <h3 className="font-bold dark:text-white">Transactions</h3>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {loyalty.transactions.length === 0 ? (
                      <p className="text-center py-8 text-gray-500 dark:text-gray-400">Aucune transaction</p>
                    ) : loyalty.transactions.map(t => (
                      <div key={t.id} className="flex items-center justify-between px-6 py-3">
                        <div>
                          <p className="font-medium dark:text-white">
                            {t.type === 'earned' ? 'Points gagnes' : t.type === 'redeemed' ? 'Points utilises' : 'Points expires'}
                          </p>
                          {t.description && <p className="text-sm text-gray-500 dark:text-gray-400">{t.description}</p>}
                          {t.order_id && (
                            <Link to={`/orders/${t.order_id}`} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                              Voir commande
                            </Link>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500">{format(new Date(t.created_at), 'dd/MM/yyyy HH:mm')}</p>
                        </div>
                        <span className={`font-bold ${t.type === 'earned' ? 'text-green-600' : 'text-red-500'}`}>
                          {t.type === 'earned' ? '+' : '-'}{Math.abs(t.points)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'payments' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <AdminTable
                  data={paginatedPayments}
                  columns={paymentColumns}
                  keyExtractor={(p) => p.id}

                  emptyIcon={CreditCard}
                  emptyMessage="Aucun paiement"
                  total={payments.length}
                  perPage={perPage}
                  currentPage={currentPage}
                  lastPage={totalPaymentPages}
                  onPageChange={setCurrentPage}
                />
              </motion.div>
            )}
          </>
        )}
      </div>
    </>
  );
}
