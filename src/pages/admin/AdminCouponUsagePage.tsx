import { useEffect, useState } from 'react';
import { fetchAdminCouponStats, type CouponStatsResponse } from '../../services/admin';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { Pagination } from '../../components/Pagination';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';

export function AdminCouponUsagePage() {
  const [couponStats, setCouponStats] = useState<CouponStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchAdminCouponStats(30).then(data => { setCouponStats(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const coupons = couponStats?.coupons_used ?? [];
  const lastPage = Math.ceil(coupons.length / perPage) || 1;
  const paginated = coupons.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <AdminLayout>
      <MobileNotOptimizedBanner />
      <div className="p-6 lg:p-8">
        <PageHeader title="Utilisation des coupons" subtitle="Liste complete des coupons et leur utilisation" />
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
                    <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-300">Code</th>
                    <th className="text-right px-6 py-4 text-sm font-medium dark:text-gray-300">Type</th>
                    <th className="text-right px-6 py-4 text-sm font-medium dark:text-gray-300">Valeur</th>
                    <th className="text-right px-6 py-4 text-sm font-medium dark:text-gray-300">Utilisations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map((coupon, i) => (
                    <motion.tr
                      key={coupon.code}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 dark:text-white font-mono">{coupon.code}</td>
                      <td className="text-right px-6 py-4 dark:text-gray-300">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `${coupon.discount_value} FCFA`}</td>
                      <td className="text-right px-6 py-4 dark:text-gray-300">{coupon.discount_type === 'percentage' ? 'Pourcentage' : 'Montant fixe'}</td>
                      <td className="text-right px-6 py-4 dark:text-gray-300">{coupon.usage_count}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {coupons.length === 0 && !loading && (
              <div className="text-center py-12">
                <Tag className="w-12 h-12 dark:text-gray-500 mx-auto mb-4" />
                <p className="dark:text-gray-500">Aucun coupon utilise</p>
              </div>
            )}
            <Pagination
              currentPage={currentPage}
              lastPage={lastPage}
              perPage={perPage}
              total={coupons.length}
              onPageChange={(page) => { setCurrentPage(page); }}
            />
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}