import { toast } from "react-hot-toast";
import { logger } from "../../lib/logger";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  fetchAdminFAQs,
  createAdminFAQ,
  updateAdminFAQ,
  deleteAdminFAQ,
} from "../../services/admin";
import type { FAQ } from "../../types";
import { Plus, Edit2, Trash2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader } from "../../components/admin/PageHeader";
import { MobileNotOptimizedBanner } from "../../components/admin/MobileNotOptimizedBanner";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { useEscape } from "../../hooks/useKeyPress";
import { Pagination } from "../../components/Pagination";

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
    question: "",
    answer: "",
    category: "",
    sort_order: 0,
    is_active: true,
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
      logger.error("Error fetching FAQs:", error);
      toast.error("Erreur lors du chargement des FAQ");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(faqs.length / perPage));
  const paginatedFaqs = faqs.slice((currentPage - 1) * perPage, currentPage * perPage);

  const resetForm = () => {
    setFormData({ question: "", answer: "", category: "", sort_order: 0, is_active: true });
    setEditingFaq(null);
    setShowForm(false);
  };

  const handleEdit = (faq: FAQ) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      sort_order: faq.sort_order,
      is_active: faq.is_active,
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
        setFaqs((prev) => prev.map((f) => (f.id === editingFaq.id ? { ...f, ...formData } : f)));
        toast.success("FAQ mise a jour");
      } else {
        const newFaq = await createAdminFAQ(formData);
        setFaqs((prev) => [...prev, newFaq]);
        toast.success("FAQ creee");
      }
      resetForm();
    } catch (error) {
      logger.error("Error saving FAQ:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmTargetId) return;
    try {
      await deleteAdminFAQ(confirmTargetId);
      setFaqs((prev) => prev.filter((f) => f.id !== confirmTargetId));
      toast.success("FAQ supprimee");
    } catch (error) {
      logger.error("Error deleting FAQ:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setConfirmOpen(false);
      setConfirmTargetId(null);
    }
  };

  const handleToggleActive = async (faq: FAQ) => {
    const nextActive = !faq.is_active;
    setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, is_active: nextActive } : f)));
    try {
      await updateAdminFAQ(faq.id, { is_active: nextActive });
      toast.success(nextActive ? "FAQ activee" : "FAQ desactivee");
    } catch (error) {
      logger.error("Error toggling FAQ:", error);
      setFaqs((prev) =>
        prev.map((f) => (f.id === faq.id ? { ...f, is_active: faq.is_active } : f))
      );
      toast.error("Erreur lors du changement de statut");
    }
  };

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader title="FAQ" subtitle={`${faqs.length} question${faqs.length > 1 ? "s" : ""}`}>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
          >
            <Plus className="h-5 w-5" />
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
              className="overflow-hidden rounded-lg border bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <div
                className="flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              >
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-gray-900 dark:text-white">
                    {faq.question}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{faq.category}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${faq.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}
                    >
                      {faq.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(faq);
                    }}
                    className="rounded-lg border p-2 transition-colors dark:border-gray-600"
                    title={faq.is_active ? "Desactiver" : "Activer"}
                  >
                    {faq.is_active ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(faq);
                    }}
                    className="rounded-lg bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmTargetId(faq.id);
                      setConfirmOpen(true);
                    }}
                    className="rounded-lg bg-red-100 p-2 text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {expandedId === faq.id && (
                <div className="border-t px-4 pb-4 dark:border-gray-700">
                  <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                  <div className="mt-2 text-xs text-gray-400">Tri: {faq.sort_order}</div>
                </div>
              )}
            </motion.div>
          ))}

          {faqs.length === 0 && !loading && (
            <div className="rounded-lg border bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
              <p className="dark:text-gray-500">Aucune question frequente</p>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={resetForm}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                {editingFaq ? "Modifier la FAQ" : "Nouvelle FAQ"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">
                    Question *
                  </label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))}
                    className="w-full rounded-lg border bg-white px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">
                    Reponse *
                  </label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData((prev) => ({ ...prev, answer: e.target.value }))}
                    rows={4}
                    className="w-full rounded-lg border bg-white px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium dark:text-gray-300">
                      Categorie
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="w-full rounded-lg border bg-white px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium dark:text-gray-300">
                      Ordre de tri
                    </label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sort_order: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full rounded-lg border bg-white px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="faq-active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="faq-active" className="text-sm text-gray-700 dark:text-gray-300">
                    Active
                  </label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 rounded-lg border px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-lg bg-primary-600 px-4 py-3 font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    ) : editingFaq ? (
                      "Modifier"
                    ) : (
                      "Creer"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setConfirmTargetId(null);
        }}
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
    </>
  );
}
