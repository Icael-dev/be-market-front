import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProducts, fetchCategories, fetchPriceBounds } from '../services/products';
import type { Product, Category, FilterOptions } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductsGridSkeleton } from '../components/LoadingSpinner';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Grid3X3,
  LayoutList,
  Search
} from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';

const sortOptions = [
  { value: 'newest', label: 'Plus recent' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix decroissant' },
  { value: 'name_asc', label: 'Nom A-Z' },
  { value: 'name_desc', label: 'Nom Z-A' }
];

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const selectedBrand = searchParams.get('brand') || '';
  const minPriceParam = searchParams.get('min_price');
  const maxPriceParam = searchParams.get('max_price');

  const [priceBounds, setPriceBounds] = useState<{ min: number; max: number }>({ min: 0, max: 500000 });
  const [localMin, setLocalMin] = useState(minPriceParam ? parseInt(minPriceParam) : 0);
  const [localMax, setLocalMax] = useState(maxPriceParam ? parseInt(maxPriceParam) : 500000);

  const minPrice = minPriceParam ? parseInt(minPriceParam) : 0;
  const maxPrice = maxPriceParam ? parseInt(maxPriceParam) : priceBounds.max;

  useEffect(() => {
    setLocalMin(minPriceParam ? parseInt(minPriceParam) : priceBounds.min);
    setLocalMax(maxPriceParam ? parseInt(maxPriceParam) : priceBounds.max);
  }, [minPriceParam, maxPriceParam, priceBounds.min, priceBounds.max]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const loadedCategories = await fetchCategories();
        setCategories(loadedCategories);

        const bounds = await fetchPriceBounds(
          selectedCategory || undefined,
          searchQuery || undefined,
          selectedBrand || undefined
        );
        setPriceBounds(bounds);

        const filters: FilterOptions = {
          category: selectedCategory || undefined,
          search: searchQuery || undefined,
          sort: sortBy as FilterOptions['sort'] | undefined,
          brand: selectedBrand || undefined,
          minPrice: minPrice > priceBounds.min ? minPrice : undefined,
          maxPrice: maxPrice < priceBounds.max ? maxPrice : undefined,
        };

        const productsData = await fetchProducts(filters);
        setProducts(productsData);

        const brandSet = new Set<string>();
        productsData.forEach((p: Product) => {
          if (p.specs?.brand) {
            brandSet.add(p.specs.brand);
          }
        });
        setBrands(Array.from(brandSet).sort());
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedCategory, searchQuery, sortBy, selectedBrand]);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const activeFiltersCount = [selectedCategory, searchQuery, selectedBrand, minPrice > priceBounds.min, maxPrice < priceBounds.max].filter(Boolean).length;

  const selectedCategoryName = selectedCategory
    ? categories.find(c => c.id === selectedCategory || c.slug === selectedCategory)?.name
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold dark:text-white">
              {selectedCategoryName || 'Tous les produits'}
            </h1>
            <p className="dark:text-gray-500 mt-2">
              {loading ? 'Chargement...' : `${products.length} produits trouves`}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6 sticky top-20">
              <h3 className="font-semibold dark:text-white mb-4">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => updateFilter('category', null)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      !selectedCategory
                        ? 'bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 font-medium'
                        : 'dark:text-gray-500 hover:bg-gray-50 hover:dark:bg-gray-900'
                    )}
                  >
                    Toutes les categories
                  </button>
                </li>
                {categories.map(category => (
                  <li key={category.id}>
                    <button
                      onClick={() => updateFilter('category', category.slug)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        selectedCategory === category.slug
                          ? 'bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 font-medium'
                          : 'dark:text-gray-500 hover:bg-gray-50 hover:dark:bg-gray-900'
                      )}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>

              {brands.length > 0 && (
                <>
                  <hr className="my-6 dark:border-gray-700" />
                  <h3 className="font-semibold dark:text-white mb-4">Marques</h3>
                  <ul className="space-y-2">
                    {brands.map(brand => (
                      <li key={brand}>
                        <button
                          onClick={() => updateFilter('brand', selectedBrand === brand ? null : brand)}
                          className={cn(
                            'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                            selectedBrand === brand
                              ? 'bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 font-medium'
                              : 'dark:text-gray-500 hover:bg-gray-50 hover:dark:bg-gray-900'
                          )}
                        >
                          {brand}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 mb-6">
               <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 border bg-white dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:dark:bg-gray-900 transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filtres
                    {activeFiltersCount > 0 && (
                      <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => updateFilter('sort', e.target.value)}
                      className="appearance-none pl-4 pr-10 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800 cursor-pointer"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-gray-500 pointer-events-none" />
                  </div>

                  <div className="hidden sm:flex items-center gap-2">
                    <button
                      onClick={() => setView('grid')}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        view === 'grid'
                          ? 'bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'dark:text-gray-500 hover:dark:text-gray-500'
                      )}
                    >
                      <Grid3X3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setView('list')}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        view === 'list'
                          ? 'bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'dark:text-gray-500 hover:dark:text-gray-500'
                      )}
                    >
                      <LayoutList className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Fourchette
                  </span>
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[75px] text-right">
                      {formatPrice(localMin)}
                    </span>
                    <div className="flex-1 relative h-2">
                      <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 rounded-full" />
                      {(priceBounds.max > priceBounds.min) && (
                        <div
                          className="absolute h-2 bg-blue-600 rounded-full"
                          style={{
                            left: `${((localMin - priceBounds.min) / (priceBounds.max - priceBounds.min)) * 100}%`,
                            right: `${100 - ((localMax - priceBounds.min) / (priceBounds.max - priceBounds.min)) * 100}%`,
                          }}
                        />
                      )}
                      <input
                        type="range"
                        min={priceBounds.min}
                        max={priceBounds.max}
                        step={5000}
                        value={localMin}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setLocalMin(Math.min(val, localMax - 5000));
                        }}
                        onTouchEnd={() => {
                          updateFilter('min_price', localMin > priceBounds.min ? String(localMin) : null);
                          updateFilter('max_price', localMax < priceBounds.max ? String(localMax) : null);
                        }}
                        onMouseUp={() => {
                          updateFilter('min_price', localMin > priceBounds.min ? String(localMin) : null);
                          updateFilter('max_price', localMax < priceBounds.max ? String(localMax) : null);
                        }}
                        disabled={priceBounds.max === priceBounds.min}
                        className="absolute w-full h-2 appearance-none bg-transparent pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <input
                        type="range"
                        min={priceBounds.min}
                        max={priceBounds.max}
                        step={5000}
                        value={localMax}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setLocalMax(Math.max(val, localMin + 5000));
                        }}
                        onTouchEnd={() => {
                          updateFilter('min_price', localMin > priceBounds.min ? String(localMin) : null);
                          updateFilter('max_price', localMax < priceBounds.max ? String(localMax) : null);
                        }}
                        onMouseUp={() => {
                          updateFilter('min_price', localMin > priceBounds.min ? String(localMin) : null);
                          updateFilter('max_price', localMax < priceBounds.max ? String(localMax) : null);
                        }}
                        disabled={priceBounds.max === priceBounds.min}
                        className="absolute w-full h-2 appearance-none bg-transparent pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[75px]">
                      {formatPrice(localMax)}
                    </span>
                  </div>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-sm dark:text-gray-500">Filtres actifs:</span>
                  {selectedCategory && (
                    <button
                      onClick={() => updateFilter('category', null)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm"
                    >
                      {selectedCategoryName}
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {searchQuery && (
                    <button
                      onClick={() => updateFilter('search', null)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm"
                    >
                      "{searchQuery}"
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {selectedBrand && (
                    <button
                      onClick={() => updateFilter('brand', null)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm"
                    >
                      {selectedBrand}
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {(minPrice > priceBounds.min || maxPrice < priceBounds.max) && (
                    <button
                      onClick={() => {
                        updateFilter('min_price', null);
                        updateFilter('max_price', null);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm"
                    >
                      {formatPrice(minPrice)} - {formatPrice(maxPrice)}
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-sm dark:text-gray-500 hover:dark:text-gray-300 underline"
                  >
                    Effacer tout
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <ProductsGridSkeleton count={12} />
            ) : products.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-12 text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium dark:text-white mb-2">
                  Aucun produit trouve
                </h3>
                <p className="dark:text-gray-500 mb-6">
                  Essayez de modifier vos criteres de recherche
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Reinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className={cn(
                'grid gap-4 md:gap-6',
                view === 'grid'
                  ? 'grid-cols-2 md:grid-cols-3'
                  : 'grid-cols-1'
              )}>
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">Filtres</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-gray-50 hover:dark:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="font-semibold dark:text-white mb-4">Categories</h3>
                <ul className="space-y-2 mb-6">
                  <li>
                    <button
                      onClick={() => {
                        updateFilter('category', null);
                        setShowFilters(false);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        !selectedCategory
                          ? 'bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 font-medium'
                          : 'dark:text-gray-500 hover:bg-gray-50 hover:dark:bg-gray-900'
                      )}
                    >
                      Toutes les categories
                    </button>
                  </li>
                  {categories.map(category => (
                    <li key={category.id}>
                      <button
                        onClick={() => {
                          updateFilter('category', category.slug);
                          setShowFilters(false);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                          selectedCategory === category.slug
                            ? 'bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 font-medium'
                            : 'dark:text-gray-500 hover:bg-gray-50 hover:dark:bg-gray-900'
                        )}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
