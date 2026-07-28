import { useEffect, useState, useCallback } from 'react';
import { logger } from '../../lib/logger';
import { fetchAdminLoyaltyTransactions, fetchAdminLoyaltyPoints } from '../../services/admin';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Pagination } from '../../components/Pagination';
import { Loader2 } from 'lucide-react';
import type { LoyaltyPoints, LoyaltyTransaction } from '../../types';
import { format } from 'date-fns';

export function AdminLoyaltyPage() {
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [txCurrentPage, setTxCurrentPage] = useState(1);
  const [txPerPage] = useState(10);
  const [txTotal, setTxTotal] = useState(0);
  const [txLastPage, setTxLastPage] = useState(1);
  const [points, setPoints] = useState<LoyaltyPoints[]>([]);
  const [ptsCurrentPage, setPtsCurrentPage] = useState(1);
  const [ptsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earned' | 'redeemed' | 'expired'>('all');

  const load = useCallback(async (txPage = 1, ptsPage = 1) => {
    setLoading(true);
    try {
      const [txData, pointsData] = await Promise.all([
        fetchAdminLoyaltyTransactions({ page: txPage, per_page: txPerPage }),
        fetchAdminLoyaltyPoints({ page: ptsPage, per_page: ptsPerPage }),
      ]);
      setTransactions(txData.data || []);
      setTxCurrentPage(txData.current_page);
      setTxLastPage(txData.last_page);
      setTxTotal(txData.total);
      setPoints(pointsData.data || []);
      setPtsCurrentPage(pointsData.current_page);
    } catch (error) {
      logger.error('Failed to load loyalty data:', error);
      setTransactions([]);
      setPoints([]);
    } finally {
      setLoading(false);
    }
  }, [txPerPage, ptsPerPage]);

  useEffect(() => {
    load(1, 1);
  }, [load]);

  const visible = filter === 'all' ? transactions : (transactions || []).filter(t => t.type === filter);

  return (
    <AdminLayout>
      <MobileNotOptimizedBanner />
      <div className="p-6 lg:p-8">
        <PageHeader title="Fidelite" subtitle={`${transactions.length} transactions`} />

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
        ) : (
          <>
            <div className="grid sm:grid-cols-4 gap-4 mb-6">
              <div className="card p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total transactions</p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{transactions.length}</p>
              </div>
              <div className="card p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total gagnes</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {transactions.filter(t => t.type === 'earned').reduce((a, t) => a + t.points, 0)}
                </p>
              </div>
              <div className="card p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total utilises</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {transactions.filter(t => t.type === 'redeemed').reduce((a, t) => a + t.points, 0)}
                </p>
              </div>
              <div className="card p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">Clients fidelite</p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{points.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              {(['all', 'earned', 'redeemed', 'expired'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${filter === f
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  {f === 'all' ? 'Toutes' : f === 'earned' ? 'Gagnees' : f === 'redeemed' ? 'Utilisees' : 'Expirees'}
                </button>
              ))}
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Client</th>
                      <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Type</th>
                      <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Points</th>
                      <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Description</th>
                      <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Reference commande</th>
                      <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {visible.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">Aucune transaction</td></tr>
                    ) : visible.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4 text-sm dark:text-white">{t.user?.profile?.full_name || t.user?.email || '—'}</td>
                        <td className="px-6 py-4">
                          <StatusBadge
                            label={t.type === 'earned' ? 'Gagnee' : t.type === 'redeemed' ? 'Utilisee' : 'Expiree'}
                            variant={t.type === 'earned' ? 'success' : t.type === 'redeemed' ? 'danger' : 'neutral'}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium dark:text-white">{Math.abs(t.points)}</td>
                        <td className="px-6 py-4 text-sm dark:text-gray-500">{t.description || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-500">{t.reference || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-500">{format(new Date(t.created_at), 'dd/MM/yyyy HH:mm')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <Pagination
                  currentPage={txCurrentPage}
                  lastPage={txLastPage}
                  perPage={txPerPage}
                  total={txTotal}
                  onPageChange={(page) => load(page, ptsCurrentPage)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
