import { useEffect, useState, useCallback } from 'react';
import { logger } from '../../lib/logger';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  fetchAdminSupportTickets
} from '../../services/admin';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { AdminTable, type Column } from '../../components/admin/AdminTable';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(8);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const result = await fetchAdminSupportTickets({
        page,
        per_page: perPage,
        status: statusFilter || undefined,
      });
      setTickets(result.data || []);
      setCurrentPage(result.current_page);
      setLastPage(result.last_page);
      setTotal(result.total);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      logger.error('Failed to load support tickets:', message, error);
      setTickets([]);
      alert('Impossible de charger les tickets de support. Verifiez que le backend fonctionne et que les migrations sont a jour.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, perPage]);

  useEffect(() => {
    load(1);
  }, [load]);

  const filtered = (tickets || []).filter(t => {
    const matchesSearch = !search ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.email?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const columns: Column<SupportTicket>[] = [
    {
      key: 'subject',
      label: 'Sujet',
      render: (ticket) => (
        <Link to={`/admin/support/${ticket.id}`} className="font-medium text-primary-600 dark:text-primary-400 hover:underline">
          {ticket.subject}
        </Link>
      ),
    },
    {
      key: 'email',
      label: 'Client',
      render: (ticket) => (
        <span className="text-sm text-gray-600 dark:text-gray-500">{ticket.user?.email || '—'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (ticket) => (
        <StatusBadge
          label={getStatusLabel(ticket.status)}
          variant={ticket.status === 'resolved' || ticket.status === 'closed' ? 'success' : ticket.status === 'open' ? 'warning' : 'info'}
        />
      ),
    },
    {
      key: 'priority',
      label: 'Priorite',
      render: (ticket) => (
        <span className="text-sm text-gray-600 dark:text-gray-500 capitalize">{ticket.priority}</span>
      ),
    },
    {
      key: 'messages',
      label: 'Messages',
      render: (ticket) => (
        <span className="text-sm text-gray-600 dark:text-gray-500">{ticket.messages?.length || 0}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (ticket) => (
        <span className="text-sm text-gray-500 dark:text-gray-500">{format(new Date(ticket.created_at), 'dd/MM/yyyy')}</span>
      ),
    },
  ];

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
            <button onClick={() => load()} className="flex items-center gap-2 px-4 py-2.5 border dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
        ) : (
          <AdminTable
            data={filtered}
            columns={columns}
            keyExtractor={(t) => t.id}

            emptyIcon={Search}
            emptyMessage="Aucun ticket"
            total={total}
            perPage={perPage}
            currentPage={currentPage}
            lastPage={lastPage}
            onPageChange={(page) => load(page)}
          />
        )}
      </div>
    </AdminLayout>
  );
}
