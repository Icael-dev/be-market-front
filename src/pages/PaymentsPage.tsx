import { useEffect, useState } from "react";
import { logger } from "../lib/logger";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchPaymentHistory } from "../services/payments";
import {
  CreditCard,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Package,
} from "lucide-react";
import type { Payment, PaymentStatus } from "../types";
import { formatPrice, getStatusColor, getStatusLabel, cn } from "../lib/utils";
import { format } from "date-fns";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  tmoney: "Tmoney",
  flooz: "Flooz",
  cash_on_delivery: "Paiement a la livraison",
};

export function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadPayments();
  }, [user]);

  const loadPayments = async () => {
    try {
      const data = await fetchPaymentHistory();
      setPayments(data);
    } catch (error) {
      logger.error("Failed to load payments:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="page-bg min-h-screen py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <CreditCard className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">Connectez-vous pour voir vos paiements</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Mes Paiements</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Historique detaille de vos transactions
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : payments.length === 0 ? (
          <div className="card p-12 text-center">
            <CreditCard className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">Aucun paiement effectue</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full",
                        payment.status === "paid"
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : payment.status === "failed"
                            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                      )}
                    >
                      {payment.status === "paid" ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : payment.status === "failed" ? (
                        <XCircle className="h-6 w-6" />
                      ) : payment.status === "pending" ? (
                        <Clock className="h-6 w-6" />
                      ) : (
                        <AlertCircle className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(payment.amount)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {PAYMENT_METHOD_LABELS[payment.payment_method] || payment.payment_method}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {format(new Date(payment.created_at), "dd MMM yyyy HH:mm")}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:items-end">
                    <span
                      className={cn(
                        "inline-flex rounded-lg px-3 py-1 text-sm font-medium",
                        getStatusColor(payment.status as PaymentStatus)
                      )}
                    >
                      {getStatusLabel(payment.status as PaymentStatus)}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>Ref: {payment.reference || "—"}</span>
                      {payment.paid_at && (
                        <span>Paye le {format(new Date(payment.paid_at), "dd/MM/yyyy")}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                  {payment.order ? (
                    <Link
                      to={`/orders/${payment.order.id}`}
                      className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:underline dark:text-primary-400"
                    >
                      <Package className="h-4 w-4" />
                      Voir la commande {payment.order.order_number}
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      Commande non disponible
                    </span>
                  )}
                  {payment.phone_number && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {payment.phone_number}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
