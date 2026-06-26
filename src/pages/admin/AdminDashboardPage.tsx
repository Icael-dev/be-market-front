import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchAdminOrders, fetchAdminStatistics } from '../../services/admin';
import { formatPrice, getStatusColor, getStatusLabel } from '../../lib/utils';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

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
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetchAdminStatistics(),
        fetchAdminOrders()
      ]);

      const stats = statsRes as any;
      const totalRevenue = (stats as any).total_revenue || 0;
      const totalOrders = (stats as any).total_orders || 0;
      const totalProducts = (stats as any).total_products || 0;
      const totalCustomers = (stats as any).total_customers || 0;

      setStats([
        {
          label: 'Chiffre d\'affaires',
          value: formatPrice(totalRevenue),
          change: '+12%',
          changeType: 'up',
          icon: DollarSign,
          color: 'blue'
        },
        {
          label: 'Commandes totales',
          value: totalOrders,
          change: '+8%',
          changeType: 'up',
          icon: Package,
          color: 'green'
        },
        {
          label: 'Produits',
          value: totalProducts,
          icon: ShoppingBag,
          color: 'purple'
        },
        {
          label: 'Clients',
          value: totalCustomers,
          change: '+15%',
          changeType: 'up',
          icon: Users,
          color: 'cyan'
        }
      ]);

      if (ordersRes) {
        setRecentOrders(ordersRes.slice(0, 10));
      }

      const productSales: Record<string, { name: string; count: number }> = {};
      ordersRes?.forEach((order: any) => {
        order.items?.forEach((item: any) => {
          if (!productSales[item.product_name]) {
            productSales[item.product_name] = { name: item.product_name, count: 0 };
          }
          productSales[item.product_name].count += item.quantity;
        });
      });

      const sortedProducts = Object.values(productSales)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTopProducts(sortedProducts);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    cyan: 'bg-cyan-100 text-cyan-600'
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-10 h-10 border-2 border-gray-200 border-t-blue-600 rounded-full" />
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
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble de votre boutique</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${colorClasses[stat.color]} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                {stat.change && (
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.changeType === 'up' ? 'text-green-600' : 'text-red-600'
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
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900">Commandes recentes</h2>
              <a href="/admin/orders" className="text-blue-600 text-sm font-medium hover:underline">
                Voir tout
              </a>
            </div>

            <div className="space-y-4">
              {recentOrders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{order.order_number}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatPrice(order.total)}</p>
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
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900">Produits populaires</h2>
            </div>

            <div className="space-y-4">
              {topProducts.map((product: any, index: number) => (
                <div key={product.name} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                  </div>
                  <p className="text-sm text-gray-600">{product.count} ventes</p>
                </div>
              ))}

              {topProducts.length === 0 && (
                <p className="text-center text-gray-500 py-8">Aucune vente encore</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
