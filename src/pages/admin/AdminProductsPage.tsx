import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchAdminProducts,
  fetchAdminCategories,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct
} from '../../services/admin';
import { formatPrice } from '../../lib/utils';
import { AdminLayout } from '../../components/admin/AdminLayout';
import type { Product, Category } from '../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Package,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compare_price: '',
    stock: '',
    category_id: '',
    images: [''],
    specs: {} as Record<string, string>,
    is_featured: false,
    is_active: true
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await fetchAdminProducts();
      setProducts(data);
    } catch (err) {
      console.error('Products fetch error:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await fetchAdminCategories();
      setCategories(data);
    } catch (err) {
      console.error('Categories fetch error:', err);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      compare_price: '',
      stock: '',
      category_id: '',
      images: [''],
      specs: {},
      is_featured: false,
      is_active: true
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      compare_price: product.compare_price?.toString() || '',
      stock: product.stock.toString(),
      category_id: product.category_id || '',
      images: product.images?.length > 0 ? product.images : [''],
      specs: product.specs || {},
      is_featured: product.is_featured,
      is_active: product.is_active
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);

    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const productData = {
      name: formData.name,
      slug: editingProduct ? slug : `${slug}-${Date.now().toString(36)}`,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
      stock: parseInt(formData.stock) || 0,
      category_id: formData.category_id || null,
      images: formData.images.filter(img => img.trim()),
      specs: formData.specs,
      is_featured: formData.is_featured,
      is_active: formData.is_active
    };

    try {
      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, productData);
      } else {
        await createAdminProduct(productData);
      }

      await fetchProducts();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Supprimer ce produit ?')) return;

    try {
      await deleteAdminProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
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
            <h1 className="text-2xl font-bold dark:text-white">Produits</h1>
            <p className="dark:text-gray-500 mt-1">{products.length} produits</p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Ajouter un produit
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800 cursor-pointer"
            >
              <option value="">Toutes les categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Produit</th>
                  <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Categorie</th>
                  <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Prix</th>
                  <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Stock</th>
                  <th className="text-left px-6 py-4 text-sm font-medium dark:text-gray-500">Statut</th>
                  <th className="text-right px-6 py-4 text-sm font-medium dark:text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-gray-50 hover:dark:bg-gray-900 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg dark:bg-gray-700 overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 dark:text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium dark:text-white">{product.name}</p>
                          {product.sku && (
                            <p className="text-xs dark:text-gray-500">SKU: {product.sku}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm dark:text-gray-500">
                      {product.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium dark:text-white">{formatPrice(product.price)}</p>
                      {product.compare_price && (
                        <p className="text-sm dark:text-gray-500 line-through">
                          {formatPrice(product.compare_price)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'font-medium',
                        product.stock < 10 ? 'text-red-600' : 'dark:text-white'
                      )}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'inline-flex px-2 py-1 rounded-full text-xs font-medium',
                        product.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'dark:bg-gray-700 dark:text-gray-500'
                      )}>
                        {product.is_active ? 'Actif' : 'Inactif'}
                      </span>
                      {product.is_featured && (
                        <span className="ml-1 inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Vedette
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 hover:bg-gray-100 hover:dark:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 dark:text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 dark:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 dark:text-gray-500 mx-auto mb-4" />
              <p className="dark:text-gray-500">Aucun produit trouve</p>
            </div>
          )}
        </motion.div>
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
                  {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
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
                  <label className="block text-sm font-medium dark:text-gray-500 mb-2">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-500 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-500 mb-2">
                      Prix (FCFA) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium dark:text-gray-500 mb-2">
                      Prix compare (FCFA)
                    </label>
                    <input
                      type="number"
                      value={formData.compare_price}
                      onChange={e => setFormData({ ...formData, compare_price: e.target.value })}
                      className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-500 mb-2">
                      Stock *
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium dark:text-gray-500 mb-2">
                      Categorie
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800"
                    >
                      <option value="">Selectionner</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-500 mb-2">
                    URL de l'image
                  </label>
                  <input
                    type="text"
                    value={formData.images[0] || ''}
                    onChange={e => setFormData({ ...formData, images: [e.target.value] })}
                    className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 dark:text-blue-400 border-gray-300 rounded"
                    />
                    <span className="text-sm dark:text-gray-500">Produit actif</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4 dark:text-blue-400 border-gray-300 rounded"
                    />
                    <span className="text-sm dark:text-gray-500">Produit vedette</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                  <button
                    onClick={handleSave}
                    disabled={saving || !formData.name || !formData.price}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2.5 border dark:border-gray-700 rounded-xl font-medium hover:bg-gray-100 hover:dark:bg-gray-900 transition-colors"
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
