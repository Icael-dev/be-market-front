import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchAdminPayments } from '../../services/admin';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { Search, Loader2 } from 'lucide-react';
import type { Payment } from '../../types';
import { formatPrice, cn, getStatusColor } from '../../lib/utils';
import { format } from 'date-fns';

export function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminPayments({
        status: statusFilter || undefined,
        payment_method: methodFilter || undefined,
      });
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter, methodFilter]);

  const filtered = payments.filter(p => {
    const matchesSearch = !search ||
      (p.reference?.toLowerCase().includes(search.toLowerCase())) ||
      (p.order?.order_number?.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <PageHeader title="Paiements" subtitle={`${filtered.length} transaction${filtered.length > 1 ? 's' : ''}`} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher par reference ou commande..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 border dark:border-gray-700 rounded-xl text-sm"
            >
              <option value="">Tous les statuts</option>
              <option value="paid">Paye</option>
              <option value="pending">En attente</option>
              <option value="failed">Echoue</option>
              <option value="refunded">Rembourse</option>
            </select>
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="px-3 py-2.5 border dark:border-gray-700 rounded-xl text-sm"
            >
              <option value="">Toutes les methodes</option>
              <option value="tmoney">Tmoney</option>
              <option value="flooz">Flooz</option>
              <option value="cash_on_delivery">Paiement a la livraison</option>
            </select>
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
                    <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Reference</th>
                    <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Client</th>
                    <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Commande</th>
                    <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Methode</th>
                    <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Montant</th>
                    <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Statut</th>
                    <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">Aucun paiement</td></tr>
                  ) : filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm dark:text-white">{p.reference || '—'}</td>
                      <td className="px-6 py-4 text-sm dark:text-gray-500">{p.user?.name || p.order?.user?.name || '—'}</td>
                      <td className="px-6 py-4">
                        {p.order ? (
                          <Link to={`/admin/customers/${p.order.user_id}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                            {p.order.order_number}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm dark:text-gray-500">{p.payment_method}</td>
                      <td className="px-6 py-4 text-sm font-medium dark:text-white">{formatPrice(p.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={cn('inline-flex px-2 py-1 rounded-full text-xs font-medium', getStatusColor(p.status))}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-500">{format(new Date(p.created_at), 'dd/MM/yyyy HH:mm')}</td>
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
