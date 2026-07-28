import { useEffect, useState } from 'react';
import { logger } from '../../lib/logger';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchAdminOrders, fetchAdminStatistics, fetchAdminTopProducts, fetchAdminLowStock } from '../../services/admin';
import { formatPrice, getStatusColor, getStatusLabel } from '../../lib/utils';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Plus,
  Tag as TagIcon,
  BarChart3
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Order } from '../../types';

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
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Array<{ name: string; count: number; revenue: number }>>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Array<{ name: string; stock: number }>>([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [statusData, setStatusData] = useState<Array<{ name: string; value: number }>>([]);
  const [dailyRevenue, setDailyRevenue] = useState<Array<{ date: string; revenue: number }>>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes, topProductsRes, lowStockRes] = await Promise.all([
        fetchAdminStatistics(),
        fetchAdminOrders({ per_page: 10 }),
        fetchAdminTopProducts(),
        fetchAdminLowStock(),
      ]);

      const stats = statsRes;
      const totalRevenue = stats.total_revenue || 0;
      const totalOrders = stats.total_orders || 0;
      const totalCustomers = stats.total_customers || 0;
      const avgOrder = stats.avg_order || 0;
      const newCustomers = stats.new_customers || 0;

      setStats([
        {
          label: 'Chiffre d\'affaires',
          value: formatPrice(totalRevenue),
          change: `${stats.revenue_change >= 0 ? '+' : ''}${stats.revenue_change}%`,
          changeType: stats.revenue_change >= 0 ? 'up' : 'down',
          icon: DollarSign,
          color: 'blue'
        },
        {
          label: 'Commandes',
          value: totalOrders,
          change: `${stats.orders_change >= 0 ? '+' : ''}${stats.orders_change}%`,
          changeType: stats.orders_change >= 0 ? 'up' : 'down',
          icon: Package,
          color: 'green'
        },
        {
          label: 'Panier moyen',
          value: formatPrice(avgOrder),
          icon: ShoppingBag,
          color: 'purple'
        },
        {
          label: 'Clients',
          value: totalCustomers,
          icon: Users,
          color: 'cyan'
        },
        {
          label: 'Nouveaux clients',
          value: newCustomers,
          icon: Users,
          color: 'orange'
        }
      ]);

      setStatusData(stats.status_data || []);
      setDailyRevenue((stats.daily_revenue || []).map(d => ({ date: d.date, revenue: d.revenue })));

      if (ordersRes) {
        const orders = ordersRes.data;
        setRecentOrders(orders.slice(0, 10));
        const pendingCount = orders.filter(o => o.status === 'pending' || o.payment_status === 'pending').length;
        setPendingOrdersCount(pendingCount);
      }

      setTopProducts(
        topProductsRes.map(p => ({
          name: p.product_name,
          count: p.total_quantity,
          revenue: p.total_revenue,
        }))
      );

      setLowStockProducts(
        lowStockRes.map(p => ({
          name: p.name,
          stock: p.stock,
        }))
      );

    } catch (error) {
      logger.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const colorClasses: Record<string, string> = {
    blue: 'dark:bg-blue-900/30 dark:text-blue-400',
    green: 'dark:bg-green-900/30 dark:text-green-400',
    purple: 'dark:bg-purple-900/30 dark:text-purple-400',
    cyan: 'dark:bg-cyan-900/30 dark:text-cyan-400',
    orange: 'dark:bg-orange-900/30 dark:text-orange-400',
    red: 'dark:bg-red-900/30 dark:text-red-400',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-10 h-10 border-2 dark:border-gray-700 border-t-blue-600 rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <MobileNotOptimizedBanner />
      <div className="p-6 lg:p-8">
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
                <div className={`w-12 h-12 rounded-xl ${colorClasses[stat.color]} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                {stat.change && (
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.changeType === 'up' ? 'dark:text-green-400' : 'dark:text-red-400'
                  }`}>
                    {stat.changeType === 'up' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {stat.change}
                  </div>
                )}
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
              to="/admin/orders"
              className="flex items-center gap-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl ${colorClasses.orange} flex items-center justify-center`}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium dark:text-white">{pendingOrdersCount} commande{pendingOrdersCount > 1 ? 's' : ''} en attente de traitement</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cliquez pour voir les commandes à traiter</p>
              </div>
            </Link>
          </motion.div>
        )}

        {lowStockProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Stock bas ({lowStockProducts.length})
                </h2>
                <Link to="/admin/products" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Voir tout
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStockProducts.slice(0, 6).map((product) => (
                  <div key={product.name} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="font-medium dark:text-white text-sm truncate">{product.name}</p>
                    <span className={`text-sm font-medium ml-2 ${product.stock === 0 ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      {product.stock === 0 ? 'Rupture' : product.stock}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {statusData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6">
              <h2 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Statuts des commandes
              </h2>
              <div className="flex flex-wrap gap-3">
                {statusData.map((status) => (
                  <div key={status.name} className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <span className={`w-3 h-3 rounded-full ${statusColors[status.name.toLowerCase()] || 'bg-gray-400'}`} />
                    <span className="text-sm dark:text-gray-300">{status.name}</span>
                    <span className="text-sm font-bold dark:text-white">{status.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {dailyRevenue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
              <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6">
               <h2 className="font-bold dark:text-white mb-4">Tendance des revenus</h2>
                <div className="w-full" style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={dailyRevenue}>
                       <defs>
                         <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                       <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                       <Tooltip
                         formatter={(value) => formatPrice(Number(value))}
                         contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '12px', color: 'white' }}
                       />
                        <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
            </motion.div>
          )}

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold dark:text-white">Commandes recentes</h2>
              <Link to="/admin/orders" className="dark:text-blue-400 text-sm font-medium hover:underline">
                Voir tout
              </Link>
            </div>

            <div className="space-y-4">
              {recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b dark:border-gray-700 last:border-0">
                  <div>
                    <p className="font-medium dark:text-white text-sm">{order.order_number}</p>
                    <p className="text-xs dark:text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium dark:text-white">{formatPrice(order.total)}</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold dark:text-white">Produits populaires</h2>
            </div>

            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between py-3 border-b dark:border-gray-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium dark:text-white text-sm">{product.name}</p>
                      <p className="text-xs dark:text-gray-500">{formatPrice(product.revenue)}</p>
                    </div>
                  </div>
                  <p className="text-sm dark:text-gray-500">{product.count} ventes</p>
                </div>
              ))}

              {topProducts.length === 0 && (
                <p className="text-center dark:text-gray-500 py-8">Aucune vente encore</p>
              )}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Link to="/admin/products/new" className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 flex items-center gap-3 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium dark:text-white text-sm">Ajouter produit</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Nouvelle fiche</p>
            </div>
          </Link>

          <Link to="/admin/coupons/new" className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 flex items-center gap-3 hover:border-purple-500 dark:hover:border-purple-500 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TagIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium dark:text-white text-sm">Creer coupon</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Promotion</p>
            </div>
          </Link>

          <Link to="/admin/orders" className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 flex items-center gap-3 hover:border-green-500 dark:hover:border-green-500 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium dark:text-white text-sm">Commandes</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Voir tout</p>
            </div>
          </Link>

          <Link to="/admin/statistics" className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 flex items-center gap-3 hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors">
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
    </AdminLayout>
  );
}
