import { useEffect, useRef, useState } from "react";
import { logger } from "../lib/logger";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProductsPaginated, fetchCategories, fetchPriceBounds } from "../services/products";
import type { Product, Category, FilterOptions } from "../types";
import { ProductCard } from "../components/ProductCard";
import { ProductsGridSkeleton } from "../components/LoadingSpinner";
import { Pagination } from "../components/Pagination";
import { PageTitle } from "../hooks/usePageTitle";
import { SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutList, Search } from "lucide-react";
import { cn, formatPrice } from "../lib/utils";
import { useEscape } from "../hooks/useKeyPress";

const sortOptions = [
  { value: "newest", label: "Plus recent" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix decroissant" },
  { value: "name_asc", label: "Nom A-Z" },
  { value: "name_desc", label: "Nom Z-A" },
];

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  useEscape(() => setShowFilters(false), showFilters);
  const [view, setView] = useState<"grid" | "list">("grid");

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const selectedCategory = searchParams.get("category") || "";
  const searchQuery = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort") || "newest";
  const selectedBrand = searchParams.get("brand") || "";
  const minPriceParam = searchParams.get("min_price");
  const maxPriceParam = searchParams.get("max_price");
  const flashSaleFilter = searchParams.get("flash_sale") === "true";
  const isFeaturedFilter = searchParams.get("featured") === "true";
  const conditionFilter = searchParams.get("condition") || "";
  const inStockFilter = searchParams.get("in_stock") === "true";
  const onSaleFilter = searchParams.get("on_sale") === "true";

  const [priceBounds, setPriceBounds] = useState<{ min: number; max: number }>({
    min: 0,
    max: 500000,
  });
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
          sort: sortBy as FilterOptions["sort"] | undefined,
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
        logger.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [
    selectedCategory,
    searchQuery,
    sortBy,
    selectedBrand,
    minPriceParam,
    maxPriceParam,
    flashSaleFilter,
    isFeaturedFilter,
    conditionFilter,
    inStockFilter,
    onSaleFilter,
    currentPage,
    perPage,
  ]);

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
      params.set(key, "true");
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const activeFiltersCount = [
    selectedCategory,
    searchQuery,
    selectedBrand,
    minPrice > priceBounds.min,
    maxPrice < priceBounds.max,
    flashSaleFilter,
    isFeaturedFilter,
    conditionFilter,
    inStockFilter,
    onSaleFilter,
  ].filter(Boolean).length;

  const selectedCategoryName = selectedCategory
    ? categories.find((c) => c.id === selectedCategory || c.slug === selectedCategory)?.name
    : null;

  return (
    <>
      <PageTitle
        title={selectedCategoryName || "Tous les produits"}
        description={`${totalProducts} produits trouves`}
      />
      <div className="page-bg min-h-screen">
        <div className="page-header">
          <div className="page-header-inner">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold tracking-tightest dark:text-white">
                {selectedCategoryName || "Tous les produits"}
              </h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {loading ? "Chargement..." : `${totalProducts} produits trouves`}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="hidden w-64 flex-shrink-0 lg:block">
              <div className="card sticky top-20 p-6">
                <h3 className="mb-4 font-semibold dark:text-white">Categories</h3>
                <ul className="max-h-[36rem] space-y-2 overflow-y-auto">
                  <li>
                    <button
                      onClick={() => updateFilter("category", null)}
                      className={cn(
                        "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        !selectedCategory
                          ? "bg-primary-50 font-medium dark:bg-primary-900/30 dark:text-primary-400"
                          : "hover:bg-gray-50 dark:text-gray-500 hover:dark:bg-gray-900"
                      )}
                    >
                      Toutes les categories
                    </button>
                  </li>
                  {categories.map((category) => (
                    <li key={category.id}>
                      <button
                        onClick={() => updateFilter("category", category.slug)}
                        className={cn(
                          "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                          selectedCategory === category.slug
                            ? "bg-primary-50 font-medium dark:bg-primary-900/30 dark:text-primary-400"
                            : "hover:bg-gray-50 dark:text-gray-500 hover:dark:bg-gray-900"
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
                    <h3 className="mb-4 font-semibold dark:text-white">Marques</h3>
                    <ul className="space-y-2">
                      {brands.map((brand) => (
                        <li key={brand}>
                          <button
                            onClick={() =>
                              updateFilter("brand", selectedBrand === brand ? null : brand)
                            }
                            className={cn(
                              "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                              selectedBrand === brand
                                ? "bg-primary-50 font-medium dark:bg-primary-900/30 dark:text-primary-400"
                                : "hover:bg-gray-50 dark:text-gray-500 hover:dark:bg-gray-900"
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
              <div className="card mb-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowFilters(true)}
                      className="flex items-center gap-2 rounded-lg border-2 border-gray-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 lg:hidden"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Filtres
                      {activeFiltersCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
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
                        onChange={(e) => updateFilter("sort", e.target.value)}
                        className="cursor-pointer appearance-none rounded-lg border-2 border-gray-200 bg-white py-2 pl-4 pr-10 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      >
                        {sortOptions.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                    </div>

                    <div className="relative">
                      <select
                        id="product-filter"
                        name="filter"
                        aria-label="Filtrer les produits"
                        value={
                          isFeaturedFilter
                            ? "featured"
                            : flashSaleFilter
                              ? "flash_sale"
                              : conditionFilter === "used"
                                ? "used"
                                : inStockFilter
                                  ? "in_stock"
                                  : onSaleFilter
                                    ? "on_sale"
                                    : ""
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "featured") {
                            toggleFilter("featured");
                          } else if (val === "flash_sale") {
                            toggleFilter("flash_sale");
                          } else if (val === "used") {
                            toggleFilter("condition");
                          } else if (val === "in_stock") {
                            toggleFilter("in_stock");
                          } else if (val === "on_sale") {
                            toggleFilter("on_sale");
                          } else {
                            const params = new URLSearchParams(searchParams);
                            params.delete("featured");
                            params.delete("flash_sale");
                            params.delete("condition");
                            params.delete("in_stock");
                            params.delete("on_sale");
                            setSearchParams(params);
                          }
                        }}
                        className="cursor-pointer appearance-none rounded-lg border-2 border-gray-200 bg-white py-2 pl-4 pr-10 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      >
                        <option value="">Tous les produits</option>
                        <option value="featured">Vedettes</option>
                        <option value="flash_sale">Promos Flash</option>
                        <option value="on_sale">En promotion</option>
                        <option value="in_stock">En stock</option>
                        <option value="used">Occasion</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                    </div>

                    <div className="hidden items-center gap-2 sm:flex">
                      <button
                        onClick={() => setView("grid")}
                        className={cn(
                          "rounded-lg p-2 transition-colors",
                          view === "grid"
                            ? "bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400"
                            : "dark:text-gray-500 hover:dark:text-gray-500"
                        )}
                      >
                        <Grid3X3 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setView("list")}
                        className={cn(
                          "rounded-lg p-2 transition-colors",
                          view === "list"
                            ? "bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400"
                            : "dark:text-gray-500 hover:dark:text-gray-500"
                        )}
                      >
                        <LayoutList className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-700">
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
                          updateFilter("min_price", localMin > 0 ? String(localMin) : null);
                          updateFilter("max_price", localMax < 1000000 ? String(localMax) : null);
                        }}
                        placeholder="Min"
                        className="input-premium w-24 py-1.5 text-right text-sm"
                      />
                      <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                      <input
                        type="number"
                        value={localMax}
                        onChange={(e) => {
                          const val = Math.min(1000000, parseInt(e.target.value) || 0);
                          setLocalMax(Math.max(val, localMin + 5000));
                        }}
                        onBlur={() => {
                          updateFilter("min_price", localMin > 0 ? String(localMin) : null);
                          updateFilter("max_price", localMax < 1000000 ? String(localMax) : null);
                        }}
                        placeholder="Max"
                        className="input-premium w-24 py-1.5 text-right text-sm"
                      />
                      <span className="whitespace-nowrap text-xs text-gray-400 dark:text-gray-500">
                        FCFA
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 sm:block">
                        Fourchette
                      </span>
                      <div className="relative h-2 flex-1">
                        <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-600" />
                        {priceBounds.max > priceBounds.min && (
                          <div
                            className="absolute h-2 rounded-full bg-primary-600/30"
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
                            updateFilter("min_price", localMin > 0 ? String(localMin) : null);
                            updateFilter("max_price", localMax < 1000000 ? String(localMax) : null);
                          }}
                          onTouchEnd={() => {
                            updateFilter("min_price", localMin > 0 ? String(localMin) : null);
                            updateFilter("max_price", localMax < 1000000 ? String(localMax) : null);
                          }}
                          className="pointer-events-auto absolute h-2 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600 [&::-webkit-slider-thumb]:shadow-lg"
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
                            updateFilter("min_price", localMin > 0 ? String(localMin) : null);
                            updateFilter("max_price", localMax < 1000000 ? String(localMax) : null);
                          }}
                          onTouchEnd={() => {
                            updateFilter("min_price", localMin > 0 ? String(localMin) : null);
                            updateFilter("max_price", localMax < 1000000 ? String(localMax) : null);
                          }}
                          className="pointer-events-auto absolute h-2 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600 [&::-webkit-slider-thumb]:shadow-lg"
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
                        onClick={() => updateFilter("category", null)}
                        className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-sm dark:bg-primary-900/30 dark:text-primary-400"
                      >
                        {selectedCategoryName}
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    {searchQuery && (
                      <button
                        onClick={() => updateFilter("search", null)}
                        className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-sm dark:bg-primary-900/30 dark:text-primary-400"
                      >
                        "{searchQuery}"
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    {selectedBrand && (
                      <button
                        onClick={() => updateFilter("brand", null)}
                        className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-sm dark:bg-primary-900/30 dark:text-primary-400"
                      >
                        {selectedBrand}
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    {(minPrice > priceBounds.min || maxPrice < priceBounds.max) && (
                      <button
                        onClick={() => {
                          updateFilter("min_price", null);
                          updateFilter("max_price", null);
                        }}
                        className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-sm text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                      >
                        {formatPrice(minPrice)} - {formatPrice(maxPrice)}
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      onClick={clearFilters}
                      className="text-sm underline dark:text-gray-500 hover:dark:text-gray-300"
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
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium dark:text-white">Aucun produit trouve</h3>
                  <p className="mb-6 text-gray-500 dark:text-gray-400">
                    Essayez de modifier vos criteres de recherche
                  </p>
                  <button onClick={clearFilters} className="btn-primary">
                    Reinitialiser les filtres
                  </button>
                </div>
              ) : (
                <div
                  className={cn(
                    "grid gap-4 md:gap-6",
                    view === "grid" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"
                  )}
                >
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
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setShowFilters(false)}
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="absolute bottom-0 left-0 top-0 z-50 w-80 overflow-y-auto bg-white dark:bg-gray-900 lg:hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-bold dark:text-white">Filtres</h2>
                    <button onClick={() => setShowFilters(false)} className="icon-btn">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <h3 className="mb-4 font-semibold dark:text-white">Categories</h3>
                  <ul className="mb-6 space-y-2">
                    <li>
                      <button
                        onClick={() => {
                          updateFilter("category", null);
                          setShowFilters(false);
                        }}
                        className={cn(
                          "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                          !selectedCategory
                            ? "bg-primary-50 font-medium dark:bg-primary-900/30 dark:text-primary-400"
                            : "hover:bg-gray-50 dark:text-gray-500 hover:dark:bg-gray-900"
                        )}
                      >
                        Toutes les categories
                      </button>
                    </li>
                    {categories.map((category) => (
                      <li key={category.id}>
                        <button
                          onClick={() => {
                            updateFilter("category", category.slug);
                            setShowFilters(false);
                          }}
                          className={cn(
                            "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                            selectedCategory === category.slug
                              ? "bg-primary-50 font-medium dark:bg-primary-900/30 dark:text-primary-400"
                              : "hover:bg-gray-50 dark:text-gray-500 hover:dark:bg-gray-900"
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
    </>
  );
}
