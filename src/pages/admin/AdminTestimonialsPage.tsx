import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Star, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { fetchAdminTestimonials, createAdminTestimonial, updateAdminTestimonial, deleteAdminTestimonial } from '../../services/admin';
import { format } from 'date-fns';
import type { Testimonial } from '../../types';

export function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ full_name: '', role: '', comment: '', rating: 5, is_active: true, sort_order: 0 });

  const fetchTestimonials = async () => {
    try {
      const data = await fetchAdminTestimonials();
      setTestimonials(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const resetForm = () => {
    setForm({ full_name: '', role: '', comment: '', rating: 5, is_active: true, sort_order: 0 });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (t: Testimonial) => {
    setForm({ full_name: t.full_name, role: t.role || '', comment: t.comment, rating: t.rating, is_active: t.is_active, sort_order: t.sort_order });
    setEditing(t);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.full_name || !form.comment) { toast.error('Le nom et le commentaire sont requis'); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateAdminTestimonial(editing.id, form);
        toast.success('Temoignage modifie');
      } else {
        await createAdminTestimonial(form);
        toast.success('Temoignage ajoute');
      }
      resetForm();
      await fetchTestimonials();
    } catch { toast.error('Erreur lors de la sauvegarde'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAdminTestimonial(deleteId);
      toast.success('Temoignage supprime');
      setDeleteId(null);
      await fetchTestimonials();
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  return (
    <AdminLayout>
      <MobileNotOptimizedBanner />
      <div className="p-6 lg:p-8">
        <PageHeader title="Temoignages" subtitle="Gerer les temoignages clients">
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-700">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </PageHeader>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-bold dark:text-white mb-4">{editing ? 'Modifier' : 'Ajouter'} un temoignage</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Nom complet *</label>
                <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full px-4 py-2 border dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Role (optionnel)</label>
                <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2 border dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Commentaire *</label>
                <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} rows={3} className="w-full px-4 py-2 border dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Note</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setForm({ ...form, rating: n })} type="button">
                      <Star className={`w-6 h-6 ${n <= form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Ordre d'affichage</label>
                <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="testimonial-active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded" />
                <label htmlFor="testimonial-active" className="text-sm dark:text-gray-300">Actif</label>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sauvegarder'}
              </button>
              <button onClick={resetForm} className="px-4 py-2 border dark:border-gray-700 rounded-xl dark:text-gray-300">Annuler</button>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
        ) : testimonials.length === 0 ? (
          <div className="card p-12 text-center"><p className="text-gray-500">Aucun temoignage</p></div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold dark:text-white">{t.full_name}</h3>
                    {t.role && <span className="text-sm text-gray-500">{t.role}</span>}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{t.is_active ? 'Actif' : 'Inactif'}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">{[1,2,3,4,5].map(n => (<Star key={n} className={`w-4 h-4 ${n <= t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />))}</div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{t.comment}</p>
                  <p className="text-xs text-gray-400 mt-2">{format(new Date(t.created_at), 'dd MMM yyyy')}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(t)} className="p-2 text-gray-500 hover:text-primary-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteId(t.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Supprimer" message="Ce temoignage sera definitivement supprime." />


      </div>
    </AdminLayout>
  );
}
