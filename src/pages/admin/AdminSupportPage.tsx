import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  fetchAdminSupportTickets
} from '../../services/admin';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Search, Loader2, RefreshCw } from 'lucide-react';
import type { SupportTicket } from '../../types';
import { format } from 'date-fns';
import { getStatusLabel } from '../../lib/utils';

const STATUS_FILTERS = [
  { value: '', label: 'Tous' },
  { value: 'open', label: 'Ouvert' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'resolved', label: 'Resolu' },
  { value: 'closed', label: 'Ferme' },
];

export function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminSupportTickets(statusFilter ? { status: statusFilter } : undefined);
      setTickets(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Failed to load support tickets:', message, error);
      alert('Impossible de charger les tickets de support. Verifiez que le backend fonctionne et que les migrations sont a jour.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = tickets.filter(t => {
    const matchesSearch = !search ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.email?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <AdminLayout>
      <MobileNotOptimizedBanner />
      <div className="p-6 lg:p-8">
        <PageHeader title="Support" subtitle={`${filtered.length} ticket${filtered.length > 1 ? 's' : ''}`} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher par sujet ou email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 border dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
            >
              {STATUS_FILTERS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 border dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Sujet</th>
                    <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Client</th>
                    <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Statut</th>
                    <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Priorite</th>
                    <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Messages</th>
                    <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">Aucun ticket</td></tr>
                  ) : filtered.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/admin/support/${t.id}`} className="font-medium text-primary-600 dark:text-primary-400 hover:underline">
                          {t.subject}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm dark:text-gray-500">{t.user?.email || '—'}</td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          label={getStatusLabel(t.status)}
                          variant={t.status === 'resolved' || t.status === 'closed' ? 'success' : t.status === 'open' ? 'warning' : 'info'}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm dark:text-gray-500 capitalize">{t.priority}</td>
                      <td className="px-6 py-4 text-sm dark:text-gray-500">{t.messages?.length || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-500">{format(new Date(t.created_at), 'dd/MM/yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
