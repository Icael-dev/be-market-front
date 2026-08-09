import { motion } from "framer-motion";
import { X, Scale } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { formatPrice, FALLBACK_IMAGE } from "../lib/utils";
import type { Product } from "../types";

interface CompareDrawerProps {
  products: Product[];
  onRemove: (productId: string) => void;
  onClear: () => void;
}

export function CompareDrawer({ products, onRemove, onClear }: CompareDrawerProps) {
  if (products.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white shadow-premium dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary-600" />
            <span className="font-bold dark:text-white">Comparer ({products.length}/3)</span>
          </div>
          <div className="flex items-center gap-3">
            {products.length > 1 && (
              <Link to="/compare" state={{ products }} className="btn-primary-sm">
                Comparer
              </Link>
            )}
            <button
              onClick={onClear}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Effacer tout
            </button>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {products.map((p) => (
            <div
              key={p.id}
              className="relative w-40 flex-shrink-0 rounded-lg bg-gray-100 p-3 dark:bg-gray-800"
            >
              <button
                onClick={() => onRemove(p.id)}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
              >
                <X className="h-4 w-4" />
              </button>
              <img
                src={p.images?.[0] || FALLBACK_IMAGE}
                alt={p.name}
                loading="lazy"
                decoding="async"
                className="mb-2 h-24 w-full rounded-lg object-cover"
              />
              <p className="line-clamp-2 text-sm font-medium dark:text-white">{p.name}</p>
              <p className="mt-1 text-sm font-bold text-primary-600">{formatPrice(p.price)}</p>
            </div>
          ))}
          {products.length < 3 && (
            <div className="flex h-36 w-40 flex-shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400">
              <span className="text-sm">Ajouter</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function ComparePage() {
  const location = useLocation();
  const products = ((location.state as { products?: Product[] } | null)?.products ||
    []) as Product[];
  if (products.length < 2)
    return (
      <div className="page-bg min-h-screen py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <Scale className="mx-auto mb-4 h-16 w-16 text-gray-400 dark:text-gray-500" />
          <h1 className="mb-2 text-2xl font-bold dark:text-white">Comparer des produits</h1>
          <p className="mb-6 text-gray-500 dark:text-gray-400">Selectionnez au moins 2 produits</p>
          <Link
            to="/products"
            className="font-medium text-primary-600 hover:underline dark:text-primary-400"
          >
            Parcourir les produits
          </Link>
        </div>
      </div>
    );

  const allKeys = [...new Set(products.flatMap((p) => Object.keys(p.specs || {})))];

  return (
    <div className="page-bg min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="mb-8 text-2xl font-bold tracking-tightest dark:text-white">Comparaison</h1>
        <div className="card overflow-hidden">
          <div className="grid grid-cols-4 gap-4 border-b border-gray-100 p-6 dark:border-gray-800">
            <div className="font-bold dark:text-white">Produit</div>
            {products.map((p) => (
              <div key={p.id}>
                <Link
                  to={`/product/${p.slug}`}
                  className="block rounded-lg bg-gray-100 p-4 dark:bg-gray-800"
                >
                  <img
                    src={p.images?.[0] || FALLBACK_IMAGE}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    className="mb-3 h-40 w-full rounded-lg object-cover"
                  />
                  <p className="font-medium dark:text-white">{p.name}</p>
                  <p className="mt-2 text-lg font-bold text-primary-600">{formatPrice(p.price)}</p>
                </Link>
              </div>
            ))}
          </div>
          {allKeys.map((key) => (
            <div
              key={key}
              className="grid grid-cols-4 gap-4 border-b border-gray-100 p-6 dark:border-gray-800"
            >
              <div className="font-medium capitalize dark:text-gray-300">
                {key.replace(/_/g, " ")}
              </div>
              {products.map((p) => (
                <div key={p.id} className="dark:text-white">
                  {(p.specs as Record<string, string>)?.[key] || "-"}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
