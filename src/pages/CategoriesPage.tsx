import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../services/products';
import type { Category } from '../types';
import { Grid3X3, ArrowRight } from 'lucide-react';
import { IconBox } from '../components/ui/Card';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
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
                <Grid3X3 className="w-5 h-5" />
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
            <Grid3X3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
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
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 dark:from-primary-900/50 to-cyan-50 dark:to-cyan-900/50">
                        <Grid3X3 className="w-12 h-12 text-primary-300 dark:text-primary-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-xl font-bold text-white">{category.name}</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
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
