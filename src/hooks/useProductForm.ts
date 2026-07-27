import { useState, useCallback, useMemo } from 'react';
import type { Product, Category, CategorySpec } from '../types';
import { getImageUrl } from '../lib/imageUrl';

type DimensionsType = { length: string; width: string; height: string };
type VariantColor = { name: string; hex: string };

interface FormDataType {
  sku: string;
  name: string;
  description: string;
  price: string;
  compare_price: string;
  stock: string;
  category_id: string;
  images: string[];
  specs: { key: string; value: string; placeholder?: string | null }[];
  is_featured: boolean;
  is_active: boolean;
  condition: string;
  weight: string;
  cost_price: string;
  dimensions: DimensionsType;
  min_stock_alert: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  variant_sizes: string[];
  variant_colors: VariantColor[];
}

const DEFAULT_SPECS_BY_CATEGORY: Record<string, { key: string; placeholder?: string }[]> = {
  telephones: [
    { key: 'Marque', placeholder: 'Ex: Samsung, Apple, Xiaomi' },
    { key: 'Modele', placeholder: 'Ex: Galaxy S24' },
    { key: 'Couleur', placeholder: 'Ex: Noir, Blanc, Bleu' },
    { key: 'Stockage', placeholder: 'Ex: 128GB, 256GB' },
    { key: 'RAM', placeholder: 'Ex: 8GB' },
    { key: 'Ecran', placeholder: 'Ex: 6.1 pouces' },
  ],
  ordinateurs: [
    { key: 'Marque', placeholder: 'Ex: HP, Dell, Lenovo' },
    { key: 'Processeur', placeholder: 'Ex: Intel i7-13700H' },
    { key: 'RAM', placeholder: 'Ex: 16GB DDR5' },
    { key: 'Stockage', placeholder: 'Ex: 512GB SSD' },
    { key: 'Ecran', placeholder: 'Ex: 15.6 pouces FHD' },
    { key: 'Carte graphique', placeholder: 'Ex: RTX 4060' },
  ],
  'vetements-hommes': [
    { key: 'Taille', placeholder: 'Ex: S, M, L, XL' },
    { key: 'Couleur', placeholder: 'Ex: Noir, Blanc' },
    { key: 'Matiere', placeholder: 'Ex: Coton, Jean' },
    { key: 'Style', placeholder: 'Ex: Casual, Sport' },
  ],
  'vetements-femmes': [
    { key: 'Taille', placeholder: 'Ex: S, M, L' },
    { key: 'Couleur', placeholder: 'Ex: Rouge, Rose' },
    { key: 'Matiere', placeholder: 'Ex: Coton, Soie' },
    { key: 'Style', placeholder: 'Ex: Casual, Elegant' },
  ],
  'chaussures-hommes': [
    { key: 'Pointure', placeholder: 'Ex: 42, 43, 44' },
    { key: 'Couleur', placeholder: 'Ex: Noir, Marron' },
    { key: 'Matiere', placeholder: 'Ex: Cuir, Tissu' },
  ],
  'chaussures-femmes': [
    { key: 'Pointure', placeholder: 'Ex: 37, 38, 39' },
    { key: 'Couleur', placeholder: 'Ex: Noir, Beige' },
    { key: 'Matiere', placeholder: 'Ex: Cuir, Tissu' },
    { key: 'Talons', placeholder: 'Ex: Plat, 5cm' },
  ],
  accessoires: [
    { key: 'Materiau', placeholder: 'Ex: Acier, Cuir' },
    { key: 'Couleur', placeholder: 'Ex: Or, Argent' },
    { key: 'Genre', placeholder: 'Ex: Homme, Femme, Unisexe' },
  ],
  maison: [
    { key: 'Materiau', placeholder: 'Ex: Bois, Metal' },
    { key: 'Dimensions', placeholder: 'Ex: 100x50x30 cm' },
    { key: 'Couleur', placeholder: 'Ex: Blanc, Gris' },
  ],
  electronique: [
    { key: 'Marque', placeholder: 'Ex: Sony, Samsung' },
    { key: 'Puissance', placeholder: 'Ex: 20W' },
    { key: 'Connectivite', placeholder: 'Ex: Bluetooth 5.0' },
    { key: 'Autonomie', placeholder: 'Ex: 10 heures' },
  ],
};

const initialFormData: FormDataType = {
  sku: '',
  name: '',
  description: '',
  price: '',
  compare_price: '',
  stock: '',
  category_id: '',
  images: [],
  specs: [{ key: '', value: '', placeholder: '' }],
  is_featured: false,
  is_active: true,
  condition: 'new',
  weight: '',
  cost_price: '',
  dimensions: { length: '', width: '', height: '' },
  min_stock_alert: '',
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  variant_sizes: [],
  variant_colors: [],
};

