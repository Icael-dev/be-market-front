import { useEffect, useRef, useState } from 'react';
import { logger } from '../lib/logger';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProductsPaginated, fetchCategories, fetchPriceBounds } from '../services/products';
import type { Product, Category, FilterOptions } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductsGridSkeleton } from '../components/LoadingSpinner';
import { Pagination } from '../components/Pagination';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Grid3X3,
  LayoutList,
  Search
} from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';
import { useEscape } from '../hooks/useKeyPress';

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
  useEscape(() => setShowFilters(false), showFilters);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const selectedBrand = searchParams.get('brand') || '';
  const minPriceParam = searchParams.get('min_price');
  const maxPriceParam = searchParams.get('max_price');
  const flashSaleFilter = searchParams.get('flash_sale') === 'true';
  const isFeaturedFilter = searchParams.get('featured') === 'true';
  const conditionFilter = searchParams.get('condition') || '';
  const inStockFilter = searchParams.get('in_stock') === 'true';
  const onSaleFilter = searchParams.get('on_sale') === 'true';

  const [priceBounds, setPriceBounds] = useState<{ min: number; max: number }>({ min: 0, max: 500000 });
  const priceBoundsRef = useRef(priceBounds);
  const [localMin, setLocalMin] = useState(minPriceParam ? parseInt(minPriceParam) : 0);
  const [localMax, setLocalMax] = useState(maxPriceParam ? parseInt(maxPriceParam) : 500000);

  const minPrice = minPriceParam ? parseInt(minPriceParam) : 0;
  const maxPrice = maxPriceParam ? parseInt(maxPriceParam) : priceBoundsRef.current.max;

  useEffect(() => {
    priceBoundsRef.current = priceBounds;
  }, [priceBounds]);

  useEffect(() => {
    setLocalMin(minPriceParam ? parseInt(minPriceParam) : priceBoundsRef.current.min);
    setLocalMax(maxPriceParam ? parseInt(maxPriceParam) : priceBoundsRef.current.max);
  }, [minPriceParam, maxPriceParam]);

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

        const effectiveMin = minPriceParam ? parseInt(minPriceParam) : priceBoundsRef.current.min;
        const effectiveMax = maxPriceParam ? parseInt(maxPriceParam) : priceBoundsRef.current.max;

        const filters: FilterOptions = {
          category: selectedCategory || undefined,
          search: searchQuery || undefined,
          sort: sortBy as FilterOptions['sort'] | undefined,
          brand: selectedBrand || undefined,
          flash_sale: flashSaleFilter || undefined,
          condition: conditionFilter || undefined,
          in_stock: inStockFilter || undefined,
          on_sale: onSaleFilter || undefined,
          minPrice: effectiveMin > priceBoundsRef.current.min ? effectiveMin : undefined,
          maxPrice: effectiveMax < priceBoundsRef.current.max ? effectiveMax : undefined,
          page: currentPage,
          per_page: perPage,
        };

        const productsData = await fetchProductsPaginated(filters);
        setProducts(productsData.data);
        setTotalPages(productsData.last_page);
        setTotalProducts(productsData.total);

        const brandSet = new Set<string>();
        productsData.data.forEach((p: Product) => {
          if (p.specs?.brand) {
            brandSet.add(p.specs.brand);
          }
        });
        setBrands(Array.from(brandSet).sort());
      } catch (error) {
        logger.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedCategory, searchQuery, sortBy, selectedBrand, minPriceParam, maxPriceParam, flashSaleFilter, isFeaturedFilter, conditionFilter, inStockFilter, onSaleFilter, currentPage, perPage]);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const toggleFilter = (key: string) => {
    const params = new URLSearchParams(searchParams);
    if (params.has(key)) {
      params.delete(key);
    } else {
      params.set(key, 'true');
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const activeFiltersCount = [selectedCategory, searchQuery, selectedBrand, minPrice > priceBounds.min, maxPrice < priceBounds.max, flashSaleFilter, isFeaturedFilter, conditionFilter, inStockFilter, onSaleFilter].filter(Boolean).length;

  const selectedCategoryName = selectedCategory
    ? categories.find(c => c.id === selectedCategory || c.slug === selectedCategory)?.name
    : null;

  return (
    <div className="min-h-screen page-bg">
      <div className="page-header">
        <div className="page-header-inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold dark:text-white tracking-tightest">
              {selectedCategoryName || 'Tous les produits'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {loading ? 'Chargement...' : `${totalProducts} produits trouves`}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="card p-6 sticky top-20">
              <h3 className="font-semibold dark:text-white mb-4">Categories</h3>
              <ul className="space-y-2 max-h-[36rem] overflow-y-auto">
                <li>
                  <button
                    onClick={() => updateFilter('category', null)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      !selectedCategory
                        ? 'bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400 font-medium'
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
                          ? 'bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400 font-medium'
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
                              ? 'bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400 font-medium'
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
            <div className="card p-4 mb-6">
               <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                   <button
                      onClick={() => setShowFilters(true)}
                      className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filtres
                    {activeFiltersCount > 0 && (
                      <span className="w-5 h-5 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      id="product-sort"
                      name="sort"
                      aria-label="Trier les produits"
                      value={sortBy}
                      onChange={(e) => updateFilter('sort', e.target.value)}
                      className="appearance-none pl-4 pr-10 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 cursor-pointer"
                    >
                      {sortOptions.map(option => (
                        <option
                          key={option.value}
                          value={option.value}
                          className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-gray-500 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      id="product-filter"
                      name="filter"
                      aria-label="Filtrer les produits"
                      value={isFeaturedFilter ? 'featured' : flashSaleFilter ? 'flash_sale' : conditionFilter === 'used' ? 'used' : inStockFilter ? 'in_stock' : onSaleFilter ? 'on_sale' : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'featured') {
                          toggleFilter('featured');
                        } else if (val === 'flash_sale') {
                          toggleFilter('flash_sale');
                        } else if (val === 'used') {
                          toggleFilter('condition');
                        } else if (val === 'in_stock') {
                          toggleFilter('in_stock');
                        } else if (val === 'on_sale') {
                          toggleFilter('on_sale');
                        } else {
                          const params = new URLSearchParams(searchParams);
                          params.delete('featured');
                          params.delete('flash_sale');
                          params.delete('condition');
                          params.delete('in_stock');
                          params.delete('on_sale');
                          setSearchParams(params);
                        }
                      }}
                      className="appearance-none pl-4 pr-10 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 cursor-pointer"
                    >
                      <option value="">Tous les produits</option>
                      <option value="featured">Vedettes</option>
                      <option value="flash_sale">Promos Flash</option>
                      <option value="on_sale">En promotion</option>
                      <option value="in_stock">En stock</option>
                      <option value="used">Occasion</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-gray-500 pointer-events-none" />
                  </div>

                  <div className="hidden sm:flex items-center gap-2">
                    <button
                      onClick={() => setView('grid')}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        view === 'grid'
                          ? 'bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400'
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
                          ? 'bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400'
                          : 'dark:text-gray-500 hover:dark:text-gray-500'
                      )}
                    >
                      <LayoutList className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

               <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                     <input
                       type="number"
                       value={localMin}
                       onChange={(e) => {
                         const val = Math.max(0, parseInt(e.target.value) || 0);
                         setLocalMin(Math.min(val, localMax - 5000));
                       }}
                       onBlur={() => {
                         updateFilter('min_price', localMin > 0 ? String(localMin) : null);
                         updateFilter('max_price', localMax < 1000000 ? String(localMax) : null);
                       }}
                       placeholder="Min"
                       className="input-premium w-24 py-1.5 text-right text-sm"
                     />
                    <span className="text-gray-400 dark:text-gray-500 text-sm">—</span>
                     <input
                       type="number"
                       value={localMax}
                       onChange={(e) => {
                         const val = Math.min(1000000, parseInt(e.target.value) || 0);
                         setLocalMax(Math.max(val, localMin + 5000));
                       }}
                       onBlur={() => {
                         updateFilter('min_price', localMin > 0 ? String(localMin) : null);
                         updateFilter('max_price', localMax < 1000000 ? String(localMax) : null);
                       }}
                       placeholder="Max"
                       className="input-premium w-24 py-1.5 text-right text-sm"
                     />
                    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      FCFA
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap hidden sm:block">
                      Fourchette
                    </span>
                    <div className="flex-1 relative h-2">
                      <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 rounded-full" />
                      {(priceBounds.max > priceBounds.min) && (
                        <div
                          className="absolute h-2 bg-primary-600/30 rounded-full"
                          style={{
                            left: `${(priceBounds.min / 1000000) * 100}%`,
                            right: `${100 - (priceBounds.max / 1000000) * 100}%`,
                          }}
                        />
                      )}
                      <input
                        type="range"
                        min={0}
                        max={1000000}
                        step={5000}
                        value={localMin}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setLocalMin(Math.min(val, localMax - 5000));
                        }}
                        onMouseUp={() => {
                          updateFilter('min_price', localMin > 0 ? String(localMin) : null);
                          updateFilter('max_price', localMax < 1000000 ? String(localMax) : null);
                        }}
                        onTouchEnd={() => {
                          updateFilter('min_price', localMin > 0 ? String(localMin) : null);
                          updateFilter('max_price', localMax < 1000000 ? String(localMax) : null);
                        }}
                        className="absolute w-full h-2 appearance-none bg-transparent pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10"
                      />
                      <input
                        type="range"
                        min={0}
                        max={1000000}
                        step={5000}
                        value={localMax}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setLocalMax(Math.max(val, localMin + 5000));
                        }}
                        onMouseUp={() => {
                          updateFilter('min_price', localMin > 0 ? String(localMin) : null);
                          updateFilter('max_price', localMax < 1000000 ? String(localMax) : null);
                        }}
                        onTouchEnd={() => {
                          updateFilter('min_price', localMin > 0 ? String(localMin) : null);
                          updateFilter('max_price', localMax < 1000000 ? String(localMax) : null);
                        }}
                        className="absolute w-full h-2 appearance-none bg-transparent pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-sm dark:text-gray-500">Filtres actifs:</span>
                  {selectedCategory && (
                    <button
                      onClick={() => updateFilter('category', null)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400 rounded-full text-sm"
                    >
                      {selectedCategoryName}
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {searchQuery && (
                    <button
                      onClick={() => updateFilter('search', null)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400 rounded-full text-sm"
                    >
                      "{searchQuery}"
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {selectedBrand && (
                    <button
                      onClick={() => updateFilter('brand', null)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400 rounded-full text-sm"
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
               <ProductsGridSkeleton count={8} />
            ) : products.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium dark:text-white mb-2">
                  Aucun produit trouve
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Essayez de modifier vos criteres de recherche
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
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
          <motion.div
            key="filters-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowFilters(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 z-50 lg:hidden overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold dark:text-white">Filtres</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="icon-btn"
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
                          ? 'bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400 font-medium'
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
                            ? 'bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400 font-medium'
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
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          lastPage={totalPages}
          perPage={perPage}
          total={totalProducts}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
}
