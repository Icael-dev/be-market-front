import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  fetchAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon
} from '../../services/admin';
import type { Coupon } from '../../types';
import { Plus, Edit2, Trash2, X, Save, Tag, Percent, DollarSign, Loader2, Power } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { AnimatePresence } from 'framer-motion';

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [form, setForm] = useState({ code: '', discount_type: 'percentage' as 'percentage' | 'fixed', discount_value: 10, min_order_amount: 0 as number | null, max_uses: null as number | null, expires_at: '', is_active: true });

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      const data = await fetchAdminCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setForm({ code: '', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, max_uses: null, expires_at: '', is_active: true }); setEditing(null); };

  const handleEdit = (c: Coupon) => { setEditing(c); setForm({ code: c.code, discount_type: c.discount_type, discount_value: c.discount_value, min_order_amount: c.min_order_amount, max_uses: c.max_uses, expires_at: c.expires_at ? c.expires_at.split('T')[0] : '', is_active: c.is_active }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.code) return;
    setSaving(true);
    const data = { ...form, code: form.code.toUpperCase(), expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null };
    try {
      if (editing) {
        await updateAdminCoupon(editing.id, data);
      } else {
        await createAdminCoupon(data);
      }
      await fetchCoupons();
      setShowForm(false);
      reset();
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ?')) return;
    try {
      await deleteAdminCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    const nextActive = !coupon.is_active;
    setTogglingId(coupon.id);
    setCoupons(prev => prev.map(c => (c.id === coupon.id ? { ...c, is_active: nextActive } : c)));
    try {
      await updateAdminCoupon(coupon.id, { is_active: nextActive });
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      setCoupons(prev => prev.map(c => (c.id === coupon.id ? { ...c, is_active: coupon.is_active } : c)));
      toast.error('Erreur lors du changement de statut');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <PageHeader
          title="Codes Promo"
          subtitle={`${coupons.length} code${coupons.length > 1 ? 's' : ''}`}
        >
          <button onClick={() => { reset(); setShowForm(true); }} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary-700"><Plus className="w-5 h-5" /> Nouveau</button>
        </PageHeader>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden">
          <table className="w-full"><thead className="bg-gray-50 dark:bg-gray-800 border-b"><tr><th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Code</th><th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Reduction</th><th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Utilisations</th><th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Statut</th><th className="text-right px-6 py-4 text-sm font-medium dark:text-gray-500">Actions</th></tr></thead>
            <tbody className="divide-y">{coupons.map((c, i) => (<motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="dark:hover:bg-gray-700"><td className="px-6 py-4"><span className="font-mono font-bold dark:text-white">{c.code}</span></td><td className="px-6 py-4"><span className="dark:text-white">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `${c.discount_value} FCFA`}</span></td><td className="px-6 py-4 dark:text-gray-500">{c.uses_count}{c.max_uses ? ` / ${c.max_uses}` : ''}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>{c.is_active ? 'Actif' : 'Inactif'}</span></td><td className="px-6 py-4"><div className="flex justify-end gap-2"><button onClick={() => handleToggleActive(c)} disabled={togglingId === c.id} className={`p-3 rounded-lg border transition-colors disabled:opacity-50 ${c.is_active ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/60' : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'}`} title={c.is_active ? 'Desactiver' : 'Activer'}>{togglingId === c.id ? <Loader2 className="w-6 h-6 animate-spin" /> : <Power className="w-6 h-6" />}</button><button onClick={() => handleEdit(c)} className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"><Edit2 className="w-6 h-6" /></button><button onClick={() => handleDelete(c.id)} className="p-3 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded-lg transition-colors dark:bg-red-900/40 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/60"><Trash2 className="w-6 h-6" /></button></div></td></motion.tr>))}</tbody>
          </table>
          {coupons.length === 0 && !loading && <div className="text-center py-12"><Tag className="w-12 h-12 dark:text-gray-500 mx-auto mb-4" /><p className="dark:text-gray-500">Aucun code promo</p></div>}
        </div>
      </div>

      <AnimatePresence>{showForm && (<><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/50 z-50" /><motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white dark:bg-gray-800 z-50 overflow-y-auto"><div className="p-6 border-b flex justify-between sticky top-0 bg-white dark:bg-gray-800"><h2 className="text-xl font-bold dark:text-white">{editing ? 'Modifier' : 'Nouveau code'}</h2><button onClick={() => setShowForm(false)} className="p-2 hover:dark:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button></div><div className="p-6 space-y-6">
        <div><label className="block text-sm font-medium dark:text-gray-500 mb-2">Code *</label><input type="text" id="coupon-code" name="code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER2024" className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl font-mono" /></div>
        <div><label className="block text-sm font-medium dark:text-gray-500 mb-2">Type</label><div className="flex gap-3"><button type="button" onClick={() => setForm({ ...form, discount_type: 'percentage' })} className={`flex-1 p-3 rounded-xl border ${form.discount_type === 'percentage' ? 'border-primary-500 dark:bg-primary-900/30 dark:text-primary-400' : 'dark:border-gray-700 dark:text-gray-500'}`}><Percent className="w-4 h-4 inline mr-2" />Pourcentage</button><button type="button" onClick={() => setForm({ ...form, discount_type: 'fixed' })} className={`flex-1 p-3 rounded-xl border ${form.discount_type === 'fixed' ? 'border-primary-500 dark:bg-primary-900/30 dark:text-primary-400' : 'dark:border-gray-700 dark:text-gray-500'}`}><DollarSign className="w-4 h-4 inline mr-2" />Montant</button></div></div>
        <div><label className="block text-sm font-medium dark:text-gray-500 mb-2">{form.discount_type === 'percentage' ? 'Pourcentage' : 'Montant (FCFA)'}</label><input type="number" id="coupon-discount-value" name="discount_value" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl" /></div>
        <div><label className="block text-sm font-medium dark:text-gray-500 mb-2">Montant minimum (FCFA)</label><input type="number" id="coupon-min-order-amount" name="min_order_amount" value={form.min_order_amount ?? ''} onChange={e => setForm({ ...form, min_order_amount: e.target.value ? parseFloat(e.target.value) : null })} className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl" /></div>
        <div><label className="block text-sm font-medium dark:text-gray-500 mb-2">Utilisations max</label><input type="number" id="coupon-max-uses" name="max_uses" value={form.max_uses ?? ''} onChange={e => setForm({ ...form, max_uses: e.target.value ? parseInt(e.target.value) : null })} className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl" /></div>
        <div><label className="block text-sm font-medium dark:text-gray-500 mb-2">Expiration</label><input type="date" id="coupon-expires-at" name="expires_at" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl" /></div>
        <label className="flex items-center gap-2"><input type="checkbox" id="coupon-is-active" name="is_active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 dark:text-primary-400 border-gray-300 rounded" /><span className="text-sm dark:text-gray-500">Actif</span></label>
        <div className="flex gap-3 pt-4 border-t"><button onClick={handleSave} disabled={saving || !form.code} className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Enregistrer</button><button onClick={() => setShowForm(false)} className="px-6 py-2.5 border dark:border-gray-700 rounded-xl font-medium">Annuler</button></div>
      </div></motion.div></>)}</AnimatePresence>
    </AdminLayout>
  );
}