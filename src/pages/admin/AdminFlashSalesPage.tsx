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
import { Plus, Edit2, Trash2, X, Save, Zap, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export function AdminFlashSalesPage() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null);
  const [saving, setSaving] = useState(false);

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
      starts_at: sale.starts_at.split('T')[0],
      ends_at: sale.ends_at.split('T')[0],
      is_active: sale.is_active
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.product_id || !formData.starts_at || !formData.ends_at) return;

    setSaving(true);

    try {
      const data = {
        ...formData,
        starts_at: new Date(formData.starts_at).toISOString(),
        ends_at: new Date(formData.ends_at).toISOString()
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
      alert('Erreur lors de l\'enregistrement');
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
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Flash Sales</h1>
            <p className="text-gray-500 mt-1">{flashSales.length} vente{flashSales.length > 1 ? 's' : ''} eclair</p>
          </div>

          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-orange-600"
          >
            <Plus className="w-5 h-5" />
            Nouveau Flash Sale
          </button>
        </motion.div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Produit</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Reduction</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Periode</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Statut</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {flashSales.map((sale, index) => {
                const product = products.find(p => p.id === sale.product_id);
                const isActive = sale.is_active && new Date(sale.starts_at) <= new Date() && new Date(sale.ends_at) > new Date();

                return (
                  <motion.tr key={sale.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{sale.product?.name || product?.name || 'Produit'}</span>

                    </td>
                    <td className="px-6 py-4">
                      <span className="text-orange-600 font-bold">-{sale.discount_percentage}%</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{format(new Date(sale.starts_at), 'dd MMM HH:mm')}</div>
                      <div className="text-gray-400">au {format(new Date(sale.ends_at), 'dd MMM HH:mm')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(sale)} className="p-2 hover:bg-gray-100 rounded-lg">
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button onClick={() => handleDelete(sale.id)} className="p-2 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4 text-red-500" />
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
              <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun flash sale</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white z-50 overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-xl font-bold text-gray-900">{editingSale ? 'Modifier' : 'Nouveau Flash Sale'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Produit *</label>
                  <select
                    value={formData.product_id}
                    onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="">Selectionnez un produit</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reduction (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={formData.discount_percentage}
                    onChange={e => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date debut *</label>
                    <input
                      type="datetime-local"
                      value={formData.starts_at}
                      onChange={e => setFormData({ ...formData, starts_at: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date fin *</label>
                    <input
                      type="datetime-local"
                      value={formData.ends_at}
                      onChange={e => setFormData({ ...formData, ends_at: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 text-orange-500 border-gray-300 rounded" />
                  <span className="text-sm text-gray-700">Flash sale actif</span>
                </label>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button onClick={handleSave} disabled={saving || !formData.product_id} className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer
                  </button>
                  <button onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50">Annuler</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
