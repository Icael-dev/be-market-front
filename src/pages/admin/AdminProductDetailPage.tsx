import { useEffect, useState, useCallback } from 'react';
import { logger } from '../../lib/logger';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  fetchAdminProduct,
  fetchAdminProductOrders,
} from '../../services/admin';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { AdminTable, type Column } from '../../components/admin/AdminTable';
import { Package, Loader2, ArrowLeft, Tag, Weight, FileText } from 'lucide-react';
import type { Product, Order } from '../../types';
import { formatPrice } from '../../lib/utils';
import { format } from 'date-fns';
import { getImageUrl } from '../../lib/imageUrl';

type Tab = 'info' | 'orders';

export function AdminProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>('info');
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [productData, ordersData] = await Promise.all([
        fetchAdminProduct(id),
        fetchAdminProductOrders(id),
      ]);
      setProduct(productData);
      setOrders(ordersData);
    } catch (error) {
      logger.error('Failed to load product detail:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'info', label: 'Informations', icon: <FileText className="w-4 h-4" /> },
    { key: 'orders', label: 'Commandes', icon: <Package className="w-4 h-4" /> },
  ];

  const orderColumns: Column<Order>[] = [
    {
      key: 'order_number',
      label: 'Commande',
      render: (order) => (
        <p className="font-medium dark:text-white">{order.order_number}</p>
      ),
    },
    {
      key: 'user',
      label: 'Client',
      render: (order) => (
        <span className="text-sm dark:text-gray-300">
          {order.user?.email || order.user?.profile?.full_name || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (order) => (
        <StatusBadge
          label={order.status}
          variant={
            order.status === 'delivered'
              ? 'success'
              : order.status === 'cancelled'
                ? 'danger'
                : order.status === 'pending'
                  ? 'warning'
                  : 'info'
          }
        />
      ),
    },
    {
      key: 'payment_status',
      label: 'Paiement',
      render: (order) => (
        <StatusBadge
          label={order.payment_status}
          variant={
            order.payment_status === 'paid'
              ? 'success'
              : order.payment_status === 'failed' || order.payment_status === 'refunded'
                ? 'danger'
                : 'warning'
          }
        />
      ),
    },
    {
      key: 'total',
      label: 'Total',
      render: (order) => <span className="font-medium dark:text-white">{formatPrice(order.total)}</span>,
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (order) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {format(new Date(order.created_at), 'dd/MM/yyyy')}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <>
        <MobileNotOptimizedBanner />
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <MobileNotOptimizedBanner />
        <div className="text-center py-12 text-gray-500">Produit introuvable</div>
      </>
    );
  }

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader
          title={product.name}
          subtitle={product.sku || 'Detail du produit'}
        >
          <Link
            to="/admin/products"
            className="flex items-center gap-2 px-4 py-2.5 border dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        </PageHeader>

        <div className="flex items-center gap-2 mb-6">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${tab === t.key
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              {t.icon}
              {t.label}
              {t.key === 'orders' && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                  {orders.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold dark:text-white">Informations generales</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nom</p>
                    <p className="font-medium dark:text-white">{product.name}</p>
                  </div>
                  {product.sku && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">SKU</p>
                      <p className="font-mono text-sm dark:text-white">{product.sku}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Categorie</p>
                    <p className="font-medium dark:text-white">{product.category?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Etat</p>
                    <StatusBadge
                      label={product.deleted_at ? 'Supprime' : product.is_active ? 'Actif' : 'Inactif'}
                      variant={
                        product.deleted_at
                          ? 'danger'
                          : product.is_active
                            ? 'success'
                            : 'neutral'
                      }
                    />
                    {product.is_featured && !product.deleted_at && (
                      <span className="ml-2 inline-flex px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                        Vedette
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Prix</p>
                    <p className="font-medium dark:text-white">{formatPrice(product.price)}</p>
                    {product.compare_price && (
                      <p className="text-sm text-gray-500 line-through">{formatPrice(product.compare_price)}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Stock</p>
                    <p className={`font-medium ${product.stock < 10 ? 'text-red-600' : 'dark:text-white'}`}>
                      {product.stock}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Condition</p>
                    <p className="font-medium dark:text-white capitalize">{product.condition || 'new'}</p>
                  </div>
                  {product.weight && (
                    <div className="flex items-center gap-2">
                      <Weight className="w-4 h-4 text-gray-400" />
                      <span className="text-sm dark:text-gray-300">{product.weight} kg</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {product.description && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold dark:text-white">Description</h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{product.description}</p>
                </div>
              </div>
            )}

            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold dark:text-white">Specifications</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{key}:</span>
                        <span className="text-sm font-medium dark:text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {product.images && product.images.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold dark:text-white">Images</h3>
                </div>
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.images.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={getImageUrl(img)}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {tab === 'orders' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <AdminTable
              data={orders}
              columns={orderColumns}
              keyExtractor={(order) => order.id}

              emptyIcon={Package}
              emptyMessage="Aucune commande pour ce produit"
              total={orders.length}
              perPage={orders.length}
              currentPage={1}
              lastPage={1}
            />
          </motion.div>
        )}
      </div>
    </>
  );
}
