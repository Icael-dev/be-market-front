import { toast } from "react-hot-toast";
import { logger } from "../../lib/logger";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  fetchAdminLegalPages,
  createAdminLegalPage,
  updateAdminLegalPage,
  deleteAdminLegalPage,
} from "../../services/admin";
import type { LegalPage } from "../../types";
import { Plus, Edit2, Trash2, Loader2, FileText } from "lucide-react";
import { PageHeader } from "../../components/admin/PageHeader";
import { MobileNotOptimizedBanner } from "../../components/admin/MobileNotOptimizedBanner";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { useEscape } from "../../hooks/useKeyPress";
import { Pagination } from "../../components/Pagination";

export function AdminLegalPage() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  useEscape(() => setShowForm(false), showForm);
  const [editingPage, setEditingPage] = useState<LegalPage | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    content: "",
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const data = await fetchAdminLegalPages();
      setPages(data);
      setCurrentPage(1);
      setTotal(data.length);
    } catch (error) {
      logger.error("Error fetching legal pages:", error);
      toast.error("Erreur lors du chargement des pages legales");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(pages.length / perPage));
  const paginatedPages = pages.slice((currentPage - 1) * perPage, currentPage * perPage);

  const resetForm = () => {
    setFormData({ slug: "", title: "", content: "" });
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
        setPages((prev) => prev.map((p) => (p.id === editingPage.id ? { ...p, ...formData } : p)));
        toast.success("Page legale mise a jour");
      } else {
        const newPage = await createAdminLegalPage(formData);
        setPages((prev) => [...prev, newPage]);
        toast.success("Page legale creee");
      }
      resetForm();
    } catch (error) {
      logger.error("Error saving legal page:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmTargetId) return;
    try {
      await deleteAdminLegalPage(confirmTargetId);
      setPages((prev) => prev.filter((p) => p.id !== confirmTargetId));
      toast.success("Page legale supprimee");
    } catch (error) {
      logger.error("Error deleting legal page:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setConfirmOpen(false);
      setConfirmTargetId(null);
    }
  };

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader
          title="Pages legales"
          subtitle={`${pages.length} page${pages.length > 1 ? "s" : ""}`}
        >
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
          >
            <Plus className="h-5 w-5" />
            Ajouter une page
          </button>
        </PageHeader>

        <div className="grid gap-4">
          {paginatedPages.map((page, index) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/40">
                  <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-gray-900 dark:text-white">
                    {page.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">/{page.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(page)}
                    className="rounded-lg bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setConfirmTargetId(page.id);
                      setConfirmOpen(true);
                    }}
                    className="rounded-lg bg-red-100 p-2 text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {pages.length === 0 && !loading && (
            <div className="rounded-lg border bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
              <p className="dark:text-gray-500">Aucune page legale</p>
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
                {editingPage ? "Modifier la page" : "Nouvelle page legale"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    className="w-full rounded-lg border bg-white px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="cgv, returns, privacy, terms"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-lg border bg-white px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">
                    Contenu *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full rounded-lg border bg-white px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    required
                  />
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
                    ) : editingPage ? (
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
        title="Supprimer la page"
        message="Etes-vous sûr de vouloir supprimer cette page legale ?"
      />
      <>
        <Pagination
          currentPage={currentPage}
          lastPage={totalPages}
          perPage={perPage}
          total={total}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </>
    </>
  );
}
