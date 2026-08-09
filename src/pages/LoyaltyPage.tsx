import { useEffect, useState } from "react";
import { logger } from "../lib/logger";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchLoyaltyPoints, fetchLoyaltyTransactions } from "../services/content";
import { Gift, Star, TrendingUp, History, Loader2, Package } from "lucide-react";
import type { LoyaltyPoints, LoyaltyTransaction } from "../types";
import { format } from "date-fns";

export function LoyaltyPage() {
  const { user } = useAuth();
  const [loyalty, setLoyalty] = useState<LoyaltyPoints | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchLoyalty();
  }, [user]);

  const fetchLoyalty = async () => {
    try {
      const [loyaltyData, transactionsData] = await Promise.all([
        fetchLoyaltyPoints(),
        fetchLoyaltyTransactions(),
      ]);

      setLoyalty(loyaltyData);
      setTransactions(transactionsData);
    } catch (err) {
      logger.error("Failed to load loyalty data:", err);
      setError("Impossible de charger les donnees de fidelite.");
    } finally {
      setLoading(false);
    }
  };

  const pointsValue = (loyalty?.points || 0) * 25; // 1 point = 25 FCFA

  if (!user) {
    return (
      <div className="page-bg min-h-screen py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <Gift className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">
            Connectez-vous pour voir vos points fidelite
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Programme Fidelite
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gagnez des points a chaque achat et obtenez des reductions
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-lg font-medium text-gray-900 dark:text-white">{error}</p>
            <button onClick={fetchLoyalty} className="btn-primary">
              Reessayer
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-6 md:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-gradient-to-br from-primary-600 to-cyan-500 p-6 text-white"
              >
                <div className="mb-4 flex items-center gap-3">
                  <Star className="h-8 w-8" />
                  <span className="font-medium">Points disponibles</span>
                </div>
                <p className="text-4xl font-bold">{loyalty?.points || 0}</p>
                <p className="mt-2 text-primary-100">
                  = {pointsValue.toLocaleString()} FCFA de reduction
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Points gagnes
                  </span>
                </div>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {loyalty?.total_earned || 0}
                </p>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Total accumules</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <Gift className="h-8 w-8 text-orange-500 dark:text-orange-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Points utilises
                  </span>
                </div>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {loyalty?.total_redeemed || 0}
                </p>
                <p className="mt-2 text-gray-500 dark:text-gray-400">En reductions</p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <div className="mb-6 flex items-center gap-2">
                <History className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Historique</h2>
              </div>

              {transactions.length === 0 ? (
                <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                  Aucune transaction
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((trans, index) => (
                    <motion.div
                      key={trans.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0 dark:border-gray-800"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {trans.type === "earned"
                            ? "Points gagnes"
                            : trans.type === "redeemed"
                              ? "Points utilises"
                              : "Points expires"}
                        </p>
                        {trans.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {trans.description}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(trans.created_at), "dd MMM yyyy HH:mm")}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`font-bold ${trans.type === "earned" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}
                        >
                          {trans.type === "earned" ? "+" : "-"}
                          {Math.abs(trans.points)}
                        </span>
                        {trans.order_id && (
                          <Link
                            to={`/orders/${trans.order_id}`}
                            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline dark:text-primary-400"
                          >
                            <Package className="h-3 w-3" />
                            Commande
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 rounded-lg bg-primary-50 p-6 dark:bg-primary-900/20"
            >
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white">Comment ca marche ?</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <Star className="mt-0.5 h-4 w-4 text-primary-600" />
                  Gagnez 1 point pour chaque 2500 FCFA d'achat
                </li>
                <li className="flex items-start gap-2">
                  <Gift className="mt-0.5 h-4 w-4 text-primary-600" />1 point = 25 FCFA de reduction
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="mt-0.5 h-4 w-4 text-primary-600" />
                  Utilisez vos points a tout moment lors du checkout
                </li>
                <li className="flex items-start gap-2">
                  <History className="mt-0.5 h-4 w-4 text-primary-600" />
                  Vos points sont valables 6 mois
                </li>
                {loyalty && loyalty.threshold > 0 && (
                  <li className="flex items-start gap-2">
                    <Package className="mt-0.5 h-4 w-4 text-primary-600" />
                    Depensez au moins {loyalty.threshold.toLocaleString()} FCFA pour utiliser vos
                    points
                  </li>
                )}
              </ul>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
