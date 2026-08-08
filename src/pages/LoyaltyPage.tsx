import { useEffect, useState } from 'react';
import { logger } from '../lib/logger';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchLoyaltyPoints, fetchLoyaltyTransactions } from '../services/content';
import { Gift, Star, TrendingUp, History, Loader2, Package } from 'lucide-react';
import type { LoyaltyPoints, LoyaltyTransaction } from '../types';
import { format } from 'date-fns';

export function LoyaltyPage() {
  const { user } = useAuth();
  const [loyalty, setLoyalty] = useState<LoyaltyPoints | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchLoyalty();
  }, [user]);

  const fetchLoyalty = async () => {
    try {
      const [loyaltyData, transactionsData] = await Promise.all([
        fetchLoyaltyPoints(),
        fetchLoyaltyTransactions()
      ]);

      setLoyalty(loyaltyData);
      setTransactions(transactionsData);
    } catch (error) {
      logger.error('Failed to load loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const pointsValue = (loyalty?.points || 0) * 25; // 1 point = 25 FCFA

  if (!user) {
    return (
      <div className="min-h-screen page-bg py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Gift className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Connectez-vous pour voir vos points fidelite</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Programme Fidelite</h1>
          <p className="text-gray-500 dark:text-gray-400">Gagnez des points a chaque achat et obtenez des reductions</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary-600 to-cyan-500 rounded-2xl p-6 text-white"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-8 h-8" />
                  <span className="font-medium">Points disponibles</span>
                </div>
                <p className="text-4xl font-bold">{loyalty?.points || 0}</p>
                <p className="text-primary-100 mt-2">= {pointsValue.toLocaleString()} FCFA de reduction</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
className="card p-6"
               >
                 <div className="flex items-center gap-3 mb-4">
                   <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                   <span className="font-medium text-gray-700 dark:text-gray-300">Points gagnes</span>
                 </div>
                 <p className="text-4xl font-bold text-gray-900 dark:text-white">{loyalty?.total_earned || 0}</p>
                 <p className="text-gray-500 dark:text-gray-400 mt-2">Total accumules</p>
               </motion.div>

               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="card p-6"
               >
                 <div className="flex items-center gap-3 mb-4">
                   <Gift className="w-8 h-8 text-orange-500 dark:text-orange-400" />
                   <span className="font-medium text-gray-700 dark:text-gray-300">Points utilises</span>
                 </div>
                 <p className="text-4xl font-bold text-gray-900 dark:text-white">{loyalty?.total_redeemed || 0}</p>
                 <p className="text-gray-500 dark:text-gray-400 mt-2">En reductions</p>
               </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Historique</h2>
              </div>

              {transactions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">Aucune transaction</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((trans, index) => (
                    <motion.div
                      key={trans.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {trans.type === 'earned' ? 'Points gagnes' : trans.type === 'redeemed' ? 'Points utilises' : 'Points expires'}
                        </p>
                        {trans.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{trans.description}</p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(trans.created_at), 'dd MMM yyyy HH:mm')}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`font-bold ${trans.type === 'earned' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                          {trans.type === 'earned' ? '+' : '-'}{Math.abs(trans.points)}
                        </span>
                        {trans.order_id && (
                          <Link
                            to={`/orders/${trans.order_id}`}
                            className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            <Package className="w-3 h-3" />
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
              className="mt-8 bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-6"
            >
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Comment ca marche ?</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-primary-600 mt-0.5" />
                  Gagnez 1 point pour chaque 2500 FCFA d'achat
                </li>
                <li className="flex items-start gap-2">
                  <Gift className="w-4 h-4 text-primary-600 mt-0.5" />
                    1 point = 25 FCFA de reduction
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-primary-600 mt-0.5" />
                  Utilisez vos points a tout moment lors du checkout
                </li>
                <li className="flex items-start gap-2">
                  <History className="w-4 h-4 text-primary-600 mt-0.5" />
                  Vos points sont valables 6 mois
                </li>
                {loyalty && loyalty.threshold > 0 && (
                  <li className="flex items-start gap-2">
                    <Package className="w-4 h-4 text-primary-600 mt-0.5" />
                    Depensez au moins {loyalty.threshold.toLocaleString()} FCFA pour utiliser vos points
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