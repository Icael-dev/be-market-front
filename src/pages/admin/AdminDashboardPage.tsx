import { useEffect, useState, useCallback } from "react";
import { logger } from "../../lib/logger";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
} from "../../services/admin";
import { getStatusLabel, getStatusColor, formatPrice } from "../../lib/utils";
import { PageHeader } from "../../components/admin/PageHeader";
import { MobileNotOptimizedBanner } from "../../components/admin/MobileNotOptimizedBanner";
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
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { SupportTicket } from "../../types";

interface Stat {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down";
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
    Array<{
      id: string;
      order_number: string;
      payment_method: string;
      total: number;
      status: string;
    }>
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
        fetchAdminSupportTickets({ status: "open", per_page: 10 }),
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
        pendingCount = orders.filter(
          (o) => o.status === "pending" || o.payment_status === "pending"
        ).length;
        setPendingOrdersCount(pendingCount);
      }

      setSupportTickets(supportRes.data || []);
      setStatusData(stats.status_data || []);
      setCategorySales(
        categorySalesRes.slice(0, 8).map((item) => ({
          name: item.category_name,
          total_quantity: item.total_quantity,
          total_revenue: item.total_revenue,
        }))
      );

      setNewCustomers(newCustomersRes.slice(0, 5));
      setTopCustomers(topCustomersRes.slice(0, 5));
      setUnsoldProducts(unsoldProductsRes);
      setFailedPayments(failedPaymentsRes.slice(0, 5));

      const activeCoupons = couponsRes.filter((c) => c.is_active).length;
      const activeFlashSales = flashSalesRes.filter((f) => f.is_active).length;
      const openTickets = supportRes.data?.length || 0;

      setStats([
        {
          label: "Commandes en attente",
          value: pendingCount,
          icon: Clock,
          color: "orange",
        },
        {
          label: "Tickets support",
          value: openTickets,
          icon: Headphones,
          color: "blue",
        },
        {
          label: "Codes promo actifs",
          value: activeCoupons,
          icon: TagIcon,
          color: "purple",
        },
        {
          label: "Ventes flash",
          value: activeFlashSales,
          icon: Zap,
          color: "green",
        },
      ]);
    } catch (error) {
      logger.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const colorClasses: Record<string, string> = {
    blue: "dark:bg-blue-900/30 dark:text-blue-400",
    green: "dark:bg-green-900/30 dark:text-green-400",
    purple: "dark:bg-purple-900/30 dark:text-purple-400",
    cyan: "dark:bg-cyan-900/30 dark:text-cyan-400",
    orange: "dark:bg-orange-900/30 dark:text-orange-400",
    red: "dark:bg-red-900/30 dark:text-red-400",
  };

  if (loading) {
    return (
      <>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-t-blue-600 dark:border-gray-700" />
        </div>
      </>
    );
  }

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de votre boutique" />

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-4 flex items-center justify-between">
                <div
                  className={`h-12 w-12 rounded-lg ${colorClasses[stat.color]} flex items-center justify-center`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <p className="text-2xl font-bold dark:text-white">{stat.value}</p>
              <p className="mt-1 text-sm dark:text-gray-500">{stat.label}</p>
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
              className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 transition-colors hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-900/20 dark:hover:bg-orange-900/30"
            >
              <div
                className={`h-10 w-10 rounded-lg ${colorClasses.orange} flex items-center justify-center`}
              >
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium dark:text-white">
                  {pendingOrdersCount} commande{pendingOrdersCount > 1 ? "s" : ""} en attente de
                  traitement
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Cliquez pour voir les commandes à traiter
                </p>
              </div>
            </Link>
          </motion.div>
        )}

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold dark:text-white">
                <Headphones className="h-5 w-5 text-blue-500" />
                Tickets support récents
              </h2>
              <Link
                to="/admin/support"
                className="text-sm font-medium hover:underline dark:text-blue-400"
              >
                Voir tout
              </Link>
            </div>
            <div className="space-y-4">
              {supportTickets.length === 0 ? (
                <p className="py-8 text-center dark:text-gray-500">Aucun ticket ouvert</p>
              ) : (
                supportTickets.slice(0, 5).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between border-b py-3 last:border-0 dark:border-gray-700"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium dark:text-white">
                        {ticket.subject}
                      </p>
                      <p className="text-xs dark:text-gray-500">
                        {ticket.user?.email || ticket.profile?.full_name || "—"}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(ticket.status)}`}
                      >
                        {getStatusLabel(ticket.status)}
                      </span>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        {new Date(ticket.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <h2 className="mb-4 flex items-center gap-2 font-bold dark:text-white">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Statuts des commandes
            </h2>
            <div className="flex items-center">
              <div className="w-1/2">
                {statusData.length === 0 ? (
                  <p className="py-8 text-center dark:text-gray-500">Aucune donnée</p>
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
                            fill={
                              ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"][index % 5]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} commande(s)`, "Total"]}
                        contentStyle={{
                          background: "#1F2937",
                          border: "none",
                          borderRadius: "12px",
                          color: "white",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="w-1/2 space-y-2 pl-6">
                {statusData.map((status, idx) => (
                  <div key={status.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"][
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

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold dark:text-white">
                <User className="h-5 w-5 text-emerald-500" />
                Nouveaux clients
              </h2>
            </div>
            <div className="space-y-4">
              {newCustomers.length === 0 ? (
                <p className="py-8 text-center dark:text-gray-500">Aucun nouveau client</p>
              ) : (
                newCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between border-b py-3 last:border-0 dark:border-gray-700"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium dark:text-white">
                        {customer.full_name}
                      </p>
                      <p className="text-xs dark:text-gray-500">{customer.email}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(customer.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold dark:text-white">
                <ShoppingBag className="h-5 w-5 text-amber-500" />
                Meilleurs clients
              </h2>
            </div>
            <div className="space-y-4">
              {topCustomers.length === 0 ? (
                <p className="py-8 text-center dark:text-gray-500">Aucune donnée</p>
              ) : (
                topCustomers.map((customer, index) => (
                  <div
                    key={`${customer.email || "customer"}-${index}`}
                    className="flex items-center justify-between border-b py-3 last:border-0 dark:border-gray-700"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium dark:text-white">
                        {customer.name}
                      </p>
                      <p className="text-xs dark:text-gray-500">{customer.email}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-bold dark:text-white">
                        {formatPrice(customer.total_spent)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {customer.orders_count} commande(s)
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <h2 className="mb-4 flex items-center gap-2 font-bold dark:text-white">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Ventes par catégorie
            </h2>
            {categorySales.length === 0 ? (
              <p className="py-8 text-center dark:text-gray-500">Aucune donnée</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categorySales} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  />
                  <Tooltip
                    formatter={(value) => formatPrice(Number(value))}
                    contentStyle={{
                      background: "#1F2937",
                      border: "none",
                      borderRadius: "12px",
                      color: "white",
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
            className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold dark:text-white">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Paiements échoués / bloqués
              </h2>
              <Link
                to="/admin/statistics/failed-payments"
                className="ml-auto flex items-center gap-1 text-xs text-primary-600 hover:underline dark:text-primary-400"
              >
                Voir plus <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-4">
              {failedPayments.length === 0 ? (
                <p className="py-8 text-center dark:text-gray-500">Aucun paiement échoué</p>
              ) : (
                failedPayments.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border-b py-3 last:border-0 dark:border-gray-700"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium dark:text-white">
                        {order.order_number}
                      </p>
                      <p className="text-xs dark:text-gray-500">{order.payment_method}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-bold text-red-600 dark:text-red-400">
                        {formatPrice(order.total)}
                      </p>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
        >
          <h2 className="mb-4 flex items-center gap-2 font-bold dark:text-white">
            <Package className="h-5 w-5 text-orange-500" />
            Produits invendus
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {unsoldProducts.length === 0 ? (
              <p className="py-8 text-center dark:text-gray-500 sm:col-span-2 lg:col-span-3">
                Tous les produits ont été vendus
              </p>
            ) : (
              unsoldProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/50"
                >
                  <p className="truncate text-sm font-medium dark:text-white">{product.name}</p>
                  <span className="ml-2 text-sm font-medium text-orange-600 dark:text-orange-400">
                    Stock: {product.stock}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Link
            to="/admin/products/new"
            className="flex items-center gap-3 rounded-lg border bg-white p-4 transition-colors hover:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium dark:text-white">Ajouter produit</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Nouvelle fiche</p>
            </div>
          </Link>

          <Link
            to="/admin/coupons/new"
            className="flex items-center gap-3 rounded-lg border bg-white p-4 transition-colors hover:border-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-500"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <TagIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium dark:text-white">Créer coupon</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Promotion</p>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="flex items-center gap-3 rounded-lg border bg-white p-4 transition-colors hover:border-green-500 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-500"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium dark:text-white">Commandes</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Voir tout</p>
            </div>
          </Link>

          <Link
            to="/admin/statistics"
            className="flex items-center gap-3 rounded-lg border bg-white p-4 transition-colors hover:border-cyan-500 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-cyan-500"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium dark:text-white">Statistiques</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Analyses</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
