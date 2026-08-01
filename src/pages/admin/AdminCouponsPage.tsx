import { toast } from 'react-hot-toast';
import { logger } from '../../lib/logger';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  fetchAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon
} from '../../services/admin';
import type { Coupon } from '../../types';
import { Plus, Edit2, Trash2, Save, Tag, Percent, DollarSign, Loader2, Power } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { AdminDrawer } from '../../components/admin/AdminDrawer';
import { AdminTable, type Column } from '../../components/admin/AdminTable';
import { useEscape } from '../../hooks/useKeyPress';
import { useAuth } from '../../context/AuthContext';

interface CouponForm {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number | null;
  min_order_amount: number | null;
  max_uses: number | null;
  expires_at: string;
  is_active: boolean;
}

export function AdminCouponsPage() {
  const { isSuperAdmin } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(8);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  useEscape(() => setShowForm(false), showForm);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [form, setForm] = useState<CouponForm>({ code: '', discount_type: 'percentage', discount_value: null, min_order_amount: null, max_uses: null, expires_at: '', is_active: true });

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      const data = await fetchAdminCoupons();
      setCoupons(data);
      setCurrentPage(1);
      setTotal(data.length);
    } catch (error) {
      logger.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(coupons.length / perPage));
  const paginatedCoupons = coupons.slice((currentPage - 1) * perPage, currentPage * perPage);

  const reset = () => { setForm({ code: '', discount_type: 'percentage', discount_value: 10, min_order_amount: null, max_uses: null, expires_at: '', is_active: true }); setEditing(null); };

  const handleEdit = (c: Coupon) => { setEditing(c); setForm({ code: c.code, discount_type: c.discount_type, discount_value: c.discount_value, min_order_amount: (c.min_order_amount ?? 0) as number, max_uses: c.max_uses, expires_at: c.expires_at ? c.expires_at.split('T')[0] : '', is_active: c.is_active }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.code) return;
    setSaving(true);
    const data: Record<string, unknown> = {
      code: form.code.toUpperCase(),
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      discount_type: form.discount_type,
      is_active: form.is_active,
    };
    if (form.discount_value != null) data.discount_value = Number(form.discount_value);
    if (form.min_order_amount != null) data.min_order_amount = Number(form.min_order_amount);
    if (form.max_uses != null) data.max_uses = Number(form.max_uses);
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
      logger.error('Error saving coupon:', error);
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
      logger.error('Error deleting coupon:', error);
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
      logger.error('Error toggling coupon status:', error);
      setCoupons(prev => prev.map(c => (c.id === coupon.id ? { ...c, is_active: coupon.is_active } : c)));
      toast.error('Erreur lors du changement de statut');
    } finally {
      setTogglingId(null);
    }
  };

  const columns: Column<Coupon>[] = [
    {
      key: 'code',
      label: 'Code',
      render: (coupon) => (
        <span className="font-mono font-bold text-gray-900 dark:text-white">{coupon.code}</span>
      ),
    },
    {
      key: 'discount',
      label: 'Reduction',
      render: (coupon) => (
        <span className="text-gray-900 dark:text-white">
          {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `${coupon.discount_value} FCFA`}
        </span>
      ),
    },
    {
      key: 'uses',
      label: 'Utilisations',
      render: (coupon) => (
        <span className="text-gray-600 dark:text-gray-400">
          {coupon.uses_count}{coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Statut',
      render: (coupon) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          coupon.is_active
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {coupon.is_active ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (coupon) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleToggleActive(coupon)}
            disabled={togglingId === coupon.id}
            className={`p-3 rounded-lg border transition-colors disabled:opacity-50 ${
              coupon.is_active
                ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/60'
                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
            }`}
            title={coupon.is_active ? 'Desactiver' : 'Activer'}
          >
            {togglingId === coupon.id ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Power className="w-6 h-6" />
            )}
          </button>
          <button
            onClick={() => handleEdit(coupon)}
            className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            title="Modifier"
          >
            <Edit2 className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleDelete(coupon.id)}
            className="p-3 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded-lg transition-colors dark:bg-red-900/40 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/60"
            title="Supprimer"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <MobileNotOptimizedBanner />
      <div className="p-6 lg:p-8">
        <PageHeader
          title="Codes Promo"
          subtitle={`${coupons.length} code${coupons.length > 1 ? 's' : ''}`}
        >
          {isSuperAdmin && (
            <button onClick={() => { reset(); setShowForm(true); }} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary-700"><Plus className="w-5 h-5" /> Nouveau</button>
          )}
        </PageHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AdminTable
            data={paginatedCoupons}
            columns={columns}
            keyExtractor={(coupon) => coupon.id}

            emptyIcon={Tag}
            emptyMessage="Aucun code promo"
            loading={loading}
            total={total}
            perPage={perPage}
            currentPage={currentPage}
            lastPage={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </motion.div>
      </div>

      <AdminDrawer
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Modifier' : 'Nouveau code'}
      >
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Code *</label>
            <input
              type="text"
              id="coupon-code"
              name="code"
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="SUMMER2024"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, discount_type: 'percentage' })}
                className={`flex-1 p-3 rounded-xl border ${form.discount_type === 'percentage' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
              >
                <Percent className="w-4 h-4 inline mr-2" />
                Pourcentage
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, discount_type: 'fixed' })}
                className={`flex-1 p-3 rounded-xl border ${form.discount_type === 'fixed' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
              >
                <DollarSign className="w-4 h-4 inline mr-2" />
                Montant
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {form.discount_type === 'percentage' ? 'Pourcentage' : 'Montant (FCFA)'}
            </label>
            <input
              type="number"
              id="coupon-discount-value"
              name="discount_value"
              value={form.discount_value ?? ''}
              onChange={e => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Montant minimum (FCFA)</label>
            <input type="number" id="coupon-min-order-amount" name="min_order_amount" value={form.min_order_amount ?? ''} onChange={e => setForm({ ...form, min_order_amount: e.target.value ? parseFloat(e.target.value) : null })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Utilisations max</label>
            <input type="number" id="coupon-max-uses" name="max_uses" value={form.max_uses ?? ''} onChange={e => setForm({ ...form, max_uses: e.target.value ? parseInt(e.target.value) : null })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Expiration</label>
            <input type="date" id="coupon-expires-at" name="expires_at" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" id="coupon-is-active" name="is_active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded border-gray-300 dark:border-gray-600" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Actif</span>
          </label>
          <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
            <button onClick={handleSave} disabled={saving || !form.code} className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer
            </button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              Annuler
            </button>
          </div>
        </div>
      </AdminDrawer>
    </AdminLayout>
  );
}
