import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory
} from '../../services/admin';
import type { Category } from '../../types';
import { Plus, Edit2, Trash2, X, Save, Loader2, Grid3X3, Tag } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { cn } from '../../lib/utils';

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    is_active: true,
    specs: [{ key: '', placeholder: '' }] as { key: string; placeholder?: string }[]
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await fetchAdminCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', is_active: true, specs: [{ key: '', placeholder: '' }] });
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      is_active: category.is_active,
      specs: category.specs && category.specs.length > 0
        ? category.specs.map(s => ({ key: s.key, placeholder: s.placeholder || '' }))
        : [{ key: '', placeholder: '' }]
    });
    setShowForm(true);
  };

  const addSpecRow = () => {
    setFormData(prev => ({
      ...prev,
      specs: [...prev.specs, { key: '', placeholder: '' }]
    }));
  };

  const updateSpec = (index: number, field: 'key' | 'placeholder', value: string) => {
    setFormData(prev => ({
      ...prev,
      specs: prev.specs.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      )
    }));
  };

  const removeSpec = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index)
    }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: editingCategory ? formData.slug : generateSlug(name)
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) return;
    setSaving(true);

    const specsToSend = formData.specs
      .filter(s => s.key.trim())
      .map(s => ({ key: s.key.trim(), placeholder: s.placeholder || undefined }));

    try {
      const data: Partial<Category> = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        is_active: formData.is_active,
        specs: specsToSend.length > 0 ? specsToSend : undefined
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
      console.error('Error saving category:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette categorie ?')) return;
    try {
      await deleteAdminCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold dark:text-white">Categories</h1>
            <p className="dark:text-gray-500 mt-1">{categories.length} categorie{categories.length > 1 ? 's' : ''}</p>
          </div>

          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle categorie
          </button>
        </motion.div>

        <div         className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b dark:border-gray-700">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Categorie</th>
                <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Slug</th>
                <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Statut</th>
                <th className="text-right px-6 py-4 text-sm font-medium dark:text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((category, index) => (
                <motion.tr
                  key={category.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="dark:hover:bg-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {category.image_url ? (
                          <img src={category.image_url} alt={category.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <Grid3X3 className="w-5 h-5 dark:text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium dark:text-white">{category.name}</p>
                        {category.description && (
                          <p className="text-xs dark:text-gray-500 truncate max-w-xs">{category.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm dark:text-gray-500 font-mono">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      category.is_active ? 'bg-green-100 text-green-700' : 'dark:bg-gray-700 dark:text-gray-500'
                    }`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 hover:bg-gray-100 hover:dark:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 dark:text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {categories.length === 0 && !loading && (
            <div className="text-center py-12">
              <Grid3X3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="dark:text-gray-500">Aucune categorie</p>
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
                  {editingCategory ? 'Modifier la categorie' : 'Nouvelle categorie'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 hover:dark:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => handleNameChange(e.target.value)}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Ex: Telephones"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Slug (auto-genere)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    disabled
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl bg-gray-50 dark:text-gray-500 cursor-not-allowed font-mono text-sm"
                  />
                  <p className="text-xs dark:text-gray-500 mt-1">Genere automatiquement depuis le nom</p>
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Description de la categorie..."
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 dark:text-blue-400 border-gray-300 rounded"
                  />
                  <span className="text-sm dark:text-gray-300">Categorie active</span>
                </label>

<div className="border-t dark:border-gray-700 pt-4">
                   <div className="flex items-center justify-between mb-3">
                     <label className="block text-sm font-medium dark:text-gray-300">Specifications par defaut</label>
                     <button
                       type="button"
                       onClick={addSpecRow}
                       className="text-xs text-blue-600 font-medium hover:text-blue-700"
                     >
                       + Ajouter
                     </button>
                   </div>
                   <div className="space-y-2">
                     {formData.specs.map((spec, i) => (
                       <div key={i} className="flex gap-2 items-center">
                         <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                         <input
                           type="text"
                           value={spec.key}
                           onChange={e => updateSpec(i, 'key', e.target.value)}
                           placeholder="Cle (ex: Marque)"
                           className={cn(
                             'flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800',
                             'dark:border-gray-700'
                           )}
                         />
                         <input
                           type="text"
                           value={spec.placeholder}
                           onChange={e => updateSpec(i, 'placeholder', e.target.value)}
                           placeholder="Placeholder (ex: Ex: Samsung)"
                           className={cn(
                             'flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800',
                             'dark:border-gray-700'
                           )}
                         />
                         <button
                           type="button"
                           onClick={() => removeSpec(i)}
                           disabled={formData.specs.length <= 1}
                           className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                         >
                           <X className="w-4 h-4" />
                         </button>
                       </div>
                     ))}
                   </div>
                   <p className="text-xs dark:text-gray-500 mt-2">
                    Ces specifications seront pre-remplies quand vous creerez un produit dans cette categorie
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                  <button
                    onClick={handleSave}
                    disabled={saving || !formData.name || !formData.slug}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2.5 border dark:border-gray-700 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
