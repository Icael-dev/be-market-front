import { useEffect, useState } from "react";
import { logger } from "../lib/logger";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fetchCategories, fetchProducts } from "../services/products";
import type { Category, Product } from "../types";
import { ArrowRight } from "lucide-react";
import { IconBox } from "../components/ui/Card";
import { Carousel } from "../components/Carousel";

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const cats = await fetchCategories();
        setCategories(cats);

        const productMap: Record<string, Product[]> = {};
        for (const cat of cats) {
          try {
            const products = await fetchProducts({ category: cat.slug });
            const shuffled = products.sort(() => Math.random() - 0.5).slice(0, 6);
            productMap[cat.id] = shuffled;
          } catch {
            productMap[cat.id] = [];
          }
        }
        setCategoryProducts(productMap);
      } catch (error) {
        logger.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="page-bg min-h-screen">
        <div className="page-header">
          <div className="page-header-inner">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
        <div className="page-section py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse overflow-hidden">
                <div className="h-48 bg-gray-200 dark:bg-gray-800" />
                <div className="p-5">
                  <div className="mb-2 h-5 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen">
      <div className="page-header">
        <div className="page-header-inner">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-2 flex items-center gap-3">
              <IconBox tone="primary" size="md">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </IconBox>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
            </div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {categories.length} categories disponibles
            </p>
          </motion.div>
        </div>
      </div>

      <div className="page-section py-8">
        {categories.length === 0 ? (
          <div className="card p-12 text-center">
            <svg
              className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">
              Aucune categorie disponible pour le moment
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/products?category=${category.slug}`}
                  className="card group block overflow-hidden transition-all hover:border-primary-200 hover:shadow-premium dark:hover:border-primary-800"
                >
                  <Carousel
                    images={(categoryProducts[category.id] || []).flatMap((p) =>
                      (p.images || []).filter(Boolean)
                    )}
                  />
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                      {category.description ||
                        `Decouvrez tous nos produits dans la categorie ${category.name}`}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-600 transition-all group-hover:gap-2 dark:text-primary-400">
                      Voir les produits
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
