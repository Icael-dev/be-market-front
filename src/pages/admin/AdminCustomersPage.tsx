import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchAdminCustomers } from '../../services/admin';
import type { AdminCustomer } from '../../types';
import { formatPrice } from '../../lib/utils';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { Pagination } from '../../components/Pagination';
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
       console.error('Error fetching customers:', error);
       setCustomers([]);
     }
   }, [searchQuery, perPage]);

  useEffect(() => {
    fetchCustomers(1);
  }, [searchQuery, fetchCustomers]);

  const filteredCustomers = (customers || []).filter(c =>
    !searchQuery ||
    c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  return (
    <AdminLayout>
      <MobileNotOptimizedBanner />
      <div className="p-6 lg:p-8">
        <PageHeader title="Clients" subtitle={`${customers.length} clients inscrits`} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-gray-500" />
            <input
              id="customer-search"
              name="customer-search"
              type="text"
              placeholder="Rechercher par nom, email ou telephone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Client</th>
                  <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Contact</th>
                  <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Commandes</th>
                  <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Total achete</th>
                  <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Inscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="dark:hover:bg-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-cyan-500 flex items-center justify-center text-white font-medium">
                          {customer.full_name?.[0] || customer.email?.[0] || 'U'}
                        </div>
                        <div>
                          <Link to={`/admin/customers/${customer.user_id}`} className="font-medium dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            {customer.full_name || 'Sans nom'}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm dark:text-gray-500">
                          <Mail className="w-4 h-4" />
                          {customer.email || '-'}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm dark:text-gray-500">
                            <Phone className="w-4 h-4" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 dark:text-gray-500" />
                        <span className="font-medium">{customer.orders_count || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium dark:text-white">
                        {formatPrice(customer.total_spent || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm dark:text-gray-500">
                      {new Date(customer.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 dark:text-gray-500 mx-auto mb-4" />
              <p className="dark:text-gray-500">Aucun client trouve</p>
            </div>
          )}
        </motion.div>

        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          perPage={perPage}
          total={total}
          onPageChange={(page) => {
            setCurrentPage(page);
            fetchCustomers(page);
          }}
        />
      </div>
    </AdminLayout>
  );
}
