import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchAdminStatistics } from '../../services/admin';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { formatPrice } from '../../lib/utils';
import { DollarSign, ShoppingCart, Users, Package, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

type AdminStatsView = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  newCustomers: number;
  revenueChange: number;
  ordersChange: number;
  avgOrder: number;
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;
  statusData: Array<{ name: string; value: number }>;
  paymentData: Array<{ name: string; value: number }>;
};

export function AdminStatisticsPage() {
  const [stats, setStats] = useState<AdminStatsView | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    void fetchStats();
  }, [days]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminStatistics(Number(days));

      setStats({
        totalRevenue: data.period_revenue,
        totalOrders: data.period_orders,
        totalProducts: data.total_products,
        newCustomers: data.new_customers,
        revenueChange: data.revenue_change,
        ordersChange: data.orders_change,
        avgOrder: data.avg_order,
        dailyRevenue: data.daily_revenue,
        statusData: data.status_data,
        paymentData: data.payment_data,
      });
    } catch (error) {
      console.error('Stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!stats) return;

    const csv = [
      ['Date', 'Revenus', 'Commandes'],
      ...stats.dailyRevenue.map(d => [d.date, d.revenue, d.orders]),
    ]
      .map(r => r.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `stats-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const cards = stats
    ? [
        {
          title: 'Revenus',
          value: formatPrice(stats.totalRevenue),
          change: stats.revenueChange,
          icon: DollarSign,
          gradient: 'from-green-500 to-emerald-500',
        },
        {
          title: 'Commandes',
          value: stats.totalOrders.toString(),
          change: stats.ordersChange,
          icon: ShoppingCart,
          gradient: 'from-primary-500 to-cyan-500',
        },
        {
          title: 'Nouveaux clients',
          value: stats.newCustomers.toString(),
          change: 0,
          icon: Users,
          gradient: 'from-purple-500 to-pink-500',
        },
        {
          title: 'Panier moyen',
          value: formatPrice(stats.avgOrder),
          change: 0,
          icon: Package,
          gradient: 'from-orange-500 to-amber-500',
        },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <PageHeader
          title="Statistiques"
          subtitle="Performances de la boutique"
        >
          <div className="flex gap-3">
            <select
              value={days}
              onChange={e => setDays(e.target.value as '7' | '30' | '90')}
              className="px-4 py-2 border dark:border-gray-700 rounded-xl"
            >
              <option value="7">7 jours</option>
              <option value="30">30 jours</option>
              <option value="90">90 jours</option>
            </select>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800"
            >
              <Download className="w-4 h-4" /> Exporter
            </button>
          </div>
        </PageHeader>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 dark:border-gray-700 border-t-primary-600 rounded-full" />
          </div>
        ) : (
          stats && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map((c, i) => (
                  <motion.div
                    key={c.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center`}
                      >
                        <c.icon className="w-6 h-6 text-white" />
                      </div>
                      {c.change !== 0 && (
                        <div
                          className={`flex items-center gap-1 text-sm ${c.change >= 0 ? 'text-green-600' : 'text-red-500'}`}
                        >
                          {c.change >= 0 ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          {Math.abs(c.change).toFixed(1)}%
                        </div>
                      )}
                    </div>
                    <p className="text-2xl font-bold dark:text-white">{c.value}</p>
                    <p className="text-sm dark:text-gray-400 mt-1">{c.title}</p>
                  </motion.div>
                ))}
              </div>

<div className="grid lg:grid-cols-2 gap-6 min-h-0">
                 <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6 min-h-0 flex flex-col">
                   <h3 className="text-lg font-bold dark:text-white mb-4">Revenus quotidiens</h3>
                   <div className="h-64 flex-1 min-h-0">
                     <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={stats.dailyRevenue}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                         <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                         <YAxis
                           tick={{ fontSize: 12 }}
                           stroke="#9CA3AF"
                           tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                         />
                         <Tooltip
                           formatter={(value) => formatPrice(Number(value) || 0)}
                           contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '12px', color: 'white' }}
                         />
                         <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F620" />
                       </AreaChart>
                     </ResponsiveContainer>
                   </div>
                 </div>

                 <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6 min-h-0 flex flex-col">
                   <h3 className="text-lg font-bold dark:text-white mb-4">Commandes par jour</h3>
                   <div className="h-64 flex-1 min-h-0">
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={stats.dailyRevenue}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                         <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                         <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                         <Tooltip contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '12px', color: 'white' }} />
                         <Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                 </div>

                 <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6 min-h-0 flex flex-col">
                   <h3 className="text-lg font-bold dark:text-white mb-4">Statuts commandes</h3>
                   <div className="h-48 flex-1 min-h-0">
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie
                           data={stats.statusData}
                           cx="50%"
                           cy="50%"
                           innerRadius={50}
                           outerRadius={70}
                           dataKey="value"
                           label={({ name, value }) => `${name}: ${value}`}
                         >
                           {stats.statusData.map((row, i) => (
                             <Cell key={row.name} fill={COLORS[i % COLORS.length]} />
                           ))}
                         </Pie>
                         <Tooltip />
                       </PieChart>
                     </ResponsiveContainer>
                   </div>
                 </div>

                 <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6 min-h-0 flex flex-col">
                   <h3 className="text-lg font-bold dark:text-white mb-4">Methodes paiement</h3>
                   <div className="h-48 flex-1 min-h-0">
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie
                           data={stats.paymentData}
                           cx="50%"
                           cy="50%"
                           innerRadius={50}
                           outerRadius={70}
                           dataKey="value"
                           label={({ name, value }) => `${name}: ${value}`}
                         >
                           {stats.paymentData.map((row, i) => (
                             <Cell key={row.name} fill={COLORS[i % COLORS.length]} />
                           ))}
                         </Pie>
                         <Tooltip />
                       </PieChart>
                     </ResponsiveContainer>
                   </div>
                 </div>
               </div>
            </>
          )
        )}
      </div>
    </AdminLayout>
  );
}

