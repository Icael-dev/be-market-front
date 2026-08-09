import { useEffect, useState } from "react";
import { fetchAdminFailedPayments } from "../../services/admin";
import { PageHeader } from "../../components/admin/PageHeader";
import { MobileNotOptimizedBanner } from "../../components/admin/MobileNotOptimizedBanner";
import { AdminTable, type Column } from "../../components/admin/AdminTable";
import { formatPrice } from "../../lib/utils";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface FailedPayment {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  total: number;
}

export function AdminFailedPaymentsPage() {
  const [payments, setPayments] = useState<FailedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchAdminFailedPayments(100)
      .then((data) => {
        setPayments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const lastPage = Math.ceil(payments.length / perPage) || 1;
  const paginated = payments.slice((currentPage - 1) * perPage, currentPage * perPage);

  const columns: Column<FailedPayment>[] = [
    {
      key: "order_number",
      label: "Commande",
      render: (item) => (
        <span className="font-medium text-gray-900 dark:text-white">#{item.order_number}</span>
      ),
    },
    {
      key: "payment_method",
      label: "Methode",
      render: (item) => (
        <span className="text-sm capitalize text-gray-600 dark:text-gray-400">
          {item.payment_method}
        </span>
      ),
    },
    {
      key: "total",
      label: "Montant",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (item) => (
        <span className="font-medium text-gray-900 dark:text-white">{formatPrice(item.total)}</span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (item) => (
        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium capitalize text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {item.status}
        </span>
      ),
    },
  ];

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader
          title="Paiements echoues / bloques"
          subtitle="Liste complete des paiements en echec"
        />
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-primary-600 dark:border-gray-700" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <AdminTable
              data={paginated}
              columns={columns}
              keyExtractor={(item) => item.id}

              emptyIcon={AlertTriangle}
              emptyMessage="Aucun paiement echoue"
              total={payments.length}
              perPage={perPage}
              currentPage={currentPage}
              lastPage={lastPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </motion.div>
        )}
      </div>
    </>
  );
}
