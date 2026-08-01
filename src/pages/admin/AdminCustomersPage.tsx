import { useEffect, useState, useCallback } from 'react';
import { logger } from '../../lib/logger';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchAdminCustomers } from '../../services/admin';
import type { AdminCustomer } from '../../types';
import { formatPrice } from '../../lib/utils';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { AdminTable } from '../../components/admin/AdminTable';
import { Search, Users, Mail, Phone, ShoppingBag } from 'lucide-react';

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = useCallback(async (page = 1) => {
    try {
      const result = await fetchAdminCustomers({
        page,
        per_page: perPage,
        email: searchQuery || undefined
      });
      setCustomers(result.data || []);
      setCurrentPage(result.current_page);
      setLastPage(result.last_page);
      setTotal(result.total);
    } catch (error) {
      logger.error('Error fetching customers:', error);
      setCustomers([]);
    }
  }, [searchQuery, perPage]);

  useEffect(() => {
    fetchCustomers(1);
  }, [searchQuery, fetchCustomers]);

  const columns = [
    {
      key: 'name',
      label: 'Client',
      render: (customer: AdminCustomer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-cyan-500 flex items-center justify-center text-white font-medium text-sm">
            {customer.full_name?.[0] || customer.email?.[0] || 'U'}
          </div>
          <div>
            <Link 
              to={`/admin/customers/${customer.user_id}`} 
              className="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {customer.full_name || 'Sans nom'}
            </Link>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (customer: AdminCustomer) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="w-4 h-4" />
            {customer.email || '-'}
          </div>
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4" />
              {customer.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'orders',
      label: 'Commandes',
      render: (customer: AdminCustomer) => (
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">{customer.orders_count || 0}</span>
        </div>
      ),
    },
    {
      key: 'total_spent',
      label: 'Total achete',
      render: (customer: AdminCustomer) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {formatPrice(customer.total_spent || 0)}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Inscription',
      render: (customer: AdminCustomer) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(customer.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader title="Clients" subtitle={`${customers.length} clients inscrits`} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="customer-search"
              name="customer-search"
              type="text"
              placeholder="Rechercher par nom, email ou telephone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
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
              window.location.href = `/admin/customers/${customer.user_id}`;
            }}
          />
        </motion.div>
      </div>
    </AdminLayout>
  );
}
