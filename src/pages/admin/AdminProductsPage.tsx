import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchAdminProducts,
  fetchAdminCategories,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  uploadProductImage,
} from '../../services/admin';
import { formatPrice, cn } from '../../lib/utils';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useProductForm } from '../../hooks/useProductForm';
import type { Product, Category } from '../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Package,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Upload,
  TrendingUp,
  Settings,
  Save,
  Copy,
} from 'lucide-react';

function TabButton({ icon, label, active, onClick, badge }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
        active
          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
      )}
    >
      {icon}
      {label}
      {badge !== undefined && (
        <span className={cn(
          'ml-1 px-1.5 py-0.5 text-xs rounded-full',
          active
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    formData,
    setFormData,
    activeTab,
    setActiveTab,
    resetForm,
    populateForm,
    applyCategorySpecs,
    addSpecRow,
    updateSpec,
    removeSpec,
    handleDimensionChange,
    addVariantSize,
    updateVariantSize,
    removeVariantSize,
    addVariantColor,
    updateVariantColor,
    removeVariantColor,
    isFormValid,
  } = useProductForm(categories);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await fetchAdminProducts();
      setProducts(data);
    } catch (err) {
      console.error('Products fetch error:', err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await fetchAdminCategories();
      setCategories(data);
    } catch (err) {
      console.error('Categories fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setFormData(populateForm(product));
    setErrors({});
    setShowForm(true);
    setActiveTab('general');
  }, [populateForm, setActiveTab, setFormData]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setErrors({});

    const specsObject = formData.specs.reduce<Record<string, string>>((acc, { key, value }) => {
      if (key.trim()) acc[key.trim()] = value;
      return acc;
    }, {});

    const productData: Record<string, unknown> = {
      sku: formData.sku.trim() || null,
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price) || 0,
      compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
      stock: parseInt(formData.stock) || 0,
      category_id: formData.category_id || null,
      images: formData.images,
      specs: Object.keys(specsObject).length > 0 ? specsObject : null,
      is_featured: formData.is_featured,
      is_active: formData.is_active,
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
      dimensions: (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height)
        ? {
            length: parseFloat(formData.dimensions.length) || 0,
            width: parseFloat(formData.dimensions.width) || 0,
            height: parseFloat(formData.dimensions.height) || 0,
          }
        : null,
      min_stock_alert: formData.min_stock_alert ? parseInt(formData.min_stock_alert) : null,
      meta_title: formData.meta_title || null,
      meta_description: formData.meta_description || null,
      meta_keywords: formData.meta_keywords || null,
      variants: (formData.variant_sizes.length > 0 || formData.variant_colors.length > 0)
        ? { sizes: formData.variant_sizes, colors: formData.variant_colors }
        : null,
    };

    if (formData.weight) productData.weight = parseFloat(formData.weight);

    try {
      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, productData);
      } else {
        await createAdminProduct(productData);
      }

      await fetchProducts();
      setShowForm(false);
      resetForm();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'error' in error) {
        const err = error as { status?: number; error?: unknown };
        if (err.status === 422 && typeof err.error === 'object') {
          setErrors(err.error as Record<string, string[]>);
        }
      }
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  }, [editingProduct, formData, fetchProducts, resetForm]);

  const handleDelete = useCallback((productId: string) => {
    setConfirmDeleteId(productId);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setDeletingId(id);
    setConfirmDeleteId(null);

    try {
      await deleteAdminProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setDeletingId(null);
    }
  }, [confirmDeleteId]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setErrors({});
    const newImages: string[] = [];
    const uploadErrors: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append('image', file);
        const result = await uploadProductImage(fd);
        newImages.push(result.url);
      } catch (err) {
        console.error('Upload error:', err);
        uploadErrors.push(`Erreur upload: ${file.name}`);
      }
    }

    if (newImages.length > 0) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    }

    if (uploadErrors.length > 0) {
      setErrors(prev => ({ ...prev, images: uploadErrors }));
    }

    setUploadingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadProductImage, setFormData, setErrors, setUploadingImage]);

  const removeImage = useCallback((url: string) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter(img => img !== url) }));
  }, [setFormData]);

  const getImageUrl = (url: string) => {
    if (!url) return url;
    if (url.includes('/storage/products/')) {
      return url.replace('/storage/products/', '/api/images/');
    }
    return url;
  };

  const fieldError = (field: string) => errors[field]?.[0];

  const handleDuplicate = useCallback((product: Product) => {
    setEditingProduct(null);
    setFormData({
      ...populateForm(product),
      sku: ''
    });
    setErrors({});
    setShowForm(true);
    setActiveTab('general');
  }, [populateForm, setActiveTab, setFormData]);

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
                className="w-full pl-10 pr-4 py-2.5 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800"
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
                                src={getImageUrl(product.images[0])}
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
                          : 'dark:bg-gray-700 dark:text-gray-400'
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
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDuplicate(product)}
                          className="p-2 hover:bg-gray-100 hover:dark:bg-gray-700 rounded-lg transition-colors"
                          title="Dupliquer"
                        >
                          <Copy className="w-4 h-4 dark:text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 hover:bg-gray-100 hover:dark:bg-gray-700 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4 dark:text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="p-2 rounded-lg transition-colors dark:hover:bg-red-900/30 disabled:opacity-50"
                          title="Supprimer"
                        >
                          {deletingId === product.id ? (
                            <Loader2 className="w-4 h-4 dark:text-red-400 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 dark:text-red-400" />
                          )}
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
              <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
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

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex overflow-x-auto gap-2 border-b dark:border-gray-700 pb-2">
                  <TabButton icon={<Package className="w-4 h-4" />} label="General" active={activeTab === 'general'} onClick={() => setActiveTab('general')} />
                  <TabButton icon={<ImageIcon className="w-4 h-4" />} label="Images" active={activeTab === 'images'} onClick={() => setActiveTab('images')} badge={formData.images.length > 0 ? formData.images.length : undefined} />
                  <TabButton icon={<TrendingUp className="w-4 h-4" />} label="Variantes" active={activeTab === 'variants'} onClick={() => setActiveTab('variants')} />
                  <TabButton icon={<Settings className="w-4 h-4" />} label="Avancé" active={activeTab === 'advanced'} onClick={() => setActiveTab('advanced')} />
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'general' && (
                    <motion.div key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium dark:text-gray-500 mb-2">Nom du produit <span className="text-red-500">*</span></label>
                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={cn('w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800', fieldError('name') ? 'border-red-500' : 'dark:border-gray-700')} />
                        {fieldError('name') && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {fieldError('name')}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium dark:text-gray-500 mb-2">Description</label>
                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={4} className={cn('w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800', fieldError('description') ? 'border-red-500' : 'dark:border-gray-700')} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium dark:text-gray-500 mb-2">Categorie</label>
                          <select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className={cn('w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800', fieldError('category_id') ? 'border-red-500' : 'dark:border-gray-700')}>
                            <option value="">Selectionner</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium dark:text-gray-500 mb-2">Prix (FCFA) <span className="text-red-500">*</span></label>
                          <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className={cn('w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800', fieldError('price') ? 'border-red-500' : 'dark:border-gray-700')} />
                          {fieldError('price') && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {fieldError('price')}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium dark:text-gray-500 mb-2">Prix compare (FCFA)</label>
                          <input type="number" value={formData.compare_price} onChange={e => setFormData({ ...formData, compare_price: e.target.value })} className={cn('w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800', fieldError('compare_price') ? 'border-red-500' : 'dark:border-gray-700')} />
                          {fieldError('compare_price') && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {fieldError('compare_price')}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium dark:text-gray-500 mb-2">Stock <span className="text-red-500">*</span></label>
                          <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className={cn('w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800', fieldError('stock') ? 'border-red-500' : 'dark:border-gray-700')} />
                          {fieldError('stock') && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {fieldError('stock')}</p>}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="text-sm dark:text-gray-500">Produit actif</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="text-sm dark:text-gray-500">Produit vedette</span>
                        </label>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'images' && (
                    <motion.div key="images" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium dark:text-gray-500 mb-2">Images du produit ({formData.images.length})</label>
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} className="w-full flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors disabled:opacity-50">
                          {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                          <span className="text-sm font-medium">{uploadingImage ? 'Upload en cours...' : 'Cliquer pour uploader des images'}</span>
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                      </div>
                      {formData.images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {formData.images.map((img, i) => (
                            <div key={i} className="relative group">
                              <img src={img} alt={`Preview ${i + 1}`} className="w-full aspect-square object-cover rounded-lg border dark:border-gray-700" onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>'; }} />
                              <button type="button" onClick={() => removeImage(img)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'advanced' && (
                    <motion.div key="advanced" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                      <div className="border-b dark:border-gray-700 pb-4 mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Specifications</h3>
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="block text-sm font-medium dark:text-gray-500">Caracteristiques</label>
<div className="flex gap-2">
                               <button
                                 type="button"
                                 onClick={addSpecRow}
                                 className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                               >
                                 + Personnalise
                               </button>
                               <button
                                 type="button"
                                 onClick={() => applyCategorySpecs()}
                                 disabled={!formData.category_id}
                                 className="flex items-center gap-1.5 text-xs bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100 dark:hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                               >
                                 + Par défaut
                               </button>
                             </div>
                          </div>
                          {!formData.category_id && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-2">
                              <AlertCircle className="w-3 h-3" />
                              Selectionnez une categorie pour charger les specifications predefinies
                            </p>
                          )}
                          <div className="space-y-2 mt-2">
                            {formData.specs.map((spec, i) => (
                              <div key={i} className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  value={spec.key}
                                  onChange={e => updateSpec(i, 'key', e.target.value)}
                                  placeholder="Cle"
                                  className={cn(
                                    'flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800',
                                    'dark:border-gray-700'
                                  )}
                                />
                                <input
                                  type="text"
                                  value={spec.value}
                                  onChange={e => updateSpec(i, 'value', e.target.value)}
                                  placeholder={spec.placeholder || 'Valeur'}
                                  className={cn(
                                    'flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800',
                                    'dark:border-gray-700'
                                  )}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeSpec(i)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            {formData.specs.length === 0 && (
                              <p className="text-xs dark:text-gray-500">Aucune caracteristique ajoutee</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="border-b dark:border-gray-700 pb-4 mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Livraison & Stock</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium dark:text-gray-500 mb-2">Poids (kg)</label>
                            <input type="number" step="0.01" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} placeholder="0.00" className={cn('w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800', fieldError('weight') ? 'border-red-500' : 'dark:border-gray-700')} />
                            {fieldError('weight') && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {fieldError('weight')}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium dark:text-gray-500 mb-2">Dimensions (cm)</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {(['length', 'width', 'height'] as const).map((dim) => (
                                <input key={dim} type="number" step="0.1" value={formData.dimensions[dim]} onChange={e => handleDimensionChange(dim, e.target.value)} placeholder={dim === 'length' ? 'Longueur' : dim === 'width' ? 'Largeur' : 'Hauteur'} className="px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700" />
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium dark:text-gray-500 mb-2">Prix coûtant (FCFA)</label>
                            <input type="number" value={formData.cost_price} onChange={e => setFormData({ ...formData, cost_price: e.target.value })} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium dark:text-gray-500 mb-2">Alerte stock minimum</label>
                            <input type="number" value={formData.min_stock_alert} onChange={e => setFormData({ ...formData, min_stock_alert: e.target.value })} placeholder="Ex: 5" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">SEO</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium dark:text-gray-500 mb-2">Meta titre</label>
                            <input type="text" value={formData.meta_title} onChange={e => setFormData({ ...formData, meta_title: e.target.value })} placeholder="Titre pour les moteurs de recherche" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium dark:text-gray-500 mb-2">Meta description</label>
                            <textarea value={formData.meta_description} onChange={e => setFormData({ ...formData, meta_description: e.target.value })} rows={3} placeholder="Description pour les moteurs de recherche" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium dark:text-gray-500 mb-2">Meta keywords</label>
                            <input type="text" value={formData.meta_keywords} onChange={e => setFormData({ ...formData, meta_keywords: e.target.value })} placeholder="Mot-cles separes par des virgules" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'variants' && (
                    <motion.div key="variants" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-medium dark:text-gray-500">Tailles disponibles</label>
                          <button type="button" onClick={addVariantSize} className="text-xs text-blue-600 font-medium hover:text-blue-700">+ Ajouter</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.variant_sizes.map((size, i) => (
                            <div key={i} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1.5">
                              <input type="text" value={size} onChange={e => updateVariantSize(i, e.target.value)} placeholder="Ex: S, M, L" className="bg-transparent border-none outline-none text-sm w-16 dark:text-white" />
                              <button type="button" onClick={() => removeVariantSize(i)} className="text-red-500 hover:text-red-700"><X className="w-3 h-3" /></button>
                            </div>
                          ))}
                        </div>
                        {formData.variant_sizes.length === 0 && <p className="text-xs text-gray-500 mt-1">Aucune taille ajoutee</p>}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-medium dark:text-gray-500">Couleurs disponibles</label>
                          <button type="button" onClick={addVariantColor} className="text-xs text-blue-600 font-medium hover:text-blue-700">+ Ajouter</button>
                        </div>
                        <div className="space-y-2">
                          {formData.variant_colors.map((color, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input type="color" value={color.hex} onChange={e => updateVariantColor(i, 'hex', e.target.value)} className="w-8 h-8 rounded cursor-pointer border dark:border-gray-700" />
                              <input type="text" value={color.name} onChange={e => updateVariantColor(i, 'name', e.target.value)} placeholder="Nom (ex: Rouge)" className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700" />
                              <button type="button" onClick={() => removeVariantColor(i)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><X className="w-4 h-4" /></button>
                            </div>
                          ))}
                        </div>
                        {formData.variant_colors.length === 0 && <p className="text-xs text-gray-500 mt-1">Aucune couleur ajoutee</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {Object.keys(errors).length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <p className="text-red-700 dark:text-red-400 text-sm font-medium mb-2">Veuillez corriger les erreurs suivantes :</p>
                    <ul className="list-disc list-inside text-red-600 dark:text-red-400 text-xs space-y-1">
                      {Object.entries(errors).map(([field, msgs]) => (msgs.map((msg, i) => <li key={`${field}-${i}`}>{msg}</li>)))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                  <button onClick={handleSave} disabled={saving || !isFormValid} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button onClick={() => setShowForm(false)} className="px-6 py-2.5 border dark:border-gray-700 rounded-xl font-medium hover:bg-gray-100 hover:dark:bg-gray-700 transition-colors">Annuler</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDeleteId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteId(null)}
              className="fixed inset-0 bg-black/50 z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl z-[70] p-6 w-full max-w-sm"
            >
              <h3 className="text-lg font-bold dark:text-white mb-2">
                Supprimer le produit ?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Cette action est irreversible. Le produit sera definitivement supprime.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 border dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deletingId !== null}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deletingId && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Supprimer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}