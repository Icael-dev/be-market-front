import { useState, useEffect, useCallback } from "react";
import { logger } from "../lib/logger";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { formatPrice, getStatusColor, getStatusLabel } from "../lib/utils";
import {
  Package,
  ChevronRight,
  Search,
  Filter,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { PageLoading } from "../components/LoadingSpinner";
import { fetchOrders as fetchOrdersService, cancelOrder } from "../services/orders";
import type { Order } from "../types";

export function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    try {
      const data = await fetchOrdersService();
      setOrders(data);
    } catch (err) {
      logger.error("Error fetching orders:", err);
      setError("Impossible de charger les commandes. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Etes-vous sûr de vouloir annuler cette commande ?")) return;

    try {
      const updated = await cancelOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      logger.error("Error cancelling order:", err);
      alert("Impossible d'annuler la commande. Veuillez réessayer.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchQuery || order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

  if (loading) return <PageLoading />;

  if (error) {
    return (
      <div className="page-bg flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg font-medium text-gray-900 dark:text-white">{error}</p>
          <button onClick={fetchOrders} className="btn-primary">
            Reessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen">
      <div className="page-header">
        <div className="page-section py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold dark:text-white">Mes commandes</h1>
            <p className="mt-1 dark:text-gray-500">
              {orders.length === 0
                ? "Aucune commande"
                : `${orders.length} commande${orders.length > 1 ? "s" : ""}`}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="page-section py-8">
        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card mb-6 p-4"
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher par numero..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="cursor-pointer appearance-none rounded-lg border-2 border-gray-200 bg-white py-2.5 pl-4 pr-10 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Tous les statuts</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>
                <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {filteredOrders.length === 0 ? (
            orders.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                  <Package className="h-8 w-8 dark:text-gray-500" />
                </div>
                <h2 className="mb-2 text-lg font-bold dark:text-white">Aucune commande</h2>
                <p className="mb-6 dark:text-gray-500">Vous n'avez pas encore passe de commande</p>
                <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Decouvrir nos produits
                </Link>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <h2 className="mb-2 text-lg font-bold dark:text-white">Aucun resultat</h2>
                <p className="dark:text-gray-500">
                  Aucune commande ne correspond a votre recherche
                </p>
              </div>
            )
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="card block cursor-pointer p-6 transition-all hover:shadow-premium"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium dark:text-white">{order.order_number}</p>
                            <p className="text-sm dark:text-gray-500">
                              {new Date(order.created_at).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className="h-5 w-5 dark:text-gray-500" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.payment_status)}`}
                          >
                            {getStatusLabel(order.payment_status)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <p className="font-bold dark:text-white">{formatPrice(order.total)}</p>

                          {["pending", "confirmed", "processing"].includes(order.status) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelOrder(order.id);
                              }}
                              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Annuler la commande"
                            >
                              <XCircle className="h-4 w-4" />
                              Annuler
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
