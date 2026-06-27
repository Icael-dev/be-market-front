import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchProductBySlug, fetchRelatedProducts } from '../services/products';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { ReviewSection } from '../components/ReviewSection';
import { PageLoading } from '../components/LoadingSpinner';
import {
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  ChevronRight,
  Star,
  Shield,
  Truck,
  RotateCcw
} from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';

export function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;

      setLoading(true);
      try {
        const data = await fetchProductBySlug(slug);
        setProduct(data);

        if (data.category_id) {
          const related = await fetchRelatedProducts(data.category_id, data.id, 4);
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/products');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug, navigate]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addItem(product, quantity);
      navigate('/cart');
    }
  };

  const handleToggleWishlist = () => {
    if (product) {
      toggleItem(product.id, product);
    }
  };

  if (loading) return <PageLoading />;
  if (!product) return null;

  const images = product.images?.length > 0 ? product.images : [
    'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=800'
  ];

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const specs = product.specs || {};
  const isWishlisted = isInWishlist(product.id);

  const features = [
    { icon: Truck, title: 'Livraison rapide', description: '24-48h a Lome' },
    { icon: Shield, title: 'Garantie', description: '1 an' },
    { icon: RotateCcw, title: 'Retour', description: '7 jours' }
  ];

  return (
    <div className="min-h-screen dark:bg-gray-900">
      <div className="dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="dark:text-gray-500 hover:dark:text-gray-500 transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 dark:text-gray-500" />
            <Link to="/products" className="dark:text-gray-500 hover:dark:text-gray-500 transition-colors">
              Produits
            </Link>
            {product.category && (
              <>
                <ChevronRight className="w-4 h-4 dark:text-gray-500" />
                <Link
                  to={`/products?category=${product.category.slug}`}
                  className="dark:text-gray-500 hover:dark:text-gray-500 transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 dark:text-gray-500" />
            <span className="dark:text-white font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-square dark:bg-gray-800 rounded-2xl overflow-hidden border dark:border-gray-700">
              <img
                src={imageError[selectedImage] ? images[0] : images[selectedImage]}
                alt={product.name}
                onError={() => setImageError(prev => ({ ...prev, [selectedImage]: true }))}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                  -{discount}%
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all',
                      selectedImage === index
                        ? 'border-blue-600 ring-2 ring-blue-600/20'
                        : 'dark:border-gray-700 hover:border-gray-300'
                    )}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      onError={() => setImageError(prev => ({ ...prev, [index]: true }))}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              {specs.brand && (
                <p className="text-sm dark:text-blue-400 font-medium mb-2">{specs.brand}</p>
              )}
              <h1 className="text-2xl md:text-3xl font-bold dark:text-white">
                {product.name}
              </h1>
              {product.sku && (
                <p className="text-sm dark:text-gray-500 mt-1">SKU: {product.sku}</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-5 h-5',
                      i < 4 ? 'text-yellow-400 fill-yellow-400' : 'dark:text-gray-500'
                    )}
                  />
                ))}
              </div>
              <Link to="#reviews" className="dark:text-blue-400 text-sm hover:underline">
                Voir les avis
              </Link>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold dark:text-white">
                {formatPrice(product.price)}
              </span>
              {product.compare_price && (
                <span className="text-xl dark:text-gray-500 line-through">
                  {formatPrice(product.compare_price)}
                </span>
              )}
              {discount > 0 && (
                <span className="px-2 py-1 dark:bg-red-900/30 text-red-600 text-sm font-medium rounded">
                  Economisez {formatPrice(product.compare_price! - product.price)}
                </span>
              )}
            </div>

            <p className="dark:text-gray-500 leading-relaxed">
              {product.description}
            </p>

            <div className="flex items-center gap-4">
              <span className={cn(
                'font-medium',
                product.stock > 0 ? 'text-green-600' : 'dark:text-red-400'
              )}>
                {product.stock > 0 ? `En stock (${product.stock} disponibles)` : 'Rupture de stock'}
              </span>
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="dark:text-gray-500 font-medium">Quantite:</span>
                  <div className="flex items-center border dark:border-gray-700 rounded-xl">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-3 hover:dark:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="p-3 hover:dark:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                Ajouter au panier
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 rounded-xl font-medium dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Acheter maintenant
              </button>
              <button
                onClick={handleToggleWishlist}
                className={cn(
                  'p-3.5 rounded-xl transition-colors',
                  isWishlisted
                    ? 'bg-red-500 text-white'
                    : 'border dark:border-gray-700 dark:text-gray-500 hover:dark:bg-gray-900'
                )}
              >
                <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
              {features.map(feature => (
                <div key={feature.title} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl dark:bg-blue-900/20 flex items-center justify-center dark:text-blue-400">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-white">{feature.title}</p>
                    <p className="text-xs dark:text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {Object.keys(specs).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12"
          >
            <h2 className="text-xl font-bold dark:text-white mb-6">Specifications</h2>
            <div className="dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden">
              <div className="grid grid-cols-2 gap-px dark:bg-gray-700">
                {Object.entries(specs).map(([key, value], index) => (
                  <div
                    key={key}
                    className={cn(
                      'flex flex-col sm:flex-row sm:items-center p-4',
                      index % 2 === 0 ? 'dark:bg-gray-800' : 'dark:bg-gray-900'
                    )}
                  >
                    <span className="dark:text-gray-500 text-sm sm:w-40 flex-shrink-0 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="font-medium dark:text-white sm:mt-0 mt-1">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div id="reviews">
          <ReviewSection productId={product.id} />
        </div>

        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold dark:text-white">Produits similaires</h2>
              <Link
                to={`/products?category=${product.category?.slug || ''}`}
                className="dark:text-blue-400 font-medium hover:underline"
              >
                Voir tout
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p, index) => (
                <ProductCard key={p.id} product={p} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}