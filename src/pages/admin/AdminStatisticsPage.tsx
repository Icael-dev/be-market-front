import { useEffect, useState, useCallback } from 'react';
import { logger } from '../../lib/logger';
import { motion } from 'framer-motion';
import { fetchAdminStatistics, fetchAdminTopProducts, fetchAdminLowStock, fetchAdminCouponStats, fetchAdminCategorySales, type TopProduct, type LowStockProduct, type CouponStatsResponse, type CategorySale } from '../../services/admin';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../lib/utils';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown, Download, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { useElementWidth } from '../../hooks/useElementWidth';
import { AdminTable, type Column } from '../../components/admin/AdminTable';

function ChartBox({ height, children }: { height: number; children: (props: { width: number }) => React.ReactNode }) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  return (
    <div ref={ref} className="w-full min-h-0" style={{ height }}>
      {width > 0 && children({ width })}
    </div>
  );
}

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
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [couponStats, setCouponStats] = useState<CouponStatsResponse | null>(null);
  const [categorySales, setCategorySales] = useState<CategorySale[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<'7' | '30' | '90'>('30');

  const fetchAllStats = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, topProductsData, lowStockData, couponStatsData, categorySalesData] = await Promise.all([
        fetchAdminStatistics(Number(days)),
        fetchAdminTopProducts(Number(days)),
        fetchAdminLowStock(),
        fetchAdminCouponStats(Number(days)),
        fetchAdminCategorySales(Number(days)),
      ]);

      setStats({
        totalRevenue: statsData.total_revenue,
        totalOrders: statsData.total_orders,
        totalProducts: statsData.total_products,
        newCustomers: statsData.new_customers,
        revenueChange: statsData.revenue_change,
        ordersChange: statsData.orders_change,
        avgOrder: statsData.avg_order,
        dailyRevenue: statsData.daily_revenue,
        statusData: statsData.status_data,
        paymentData: statsData.payment_data,
      });
      setTopProducts(topProductsData);
      setLowStock(lowStockData);
      setCouponStats(couponStatsData);
      setCategorySales(categorySalesData);
    } catch (error) {
      logger.error('Stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void fetchAllStats();
  }, [days, fetchAllStats]);

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

  const topProductsColumns: Column<TopProduct>[] = [
    {
      key: 'product_name',
      label: 'Produit',
    },
    {
      key: 'total_quantity',
      label: 'Quantite',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
    },
    {
      key: 'total_revenue',
      label: 'Revenu',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (item) => formatPrice(item.total_revenue),
    },
  ];

  const lowStockColumns: Column<LowStockProduct>[] = [
    {
      key: 'name',
      label: 'Produit',
    },
    {
      key: 'sku',
      label: 'SKU',
      cellClassName: 'font-mono text-xs',
    },
    {
      key: 'stock',
      label: 'Stock',
      headerClassName: 'text-right',
      cellClassName: 'text-right font-medium',
      render: (item) => (
        <span className={item.stock === 0 ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}>
          {item.stock}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Prix',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (item) => formatPrice(item.price),
    },
  ];

  const couponColumns: Column<{ code: string; discount_type: string; discount_value: number; usage_count: number }>[] = [
    {
      key: 'code',
      label: 'Code',
    },
    {
      key: 'discount_type',
      label: 'Type',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (item) => item.discount_type === 'percentage' ? `${item.discount_value}%` : `${item.discount_value} FCFA`,
    },
    {
      key: 'usage_count',
      label: 'Utilisations',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
    },
  ];

  const categorySalesColumns: Column<CategorySale>[] = [
    {
      key: 'category_name',
      label: 'Categorie',
    },
    {
      key: 'orders_count',
      label: 'Commandes',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
    },
    {
      key: 'total_quantity',
      label: 'Quantite',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
    },
    {
      key: 'total_revenue',
      label: 'Revenu',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (item) => formatPrice(item.total_revenue),
    },
  ];

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader
          title="Statistiques"
          subtitle="Performances de la boutique"
        >
          <div className="flex gap-3">
            <select
              id="stats-days"
              name="stats-days"
              value={days}
              onChange={e => setDays(e.target.value as '7' | '30' | '90')}
              className="px-4 py-2 border dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
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
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
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

              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold dark:text-white mb-4">Revenus quotidiens</h3>
                  <ChartBox height={320}>
                    {({ width }) => (
                      <ResponsiveContainer width={width || '100%'} height={320}>
                        <AreaChart data={stats.dailyRevenue}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                          <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                          <Tooltip formatter={(value) => formatPrice(Number(value) || 0)} contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '12px', color: 'white' }} />
                          <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F620" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </ChartBox>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold dark:text-white mb-4">Commandes par jour</h3>
                  <ChartBox height={320}>
                    {({ width }) => (
                      <ResponsiveContainer width={width || '100%'} height={320}>
                        <BarChart data={stats.dailyRevenue}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                          <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                          <Tooltip contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '12px', color: 'white' }} />
                          <Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </ChartBox>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                    Top 5 produits vendus
                    <Link to="/admin/statistics/top-products" className="ml-auto text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                      Voir plus <ArrowRight className="w-3 h-3" />
                    </Link>
                  </h3>
                  <AdminTable
                    data={topProducts.slice(0, 5)}
                    columns={topProductsColumns}
                    keyExtractor={(item) => item.product_id}
                    emptyIcon={Package}
                    emptyMessage="Aucune donnee"
                  />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                    Stock bas / rupture
                    <Link to="/admin/statistics/low-stock" className="ml-auto text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                      Voir plus <ArrowRight className="w-3 h-3" />
                    </Link>
                  </h3>
                  <AdminTable
                    data={lowStock.slice(0, 5)}
                    columns={lowStockColumns}
                    keyExtractor={(item) => item.id}
                    emptyIcon={Package}
                    emptyMessage="Aucun produit en stock bas"
                  />
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                    Impact des coupons
                    <Link to="/admin/statistics/coupons" className="ml-auto text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                      Voir plus <ArrowRight className="w-3 h-3" />
                    </Link>
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Coupons utilises</p>
                      <p className="text-2xl font-bold dark:text-white">{couponStats?.total_coupon_usages ?? 0}</p>
                    </div>
                  </div>
                  <AdminTable
                       data={couponStats?.coupons_used.slice(0, 3) ?? []}
                    columns={couponColumns}
                    keyExtractor={(item) => item.code}
                    emptyIcon={Package}
                    emptyMessage="Aucun coupon utilise"
                  />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                    Ventes par categorie
                    <Link to="/admin/statistics/category-sales" className="ml-auto text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                      Voir plus <ArrowRight className="w-3 h-3" />
                    </Link>
                  </h3>
                  <AdminTable
                    data={categorySales.slice(0, 5)}
                    columns={categorySalesColumns}
                    keyExtractor={(item) => item.category_id}
                    emptyIcon={Package}
                    emptyMessage="Aucune vente"
                  />
                </div>
              </div>
            </>
          )
        )}
      </div>
    </>
  );
}
