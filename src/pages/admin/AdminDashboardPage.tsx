import { useEffect, useState, useCallback } from 'react';
import { logger } from '../../lib/logger';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  fetchAdminOrders,
  fetchAdminStatistics,
  fetchAdminSupportTickets,
  fetchAdminCoupons,
  fetchAdminFlashSales,
  fetchAdminCategorySales,
  fetchAdminNewCustomers,
  fetchAdminTopCustomers,
  fetchAdminUnsoldProducts,
  fetchAdminFailedPayments,
} from '../../services/admin';
import { getStatusLabel, getStatusColor, formatPrice } from '../../lib/utils';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import {
  Clock,
  Plus,
  Tag as TagIcon,
  BarChart3,
  Headphones,
  Zap,
  TrendingUp,
  Package,
  AlertCircle,
  ShoppingBag,
  User,
  ArrowRight,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { SupportTicket } from '../../types';

interface Stat {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stat[]>([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [statusData, setStatusData] = useState<Array<{ name: string; value: number }>>([]);
  const [categorySales, setCategorySales] = useState<
    Array<{ name: string; total_quantity: number; total_revenue: number }>
  >([]);
  const [newCustomers, setNewCustomers] = useState<
    Array<{ id: string; full_name: string; email: string; created_at: string }>
  >([]);
  const [topCustomers, setTopCustomers] = useState<
    Array<{ name: string; email: string; total_spent: number; orders_count: number }>
  >([]);
  const [unsoldProducts, setUnsoldProducts] = useState<
    Array<{ id: string; name: string; stock: number; price: number }>
  >([]);
  const [failedPayments, setFailedPayments] = useState<
    Array<{ id: string; order_number: string; payment_method: string; total: number; status: string }>
  >([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [
        statsRes,
        ordersRes,
        supportRes,
        couponsRes,
        flashSalesRes,
        categorySalesRes,
        newCustomersRes,
        topCustomersRes,
        unsoldProductsRes,
        failedPaymentsRes,
      ] = await Promise.all([
        fetchAdminStatistics(),
        fetchAdminOrders({ per_page: 10 }),
        fetchAdminSupportTickets({ status: 'open', per_page: 10 }),
        fetchAdminCoupons(),
        fetchAdminFlashSales(),
        fetchAdminCategorySales(),
        fetchAdminNewCustomers(),
        fetchAdminTopCustomers(),
        fetchAdminUnsoldProducts(),
        fetchAdminFailedPayments(),
      ]);

      const stats = statsRes;

      let pendingCount = 0;
      if (ordersRes.data) {
        const orders = ordersRes.data;
        pendingCount = orders.filter(o => o.status === 'pending' || o.payment_status === 'pending').length;
        setPendingOrdersCount(pendingCount);
      }

      setSupportTickets(supportRes.data || []);
      setStatusData(stats.status_data || []);
      setCategorySales(
        categorySalesRes.slice(0, 8).map(item => ({
          name: item.category_name,
          total_quantity: item.total_quantity,
          total_revenue: item.total_revenue,
        }))
      );

      setNewCustomers(newCustomersRes.slice(0, 5));
      setTopCustomers(topCustomersRes.slice(0, 5));
      setUnsoldProducts(unsoldProductsRes);
      setFailedPayments(failedPaymentsRes.slice(0, 5));

      const activeCoupons = couponsRes.filter(c => c.is_active).length;
      const activeFlashSales = flashSalesRes.filter(f => f.is_active).length;
      const openTickets = supportRes.data?.length || 0;

      setStats([
        {
          label: 'Commandes en attente',
          value: pendingCount,
          icon: Clock,
          color: 'orange',
        },
        {
          label: 'Tickets support',
          value: openTickets,
          icon: Headphones,
          color: 'blue',
        },
        {
          label: 'Codes promo actifs',
          value: activeCoupons,
          icon: TagIcon,
          color: 'purple',
        },
        {
          label: 'Ventes flash',
          value: activeFlashSales,
          icon: Zap,
          color: 'green',
        },
      ]);
    } catch (error) {
      logger.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const colorClasses: Record<string, string> = {
    blue: 'dark:bg-blue-900/30 dark:text-blue-400',
    green: 'dark:bg-green-900/30 dark:text-green-400',
    purple: 'dark:bg-purple-900/30 dark:text-purple-400',
    cyan: 'dark:bg-cyan-900/30 dark:text-cyan-400',
    orange: 'dark:bg-orange-900/30 dark:text-orange-400',
    red: 'dark:bg-red-900/30 dark:text-red-400',
  };

  if (loading) {
    return (
      <>
        <div className=" flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-10 h-10 border-2 dark:border-gray-700 border-t-blue-600 rounded-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de votre boutique" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl ${colorClasses[stat.color]} flex items-center justify-center`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-2xl font-bold dark:text-white">{stat.value}</p>
              <p className="text-sm dark:text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {pendingOrdersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Link
              to="/admin/orders?status=pending"
              className="flex items-center gap-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl ${colorClasses.orange} flex items-center justify-center`}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium dark:text-white">
                  {pendingOrdersCount} commande{pendingOrdersCount > 1 ? 's' : ''} en attente de traitement
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cliquez pour voir les commandes à traiter</p>
              </div>
            </Link>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold dark:text-white flex items-center gap-2">
                <Headphones className="w-5 h-5 text-blue-500" />
                Tickets support récents
              </h2>
              <Link to="/admin/support" className="dark:text-blue-400 text-sm font-medium hover:underline">
                Voir tout
              </Link>
            </div>
            <div className="space-y-4">
              {supportTickets.length === 0 ? (
                <p className="text-center dark:text-gray-500 py-8">Aucun ticket ouvert</p>
              ) : supportTickets.slice(0, 5).map(ticket => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between py-3 border-b dark:border-gray-700 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium dark:text-white text-sm truncate">{ticket.subject}</p>
                    <p className="text-xs dark:text-gray-500">
                      {ticket.user?.email || ticket.profile?.full_name || '—'}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}
                    >
                      {getStatusLabel(ticket.status)}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6"
          >
            <h2 className="font-bold dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Statuts des commandes
            </h2>
            <div className="flex items-center">
              <div className="w-1/2">
                {statusData.length === 0 ? (
                  <p className="text-center dark:text-gray-500 py-8">Aucune donnée</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusData.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'][index % 5]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} commande(s)`, 'Total']}
                        contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '12px', color: 'white' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="w-1/2 pl-6 space-y-2">
                {statusData.map((status, idx) => (
                  <div key={status.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'][
                            idx % 5
                          ],
                        }}
                      />
                      <span className="text-sm dark:text-gray-300">{status.name}</span>
                    </div>
                    <span className="text-sm font-bold dark:text-white">{status.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-500" />
                Nouveaux clients
              </h2>
            </div>
            <div className="space-y-4">
              {newCustomers.length === 0 ? (
                <p className="text-center dark:text-gray-500 py-8">Aucun nouveau client</p>
              ) : newCustomers.map(customer => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between py-3 border-b dark:border-gray-700 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium dark:text-white text-sm truncate">{customer.full_name}</p>
                    <p className="text-xs dark:text-gray-500">{customer.email}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(customer.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                Meilleurs clients
              </h2>
            </div>
            <div className="space-y-4">
              {topCustomers.length === 0 ? (
                <p className="text-center dark:text-gray-500 py-8">Aucune donnée</p>
              ) : topCustomers.map((customer, index) => (
                <div
                  key={`${customer.email || 'customer'}-${index}`}
                  className="flex items-center justify-between py-3 border-b dark:border-gray-700 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium dark:text-white text-sm truncate">{customer.name}</p>
                    <p className="text-xs dark:text-gray-500">{customer.email}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold dark:text-white">{formatPrice(customer.total_spent)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {customer.orders_count} commande(s)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6"
          >
            <h2 className="font-bold dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Ventes par catégorie
            </h2>
            {categorySales.length === 0 ? (
              <p className="text-center dark:text-gray-500 py-8">Aucune donnée</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categorySales} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  />
                  <Tooltip
                    formatter={(value) => formatPrice(Number(value))}
                    contentStyle={{
                      background: '#1F2937',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                    }}
                  />
                  <Bar dataKey="total_revenue" radius={[0, 6, 6, 0]} fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Paiements échoués / bloqués
              </h2>
               <Link to="/admin/statistics/failed-payments" className="ml-auto text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                 Voir plus <ArrowRight className="w-3 h-3" />
               </Link>
            </div>
            <div className="space-y-4">
              {failedPayments.length === 0 ? (
                <p className="text-center dark:text-gray-500 py-8">Aucun paiement échoué</p>
              ) : failedPayments.map(order => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 border-b dark:border-gray-700 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium dark:text-white text-sm truncate">{order.order_number}</p>
                    <p className="text-xs dark:text-gray-500">{order.payment_method}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">
                      {formatPrice(order.total)}
                    </p>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6 mb-6"
        >
          <h2 className="font-bold dark:text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-500" />
            Produits invendus
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unsoldProducts.length === 0 ? (
              <p className="text-center dark:text-gray-500 py-8 sm:col-span-2 lg:col-span-3">
                Tous les produits ont été vendus
              </p>
            ) : unsoldProducts.map(product => (
              <div
                key={product.id}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
              >
                <p className="font-medium dark:text-white text-sm truncate">{product.name}</p>
                <span className="text-sm font-medium ml-2 text-orange-600 dark:text-orange-400">
                  Stock: {product.stock}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Link
            to="/admin/products/new"
            className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 flex items-center gap-3 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium dark:text-white text-sm">Ajouter produit</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Nouvelle fiche</p>
            </div>
          </Link>

          <Link
            to="/admin/coupons/new"
            className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 flex items-center gap-3 hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TagIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium dark:text-white text-sm">Créer coupon</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Promotion</p>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 flex items-center gap-3 hover:border-green-500 dark:hover:border-green-500 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium dark:text-white text-sm">Commandes</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Voir tout</p>
            </div>
          </Link>

          <Link
            to="/admin/statistics"
            className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 flex items-center gap-3 hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium dark:text-white text-sm">Statistiques</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Analyses</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
