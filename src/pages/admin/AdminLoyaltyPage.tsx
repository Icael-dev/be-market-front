import { useEffect, useState, useCallback } from 'react';
import { logger } from '../../lib/logger';
import { fetchAdminLoyaltyTransactions, fetchAdminLoyaltyPoints } from '../../services/admin';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { AdminTable, type Column } from '../../components/admin/AdminTable';
import { Loader2 } from 'lucide-react';
import type { LoyaltyPoints, LoyaltyTransaction } from '../../types';
import { format } from 'date-fns';

export function AdminLoyaltyPage() {
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [txCurrentPage, setTxCurrentPage] = useState(1);
  const [txPerPage] = useState(10);
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

  const columns: Column<LoyaltyTransaction>[] = [
    {
      key: 'user',
      label: 'Client',
      render: (t) => (
        <span className="text-sm dark:text-white">{t.user?.profile?.full_name || t.user?.email || '—'}</span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (t) => (
        <StatusBadge
          label={t.type === 'earned' ? 'Gagnee' : t.type === 'redeemed' ? 'Utilisee' : 'Expiree'}
          variant={t.type === 'earned' ? 'success' : t.type === 'redeemed' ? 'danger' : 'neutral'}
        />
      ),
    },
    {
      key: 'points',
      label: 'Points',
      headerClassName: 'text-right',
      cellClassName: 'text-right font-medium dark:text-white',
      render: (t) => Math.abs(t.points),
    },
    {
      key: 'description',
      label: 'Description',
      render: (t) => (
        <span className="text-sm dark:text-gray-500">{t.description || '—'}</span>
      ),
    },
    {
      key: 'reference',
      label: 'Reference commande',
      render: (t) => (
        <span className="text-sm text-gray-500 dark:text-gray-500">{t.reference || '—'}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (t) => (
        <span className="text-sm text-gray-500 dark:text-gray-500">{format(new Date(t.created_at), 'dd/MM/yyyy HH:mm')}</span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <MobileNotOptimizedBanner />
      <div>
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

            <AdminTable
              data={visible}
              columns={columns}
              keyExtractor={(t) => t.id}

              emptyIcon={Loader2}
              emptyMessage="Aucune transaction"
              total={visible.length}
              perPage={txPerPage}
              currentPage={txCurrentPage}
              lastPage={txLastPage}
              onPageChange={(page) => load(page, ptsCurrentPage)}
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
}
