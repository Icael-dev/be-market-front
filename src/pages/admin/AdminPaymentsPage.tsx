import { useEffect, useState, useCallback } from "react";
import { logger } from "../../lib/logger";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { fetchAdminPayments } from "../../services/admin";
import { PageHeader } from "../../components/admin/PageHeader";
import { MobileNotOptimizedBanner } from "../../components/admin/MobileNotOptimizedBanner";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { AdminTable, type Column } from "../../components/admin/AdminTable";
import { Search, Loader2 } from "lucide-react";
import type { Payment } from "../../types";
import { formatPrice } from "../../lib/utils";
import { format } from "date-fns";

export function AdminPaymentsPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const result = await fetchAdminPayments({
          page,
          per_page: perPage,
          status: statusFilter || undefined,
          payment_method: methodFilter || undefined,
        });
        setPayments(result.data || []);
        setCurrentPage(result.current_page);
        setLastPage(result.last_page);
      } catch (error) {
        logger.error("Failed to load payments:", error);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, methodFilter, perPage]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const filtered = payments.filter((p) => {
    const matchesSearch =
      !search ||
      p.reference?.toLowerCase().includes(search.toLowerCase()) ||
      p.order?.order_number?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const columns: Column<Payment>[] = [
    {
      key: "reference",
      label: "Reference",
      render: (p) => (
        <span className="font-mono text-sm dark:text-white">{p.reference || "—"}</span>
      ),
    },
    {
      key: "user",
      label: "Client",
      render: (p) => (
        <span className="text-sm dark:text-gray-500">
          {p.user?.profile?.full_name || p.order?.user?.profile?.full_name || "—"}
        </span>
      ),
    },
    {
      key: "order",
      label: "Commande",
      render: (p) =>
        p.order ? (
          <Link
            to={`/admin/customers/${p.order.user_id}`}
            className="text-sm text-primary-600 hover:underline dark:text-primary-400"
          >
            {p.order.order_number}
          </Link>
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
        ),
    },
    {
      key: "payment_method",
      label: "Methode",
      render: (p) => <span className="text-sm dark:text-gray-500">{p.payment_method}</span>,
    },
    {
      key: "amount",
      label: "Montant",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (p) => (
        <span className="text-sm font-medium dark:text-white">{formatPrice(p.amount)}</span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (p) => (
        <StatusBadge
          label={p.status}
          variant={
            p.status === "paid"
              ? "success"
              : p.status === "failed" || p.status === "refunded"
                ? "danger"
                : "warning"
          }
        />
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (p) => (
        <span className="text-sm text-gray-500 dark:text-gray-500">
          {format(new Date(p.created_at), "dd/MM/yyyy HH:mm")}
        </span>
      ),
    },
  ];

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader
          title="Paiements"
          subtitle={`${filtered.length} transaction${filtered.length > 1 ? "s" : ""}`}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher par reference ou commande..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="cursor-pointer rounded-lg border bg-white px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Tous les statuts</option>
              <option value="paid">Paye</option>
              <option value="pending">En attente</option>
              <option value="failed">Echoue</option>
              <option value="refunded">Rembourse</option>
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="cursor-pointer rounded-lg border bg-white px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Toutes les methodes</option>
              <option value="tmoney">Tmoney</option>
              <option value="flooz">Flooz</option>
              <option value="cash_on_delivery">Paiement a la livraison</option>
            </select>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <AdminTable
            data={filtered}
            columns={columns}
            keyExtractor={(p) => p.id}

            emptyIcon={Loader2}
            emptyMessage="Aucun paiement"
            total={filtered.length}
            perPage={perPage}
            currentPage={currentPage}
            lastPage={lastPage}
            onPageChange={(page) => {
              setCurrentPage(page);
              load(page);
            }}
            onRowClick={(p) => {
              if (p.order_id) {
                navigate(`/admin/orders?highlight=${p.order_id}`);
              } else if (p.user_id) {
                navigate(`/admin/customers/${p.user_id}`);
              }
            }}
          />
        )}
      </div>
    </>
  );
}
