import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  fetchAdminBanners,
  createAdminBanner,
  updateAdminBanner,
  deleteAdminBanner
} from '../../services/admin';
import type { Banner } from '../../types';
import { Plus, Edit2, Trash2, Save, Image as ImageIcon, Loader2, Power } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { AdminDrawer } from '../../components/admin/AdminDrawer';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useEscape } from '../../hooks/useKeyPress';
import { ImageUpload } from '../../components/admin/ImageUpload';
import { getImageUrl } from '../../lib/imageUrl';

export function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  useEscape(() => setShowForm(false), showForm);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    button_text: '',
    is_active: true,
    sort_order: 0
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const data = await fetchAdminBanners();
      setBanners(data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '',
      button_text: '',
      is_active: true,
      sort_order: 0
    });
    setImageUrls([]);
    setEditingBanner(null);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      button_text: banner.button_text || '',
      is_active: banner.is_active,
      sort_order: banner.sort_order != null ? banner.sort_order : 0
    });
    setImageUrls(banner.image_url ? [banner.image_url] : []);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const data: Record<string, unknown> = {
        ...formData,
        image_url: imageUrls[0] || ''
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
      console.error('Error saving banner:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmTargetId) return;
    try {
      await deleteAdminBanner(confirmTargetId);
      setBanners(prev => prev.filter(b => b.id !== confirmTargetId));
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setConfirmOpen(false);
      setConfirmTargetId(null);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    const nextActive = !banner.is_active;
    setTogglingId(banner.id);
    setBanners(prev => prev.map(b => (b.id === banner.id ? { ...b, is_active: nextActive } : b)));
    try {
      await updateAdminBanner(banner.id, { is_active: nextActive });
    } catch (error) {
      console.error('Error toggling banner status:', error);
      setBanners(prev => prev.map(b => (b.id === banner.id ? { ...b, is_active: banner.is_active } : b)));
      toast.error('Erreur lors du changement de statut');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <AdminLayout>
      <MobileNotOptimizedBanner />
      <div className="p-6 lg:p-8">
        <PageHeader
          title="Bannieres"
          subtitle={`${banners.length} banniere${banners.length > 1 ? 's' : ''}`}
        >
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Ajouter une banniere
          </button>
        </PageHeader>

        <div className="grid gap-6">
          {banners.map((banner, index) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden"
            >
                <div className="relative h-48">
                  <img
                    src={getImageUrl(banner.image_url)}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                <div className="absolute inset-0 flex items-center px-8">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold">{banner.title}</h3>
                    {banner.subtitle && (
                      <p className="text-gray-200 dark:text-gray-300 mt-1">{banner.subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <StatusBadge
                    label={banner.is_active ? 'Active' : 'Inactive'}
                    variant={banner.is_active ? 'success' : 'neutral'}
                  />
                </div>
              </div>

              <div className="p-4 flex justify-between items-center">
                <div className="text-sm dark:text-gray-500">
                  {banner.link_url && (
                    <span>Lien: {banner.link_url}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    disabled={togglingId === banner.id}
                    className={`p-3 rounded-lg border transition-colors disabled:opacity-50 ${banner.is_active ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/60' : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'}`}
                    title={banner.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {togglingId === banner.id ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Power className="w-6 h-6" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(banner)}
                    className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    <Edit2 className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => { setConfirmTargetId(banner.id); setConfirmOpen(true); }}
                    className="p-3 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded-lg transition-colors dark:bg-red-900/40 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/60"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {banners.length === 0 && !loading && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-12 text-center">
              <ImageIcon className="w-12 h-12 dark:text-gray-500 mx-auto mb-4" />
              <p className="dark:text-gray-500">Aucune banniere</p>
            </div>
          )}
        </div>
      </div>

      <AdminDrawer
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingBanner ? 'Modifier la banniere' : 'Nouvelle banniere'}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium dark:text-gray-500 mb-2">
              Titre *
            </label>
            <input
              type="text"
              id="banner-title"
              name="title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-500 mb-2">
                    Sous-titre
                  </label>
                  <input
                    type="text"
                    id="banner-subtitle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-500 mb-2">
                    Image *
                  </label>
                  <ImageUpload
                    value={imageUrls}
                    onChange={setImageUrls}
                    folder="banners"
                    single
                    maxFiles={1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-500 mb-2">
                    Lien du bouton
                  </label>
                  <input
                    type="text"
                    id="banner-link-url"
                    name="link_url"
                    value={formData.link_url}
                    onChange={e => setFormData({ ...formData, link_url: e.target.value })}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-500 mb-2">
                    Texte du bouton
                  </label>
                  <input
                    type="text"
                    id="banner-button-text"
                    name="button_text"
                    value={formData.button_text}
                    onChange={e => setFormData({ ...formData, button_text: e.target.value })}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-500 mb-2">
                    Ordre
                  </label>
                  <input
                    type="number"
                    id="banner-sort-order"
                    name="sort_order"
                    value={formData.sort_order ?? ''}
                    onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="banner-is-active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                  />
                  <span className="text-sm dark:text-gray-500">Banniere active</span>
                </label>

                <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                  <button
                    onClick={handleSave}
                    disabled={saving || !formData.title || !formData.image_url}
                    className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2.5 border dark:border-gray-700 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </AdminDrawer>
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => { setConfirmOpen(false); setConfirmTargetId(null); }}
          onConfirm={handleConfirmDelete}
          title="Supprimer cette banniere ?"
          message="Cette action est irreversible."
          variant="danger"
        />
      </AdminLayout>
  );
}