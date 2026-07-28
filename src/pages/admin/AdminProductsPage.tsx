import { useEffect, useState, useRef, useCallback } from 'react';
import { logger } from '../../lib/logger';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchAdminProducts,
  fetchAdminCategories,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  restoreAdminProduct,
  uploadProductImage,
} from '../../services/admin';
import { formatPrice, cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { toast } from 'react-hot-toast';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Pagination } from '../../components/Pagination';
import { useProductForm } from '../../hooks/useProductForm';
import { getImageUrl } from '../../lib/imageUrl';
import type { Product, Category } from '../../types';
import { useEscape, useEnter } from '../../hooks/useKeyPress';
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
  Camera,
  Square,
  Power,
  RotateCcw,
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
          ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
      )}
    >
      {icon}
      {label}
      {badge !== undefined && (
        <span className={cn(
          'ml-1 px-1.5 py-0.5 text-xs rounded-full',
          active
            ? 'bg-primary-100 text-primary-600 dark:bg-primary-800 dark:text-primary-300'
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
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  useEscape(() => setShowForm(false), showForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockProductId, setStockProductId] = useState<string | null>(null);
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockLoading, setStockLoading] = useState(false);
  useEscape(() => setStockModalOpen(false), stockModalOpen);
  useEnter(() => { if (stockModalOpen) handleAddStock(); }, stockModalOpen && !!stockQuantity && parseInt(stockQuantity) > 0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
      logger.error('Products fetch error:', err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await fetchAdminCategories();
      setCategories(data);
    } catch (err) {
      logger.error('Categories fetch error:', err);
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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / perPage));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setFormData(populateForm(product));
    setErrors({});
    setShowForm(true);
    setActiveTab('general');
  }, [populateForm, setActiveTab, setFormData]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
    setCameraError(null);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('La camera n\'est pas supportee par ce navigateur. Utilisez l\'upload.');
      return;
    }
    try {
      const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isMobile ? 'environment' : 'user' },
        audio: false
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch (err) {
      logger.error('Camera error:', err);
      setCameraError('Impossible d\'acceder a la camera. Autorisez l\'acces ou utilisez l\'upload.');
      setCameraOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!cameraOpen) return;
    const video = videoRef.current;
    if (video && streamRef.current) {
      video.srcObject = streamRef.current;
      video.play().catch(() => {});
    }
  }, [cameraOpen]);

  const isNetworkOrCorsError = (err: unknown): boolean => {
    return err instanceof TypeError || (typeof err === 'object' && err !== null && !('status' in err));
  };

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current;
    if (!video) {
      setCameraError('Camera non disponible. Fermez et rouvrez la camera.');
      return;
    }

    if (!video.videoWidth) {
      try {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('video-timeout')), 3000);
          const check = () => {
            if (video.videoWidth) {
              clearTimeout(timeout);
              resolve();
            } else {
              requestAnimationFrame(check);
            }
          };
          check();
        });
      } catch {
        setCameraError('Flux video non pret. Patientez une seconde ou rouvrez la camera.');
        return;
      }
    }

    const maxDim = 1280;
    const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });

    const MAX_RETRIES = 3;
    let succeeded = false;
    let isRetryable = false;
    setUploadingImage(true);
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const fd = new FormData();
        fd.append('image', file);
        const result = await uploadProductImage(fd);
        setFormData(prev => ({ ...prev, images: [...prev.images, result.url] }));
        setCameraError(null);
        succeeded = true;
        break;
      } catch (err) {
        logger.error(`Capture upload error (attempt ${attempt}):`, err);
        isRetryable = isNetworkOrCorsError(err);
        if (isRetryable && attempt < MAX_RETRIES) {
          await new Promise(res => setTimeout(res, 800 * attempt));
          continue;
        }
        if (isRetryable) {
          setCameraError('Impossible de joindre le serveur (probleme CORS ou reseau). Verifiez que le backend est demarre et autorise cette origine, puis reessayez.');
        } else {
          const status = (err as { status?: number }).status;
          if (status === 413 || status === 422) {
            setCameraError('Photo trop lourde ou format non supporte. Utilisez une image JPEG/PNG de moins de 10 Mo.');
          } else {
            setCameraError('Erreur lors de l\'envoi de la photo. Reessayez.');
          }
        }
        break;
      } finally {
        if (succeeded || !isRetryable) {
          setUploadingImage(false);
        }
      }
    }
    if (!succeeded) {
      setUploadingImage(false);
    }
  }, [setFormData]);

  const handleCancel = useCallback(() => {
    stopCamera();
    setShowForm(false);
    setEditingProduct(null);
    setErrors({});
    resetForm();
  }, [resetForm, stopCamera]);

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
      condition: formData.condition,
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
      stopCamera();
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'error' in error) {
        const err = error as { status?: number; error?: unknown };
        if (err.status === 422 && typeof err.error === 'object') {
          setErrors(err.error as Record<string, string[]>);
        }
      }
      logger.error('Error:', error);
    } finally {
      setSaving(false);
    }
  }, [editingProduct, formData, fetchProducts, resetForm, stopCamera]);

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
      setProducts(prev => prev.map(p => (p.id === id ? { ...p, deleted_at: new Date().toISOString() } : p)));
    } catch (error) {
      logger.error('Error deleting product:', error);
    } finally {
      setDeletingId(null);
    }
  }, [confirmDeleteId]);

  const handleToggleActive = useCallback(async (product: Product) => {
    const nextActive = !product.is_active;
    setTogglingId(product.id);
    // Optimistic update
    setProducts(prev => prev.map(p => (p.id === product.id ? { ...p, is_active: nextActive } : p)));

    try {
      await updateAdminProduct(product.id, { is_active: nextActive });
    } catch (error) {
      logger.error('Error toggling product status:', error);
      // Revert on failure
      setProducts(prev => prev.map(p => (p.id === product.id ? { ...p, is_active: product.is_active } : p)));
    } finally {
      setTogglingId(null);
    }
  }, []);

  const handleOpenStockModal = useCallback((product: Product) => {
    setStockProductId(product.id);
    setStockQuantity('');
    setStockModalOpen(true);
  }, []);

  const handleAddStock = useCallback(async () => {
    if (!stockProductId || !stockQuantity || parseInt(stockQuantity) <= 0) return;
    setStockLoading(true);
    try {
      const data = await api.post<{ product: Product }>(`/api/admin/products/${stockProductId}/add-stock`, {
        quantity: parseInt(stockQuantity),
      });
      setProducts(prev => prev.map(p => (p.id === stockProductId ? { ...p, stock: data.product.stock } : p)));
      setStockModalOpen(false);
      setStockQuantity('');
      setStockProductId(null);
    } catch (error: unknown) {
      logger.error('Error adding stock:', error);
      const e = error as { error?: string };
      toast.error(e?.error || 'Erreur lors de l\'ajout de stock');
    } finally {
      setStockLoading(false);
    }
  }, [stockProductId, stockQuantity]);

  const handleRestore = useCallback(async (productId: string) => {
    setRestoringId(productId);
    try {
      const restored = await restoreAdminProduct(productId);
      setProducts(prev => prev.map(p => (p.id === productId ? { ...p, ...restored, deleted_at: null } : p)));
    } catch (error) {
      logger.error('Error restoring product:', error);
    } finally {
      setRestoringId(null);
    }
  }, []);

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
        logger.error('Upload error:', err);
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
  }, [setFormData, setErrors, setUploadingImage]);

  const removeImage = useCallback((url: string) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter(img => img !== url) }));
  }, [setFormData]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const closeForm = useCallback(() => {
    stopCamera();
    setShowForm(false);
  }, [stopCamera]);

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
      <MobileNotOptimizedBanner />
      <div className="p-6 lg:p-8">
        <PageHeader
          title="Produits"
          subtitle={`${products.length} produits`}
        >
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Ajouter un produit
          </button>
        </PageHeader>

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
                id="product-search"
                name="search"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            <select
              id="product-category-filter"
              name="category_filter"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white cursor-pointer"
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
                {paginatedProducts.map((product, index) => (
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
                      <StatusBadge
                        label={product.deleted_at ? 'Supprime' : product.is_active ? 'Actif' : 'Inactif'}
                        variant={
                          product.deleted_at
                            ? 'danger'
                            : product.is_active
                              ? 'success'
                              : 'neutral'
                        }
                      />
                      {product.is_featured && !product.deleted_at && (
                        <span className="ml-1 inline-flex px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                          Vedette
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {product.deleted_at ? (
                          <button
                            onClick={() => handleRestore(product.id)}
                            disabled={restoringId === product.id}
                            className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 rounded-lg px-3 py-2 transition-colors dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/60 disabled:opacity-50"
                          >
                            {restoringId === product.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                            Restaurer
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleDuplicate(product)}
                              className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                              title="Dupliquer"
                            >
                              <Copy className="w-6 h-6" />
                            </button>
                            <button
                              onClick={() => handleToggleActive(product)}
                              disabled={togglingId === product.id}
                              className={cn(
                                'p-3 rounded-lg border transition-colors disabled:opacity-50',
                                product.is_active
                                  ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/60'
                                  : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                              )}
                              title={product.is_active ? 'Désactiver' : 'Activer'}
                            >
                              {togglingId === product.id ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                              ) : (
                                <Power className="w-6 h-6" />
                              )}
                            </button>
                             <button
                               onClick={() => handleEdit(product)}
                               className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                               title="Modifier"
                             >
                               <Edit2 className="w-6 h-6" />
                             </button>
                             <button
                               onClick={() => handleOpenStockModal(product)}
                               className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 rounded-lg transition-colors dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/60"
                               title="Ajouter du stock"
                             >
                               <Plus className="w-6 h-6" />
                             </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              disabled={deletingId === product.id}
                              className="p-3 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded-lg transition-colors disabled:opacity-50 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/60"
                              title="Supprimer"
                            >
                              {deletingId === product.id ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                              ) : (
                                <Trash2 className="w-6 h-6" />
                              )}
                            </button>
                          </>
                        )}
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

        <Pagination
          currentPage={currentPage}
          lastPage={totalPages}
          perPage={perPage}
          total={filteredProducts.length}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForm}
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
                  onClick={closeForm}
                  className="p-3 hover:bg-gray-100 hover:dark:bg-gray-700 rounded-lg transition-colors"
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
                        <input type="text" id="product-name" name="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={cn('w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:bg-gray-800 dark:text-white', fieldError('name') ? 'border-red-500' : 'dark:border-gray-700')} />
                        {fieldError('name') && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {fieldError('name')}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium dark:text-gray-500 mb-2">SKU (reference)</label>
                        <input type="text" id="product-sku" name="sku" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="Ex: SAM-S24-128" className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium dark:text-gray-500 mb-2">Description</label>
                        <textarea id="product-description" name="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={4} className={cn('w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500', fieldError('description') ? 'border-red-500' : 'dark:border-gray-700')} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium dark:text-gray-500 mb-2">Categorie</label>
                          <select id="product-category" name="category_id" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className={cn('w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:bg-gray-800 dark:text-white', fieldError('category_id') ? 'border-red-500' : 'dark:border-gray-700')}>
                            <option value="">Selectionner</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium dark:text-gray-500 mb-2">Prix (FCFA) <span className="text-red-500">*</span></label>
                          <input type="number" id="product-price" name="price" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className={cn('w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:bg-gray-800 dark:text-white', fieldError('price') ? 'border-red-500' : 'dark:border-gray-700')} />
                          {fieldError('price') && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {fieldError('price')}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium dark:text-gray-500 mb-2">Prix compare (FCFA)</label>
                          <input type="number" id="product-compare-price" name="compare_price" value={formData.compare_price} onChange={e => setFormData({ ...formData, compare_price: e.target.value })} className={cn('w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:bg-gray-800 dark:text-white', fieldError('compare_price') ? 'border-red-500' : 'dark:border-gray-700')} />
                          {fieldError('compare_price') && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {fieldError('compare_price')}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium dark:text-gray-500 mb-2">Stock <span className="text-red-500">*</span></label>
                          <input type="number" id="product-stock" name="stock" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className={cn('w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:bg-gray-800 dark:text-white', fieldError('stock') ? 'border-red-500' : 'dark:border-gray-700')} />
                          {fieldError('stock') && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {fieldError('stock')}</p>}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input type="checkbox" id="product-is-active" name="is_active" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500" />
                          <span className="text-sm dark:text-gray-500">Produit actif</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" id="product-is-featured" name="is_featured" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                          <span className="text-sm dark:text-gray-500">Produit vedette</span>
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium dark:text-gray-500 mb-2">Condition</label>
                        <select id="product-condition" name="condition" value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value })} className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                          <option value="new">Neuf</option>
                          <option value="used">Occasion</option>
                          <option value="refurbished">Reconditionne</option>
                        </select>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'images' && (
                    <motion.div key="images" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium dark:text-gray-500 mb-2">Images du produit ({formData.images.length})</label>
                        <div className="flex gap-3">
                          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage || cameraOpen} className="flex-1 flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors disabled:opacity-50">
                            {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                            <span className="text-sm font-medium">{uploadingImage ? 'Upload en cours...' : 'Cliquer pour uploader'}</span>
                          </button>
                          <button type="button" onClick={cameraOpen ? stopCamera : startCamera} disabled={uploadingImage} className="flex-1 flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors disabled:opacity-50">
                            <Camera className="w-5 h-5" />
                            <span className="text-sm font-medium">{cameraOpen ? 'Fermer la camera' : 'Prendre une photo'}</span>
                          </button>
                        </div>
                        <input ref={fileInputRef} id="product-image-upload" name="images" type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />

                        {cameraOpen && (
                          <div className="mt-3 space-y-3">
                            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                              <video ref={videoRef} playsInline className="w-full h-full object-contain" />
                            </div>
                            {cameraError && (
                              <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {cameraError}
                              </p>
                            )}
                            <button type="button" onClick={capturePhoto} disabled={uploadingImage} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
                              {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Square className="w-5 h-5" />}
                              <span className="text-sm font-medium">{uploadingImage ? 'Envoi en cours...' : 'Capturer'}</span>
                            </button>
                            <button type="button" onClick={stopCamera} className="w-full flex items-center justify-center gap-2 px-4 py-3 border dark:border-gray-700 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              Terminer ({formData.images.length} photo{formData.images.length > 1 ? 's' : ''})
                            </button>
                          </div>
                        )}
                      </div>
                      {formData.images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {formData.images.map((img, i) => (
                            <div key={i} className="relative group">
                               <img src={getImageUrl(img)} alt={`Preview ${i + 1}`} className="w-full aspect-square object-cover rounded-lg border dark:border-gray-700" onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>'; }} />
                              <button type="button" onClick={() => removeImage(img)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
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
                                 className="flex items-center gap-1.5 text-xs bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 px-3 py-1.5 rounded-lg font-medium hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
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
                                  id={`product-spec-key-${i}`}
                                  name={`spec_key_${i}`}
                                  value={spec.key}
                                  onChange={e => updateSpec(i, 'key', e.target.value)}
                                  placeholder="Cle"
                                  className={cn(
                                    'flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:bg-gray-800',
                                    'dark:border-gray-700'
                                  )}
                                />
                                <input
                                  type="text"
                                  id={`product-spec-value-${i}`}
                                  name={`spec_value_${i}`}
                                  value={spec.value}
                                  onChange={e => updateSpec(i, 'value', e.target.value)}
                                  placeholder={spec.placeholder || 'Valeur'}
                                  className={cn(
                                    'flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:bg-gray-800',
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
                            <input type="number" id="product-weight" name="weight" step="0.01" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} placeholder="0.00" className={cn('w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:bg-gray-800 dark:text-white', fieldError('weight') ? 'border-red-500' : 'dark:border-gray-700')} />
                            {fieldError('weight') && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {fieldError('weight')}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium dark:text-gray-500 mb-2">Dimensions (cm)</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {(['length', 'width', 'height'] as const).map((dim) => (
                                <input key={dim} id={`product-dimension-${dim}`} name={`dimension_${dim}`} type="number" step="0.1" value={formData.dimensions[dim]} onChange={e => handleDimensionChange(dim, e.target.value)} placeholder={dim === 'length' ? 'Longueur' : dim === 'width' ? 'Largeur' : 'Hauteur'} className="px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500" />
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium dark:text-gray-500 mb-2">Prix coûtant (FCFA)</label>
                            <input type="number" id="product-cost-price" name="cost_price" value={formData.cost_price} onChange={e => setFormData({ ...formData, cost_price: e.target.value })} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium dark:text-gray-500 mb-2">Alerte stock minimum</label>
                            <input type="number" id="product-min-stock-alert" name="min_stock_alert" value={formData.min_stock_alert} onChange={e => setFormData({ ...formData, min_stock_alert: e.target.value })} placeholder="Ex: 5" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">SEO</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium dark:text-gray-500 mb-2">Meta titre</label>
                            <input type="text" id="product-meta-title" name="meta_title" value={formData.meta_title} onChange={e => setFormData({ ...formData, meta_title: e.target.value })} placeholder="Titre pour les moteurs de recherche" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium dark:text-gray-500 mb-2">Meta description</label>
                            <textarea id="product-meta-description" name="meta_description" value={formData.meta_description} onChange={e => setFormData({ ...formData, meta_description: e.target.value })} rows={3} placeholder="Description pour les moteurs de recherche" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium dark:text-gray-500 mb-2">Meta keywords</label>
                            <input type="text" id="product-meta-keywords" name="meta_keywords" value={formData.meta_keywords} onChange={e => setFormData({ ...formData, meta_keywords: e.target.value })} placeholder="Mot-cles separes par des virgules" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
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
                          <button type="button" onClick={addVariantSize} className="text-xs text-primary-600 font-medium hover:text-primary-700">+ Ajouter</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.variant_sizes.map((size, i) => (
                            <div key={i} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1.5">
                              <input type="text" id={`product-variant-size-${i}`} name={`variant_size_${i}`} value={size} onChange={e => updateVariantSize(i, e.target.value)} placeholder="Ex: S, M, L" className="bg-transparent border-none outline-none text-sm w-16 dark:text-white" />
                               <button type="button" onClick={() => removeVariantSize(i)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                 <X className="w-4 h-4" />
                               </button>
                             </div>
                          ))}
                        </div>
                        {formData.variant_sizes.length === 0 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Aucune taille ajoutee</p>}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-medium dark:text-gray-500">Couleurs disponibles</label>
                          <button type="button" onClick={addVariantColor} className="text-xs text-primary-600 font-medium hover:text-primary-700">+ Ajouter</button>
                        </div>
                        <div className="space-y-2">
                          {formData.variant_colors.map((color, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input type="color" id={`product-variant-color-hex-${i}`} name={`variant_color_hex_${i}`} value={color.hex} onChange={e => updateVariantColor(i, 'hex', e.target.value)} className="w-8 h-8 rounded cursor-pointer border dark:border-gray-700" />
                              <input type="text" id={`product-variant-color-name-${i}`} name={`variant_color_name_${i}`} value={color.name} onChange={e => updateVariantColor(i, 'name', e.target.value)} placeholder="Nom (ex: Rouge)" className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500" />
                              <button type="button" onClick={() => removeVariantColor(i)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><X className="w-4 h-4" /></button>
                            </div>
                          ))}
                        </div>
                        {formData.variant_colors.length === 0 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Aucune couleur ajoutee</p>}
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
                  <button onClick={handleSave} disabled={saving || !isFormValid} className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button onClick={handleCancel} className="px-6 py-2.5 border dark:border-gray-700 rounded-xl font-medium hover:bg-gray-100 hover:dark:bg-gray-700 transition-colors">Annuler</button>
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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl z-[70] p-6 w-full max-w-lg"
            >
              <h3 className="text-lg font-bold dark:text-white mb-2">
                Supprimer le produit ?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Cette action est reversible. Le produit sera masque du site mais pourra etre restaure depuis cette liste.
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

      <AnimatePresence>
        {stockModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStockModalOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl z-[70] p-6 w-full max-w-lg"
            >
              <h3 className="text-lg font-bold dark:text-white mb-2">
                Ajouter du stock
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Entrez la quantite a ajouter au stock actuel.
              </p>
              <input
                type="number"
                min="1"
                value={stockQuantity}
                onChange={e => setStockQuantity(e.target.value)}
                className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl mb-4 dark:bg-gray-800 dark:text-white"
                placeholder="Quantite a ajouter"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setStockModalOpen(false)}
                  className="px-4 py-2 border dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddStock}
                  disabled={stockLoading || !stockQuantity || parseInt(stockQuantity) <= 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {stockLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Ajouter
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}