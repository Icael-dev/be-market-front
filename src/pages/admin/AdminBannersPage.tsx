import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  fetchAdminBanners,
  createAdminBanner,
  updateAdminBanner,
  deleteAdminBanner,
  uploadProductImage
} from '../../services/admin';
import type { Banner } from '../../types';
import { Plus, Edit2, Trash2, X, Save, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { AnimatePresence } from 'framer-motion';

const displayImageUrl = (url: string) => {
  if (!url) return url;
  if (url.includes('/storage/products/')) {
    return url.replace('/storage/products/', '/api/images/');
  }
  return url;
};

export function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    button_text: '',
    is_active: true,
    sort_order: 0
  });
  const [uploadingImage, setUploadingImage] = useState(false);

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
    setEditingBanner(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const result = await uploadProductImage(fd);
      setFormData(prev => ({ ...prev, image_url: result.url }));
    } catch (err) {
      console.error('Banner image upload error:', err);
      toast.error('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
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
      sort_order: banner.sort_order
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      if (editingBanner) {
        await updateAdminBanner(editingBanner.id, formData);
      } else {
        await createAdminBanner(formData);
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette banniere ?')) return;

    try {
      await deleteAdminBanner(id);
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <AdminLayout>
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
                    src={displayImageUrl(banner.image_url)}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                <div className="absolute inset-0 flex items-center px-8">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold">{banner.title}</h3>
                    {banner.subtitle && (
                      <p className="text-gray-200 mt-1">{banner.subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    banner.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                  }`}>
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </span>
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
                    onClick={() => handleEdit(banner)}
                    className="p-2 hover:bg-gray-100 hover:dark:bg-gray-700 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4 dark:text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 dark:text-red-400" />
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

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white dark:bg-gray-800 z-50 overflow-y-auto"
            >
              <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800">
                <h2 className="text-xl font-bold dark:text-white">
                  {editingBanner ? 'Modifier la banniere' : 'Nouvelle banniere'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 hover:dark:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-500 mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-500 mb-2">
                    Sous-titre
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-500 mb-2">
                    Image *
                  </label>
                  {formData.image_url ? (
                    <div className="relative rounded-xl overflow-hidden border dark:border-gray-700">
                      <img
                        src={displayImageUrl(formData.image_url)}
                        alt="Apercu"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                        aria-label="Retirer l'image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors cursor-pointer">
                      {uploadingImage ? (
                        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                      ) : (
                        <Upload className="w-6 h-6 dark:text-gray-500" />
                      )}
                      <span className="text-sm font-medium dark:text-gray-500">
                        {uploadingImage ? 'Upload en cours...' : 'Cliquer pour uploader une image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-500 mb-2">
                    Lien du bouton
                  </label>
                  <input
                    type="text"
                    value={formData.link_url}
                    onChange={e => setFormData({ ...formData, link_url: e.target.value })}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-500 mb-2">
                    Texte du bouton
                  </label>
                  <input
                    type="text"
                    value={formData.button_text}
                    onChange={e => setFormData({ ...formData, button_text: e.target.value })}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-500 mb-2">
                    Ordre
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}