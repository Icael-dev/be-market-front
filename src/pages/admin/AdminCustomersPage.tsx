import { useEffect, useState, useCallback } from "react";
import { logger } from "../../lib/logger";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { fetchAdminCustomers } from "../../services/admin";
import type { AdminCustomer } from "../../types";
import { formatPrice } from "../../lib/utils";
import { PageHeader } from "../../components/admin/PageHeader";
import { MobileNotOptimizedBanner } from "../../components/admin/MobileNotOptimizedBanner";
import { AdminTable } from "../../components/admin/AdminTable";
import { Search, Users, Mail, Phone, ShoppingBag } from "lucide-react";

export function AdminCustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(
    async (page = 1) => {
      setError(null);
      try {
        const result = await fetchAdminCustomers({
          page,
          per_page: perPage,
          search: searchQuery || undefined,
        });
        setCustomers(result.data || []);
        setCurrentPage(result.current_page);
        setLastPage(result.last_page);
        setTotal(result.total);
      } catch (err) {
        logger.error("Error fetching customers:", err);
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des clients");
        setCustomers([]);
      }
    },
    [searchQuery, perPage]
  );

  useEffect(() => {
    fetchCustomers(1);
  }, [searchQuery, fetchCustomers]);

  const columns = [
    {
      key: "name",
      label: "Client",
      render: (customer: AdminCustomer) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-cyan-500 text-sm font-medium text-white">
            {customer.full_name?.[0] || customer.email?.[0] || "U"}
          </div>
          <div>
            <Link
              to={`/admin/customers/${customer.user_id}`}
              className="font-medium text-gray-900 transition-colors hover:text-primary-600 dark:text-white dark:hover:text-primary-400"
              onClick={(e) => e.stopPropagation()}
            >
              {customer.full_name || "Sans nom"}
            </Link>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (customer: AdminCustomer) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="h-4 w-4" />
            {customer.email || "-"}
          </div>
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="h-4 w-4" />
              {customer.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "orders",
      label: "Commandes",
      render: (customer: AdminCustomer) => (
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            {customer.orders_count || 0}
          </span>
        </div>
      ),
    },
    {
      key: "total_spent",
      label: "Total achete",
      render: (customer: AdminCustomer) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {formatPrice(customer.total_spent || 0)}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Inscription",
      render: (customer: AdminCustomer) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(customer.created_at).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader title="Clients" subtitle={`${customers.length} clients inscrits`} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              id="customer-search"
              name="customer-search"
              type="text"
              placeholder="Rechercher par nom, email ou telephone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          <AdminTable
            data={customers}
            columns={columns}
            keyExtractor={(customer) => customer.id}

            emptyIcon={Users}
            emptyMessage="Aucun client trouve"
            total={total}
            perPage={perPage}
            currentPage={currentPage}
            lastPage={lastPage}
            onPageChange={(page) => {
              setCurrentPage(page);
              fetchCustomers(page);
            }}
            onRowClick={(customer) => {
              navigate(`/admin/customers/${customer.user_id}`);
            }}
          />
        </motion.div>
      </div>
    </>
  );
}
