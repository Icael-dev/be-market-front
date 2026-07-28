import { useEffect, useState } from 'react';
import { logger } from '../lib/logger';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchCategories, fetchProducts } from '../services/products';
import type { Category, Product } from '../types';
import { ArrowRight } from 'lucide-react';
import { IconBox } from '../components/ui/Card';
import { Carousel } from '../components/Carousel';

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
        logger.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

if (loading) {
    return (
      <div className="min-h-screen page-bg">
        <div className="page-header">
          <div className="page-header-inner">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Chargement...</p>
          </div>
        </div>
        <div className="page-section py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-800" />
                <div className="p-5">
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg">
      <div className="page-header">
        <div className="page-header-inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <IconBox tone="primary" size="md">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </IconBox>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {categories.length} categories disponibles
            </p>
          </motion.div>
        </div>
      </div>

      <div className="page-section py-8">
        {categories.length === 0 ? (
          <div className="card p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">Aucune categorie disponible pour le moment</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/products?category=${category.slug}`}
                  className="group block card overflow-hidden hover:shadow-premium hover:border-primary-200 dark:hover:border-primary-800 transition-all"
                >
                  <Carousel
                    images={(categoryProducts[category.id] || [])
                      .flatMap(p => (p.images || []).filter(Boolean))}
                  />
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{category.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                      {category.description || `Decouvrez tous nos produits dans la categorie ${category.name}`}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:gap-2 transition-all">
                      Voir les produits
                      <ArrowRight className="w-4 h-4" />
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
