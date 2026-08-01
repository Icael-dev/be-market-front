import { useEffect, useState } from 'react';
import { fetchAdminCategorySales, type CategorySale } from '../../services/admin';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { AdminTable, type Column } from '../../components/admin/AdminTable';
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

  const columns: Column<CategorySale>[] = [
    {
      key: 'category_name',
      label: 'Categorie',
    },
    {
      key: 'orders_count',
      label: 'Commandes',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
    },
    {
      key: 'total_quantity',
      label: 'Quantite',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
    },
    {
      key: 'total_revenue',
      label: 'Revenu',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (item) => formatPrice(item.total_revenue),
    },
  ];

  return (
    <AdminLayout>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader title="Ventes par categorie" subtitle="Liste complete des ventes par categorie" />
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 dark:border-gray-700 border-t-primary-600 rounded-full" /></div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AdminTable
              data={paginated}
              columns={columns}
              keyExtractor={(item) => item.category_id}

              emptyIcon={Package}
              emptyMessage="Aucune vente"
              total={categorySales.length}
              perPage={perPage}
              currentPage={currentPage}
              lastPage={lastPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}