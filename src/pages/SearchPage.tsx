import { useEffect, useState } from "react";
import { logger } from "../lib/logger";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProductsPaginated, fetchCategories } from "../services/products";
import type { Product, Category, FilterOptions } from "../types";
import { ProductCard } from "../components/ProductCard";
import { ProductsGridSkeleton } from "../components/LoadingSpinner";
import { Pagination } from "../components/Pagination";
import { SlidersHorizontal, Grid3X3, LayoutList, Search } from "lucide-react";
import { cn } from "../lib/utils";
import { useEscape } from "../hooks/useKeyPress";

const sortOptions = [
  { value: "newest", label: "Plus recent" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix decroissant" },
  { value: "name_asc", label: "Nom A-Z" },
  { value: "name_desc", label: "Nom Z-A" },
];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  useEscape(() => setShowFilters(false), showFilters);
  const [view, setView] = useState<"grid" | "list">("grid");

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const searchQuery = searchParams.get("q") || "";
  const selectedCategory = searchParams.get("category") || "";
  const sortBy = searchParams.get("sort") || "newest";
  const minPriceParam = searchParams.get("min_price");
  const maxPriceParam = searchParams.get("max_price");
  const flashSaleFilter = searchParams.get("flash_sale") === "true";
  const conditionFilter = searchParams.get("condition") || "";
  const inStockFilter = searchParams.get("in_stock") === "true";
  const onSaleFilter = searchParams.get("on_sale") === "true";

  const [localMin, setLocalMin] = useState(minPriceParam ? parseInt(minPriceParam) : 0);
  const [localMax, setLocalMax] = useState(maxPriceParam ? parseInt(maxPriceParam) : 500000);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCategory,
    sortBy,
    minPriceParam,
    maxPriceParam,
    flashSaleFilter,
    conditionFilter,
    inStockFilter,
    onSaleFilter,
  ]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((error) => logger.error("Failed to load categories:", error));
  }, []);

  useEffect(() => {
    const term = searchQuery.trim();
    const filters: FilterOptions = {
      page: currentPage,
      per_page: perPage,
      sort: sortBy as FilterOptions["sort"],
    };

    if (selectedCategory) filters.category = selectedCategory;
    if (term) filters.search = term;
    if (flashSaleFilter) filters.flash_sale = true;
    if (conditionFilter) filters.condition = conditionFilter;
    if (inStockFilter) filters.in_stock = true;
    if (onSaleFilter) filters.on_sale = true;
    if (minPriceParam) filters.minPrice = parseInt(minPriceParam);
    if (maxPriceParam) filters.maxPrice = parseInt(maxPriceParam);

    setLoading(true);
    fetchProductsPaginated(filters)
      .then((result) => {
        setProducts(result.data || []);
        setTotalPages(result.last_page);
        setTotalProducts(result.total);
      })
      .catch((error) => logger.error("Search error:", error))
      .finally(() => setLoading(false));
  }, [
    searchQuery,
    selectedCategory,
    sortBy,
    minPriceParam,
    maxPriceParam,
    flashSaleFilter,
    conditionFilter,
    inStockFilter,
    onSaleFilter,
    currentPage,
    perPage,
  ]);

  const updateFilter = (key: string, value: string | boolean | number | undefined) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === undefined || value === "" || value === false) {
      newParams.delete(key);
    } else if (value === true) {
      newParams.set(key, "true");
    } else {
      newParams.set(key, String(value));
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set("q", searchQuery);
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedCategory ||
    minPriceParam ||
    maxPriceParam ||
    flashSaleFilter ||
    conditionFilter ||
    inStockFilter ||
    onSaleFilter;

  return (
    <div className="page-bg min-h-screen">
      <div className="page-header">
        <div className="page-section py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold dark:text-white">
              {searchQuery ? `Resultats pour "${searchQuery}"` : "Recherche"}
            </h1>
            <p className="mt-1 dark:text-gray-500">
              {totalProducts} resultat{totalProducts > 1 ? "s" : ""} trouve
              {totalProducts > 1 ? "s" : ""}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="page-section py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 transition-colors",
                showFilters || hasActiveFilters
                  ? "border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                  : "border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
              {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-primary-600" />}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Effacer tout
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="hidden items-center overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-700 md:flex">
              <button
                onClick={() => setView("grid")}
                className={cn(
                  "p-2",
                  view === "grid" ? "bg-primary-50 text-primary-600" : "text-gray-500"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "p-2",
                  view === "list" ? "bg-primary-50 text-primary-600" : "text-gray-500"
                )}
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 280 }}
                exit={{ opacity: 0, width: 0 }}
                className="hidden flex-shrink-0 overflow-hidden lg:block"
              >
                <div className="sticky top-24 space-y-6 rounded-lg border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold dark:text-white">Filtres</h3>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
                      >
                        Effacer
                      </button>
                    )}
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-medium dark:text-gray-300">Categorie</h4>
                    <select
                      value={selectedCategory}
                      onChange={(e) => updateFilter("category", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                    >
                      <option value="">Toutes</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-medium dark:text-gray-300">Prix (FCFA)</h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={localMin}
                        onChange={(e) => setLocalMin(Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Min"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        value={localMax}
                        onChange={(e) => setLocalMax(Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Max"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (localMin > 0 || localMax < 500000) {
                          updateFilter("min_price", localMin > 0 ? localMin : undefined);
                          updateFilter("max_price", localMax < 500000 ? localMax : undefined);
                        } else {
                          updateFilter("min_price", undefined);
                          updateFilter("max_price", undefined);
                        }
                      }}
                      className="mt-2 w-full rounded-lg bg-primary-50 py-2 text-sm text-primary-600 transition-colors hover:bg-primary-100"
                    >
                      Appliquer
                    </button>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-medium dark:text-gray-300">Condition</h4>
                    <select
                      value={conditionFilter}
                      onChange={(e) => updateFilter("condition", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                    >
                      <option value="">Toutes</option>
                      <option value="new">Neuf</option>
                      <option value="refurbished">Reconditionne</option>
                      <option value="used">Occasion</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={inStockFilter}
                        onChange={(e) => updateFilter("in_stock", e.target.checked || undefined)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">En stock</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={onSaleFilter}
                        onChange={(e) => updateFilter("on_sale", e.target.checked || undefined)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">En promotion</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={flashSaleFilter}
                        onChange={(e) => updateFilter("flash_sale", e.target.checked || undefined)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Flash sale</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1">
            {loading ? (
              <ProductsGridSkeleton count={perPage} />
            ) : products.length === 0 ? (
              <div className="py-20 text-center">
                <Search className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                  Aucun resultat
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Essayez de modifier vos filtres ou votre recherche
                </p>
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    view === "grid"
                      ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                      : "space-y-4"
                  )}
                >
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      lastPage={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
