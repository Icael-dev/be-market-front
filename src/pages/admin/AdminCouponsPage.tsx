import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import type { Coupon } from '../../types';
import { Plus, Edit2, Trash2, X, Save, Tag, Percent, DollarSign, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AnimatePresence } from 'framer-motion';

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ code: '', discount_type: 'percentage' as 'percentage' | 'fixed', discount_value: 10, min_order_amount: 0, max_uses: null as number | null, expires_at: '', is_active: true });

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => { const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false }); if (data) setCoupons(data as Coupon[]); setLoading(false); };

  const reset = () => { setForm({ code: '', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, max_uses: null, expires_at: '', is_active: true }); setEditing(null); };

  const handleEdit = (c: Coupon) => { setEditing(c); setForm({ code: c.code, discount_type: c.discount_type, discount_value: c.discount_value, min_order_amount: c.min_order_amount, max_uses: c.max_uses, expires_at: c.expires_at ? c.expires_at.split('T')[0] : '', is_active: c.is_active }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.code) return;
    setSaving(true);
    const data = { ...form, code: form.code.toUpperCase(), expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null };
    const { error } = editing
      ? await supabase.from('coupons').update(data).eq('id', editing.id)
      : await supabase.from('coupons').insert(data);
    if (!error) { await fetchCoupons(); setShowForm(false); reset(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => { if (!confirm('Supprimer ?')) return; const { error } = await supabase.from('coupons').delete().eq('id', id); if (!error) setCoupons(prev => prev.filter(c => c.id !== id)); };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-bold text-gray-900">Codes Promo</h1><p className="text-gray-500">{coupons.length} code{coupons.length > 1 ? 's' : ''}</p></div>
          <button onClick={() => { reset(); setShowForm(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700"><Plus className="w-5 h-5" /> Nouveau</button>
        </motion.div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full"><thead className="bg-gray-50 border-b"><tr><th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Code</th><th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Reduction</th><th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Utilisations</th><th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Statut</th><th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th></tr></thead>
            <tbody className="divide-y">{coupons.map((c, i) => (<motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-gray-50"><td className="px-6 py-4"><span className="font-mono font-bold text-gray-900">{c.code}</span></td><td className="px-6 py-4"><span className="text-gray-900">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `${c.discount_value} FCFA`}</span></td><td className="px-6 py-4 text-gray-600">{c.uses_count}{c.max_uses ? ` / ${c.max_uses}` : ''}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{c.is_active ? 'Actif' : 'Inactif'}</span></td><td className="px-6 py-4"><div className="flex justify-end gap-2"><button onClick={() => handleEdit(c)} className="p-2 hover:bg-gray-100 rounded-lg"><Edit2 className="w-4 h-4 text-gray-600" /></button><button onClick={() => handleDelete(c.id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button></div></td></motion.tr>))}</tbody>
          </table>
          {coupons.length === 0 && !loading && <div className="text-center py-12"><Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Aucun code promo</p></div>}
        </div>
      </div>

      <AnimatePresence>{showForm && (<><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/50 z-50" /><motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white z-50 overflow-y-auto"><div className="p-6 border-b flex justify-between sticky top-0 bg-white"><h2 className="text-xl font-bold text-gray-900">{editing ? 'Modifier' : 'Nouveau code'}</h2><button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button></div><div className="p-6 space-y-6">
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Code *</label><input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER2024" className="w-full px-4 py-3 border border-gray-200 rounded-xl font-mono" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Type</label><div className="flex gap-3"><button type="button" onClick={() => setForm({ ...form, discount_type: 'percentage' })} className={`flex-1 p-3 rounded-xl border ${form.discount_type === 'percentage' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}><Percent className="w-4 h-4 inline mr-2" />Pourcentage</button><button type="button" onClick={() => setForm({ ...form, discount_type: 'fixed' })} className={`flex-1 p-3 rounded-xl border ${form.discount_type === 'fixed' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}><DollarSign className="w-4 h-4 inline mr-2" />Montant</button></div></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">{form.discount_type === 'percentage' ? 'Pourcentage' : 'Montant (FCFA)'}</label><input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 border border-gray-200 rounded-xl" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Expiration</label><input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl" /></div>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 text-blue-600 border-gray-300 rounded" /><span className="text-sm text-gray-700">Actif</span></label>
        <div className="flex gap-3 pt-4 border-t"><button onClick={handleSave} disabled={saving || !form.code} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Enregistrer</button><button onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-200 rounded-xl font-medium">Annuler</button></div>
      </div></motion.div></>)}</AnimatePresence>
    </AdminLayout>
  );
}