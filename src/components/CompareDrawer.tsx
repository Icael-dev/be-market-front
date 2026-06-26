import { motion } from 'framer-motion';
import { X, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/utils';
import type { Product } from '../types';

interface CompareDrawerProps {
  products: Product[];
  onRemove: (productId: string) => void;
  onClear: () => void;
}

export function CompareDrawer({ products, onRemove, onClear }: CompareDrawerProps) {
  if (products.length === 0) return null;

  return (
    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Scale className="w-5 h-5 text-blue-600" /><span className="font-bold text-gray-900">Comparer ({products.length}/3)</span></div>
          <div className="flex items-center gap-3">
            {products.length > 1 && <Link to="/compare" state={{ products }} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Comparer</Link>}
            <button onClick={onClear} className="text-sm text-gray-500 hover:text-gray-700">Effacer tout</button>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {products.map(p => (
            <div key={p.id} className="flex-shrink-0 w-40 relative bg-gray-50 rounded-xl p-3">
              <button onClick={() => onRemove(p.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"><X className="w-4 h-4" /></button>
              <img src={p.images?.[0] || 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg'} alt={p.name} className="w-full h-24 object-cover rounded-lg mb-2" />
              <p className="text-sm font-medium text-gray-900 line-clamp-2">{p.name}</p>
              <p className="text-sm font-bold text-blue-600 mt-1">{formatPrice(p.price)}</p>
            </div>
          ))}
          {products.length < 3 && <div className="flex-shrink-0 w-40 h-36 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400"><span className="text-sm">Ajouter</span></div>}
        </div>
      </div>
    </motion.div>
  );
}

export function ComparePage() {
  const products = (history.state?.products || []) as Product[];
  if (products.length < 2) return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Comparer des produits</h1>
        <p className="text-gray-500 mb-6">Selectionnez au moins 2 produits</p>
        <Link to="/products" className="text-blue-600 font-medium hover:underline">Parcourir les produits</Link>
      </div>
    </div>
  );

  const allKeys = [...new Set(products.flatMap(p => Object.keys(p.specs || {})))];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Comparaison</h1>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-4 gap-4 p-6 border-b border-gray-200">
            <div className="font-bold text-gray-900">Produit</div>
            {products.map(p => (<div key={p.id}><Link to={`/product/${p.slug}`} className="block bg-gray-50 rounded-xl p-4"><img src={p.images?.[0] || 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg'} alt={p.name} className="w-full h-40 object-cover rounded-lg mb-3" /><p className="font-medium text-gray-900">{p.name}</p><p className="text-lg font-bold text-blue-600 mt-2">{formatPrice(p.price)}</p></Link></div>))}
          </div>
          {allKeys.map(key => (
            <div key={key} className="grid grid-cols-4 gap-4 p-6 border-b border-gray-200">
              <div className="font-medium text-gray-700 capitalize">{key.replace(/_/g, ' ')}</div>
              {products.map(p => (<div key={p.id} className="text-gray-900">{(p.specs as Record<string, string>)?.[key] || '-'}</div>))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}