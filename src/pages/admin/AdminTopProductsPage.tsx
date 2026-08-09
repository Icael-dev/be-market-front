import { useEffect, useState } from "react";
import { fetchAdminTopProducts, type TopProduct } from "../../services/admin";
import { PageHeader } from "../../components/admin/PageHeader";
import { MobileNotOptimizedBanner } from "../../components/admin/MobileNotOptimizedBanner";
import { AdminTable, type Column } from "../../components/admin/AdminTable";
import { formatPrice } from "../../lib/utils";
import { motion } from "framer-motion";
import { Package } from "lucide-react";

export function AdminTopProductsPage() {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchAdminTopProducts(30)
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const lastPage = Math.ceil(products.length / perPage) || 1;
  const paginated = products.slice((currentPage - 1) * perPage, currentPage * perPage);

  const columns: Column<TopProduct>[] = [
    {
      key: "product_name",
      label: "Produit",
    },
    {
      key: "total_quantity",
      label: "Quantite",
      headerClassName: "text-right",
      cellClassName: "text-right",
    },
    {
      key: "total_revenue",
      label: "Revenu",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (item) => formatPrice(item.total_revenue),
    },
  ];

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader
          title="Top produits vendus"
          subtitle="Liste complete des produits les plus vendus"
        />
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-primary-600 dark:border-gray-700" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <AdminTable
              data={paginated}
              columns={columns}
              keyExtractor={(item) => item.product_id}

              emptyIcon={Package}
              emptyMessage="Aucune donnee"
              total={products.length}
              perPage={perPage}
              currentPage={currentPage}
              lastPage={lastPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </motion.div>
        )}
      </div>
    </>
  );
}
