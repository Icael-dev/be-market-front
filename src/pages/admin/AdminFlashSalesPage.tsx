import { toast } from 'react-hot-toast';
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
import { Plus, Edit2, Trash2, X, Save, Zap, Loader2, Power } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useEscape } from '../../hooks/useKeyPress';

export function AdminFlashSalesPage() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  useEscape(() => setShowForm(false), showForm);
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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
    } catch (error) {
      console.error('Flash sales fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

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
      discount_percentage: sale.discount_percentage,
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

      const data = {
        ...formData,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString()
      };

      if (editingSale) {
        await updateAdminFlashSale(editingSale.id, data);
      } else {
        await createAdminFlashSale(data);
      }

      await fetchData();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Flash sale save error:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce flash sale ?')) return;
    try {
      await deleteAdminFlashSale(id);
      setFlashSales(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Flash sale delete error:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggleActive = async (sale: FlashSale) => {
    const nextActive = !sale.is_active;
    setTogglingId(sale.id);
    setFlashSales(prev => prev.map(s => (s.id === sale.id ? { ...s, is_active: nextActive } : s)));
    try {
      await updateAdminFlashSale(sale.id, { is_active: nextActive });
    } catch (error) {
      console.error('Flash sale toggle error:', error);
      setFlashSales(prev => prev.map(s => (s.id === sale.id ? { ...s, is_active: sale.is_active } : s)));
      toast.error('Erreur lors du changement de statut');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <PageHeader
          title="Flash Sales"
          subtitle={`${flashSales.length} vente${flashSales.length > 1 ? 's' : ''} eclair`}
        >
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-orange-600"
          >
            <Plus className="w-5 h-5" />
            Nouveau Flash Sale
          </button>
        </PageHeader>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Produit</th>
                <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Reduction</th>
                <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Periode</th>
                <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Statut</th>
                <th className="text-right px-6 py-4 text-sm font-medium dark:text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {flashSales.map((sale, index) => {
                const product = products.find(p => p.id === sale.product_id);
                const isActive = sale.is_active && new Date(sale.starts_at) <= new Date() && new Date(sale.ends_at) > new Date();

                return (
                  <motion.tr key={sale.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }} className="hover:bg-gray-50 hover:dark:bg-gray-700">
                    <td className="px-6 py-4">
                      <span className="font-medium dark:text-white">{sale.product?.name || product?.name || 'Produit'}</span>

                    </td>
                    <td className="px-6 py-4">
                      <span className="text-orange-600 font-bold">-{sale.discount_percentage}%</span>
                    </td>
                    <td className="px-6 py-4 text-sm dark:text-gray-500">
                      <div>{format(new Date(sale.starts_at), 'dd MMM HH:mm')}</div>
                      <div className="dark:text-gray-500">au {format(new Date(sale.ends_at), 'dd MMM HH:mm')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${sale.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                          {sale.is_active ? 'Actif' : 'Inactif'}
                        </span>
                        {isActive && (
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                            En cours
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleToggleActive(sale)} disabled={togglingId === sale.id} className={`p-3 rounded-lg border transition-colors disabled:opacity-50 ${sale.is_active ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/60' : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'}`} title={sale.is_active ? 'Desactiver' : 'Activer'}>
                          {togglingId === sale.id ? <Loader2 className="w-6 h-6 animate-spin" /> : <Power className="w-6 h-6" />}
                        </button>
                        <button onClick={() => handleEdit(sale)} className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                          <Edit2 className="w-6 h-6" />
                        </button>
                        <button onClick={() => handleDelete(sale.id)} className="p-3 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded-lg transition-colors dark:bg-red-900/40 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/60">
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {flashSales.length === 0 && !loading && (
            <div className="text-center py-12">
              <Zap className="w-12 h-12 dark:text-gray-500 mx-auto mb-4" />
              <p className="dark:text-gray-500">Aucun flash sale</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white dark:bg-gray-800 z-50 overflow-y-auto">
              <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800">
                <h2 className="text-xl font-bold dark:text-white">{editingSale ? 'Modifier' : 'Nouveau Flash Sale'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 hover:dark:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-500 mb-2">Produit *</label>
                  <select
                    id="flash-product_id"
                    name="product_id"
                    value={formData.product_id}
                    onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
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
                    value={formData.discount_percentage}
                    onChange={e => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-500 mb-2">Date debut *</label>
                    <input
                      type="datetime-local"
                      id="flash-starts_at"
                      name="starts_at"
                      value={formData.starts_at}
                      onChange={e => setFormData({ ...formData, starts_at: e.target.value })}
                      className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
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
                      className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" id="flash-is_active" name="is_active" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 text-orange-500 border-gray-300 rounded" />
                  <span className="text-sm dark:text-gray-500">Flash sale actif</span>
                </label>

                <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                  <button onClick={handleSave} disabled={saving || !formData.product_id} className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer
                  </button>
                  <button onClick={() => setShowForm(false)} className="px-6 py-2.5 border dark:border-gray-700 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-700">Annuler</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