export function useProductForm(categories: Category[]) {
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [activeTab, setActiveTab] = useState('general');
  const [specsSource, setSpecsSource] = useState<'custom' | 'category'>('category');

  const getCategoryDefaultSpecs = useCallback((categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category?.specs && category.specs.length > 0) {
      return category.specs.map((s: CategorySpec) => ({ key: s.key, value: '', placeholder: s.placeholder }));
    }
    const fallbackKey = category?.slug || categoryId;
    return (DEFAULT_SPECS_BY_CATEGORY[fallbackKey] || []).map(s => ({ key: s.key, value: '', placeholder: s.placeholder }));
  }, [categories]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setActiveTab('general');
    setSpecsSource('category');
  }, []);

  const populateForm = useCallback((product: Product) => {
    return {
      sku: product.sku || '',
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      compare_price: product.compare_price?.toString() || '',
      stock: product.stock.toString(),
      category_id: product.category_id || '',
      images: (product.images || []).map(url => getImageUrl(url)),
      specs: Object.entries(product.specs || {}).map(([key, value]) => ({ key, value: value as string })),
      is_featured: product.is_featured,
      is_active: product.is_active,
      condition: product.condition || 'new',
      weight: product.weight?.toString() || '',
      cost_price: product.cost_price?.toString() || '',
      dimensions: product.dimensions
        ? {
            length: product.dimensions.length?.toString() || '',
            width: product.dimensions.width?.toString() || '',
            height: product.dimensions.height?.toString() || '',
          }
        : { length: '', width: '', height: '' },
      min_stock_alert: product.min_stock_alert?.toString() || '',
      meta_title: product.meta_title || '',
      meta_description: product.meta_description || '',
      meta_keywords: product.meta_keywords || '',
      variant_sizes: product.variants?.sizes || [],
      variant_colors: product.variants?.colors || [],
    };
  }, []);

  const applyCategorySpecs = useCallback(() => {
    const defaultSpecs = getCategoryDefaultSpecs(formData.category_id);
    if (defaultSpecs.length > 0) {
      setFormData(prev => ({
        ...prev,
        specs: defaultSpecs,
      }));
      setSpecsSource('category');
    }
  }, [formData.category_id, getCategoryDefaultSpecs]);

  const addSpecRow = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      specs: [...prev.specs, { key: '', value: '', placeholder: '' }],
    }));
    setSpecsSource('custom');
  }, []);

  const updateSpec = useCallback((index: number, field: 'key' | 'value', val: string) => {
    setFormData(prev => ({
      ...prev,
      specs: prev.specs.map((s, i) => i === index ? { ...s, [field]: val } : s),
    }));
    setSpecsSource('custom');
  }, []);

  const removeSpec = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index),
    }));
  }, []);

  const handleChange = useCallback(
    (field: keyof FormDataType, value: unknown) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (field === 'category_id' && specsSource === 'category') {
        const defaultSpecs = getCategoryDefaultSpecs(value as string);
        if (defaultSpecs.length > 0) {
          setFormData(prev => ({ ...prev, specs: defaultSpecs }));
        }
      }
    },
    [specsSource, getCategoryDefaultSpecs]
  );

  const handleDimensionChange = useCallback((dim: keyof DimensionsType, value: string) => {
    setFormData(prev => ({
      ...prev,
      dimensions: { ...prev.dimensions, [dim]: value },
    }));
  }, []);

  const addVariantSize = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      variant_sizes: [...prev.variant_sizes, ''],
    }));
  }, []);

  const updateVariantSize = useCallback((index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      variant_sizes: prev.variant_sizes.map((s, i) => (i === index ? value : s)),
    }));
  }, []);

  const removeVariantSize = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      variant_sizes: prev.variant_sizes.filter((_, i) => i !== index),
    }));
  }, []);

  const addVariantColor = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      variant_colors: [...prev.variant_colors, { name: '', hex: '#000000' }],
    }));
  }, []);

  const updateVariantColor = useCallback((index: number, field: keyof VariantColor, value: string) => {
    setFormData(prev => ({
      ...prev,
      variant_colors: prev.variant_colors.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      ),
    }));
  }, []);

  const removeVariantColor = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      variant_colors: prev.variant_colors.filter((_, i) => i !== index),
    }));
  }, []);

  const isFormValid = useMemo(() => {
    return formData.name.trim() && formData.price && parseFloat(formData.price) >= 0;
  }, [formData.name, formData.price]);

  return {
    formData,
    setFormData,
    activeTab,
    setActiveTab,
    specsSource,
    resetForm,
    populateForm,
    applyCategorySpecs,
    addSpecRow,
    updateSpec,
    removeSpec,
    handleChange,
    handleDimensionChange,
    addVariantSize,
    updateVariantSize,
    removeVariantSize,
    addVariantColor,
    updateVariantColor,
    removeVariantColor,
    isFormValid,
  };
}