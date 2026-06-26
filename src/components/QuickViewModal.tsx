import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Heart, Minus, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Product } from '../types';
import { formatPrice, cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) return null;

  const images = product.images?.length > 0 ? product.images : ['https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg'];

  const handleAddToCart = () => { addItem(product, quantity); onClose(); };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-50" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:max-h-[90vh] bg-white rounded-2xl overflow-hidden z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Apercu rapide</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden"><img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" /></div>
                  {images.length > 1 && <div className="flex gap-2 overflow-x-auto">{images.map((img, i) => (<button key={i} onClick={() => setSelectedImage(i)} className={cn('flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2', selectedImage === i ? 'border-blue-600' : 'border-gray-200')}><img src={img} alt="" className="w-full h-full object-cover" /></button>))}</div>}
                </div>
                <div className="space-y-4">
                  {product.specs?.brand && <p className="text-sm text-blue-600 font-medium">{product.specs.brand}</p>}
                  <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                  <div className="flex items-baseline gap-3"><span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>{product.compare_price && <span className="text-lg text-gray-400 line-through">{formatPrice(product.compare_price)}</span>}</div>
                  <p className="text-gray-600 text-sm line-clamp-3">{product.description}</p>
                  {product.stock > 0 && (<div className="flex items-center gap-3"><span className="text-sm text-gray-700">Quantite:</span><div className="flex items-center border border-gray-200 rounded-lg"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-50"><Minus className="w-4 h-4" /></button><span className="w-10 text-center font-medium">{quantity}</span><button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-2 hover:bg-gray-50"><Plus className="w-4 h-4" /></button></div></div>)}
                  <div className="flex gap-3 pt-4"><button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"><ShoppingCart className="w-5 h-5" /> Ajouter</button><button onClick={() => toggleItem(product.id, product)} className={cn('p-3 rounded-xl', isInWishlist(product.id) ? 'bg-red-500 text-white' : 'border border-gray-200 text-gray-600')}><Heart className={cn('w-5 h-5', isInWishlist(product.id) && 'fill-current')} /></button></div>
                  <Link to={`/product/${product.slug}`} onClick={onClose} className="block text-center text-blue-600 font-medium hover:underline">Voir les details</Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}