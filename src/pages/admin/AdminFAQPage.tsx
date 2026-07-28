import { toast } from 'react-hot-toast';
import { logger } from '../../lib/logger';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  fetchAdminFAQs,
  createAdminFAQ,
  updateAdminFAQ,
  deleteAdminFAQ
} from '../../services/admin';
import type { FAQ } from '../../types';
import { Plus, Edit2, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useEscape } from '../../hooks/useKeyPress';
import { Pagination } from '../../components/Pagination';

export function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  useEscape(() => setShowForm(false), showForm);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const data = await fetchAdminFAQs();
      setFaqs(data);
      setCurrentPage(1);
      setTotal(data.length);
    } catch (error) {
      logger.error('Error fetching FAQs:', error);
      toast.error('Erreur lors du chargement des FAQ');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(faqs.length / perPage));
  const paginatedFaqs = faqs.slice((currentPage - 1) * perPage, currentPage * perPage);

  const resetForm = () => {
    setFormData({ question: '', answer: '', category: '', sort_order: 0, is_active: true });
    setEditingFaq(null);
    setShowForm(false);
  };

  const handleEdit = (faq: FAQ) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      sort_order: faq.sort_order,
      is_active: faq.is_active
    });
    setEditingFaq(faq);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingFaq) {
        await updateAdminFAQ(editingFaq.id, formData);
        setFaqs(prev => prev.map(f => (f.id === editingFaq.id ? { ...f, ...formData } : f)));
        toast.success('FAQ mise a jour');
      } else {
        const newFaq = await createAdminFAQ(formData);
        setFaqs(prev => [...prev, newFaq]);
        toast.success('FAQ creee');
      }
      resetForm();
    } catch (error) {
      logger.error('Error saving FAQ:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmTargetId) return;
    try {
      await deleteAdminFAQ(confirmTargetId);
      setFaqs(prev => prev.filter(f => f.id !== confirmTargetId));
      toast.success('FAQ supprimee');
    } catch (error) {
      logger.error('Error deleting FAQ:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setConfirmOpen(false);
      setConfirmTargetId(null);
    }
  };

  const handleToggleActive = async (faq: FAQ) => {
    const nextActive = !faq.is_active;
    setFaqs(prev => prev.map(f => (f.id === faq.id ? { ...f, is_active: nextActive } : f)));
    try {
      await updateAdminFAQ(faq.id, { is_active: nextActive });
      toast.success(nextActive ? 'FAQ activee' : 'FAQ desactivee');
    } catch (error) {
      logger.error('Error toggling FAQ:', error);
      setFaqs(prev => prev.map(f => (f.id === faq.id ? { ...f, is_active: faq.is_active } : f)));
      toast.error('Erreur lors du changement de statut');
    }
  };

  return (
    <AdminLayout>
      <MobileNotOptimizedBanner />
      <div className="p-6 lg:p-8">
        <PageHeader
          title="FAQ"
          subtitle={`${faqs.length} question${faqs.length > 1 ? 's' : ''}`}
        >
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Ajouter une question
          </button>
        </PageHeader>

        <div className="grid gap-4">
          {paginatedFaqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden"
            >
              <div
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{faq.question}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{faq.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${faq.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                      {faq.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleActive(faq); }}
                    className="p-2 rounded-lg border transition-colors dark:border-gray-600"
                    title={faq.is_active ? 'Desactiver' : 'Activer'}
                  >
                    {faq.is_active ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(faq); }}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-200"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmTargetId(faq.id); setConfirmOpen(true); }}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors dark:bg-red-900/40 dark:text-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {expandedId === faq.id && (
                <div className="px-4 pb-4 border-t dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 whitespace-pre-wrap">{faq.answer}</p>
                  <div className="mt-2 text-xs text-gray-400">Tri: {faq.sort_order}</div>
                </div>
              )}
            </motion.div>
          ))}

          {faqs.length === 0 && !loading && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-12 text-center">
              <p className="dark:text-gray-500">Aucune question frequente</p>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={resetForm}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {editingFaq ? 'Modifier la FAQ' : 'Nouvelle FAQ'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-1">Question *</label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={e => setFormData(prev => ({ ...prev, question: e.target.value }))}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-1">Reponse *</label>
                  <textarea
                    value={formData.answer}
                    onChange={e => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 mb-1">Categorie</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 mb-1">Ordre de tri</label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={e => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="faq-active"
                    checked={formData.is_active}
                    onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="faq-active" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={resetForm} className="flex-1 px-4 py-3 border dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Annuler
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingFaq ? 'Modifier' : 'Creer')}
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
        title="Supprimer la FAQ"
        message="Etes-vous sûr de vouloir supprimer cette question frequente ?"
      />
      <Pagination
        currentPage={currentPage}
        lastPage={totalPages}
        perPage={perPage}
        total={total}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </AdminLayout>
  );
}