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
import { cn, formatPrice, FALLBACK_IMAGE } from '../lib/utils';

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
      setSelectedImage(0);
      setImageError({});
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
    FALLBACK_IMAGE
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
    <div className="min-h-screen page-bg">
      <div className="page-header">
        <div className="page-header-inner">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <Link to="/products" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              Produits
            </Link>
            {product.category && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <Link
                  to={`/products?category=${product.category.slug}`}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
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
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800">
              <img
                src={imageError[selectedImage] ? images[0] : images[selectedImage]}
                alt={product.name}
                onError={() => setImageError(prev => ({ ...prev, [selectedImage]: true }))}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
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
                        ? 'border-primary-600 ring-2 ring-primary-600/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    )}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      loading="lazy"
                      decoding="async"
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
                <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-2">{specs.brand}</p>
              )}
              <h1 className="text-2xl md:text-3xl font-bold dark:text-white tracking-tightest">
                {product.name}
              </h1>
              {product.sku && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">SKU: {product.sku}</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-5 h-5',
                      i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'
                    )}
                  />
                ))}
              </div>
              <a href="#reviews" className="text-primary-600 dark:text-primary-400 text-sm hover:underline">
                Voir les avis
              </a>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold dark:text-white">
                {formatPrice(product.price)}
              </span>
              {product.compare_price && (
                <span className="text-xl text-gray-400 dark:text-gray-500 line-through">
                  {formatPrice(product.compare_price)}
                </span>
              )}
              {discount > 0 && (
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium rounded-full">
                  Economisez {formatPrice(product.compare_price! - product.price)}
                </span>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {product.description}
            </p>

            <div className="flex items-center gap-4">
              <span className={cn(
                'font-medium',
                product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
              )}>
                {product.stock > 0 ? `En stock (${product.stock} disponibles)` : 'Rupture de stock'}
              </span>
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Quantite:</span>
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                className="btn-primary flex-1"
              >
                <ShoppingCart className="w-5 h-5" />
                Ajouter au panier
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="btn-ghost flex-1"
              >
                Acheter maintenant
              </button>
              <button
                onClick={handleToggleWishlist}
                className={cn(
                  'p-3.5 rounded-xl transition-colors',
                  isWishlisted
                    ? 'bg-red-500 text-white'
                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              {features.map(feature => (
                <div key={feature.title} className="flex items-center gap-3">
                  <div className="icon-box-primary w-10 h-10">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-white">{feature.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{feature.description}</p>
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
            <h2 className="text-xl font-bold dark:text-white mb-6 tracking-tightest">Specifications</h2>
            <div className="card overflow-hidden">
              <div className="grid grid-cols-2 gap-px bg-gray-100 dark:bg-gray-800">
                {Object.entries(specs).map(([key, value], index) => (
                  <div
                    key={key}
                    className={cn(
                      'flex flex-col sm:flex-row sm:items-center p-4',
                      index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/60'
                    )}
                  >
                    <span className="text-gray-500 dark:text-gray-400 text-sm sm:w-40 flex-shrink-0 capitalize">
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
              <h2 className="text-xl font-bold dark:text-white tracking-tightest">Produits similaires</h2>
              <Link
                to={`/products?category=${product.category?.slug || ''}`}
                className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
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