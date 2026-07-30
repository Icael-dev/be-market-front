import { useEffect, useState } from 'react';
import { fetchAdminCategorySales, type CategorySale } from '../../services/admin';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { Pagination } from '../../components/Pagination';
import { formatPrice } from '../../lib/utils';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

export function AdminCategorySalesPage() {
  const [categorySales, setCategorySales] = useState<CategorySale[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchAdminCategorySales(30).then(data => { setCategorySales(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const lastPage = Math.ceil(categorySales.length / perPage) || 1;
  const paginated = categorySales.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <AdminLayout>
      <MobileNotOptimizedBanner />
      <div className="p-6 lg:p-8">
        <PageHeader title="Ventes par categorie" subtitle="Liste complete des ventes par categorie" />
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 dark:border-gray-700 border-t-primary-600 rounded-full" /></div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-300">Categorie</th>
                    <th className="text-right px-6 py-4 text-sm font-medium dark:text-gray-300">Commandes</th>
                    <th className="text-right px-6 py-4 text-sm font-medium dark:text-gray-300">Quantite</th>
                    <th className="text-right px-6 py-4 text-sm font-medium dark:text-gray-300">Revenu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map((cat, i) => (
                    <motion.tr
                      key={cat.category_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 dark:text-white">{cat.category_name}</td>
                      <td className="text-right px-6 py-4 dark:text-gray-300">{cat.orders_count}</td>
                      <td className="text-right px-6 py-4 dark:text-gray-300">{cat.total_quantity}</td>
                      <td className="text-right px-6 py-4 dark:text-gray-300">{formatPrice(cat.total_revenue)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {categorySales.length === 0 && !loading && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 dark:text-gray-500 mx-auto mb-4" />
                <p className="dark:text-gray-500">Aucune vente</p>
              </div>
            )}
            <Pagination
              currentPage={currentPage}
              lastPage={lastPage}
              perPage={perPage}
              total={categorySales.length}
              onPageChange={(page) => { setCurrentPage(page); }}
            />
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}