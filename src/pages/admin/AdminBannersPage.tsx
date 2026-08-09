import { toast } from "react-hot-toast";
import { logger } from "../../lib/logger";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  fetchAdminBanners,
  createAdminBanner,
  updateAdminBanner,
  deleteAdminBanner,
} from "../../services/admin";
import type { Banner } from "../../types";
import { Plus, Edit2, Trash2, Save, Image as ImageIcon, Loader2, Power } from "lucide-react";
import { PageHeader } from "../../components/admin/PageHeader";
import { MobileNotOptimizedBanner } from "../../components/admin/MobileNotOptimizedBanner";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { AdminDrawer } from "../../components/admin/AdminDrawer";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { useEscape } from "../../hooks/useKeyPress";
import { ImageUpload } from "../../components/admin/ImageUpload";
import { getImageUrl } from "../../lib/imageUrl";
import { Pagination } from "../../components/Pagination";

export function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  useEscape(() => setShowForm(false), showForm);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "",
    button_text: "",
    is_active: true,
    sort_order: 0,
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const data = await fetchAdminBanners();
      setBanners(data);
      setCurrentPage(1);
      setTotal(data.length);
    } catch (error) {
      logger.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(banners.length / perPage));
  const paginatedBanners = banners.slice((currentPage - 1) * perPage, currentPage * perPage);

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      image_url: "",
      link_url: "",
      button_text: "",
      is_active: true,
      sort_order: 0,
    });
    setImageUrls([]);
    setEditingBanner(null);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image_url: banner.image_url,
      link_url: banner.link_url || "",
      button_text: banner.button_text || "",
      is_active: banner.is_active,
      sort_order: banner.sort_order != null ? banner.sort_order : 0,
    });
    setImageUrls(banner.image_url ? [banner.image_url] : []);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const data: Record<string, unknown> = {
        ...formData,
        image_url: imageUrls[0] || "",
      };
      if (formData.sort_order != null && formData.sort_order !== undefined) {
        data.sort_order = Number(formData.sort_order);
      }
      if (editingBanner) {
        await updateAdminBanner(editingBanner.id, data);
      } else {
        await createAdminBanner(data);
      }

      await fetchBanners();
      setShowForm(false);
      resetForm();
    } catch (error) {
      logger.error("Error saving banner:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmTargetId) return;
    try {
      await deleteAdminBanner(confirmTargetId);
      setBanners((prev) => prev.filter((b) => b.id !== confirmTargetId));
    } catch (error) {
      logger.error("Error deleting banner:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setConfirmOpen(false);
      setConfirmTargetId(null);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    const nextActive = !banner.is_active;
    setTogglingId(banner.id);
    setBanners((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, is_active: nextActive } : b))
    );
    try {
      await updateAdminBanner(banner.id, { is_active: nextActive });
    } catch (error) {
      logger.error("Error toggling banner status:", error);
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, is_active: banner.is_active } : b))
      );
      toast.error("Erreur lors du changement de statut");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader
          title="Bannieres"
          subtitle={`${banners.length} banniere${banners.length > 1 ? "s" : ""}`}
        >
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
          >
            <Plus className="h-5 w-5" />
            Ajouter une banniere
          </button>
        </PageHeader>

        <div className="grid gap-6">
          {paginatedBanners.map((banner, index) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="cursor-pointer overflow-hidden rounded-lg border bg-white transition-colors hover:border-primary-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-700"
              onClick={() => handleEdit(banner)}
            >
              <div className="relative h-48">
                <img
                  src={getImageUrl(banner.image_url)}
                  alt={banner.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                <div className="absolute inset-0 flex items-center px-8">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold">{banner.title}</h3>
                    {banner.subtitle && (
                      <p className="mt-1 text-gray-200 dark:text-gray-300">{banner.subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="absolute right-4 top-4 flex items-center gap-2">
                  <StatusBadge
                    label={banner.is_active ? "Active" : "Inactive"}
                    variant={banner.is_active ? "success" : "neutral"}
                  />
                </div>
              </div>

              <div
                className="flex items-center justify-between p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-sm dark:text-gray-500">
                  {banner.link_url && <span>Lien: {banner.link_url}</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    disabled={togglingId === banner.id}
                    className={`rounded-lg border p-3 transition-colors disabled:opacity-50 ${banner.is_active ? "border-green-300 bg-green-100 text-green-700 hover:bg-green-200 dark:border-green-700 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60" : "border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"}`}
                    title={banner.is_active ? "Désactiver" : "Activer"}
                  >
                    {togglingId === banner.id ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Power className="h-6 w-6" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(banner)}
                    className="rounded-lg border border-gray-200 bg-gray-100 p-3 text-gray-700 transition-colors hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    <Edit2 className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => {
                      setConfirmTargetId(banner.id);
                      setConfirmOpen(true);
                    }}
                    className="rounded-lg border border-red-300 bg-red-100 p-3 text-red-700 transition-colors hover:bg-red-200 dark:border-red-700 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
                  >
                    <Trash2 className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {banners.length === 0 && !loading && (
            <div className="rounded-lg border bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
              <ImageIcon className="mx-auto mb-4 h-12 w-12 dark:text-gray-500" />
              <p className="dark:text-gray-500">Aucune banniere</p>
            </div>
          )}
        </div>
      </div>

      <AdminDrawer
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingBanner ? "Modifier la banniere" : "Nouvelle banniere"}
      >
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium dark:text-gray-500">Titre *</label>
            <input
              type="text"
              id="banner-title"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border bg-white px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium dark:text-gray-500">Sous-titre</label>
            <input
              type="text"
              id="banner-subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full rounded-lg border bg-white px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium dark:text-gray-500">Image *</label>
            <ImageUpload
              value={imageUrls}
              onChange={setImageUrls}
              folder="banners"
              single
              maxFiles={1}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium dark:text-gray-500">
              Lien du bouton
            </label>
            <input
              type="text"
              id="banner-link-url"
              name="link_url"
              value={formData.link_url}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
              className="w-full rounded-lg border bg-white px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium dark:text-gray-500">
              Texte du bouton
            </label>
            <input
              type="text"
              id="banner-button-text"
              name="button_text"
              value={formData.button_text}
              onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
              className="w-full rounded-lg border bg-white px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium dark:text-gray-500">Ordre</label>
            <input
              type="number"
              id="banner-sort-order"
              name="sort_order"
              value={formData.sort_order ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
              }
              className="w-full rounded-lg border bg-white px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              id="banner-is-active"
              name="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary-600"
            />
            <span className="text-sm dark:text-gray-500">Banniere active</span>
          </label>

          <div className="flex gap-3 border-t pt-4 dark:border-gray-700">
            <button
              onClick={handleSave}
              disabled={saving || !formData.title || !formData.image_url}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border px-6 py-2.5 font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
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
        title="Supprimer cette banniere ?"
        message="Cette action est irreversible."
        variant="danger"
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
