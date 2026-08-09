import { toast } from "react-hot-toast";
import { logger } from "../../lib/logger";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAdminOrders, updateAdminOrder, restoreAdminOrder } from "../../services/admin";
import { formatPrice, getStatusColor, getStatusLabel } from "../../lib/utils";
import { PageHeader } from "../../components/admin/PageHeader";
import { MobileNotOptimizedBanner } from "../../components/admin/MobileNotOptimizedBanner";
import { AdminTable, type Column } from "../../components/admin/AdminTable";
import type { Order, OrderStatus } from "../../types";
import {
  Package,
  Search,
  Eye,
  X,
  MapPin,
  CreditCard,
  Calendar,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useSearchParams } from "react-router-dom";

export function AdminOrdersPage() {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchOrders = useCallback(
    async (page = 1) => {
      try {
        const result = await fetchAdminOrders({
          page,
          per_page: perPage,
          status: statusFilter || undefined,
        });
        setOrders(result.data || []);
        setCurrentPage(result.current_page);
        setLastPage(result.last_page);
        setTotal(result.total);
      } catch (err) {
        logger.error("Orders fetch error:", err);
        setOrders([]);
      }
    },
    [statusFilter, perPage]
  );

  useEffect(() => {
    fetchOrders(1);
  }, [statusFilter, fetchOrders]);

  const handleRestoreOrder = async (orderId: string) => {
    setRestoringId(orderId);
    try {
      const restored = await restoreAdminOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...restored, deleted_at: null } : o))
      );
      toast.success("Commande restauree");
    } catch (error) {
      logger.error("Order restore error:", error);
      toast.error("Erreur lors de la restauration");
    } finally {
      setRestoringId(null);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const updatedOrder = await updateAdminOrder(orderId, { status });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      logger.error("Order status update error:", error);
      toast.error("Erreur lors de la mise a jour du statut");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchQuery || order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

  const columns: Column<Order>[] = [
    {
      key: "order_number",
      label: "Commande",
      render: (order) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{order.order_number}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(order.created_at).toLocaleDateString("fr-FR")}
          </p>
          {order.deleted_at && (
            <span className="mt-1 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Supprime
            </span>
          )}
        </div>
      ),
    },
    {
      key: "client",
      label: "Client",
      render: (order) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {order.shipping_address?.full_name || "-"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {order.shipping_address?.phone || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "total",
      label: "Montant",
      render: (order) => (
        <p className="font-medium text-gray-900 dark:text-white">{formatPrice(order.total)}</p>
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (order) => (
        <select
          id={`order-status-${order.id}`}
          name={`order-status-${order.id}`}
          value={order.status}
          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
          className={cn(
            "cursor-pointer rounded-lg border-0 px-3 py-1.5 text-sm font-medium",
            getStatusColor(order.status)
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {getStatusLabel(status)}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "payment_status",
      label: "Paiement",
      render: (order) => (
        <span
          className={cn(
            "inline-flex rounded-lg px-3 py-1 text-sm font-medium",
            getStatusColor(order.payment_status)
          )}
        >
          {getStatusLabel(order.payment_status)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (order) => (
        <div className="flex items-center justify-end gap-2">
          {order.deleted_at && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRestoreOrder(order.id);
              }}
              disabled={restoringId === order.id}
              className="flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200 disabled:opacity-50 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
            >
              {restoringId === order.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Restaurer
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(order);
            }}
            disabled={!!order.deleted_at}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-700"
          >
            <Eye className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader title="Commandes" subtitle={`${orders.length} commandes`} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="order-search"
                name="order-search"
                type="text"
                placeholder="Rechercher par numero..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <select
              id="order-status-filter"
              name="order-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="cursor-pointer rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Tous les statuts</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AdminTable
            data={filteredOrders}
            columns={columns}
            keyExtractor={(order) => order.id}

            emptyIcon={Package}
            emptyMessage="Aucune commande trouvee"
            onRowClick={(order) => setSelectedOrder(order)}
            total={total}
            perPage={perPage}
            currentPage={currentPage}
            lastPage={lastPage}
            onPageChange={(page) => {
              setCurrentPage(page);
              fetchOrders(page);
            }}
          />
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 z-50 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-xl overflow-y-auto bg-white dark:bg-gray-800"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-xl font-bold dark:text-white">{selectedOrder.order_number}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg p-2 transition-colors hover:bg-gray-100 hover:dark:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 p-6">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedOrder.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    Adresse de livraison
                  </h3>
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedOrder.shipping_address?.full_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedOrder.shipping_address?.phone}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {selectedOrder.shipping_address?.address_line1}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedOrder.shipping_address?.city},{" "}
                      {selectedOrder.shipping_address?.region}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    Paiement
                  </h3>
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <div className="mb-2 flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Methode</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {getStatusLabel(selectedOrder.payment_method || "")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Statut</span>
                      <span
                        className={cn(
                          "rounded px-2 py-1 text-xs font-medium",
                          getStatusColor(selectedOrder.payment_status)
                        )}
                      >
                        {getStatusLabel(selectedOrder.payment_status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-medium text-gray-900 dark:text-white">Articles</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.product_name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            x{item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatPrice(item.total)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4 dark:border-gray-700">
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Sous-total</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Remise</span>
                      <span>-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Livraison</span>
                    <span>
                      {selectedOrder.shipping_fee === 0
                        ? "Gratuite"
                        : formatPrice(selectedOrder.shipping_fee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
