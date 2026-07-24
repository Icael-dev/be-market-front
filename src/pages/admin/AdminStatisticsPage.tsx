import { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { fetchAdminStatistics, fetchAdminTopProducts, fetchAdminLowStock, fetchAdminCouponStats, fetchAdminCategorySales, type TopProduct, type LowStockProduct, type CouponStatsResponse, type CategorySale } from '../../services/admin';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { formatPrice } from '../../lib/utils';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown, Download, AlertTriangle, Ticket, Tag } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

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
      console.error('Stats fetch error:', error);
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

  return (
    <AdminLayout>
      <MobileNotOptimizedBanner />
      <div className="p-6 lg:p-8">
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
                  <h3 className="text-lg font-bold dark:text-white mb-4">Top 10 produits vendus</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b dark:border-gray-700">
                          <th className="text-left py-2 px-3 dark:text-gray-400">Produit</th>
                          <th className="text-right py-2 px-3 dark:text-gray-400">Quantite</th>
                          <th className="text-right py-2 px-3 dark:text-gray-400">Revenu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-gray-700">
                        {topProducts.map((product, i) => (
                          <tr key={product.product_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="py-3 px-3 dark:text-white">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                {product.product_name}
                              </div>
                            </td>
                            <td className="text-right py-3 px-3 dark:text-gray-300">{product.total_quantity}</td>
                            <td className="text-right py-3 px-3 dark:text-gray-300">{formatPrice(product.total_revenue)}</td>
                          </tr>
                        ))}
                        {topProducts.length === 0 && (
                          <tr><td colSpan={3} className="text-center py-8 text-gray-500 dark:text-gray-400">Aucune donnee</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Stock bas / rupture
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b dark:border-gray-700">
                          <th className="text-left py-2 px-3 dark:text-gray-400">Produit</th>
                          <th className="text-left py-2 px-3 dark:text-gray-400">SKU</th>
                          <th className="text-right py-2 px-3 dark:text-gray-400">Stock</th>
                          <th className="text-right py-2 px-3 dark:text-gray-400">Prix</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-gray-700">
                        {lowStock.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="py-3 px-3 dark:text-white">{product.name}</td>
                            <td className="py-3 px-3 dark:text-gray-400 font-mono text-xs">{product.sku}</td>
                            <td className={`text-right py-3 px-3 font-medium ${product.stock === 0 ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                              {product.stock}
                            </td>
                            <td className="text-right py-3 px-3 dark:text-gray-300">{formatPrice(product.price)}</td>
                          </tr>
                        ))}
                        {lowStock.length === 0 && (
                          <tr><td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">Aucun produit en stock bas</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

                  <div className="grid lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6">
                      <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-purple-500" />
                        Impact des coupons
                      </h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Coupons utilises</p>
                          <p className="text-2xl font-bold dark:text-white">{couponStats?.total_coupon_usages ?? 0}</p>
                        </div>
                      </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b dark:border-gray-700">
                          <th className="text-left py-2 px-3 dark:text-gray-400">Code</th>
                          <th className="text-right py-2 px-3 dark:text-gray-400">Type</th>
                          <th className="text-right py-2 px-3 dark:text-gray-400">Utilisations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-gray-700">
                        {couponStats?.coupons_used.map((coupon) => (
                          <tr key={coupon.code} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="py-3 px-3 dark:text-white font-mono">{coupon.code}</td>
                            <td className="text-right py-3 px-3 dark:text-gray-300">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `${coupon.discount_value} FCFA`}</td>
                            <td className="text-right py-3 px-3 dark:text-gray-300">{coupon.usage_count}</td>
                          </tr>
                        ))}
                        {(!couponStats || couponStats.coupons_used.length === 0) && (
                          <tr><td colSpan={3} className="text-center py-8 text-gray-500 dark:text-gray-400">Aucun coupon utilise</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-cyan-500" />
                    Ventes par categorie
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b dark:border-gray-700">
                          <th className="text-left py-2 px-3 dark:text-gray-400">Categorie</th>
                          <th className="text-right py-2 px-3 dark:text-gray-400">Commandes</th>
                          <th className="text-right py-2 px-3 dark:text-gray-400">Quantite</th>
                          <th className="text-right py-2 px-3 dark:text-gray-400">Revenu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-gray-700">
                        {categorySales.map((cat) => (
                          <tr key={cat.category_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="py-3 px-3 dark:text-white">{cat.category_name}</td>
                            <td className="text-right py-3 px-3 dark:text-gray-300">{cat.orders_count}</td>
                            <td className="text-right py-3 px-3 dark:text-gray-300">{cat.total_quantity}</td>
                            <td className="text-right py-3 px-3 dark:text-gray-300">{formatPrice(cat.total_revenue)}</td>
                          </tr>
                        ))}
                        {categorySales.length === 0 && (
                          <tr><td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">Aucune vente</td></tr>
                        )}
                      </tbody>
                    </table>
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
