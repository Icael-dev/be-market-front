import { useEffect, useState } from 'react';
import { fetchAdminLowStock, type LowStockProduct } from '../../services/admin';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { AdminTable, type Column } from '../../components/admin/AdminTable';
import { formatPrice } from '../../lib/utils';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

export function AdminLowStockPage() {
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchAdminLowStock(999).then(data => { setProducts(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const lastPage = Math.ceil(products.length / perPage) || 1;
  const paginated = products.slice((currentPage - 1) * perPage, currentPage * perPage);

  const columns: Column<LowStockProduct>[] = [
    {
      key: 'name',
      label: 'Produit',
    },
    {
      key: 'sku',
      label: 'SKU',
      cellClassName: 'font-mono text-xs',
    },
    {
      key: 'stock',
      label: 'Stock',
      headerClassName: 'text-right',
      cellClassName: 'text-right font-medium',
      render: (item) => (
        <span className={item.stock === 0 ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}>
          {item.stock}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Prix',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (item) => formatPrice(item.price),
    },
  ];

  return (
    <AdminLayout>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader title="Stock bas / rupture" subtitle="Liste complete des produits en stock bas ou rupture" />
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
              keyExtractor={(item) => item.id}

              emptyIcon={Package}
              emptyMessage="Aucun produit en stock bas"
              total={products.length}
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