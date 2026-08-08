import { motion } from 'framer-motion';
import { X, Scale } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { formatPrice, FALLBACK_IMAGE } from '../lib/utils';
import type { Product } from '../types';

interface CompareDrawerProps {
  products: Product[];
  onRemove: (productId: string) => void;
  onClear: () => void;
}

export function CompareDrawer({ products, onRemove, onClear }: CompareDrawerProps) {
  if (products.length === 0) return null;

  return (
    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-premium z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Scale className="w-5 h-5 text-primary-600" /><span className="font-bold dark:text-white">Comparer ({products.length}/3)</span></div>
          <div className="flex items-center gap-3">
            {products.length > 1 && <Link to="/compare" state={{ products }} className="btn-primary-sm">Comparer</Link>}
            <button onClick={onClear} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Effacer tout</button>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {products.map(p => (
            <div key={p.id} className="flex-shrink-0 w-40 relative bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <button onClick={() => onRemove(p.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"><X className="w-4 h-4" /></button>
               <img src={p.images?.[0] || FALLBACK_IMAGE} alt={p.name} loading="lazy" decoding="async" className="w-full h-24 object-cover rounded-lg mb-2" />
              <p className="text-sm font-medium dark:text-white line-clamp-2">{p.name}</p>
              <p className="text-sm font-bold text-primary-600 mt-1">{formatPrice(p.price)}</p>
            </div>
          ))}
          {products.length < 3 && <div className="flex-shrink-0 w-40 h-36 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400"><span className="text-sm">Ajouter</span></div>}
        </div>
      </div>
    </motion.div>
  );
}

export function ComparePage() {
  const location = useLocation();
  const products = ((location.state as { products?: Product[] } | null)?.products || []) as Product[];
  if (products.length < 2) return (
    <div className="min-h-screen page-bg py-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <Scale className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold dark:text-white mb-2">Comparer des produits</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Selectionnez au moins 2 produits</p>
        <Link to="/products" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Parcourir les produits</Link>
      </div>
    </div>
  );

  const allKeys = [...new Set(products.flatMap(p => Object.keys(p.specs || {})))];

  return (
    <div className="min-h-screen page-bg py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold dark:text-white mb-8 tracking-tightest">Comparaison</h1>
        <div className="card overflow-hidden">
          <div className="grid grid-cols-4 gap-4 p-6 border-b border-gray-100 dark:border-gray-800">
            <div className="font-bold dark:text-white">Produit</div>
            {products.map(p => (<div key={p.id}><Link to={`/product/${p.slug}`} className="block bg-gray-100 dark:bg-gray-800 rounded-lg p-4"><img src={p.images?.[0] || FALLBACK_IMAGE} alt={p.name} loading="lazy" decoding="async" className="w-full h-40 object-cover rounded-lg mb-3" /><p className="font-medium dark:text-white">{p.name}</p><p className="text-lg font-bold text-primary-600 mt-2">{formatPrice(p.price)}</p></Link></div>))}
          </div>
          {allKeys.map(key => (
            <div key={key} className="grid grid-cols-4 gap-4 p-6 border-b border-gray-100 dark:border-gray-800">
              <div className="font-medium dark:text-gray-300 capitalize">{key.replace(/_/g, ' ')}</div>
              {products.map(p => (<div key={p.id} className="dark:text-white">{(p.specs as Record<string, string>)?.[key] || '-'}</div>))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}