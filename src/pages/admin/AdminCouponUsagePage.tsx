import { useEffect, useState } from "react";
import { fetchAdminCouponStats, type CouponStatsResponse } from "../../services/admin";
import { PageHeader } from "../../components/admin/PageHeader";
import { MobileNotOptimizedBanner } from "../../components/admin/MobileNotOptimizedBanner";
import { AdminTable, type Column } from "../../components/admin/AdminTable";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";

export function AdminCouponUsagePage() {
  const [couponStats, setCouponStats] = useState<CouponStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchAdminCouponStats(30)
      .then((data) => {
        setCouponStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const coupons = couponStats?.coupons_used ?? [];
  const lastPage = Math.ceil(coupons.length / perPage) || 1;
  const paginated = coupons.slice((currentPage - 1) * perPage, currentPage * perPage);

  const columns: Column<{
    code: string;
    discount_type: string;
    discount_value: number;
    usage_count: number;
  }>[] = [
    {
      key: "code",
      label: "Code",
    },
    {
      key: "discount_value",
      label: "Type",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (item) =>
        item.discount_type === "percentage"
          ? `${item.discount_value}%`
          : `${item.discount_value} FCFA`,
    },
    {
      key: "discount_type",
      label: "Valeur",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (item) => (item.discount_type === "percentage" ? "Pourcentage" : "Montant fixe"),
    },
    {
      key: "usage_count",
      label: "Utilisations",
      headerClassName: "text-right",
      cellClassName: "text-right",
    },
  ];

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader
          title="Utilisation des coupons"
          subtitle="Liste complete des coupons et leur utilisation"
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
              keyExtractor={(item) => item.code}

              emptyIcon={Tag}
              emptyMessage="Aucun coupon utilise"
              total={coupons.length}
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
