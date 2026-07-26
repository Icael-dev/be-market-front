import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  fetchAdminLegalPages,
  createAdminLegalPage,
  updateAdminLegalPage,
  deleteAdminLegalPage
} from '../../services/admin';
import type { LegalPage } from '../../types';
import { Plus, Edit2, Trash2, Loader2, FileText } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useEscape } from '../../hooks/useKeyPress';

export function AdminLegalPage() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  useEscape(() => setShowForm(false), showForm);
  const [editingPage, setEditingPage] = useState<LegalPage | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: ''
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const data = await fetchAdminLegalPages();
      setPages(data);
    } catch (error) {
      console.error('Error fetching legal pages:', error);
      toast.error('Erreur lors du chargement des pages legales');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ slug: '', title: '', content: '' });
    setEditingPage(null);
    setShowForm(false);
  };

  const handleEdit = (page: LegalPage) => {
    setFormData({ slug: page.slug, title: page.title, content: page.content });
    setEditingPage(page);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPage) {
        await updateAdminLegalPage(editingPage.id, formData);
        setPages(prev => prev.map(p => (p.id === editingPage.id ? { ...p, ...formData } : p)));
        toast.success('Page legale mise a jour');
      } else {
        const newPage = await createAdminLegalPage(formData);
        setPages(prev => [...prev, newPage]);
        toast.success('Page legale creee');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving legal page:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmTargetId) return;
    try {
      await deleteAdminLegalPage(confirmTargetId);
      setPages(prev => prev.filter(p => p.id !== confirmTargetId));
      toast.success('Page legale supprimee');
    } catch (error) {
      console.error('Error deleting legal page:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setConfirmOpen(false);
      setConfirmTargetId(null);
    }
  };

  return (
    <AdminLayout>
      <MobileNotOptimizedBanner />
      <div className="p-6 lg:p-8">
        <PageHeader
          title="Pages legales"
          subtitle={`${pages.length} page${pages.length > 1 ? 's' : ''}`}
        >
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Ajouter une page
          </button>
        </PageHeader>

        <div className="grid gap-4">
          {pages.map((page, index) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{page.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">/{page.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(page)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-200"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => { setConfirmTargetId(page.id); setConfirmOpen(true); }}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors dark:bg-red-900/40 dark:text-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {pages.length === 0 && !loading && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-12 text-center">
              <p className="dark:text-gray-500">Aucune page legale</p>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={resetForm}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {editingPage ? 'Modifier la page' : 'Nouvelle page legale'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-1">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="cgv, returns, privacy, terms"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-1">Titre *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-1">Contenu *</label>
                  <textarea
                    value={formData.content}
                    onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={resetForm} className="flex-1 px-4 py-3 border dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Annuler
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingPage ? 'Modifier' : 'Creer')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setConfirmTargetId(null); }}
        onConfirm={handleDelete}
        title="Supprimer la page"
        message="Etes-vous sûr de vouloir supprimer cette page legale ?"
      />
    </AdminLayout>
  );
}