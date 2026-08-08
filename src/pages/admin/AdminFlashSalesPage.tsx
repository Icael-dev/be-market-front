import { toast } from 'react-hot-toast';
import { logger } from '../../lib/logger';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  createAdminFlashSale,
  deleteAdminFlashSale,
  fetchAdminFlashSales,
  fetchAdminProducts,
  updateAdminFlashSale
} from '../../services/admin';
import type { FlashSale, Product } from '../../types';
import { Plus, Edit2, Trash2, Save, Zap, Loader2, Power } from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { AdminTable, type Column } from '../../components/admin/AdminTable';
import { AdminDrawer } from '../../components/admin/AdminDrawer';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { format } from 'date-fns';
import { useEscape } from '../../hooks/useKeyPress';
import { useAuth } from '../../context/AuthContext';

export function AdminFlashSalesPage() {
  const { isSuperAdmin } = useAuth();
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  useEscape(() => setShowForm(false), showForm);
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    product_id: '',
    discount_percentage: 20,
    starts_at: '',
    ends_at: '',
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sales, products] = await Promise.all([
        fetchAdminFlashSales(),
        fetchAdminProducts()
      ]);

      setFlashSales(sales);
      setProducts(products);
      setCurrentPage(1);
    } catch (error) {
      logger.error('Flash sales fetch error:', error);
    }
  };

  const totalPages = Math.max(1, Math.ceil(flashSales.length / perPage));
  const paginatedFlashSales = flashSales.slice((currentPage - 1) * perPage, currentPage * perPage);

  const resetForm = () => {
    setFormData({
      product_id: '',
      discount_percentage: 20,
      starts_at: '',
      ends_at: '',
      is_active: true
    });
    setEditingSale(null);
  };

  const handleEdit = (sale: FlashSale) => {
    setEditingSale(sale);
    setFormData({
      product_id: sale.product_id,
      discount_percentage: sale.discount_percentage != null ? sale.discount_percentage : 0,
      starts_at: sale.starts_at.slice(0, 16),
      ends_at: sale.ends_at.slice(0, 16),
      is_active: sale.is_active
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.product_id || !formData.starts_at || !formData.ends_at) return;

    setSaving(true);

    try {
      const startsAt = formData.starts_at.includes('T')
        ? formData.starts_at
        : formData.starts_at.replace(' ', 'T');
      const endsAt = formData.ends_at.includes('T')
        ? formData.ends_at
        : formData.ends_at.replace(' ', 'T');

      const data: Record<string, unknown> = {
        ...formData,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
        product_id: formData.product_id,
        is_active: formData.is_active,
      };
      if (formData.discount_percentage != null && formData.discount_percentage !== undefined) {
        data.discount_percentage = Number(formData.discount_percentage);
      }

      if (editingSale) {
        await updateAdminFlashSale(editingSale.id, data);
      } else {
        await createAdminFlashSale(data);
      }

      await fetchData();
      setShowForm(false);
      resetForm();
    } catch (error) {
      logger.error('Flash sale save error:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmTargetId) return;
    try {
      await deleteAdminFlashSale(confirmTargetId);
      setFlashSales(prev => prev.filter(s => s.id !== confirmTargetId));
    } catch (error) {
      logger.error('Flash sale delete error:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setConfirmOpen(false);
      setConfirmTargetId(null);
    }
  };

  const handleToggleActive = async (sale: FlashSale) => {
    const nextActive = !sale.is_active;
    setTogglingId(sale.id);
    setFlashSales(prev => prev.map(s => (s.id === sale.id ? { ...s, is_active: nextActive } : s)));
    try {
      await updateAdminFlashSale(sale.id, { is_active: nextActive });
    } catch (error) {
      logger.error('Flash sale toggle error:', error);
      setFlashSales(prev => prev.map(s => (s.id === sale.id ? { ...s, is_active: sale.is_active } : s)));
      toast.error('Erreur lors du changement de statut');
    } finally {
      setTogglingId(null);
    }
  };

  const columns: Column<FlashSale>[] = [
    {
      key: 'product',
      label: 'Produit',
      render: (item) => {
        const product = products.find(p => p.id === item.product_id);
        return <span className="font-medium dark:text-white">{item.product?.name || product?.name || 'Produit'}</span>;
      },
    },
    {
      key: 'discount_percentage',
      label: 'Reduction',
      render: (item) => (
        <span className="text-orange-600 font-bold">-{item.discount_percentage}%</span>
      ),
    },
    {
      key: 'period',
      label: 'Periode',
      render: (item) => (
        <div className="text-sm dark:text-gray-500">
          <div>{format(new Date(item.starts_at), 'dd MMM HH:mm')}</div>
          <div className="dark:text-gray-500">au {format(new Date(item.ends_at), 'dd MMM HH:mm')}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (item) => {
        const isActive = item.is_active && new Date(item.starts_at) <= new Date() && new Date(item.ends_at) > new Date();
        return (
          <div className="flex items-center gap-2">
            <StatusBadge label={item.is_active ? 'Actif' : 'Inactif'} variant={item.is_active ? 'success' : 'neutral'} />
            {isActive && <StatusBadge label="En cours" variant="warning" />}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader
          title="Flash Sales"
          subtitle={`${flashSales.length} vente${flashSales.length > 1 ? 's' : ''} eclair`}
        >
          {isSuperAdmin && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-orange-600"
            >
              <Plus className="w-5 h-5" />
              Nouveau Flash Sale
            </button>
          )}
        </PageHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AdminTable
            data={paginatedFlashSales}
            columns={columns}
            keyExtractor={(sale) => sale.id}
            emptyIcon={Zap}
            emptyMessage="Aucun flash sale"
            total={flashSales.length}
            perPage={perPage}
            currentPage={currentPage}
            lastPage={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            onRowClick={(sale) => {
              setEditingSale(sale);
              setFormData({
                product_id: sale.product_id,
                discount_percentage: sale.discount_percentage ?? 20,
                starts_at: sale.starts_at || '',
                ends_at: sale.ends_at || '',
                is_active: sale.is_active
              });
              setShowForm(true);
            }}
            renderActions={(sale) => (
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => handleToggleActive(sale)} disabled={togglingId === sale.id} className={`p-3 rounded-lg border transition-colors disabled:opacity-50 ${sale.is_active ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/60' : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'}`} title={sale.is_active ? 'Desactiver' : 'Activer'}>
                  {togglingId === sale.id ? <Loader2 className="w-6 h-6 animate-spin" /> : <Power className="w-6 h-6" />}
                </button>
                <button onClick={() => handleEdit(sale)} className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                  <Edit2 className="w-6 h-6" />
                </button>
                <button onClick={() => { setConfirmTargetId(sale.id); setConfirmOpen(true); }} className="p-3 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded-lg transition-colors dark:bg-red-900/40 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/60">
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            )}
          />
        </motion.div>
      </div>

      <AdminDrawer
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingSale ? 'Modifier' : 'Nouveau Flash Sale'}
      >
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium dark:text-gray-500 mb-2">Produit *</label>
            <select
              id="flash-product_id"
              name="product_id"
              value={formData.product_id}
              onChange={e => setFormData({ ...formData, product_id: e.target.value })}
              className="w-full px-4 py-3 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            >
              <option value="">Selectionnez un produit</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-500 mb-2">Reduction (%) *</label>
                  <input
                    type="number"
                    id="flash-discount_percentage"
                    name="discount_percentage"
                    min="1"
                    max="99"
                    value={formData.discount_percentage ?? ''}
                    onChange={e => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-500 mb-2">Date debut *</label>
                    <input
                      type="datetime-local"
                      id="flash-starts_at"
                      name="starts_at"
                      value={formData.starts_at}
                      onChange={e => setFormData({ ...formData, starts_at: e.target.value })}
                       className="w-full px-4 py-3 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                     />
                  </div>
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-500 mb-2">Date fin *</label>
                    <input
                      type="datetime-local"
                      id="flash-ends_at"
                      name="ends_at"
                      value={formData.ends_at}
                      onChange={e => setFormData({ ...formData, ends_at: e.target.value })}
                       className="w-full px-4 py-3 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                     />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" id="flash-is_active" name="is_active" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })}                   className="w-4 h-4 text-orange-500 border-gray-300 dark:border-gray-600 rounded" />
                  <span className="text-sm dark:text-gray-500">Flash sale actif</span>
                </label>

                <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                  <button onClick={handleSave} disabled={saving || !formData.product_id} className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer
                  </button>
                  <button onClick={() => setShowForm(false)} className="px-6 py-2.5 border dark:border-gray-700 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700">Annuler</button>
                </div>
              </div>
            </AdminDrawer>
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => { setConfirmOpen(false); setConfirmTargetId(null); }}
          onConfirm={handleConfirmDelete}
          title="Supprimer ce flash sale ?"
          message="Cette action est irreversible."
          variant="danger"
        />
      </>
  );
}
