import { toast } from "react-hot-toast";
import { logger } from "../../lib/logger";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  restoreAdminCategory,
} from "../../services/admin";
import type { Category, CategorySpec } from "../../types";
import { Plus, Edit2, Trash2, X, Save, Loader2, Tag, Power, RotateCcw } from "lucide-react";
import { PageHeader } from "../../components/admin/PageHeader";
import { MobileNotOptimizedBanner } from "../../components/admin/MobileNotOptimizedBanner";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { AdminDrawer } from "../../components/admin/AdminDrawer";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { cn } from "../../lib/utils";
import { useEscape } from "../../hooks/useKeyPress";
import { AdminTable, type Column } from "../../components/admin/AdminTable";

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  useEscape(() => setShowForm(false), showForm);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    is_active: true,
    specs: [{ key: "", placeholder: "" }] as { key: string; placeholder?: string | null }[],
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await fetchAdminCategories();
      setCategories(data);
      setCurrentPage(1);
      setTotal(data.length);
    } catch (error) {
      logger.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(categories.length / perPage));
  const paginatedCategories = categories.slice((currentPage - 1) * perPage, currentPage * perPage);

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      is_active: true,
      specs: [{ key: "", placeholder: "" }],
    });
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      is_active: category.is_active,
      specs:
        category.specs && category.specs.length > 0
          ? category.specs.map((s) => ({ key: s.key, placeholder: s.placeholder || "" }))
          : [{ key: "", placeholder: "" }],
    });
    setShowForm(true);
  };

  const addSpecRow = () => {
    setFormData((prev) => ({
      ...prev,
      specs: [...prev.specs, { key: "", placeholder: "" }],
    }));
  };

  const updateSpec = (index: number, field: "key" | "placeholder", value: string) => {
    setFormData((prev) => ({
      ...prev,
      specs: prev.specs.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  };

  const removeSpec = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index),
    }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: editingCategory ? formData.slug : generateSlug(name),
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) return;
    setSaving(true);

    const specsToSend = formData.specs
      .filter((s) => s.key.trim())
      .map((s) => ({ key: s.key.trim(), placeholder: s.placeholder ?? null })) as CategorySpec[];

    try {
      const data: Partial<Category> = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        is_active: formData.is_active,
        specs: specsToSend.length > 0 ? specsToSend : undefined,
      };

      if (editingCategory) {
        await updateAdminCategory(editingCategory.id, data);
      } else {
        await createAdminCategory(data);
      }

      await fetchCategories();
      setShowForm(false);
      resetForm();
    } catch (error) {
      logger.error("Error saving category:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmTargetId) return;
    try {
      await deleteAdminCategory(confirmTargetId);
      setCategories((prev) => prev.filter((c) => c.id !== confirmTargetId));
    } catch (error) {
      logger.error("Error deleting category:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setConfirmOpen(false);
      setConfirmTargetId(null);
    }
  };

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      const restored = await restoreAdminCategory(id);
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...restored, deleted_at: null } : c))
      );
      toast.success("Categorie restauree");
    } catch (error) {
      logger.error("Error restoring category:", error);
      toast.error("Erreur lors de la restauration");
    } finally {
      setRestoringId(null);
    }
  };

  const handleToggleActive = async (category: Category) => {
    const nextActive = !category.is_active;
    setTogglingId(category.id);
    setCategories((prev) =>
      prev.map((c) => (c.id === category.id ? { ...c, is_active: nextActive } : c))
    );
    try {
      await updateAdminCategory(category.id, { is_active: nextActive });
    } catch (error) {
      logger.error("Error toggling category status:", error);
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, is_active: category.is_active } : c))
      );
      toast.error("Erreur lors du changement de statut");
    } finally {
      setTogglingId(null);
    }
  };

  const columns: Column<Category>[] = [
    {
      key: "name",
      label: "Categorie",
      render: (category) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
            <svg
              className="h-5 w-5 text-gray-400 dark:text-gray-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{category.name}</p>
            {category.description && (
              <p className="max-w-xs truncate text-xs text-gray-500 dark:text-gray-400">
                {category.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      render: (category) => (
        <span className="font-mono text-sm text-gray-600 dark:text-gray-500">{category.slug}</span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (category) => (
        <StatusBadge
          label={category.deleted_at ? "Supprime" : category.is_active ? "Active" : "Inactive"}
          variant={category.deleted_at ? "danger" : category.is_active ? "success" : "neutral"}
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (category) => (
        <div className="flex items-center justify-end gap-2">
          {category.deleted_at ? (
            <button
              onClick={() => handleRestore(category.id)}
              disabled={restoringId === category.id}
              className="flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200 disabled:opacity-50 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
            >
              {restoringId === category.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Restaurer
            </button>
          ) : (
            <>
              <button
                onClick={() => handleToggleActive(category)}
                disabled={togglingId === category.id}
                className={cn(
                  "rounded-lg border p-2 transition-colors disabled:opacity-50",
                  category.is_active
                    ? "border-green-300 bg-green-100 text-green-700 hover:bg-green-200 dark:border-green-700 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60"
                    : "border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                )}
                title={category.is_active ? "Désactiver" : "Activer"}
              >
                {togglingId === category.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Power className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => handleEdit(category)}
                className="rounded-lg border border-gray-200 bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                title="Modifier"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setConfirmTargetId(category.id);
                  setConfirmOpen(true);
                }}
                className="rounded-lg border border-red-300 bg-red-100 p-2 text-red-700 transition-colors hover:bg-red-200 dark:border-red-700 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader
          title="Categories"
          subtitle={`${categories.length} categorie${categories.length > 1 ? "s" : ""}`}
        >
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
          >
            <Plus className="h-5 w-5" />
            Nouvelle categorie
          </button>
        </PageHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AdminTable
            data={paginatedCategories}
            columns={columns}
            keyExtractor={(category) => category.id}

            emptyIcon={Tag}
            emptyMessage="Aucune categorie"
            loading={loading}
            total={total}
            perPage={perPage}
            currentPage={currentPage}
            lastPage={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            onRowClick={(category) => {
              setEditingCategory(category);
              setFormData({
                name: category.name,
                slug: category.slug,
                description: category.description || "",
                is_active: category.is_active,
                specs:
                  category.specs && category.specs.length > 0
                    ? category.specs.map((s) => ({ key: s.key, placeholder: s.placeholder || "" }))
                    : [{ key: "", placeholder: "" }],
              });
              setShowForm(true);
            }}
          />
        </motion.div>
      </div>

      <AdminDrawer
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingCategory ? "Modifier la categorie" : "Nouvelle categorie"}
      >
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium dark:text-gray-300">Nom *</label>
            <input
              type="text"
              id="category-name"
              name="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-lg border bg-white px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              placeholder="Ex: Telephones"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium dark:text-gray-300">
              Slug (auto-genere)
            </label>
            <input
              type="text"
              id="category-slug"
              name="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              disabled
              className="w-full cursor-not-allowed rounded-lg border bg-gray-50 px-4 py-3 font-mono text-sm dark:border-gray-700 dark:bg-gray-700 dark:text-gray-500"
            />
            <p className="mt-1 text-xs dark:text-gray-500">Genere automatiquement depuis le nom</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium dark:text-gray-300">Description</label>
            <textarea
              id="category-description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border bg-white px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              placeholder="Description de la categorie..."
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              id="category-is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 dark:text-primary-400"
            />
            <span className="text-sm dark:text-gray-300">Categorie active</span>
          </label>

          <div className="border-t pt-4 dark:border-gray-700">
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-sm font-medium dark:text-gray-300">
                Specifications par defaut
              </label>
              <button
                type="button"
                onClick={addSpecRow}
                className="text-xs font-medium text-primary-600 hover:text-primary-700"
              >
                + Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {formData.specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Tag className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    id={`category-spec-key-${i}`}
                    name={`spec_key_${i}`}
                    value={spec.key}
                    onChange={(e) => updateSpec(i, "key", e.target.value)}
                    placeholder="Cle (ex: Marque)"
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500",
                      "dark:border-gray-700"
                    )}
                  />
                  <input
                    type="text"
                    id={`category-spec-placeholder-${i}`}
                    name={`spec_placeholder_${i}`}
                    value={spec.placeholder || ""}
                    onChange={(e) => updateSpec(i, "placeholder", e.target.value)}
                    placeholder="Placeholder (ex: Ex: Samsung)"
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500",
                      "dark:border-gray-700"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(i)}
                    disabled={formData.specs.length <= 1}
                    className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs dark:text-gray-500">
              Ces specifications seront pre-remplies quand vous creerez un produit dans cette
              categorie
            </p>
          </div>

          <div className="flex gap-3 border-t pt-4 dark:border-gray-700">
            <button
              onClick={handleSave}
              disabled={saving || !formData.name || !formData.slug}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border px-6 py-2.5 font-medium transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
          </div>
        </div>
      </AdminDrawer>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setConfirmTargetId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer cette categorie ?"
        message="Cette action est irreversible."
        variant="danger"
      />
    </>
  );
}
