import { useEffect, useState } from "react";
import { logger } from "../lib/logger";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchProductBySlug, fetchRelatedProducts } from "../services/products";
import { fetchReviews } from "../services/content";
import type { Product, Review } from "../types";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { ProductCard } from "../components/ProductCard";
import { ReviewSection } from "../components/ReviewSection";
import { PageLoading } from "../components/LoadingSpinner";
import { StockNotificationButton } from "../pages/StockNotificationPage";
import { PageTitle } from "../hooks/usePageTitle";
import {
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  ChevronRight,
  Star,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react";
import { cn, formatPrice, FALLBACK_IMAGE } from "../lib/utils";

export function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
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

        const productReviews = await fetchReviews(data.id);
        setReviews(productReviews);
        if (productReviews.length > 0) {
          const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
          setAverageRating(Math.round(avg * 10) / 10);
        }
      } catch (error) {
        logger.error("Error fetching product:", error);
        navigate("/products");
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
      navigate("/cart");
    }
  };

  const handleToggleWishlist = () => {
    if (product) {
      toggleItem(product.id, product);
    }
  };

  if (loading) return <PageLoading />;
  if (!product) {
    return (
      <div className="page-bg flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            Produit introuvable
          </p>
          <Link to="/products" className="text-primary-600 hover:underline">
            Voir tous les produits
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [FALLBACK_IMAGE];

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const specs = product.specs || {};
  const isWishlisted = isInWishlist(product.id);

  const features = [
    { icon: Truck, title: "Livraison rapide", description: "24-48h a Lome" },
    { icon: Shield, title: "Garantie", description: "1 an" },
    { icon: RotateCcw, title: "Retour", description: "7 jours" },
  ];

  return (
    <>
      {product && (
        <PageTitle
          title={product.name}
          description={product.short_description || product.description || undefined}
        />
      )}
      <div className="page-bg min-h-screen">
        <div className="page-header">
          <div className="page-header-inner">
            <nav className="flex items-center gap-2 text-sm">
              <Link
                to="/"
                className="text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Accueil
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Link
                to="/products"
                className="text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Produits
              </Link>
              {product.category && (
                <>
                  <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Link
                    to={`/products?category=${product.category.slug}`}
                    className="text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {product.category.name}
                  </Link>
                </>
              )}
              <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <span className="max-w-[200px] truncate font-medium text-gray-900 dark:text-white">
                {product.name}
              </span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-100 bg-gray-100 dark:border-gray-800 dark:bg-gray-800">
                <img
                  src={imageError[selectedImage] ? images[0] : images[selectedImage]}
                  alt={product.name}
                  onError={() => setImageError((prev) => ({ ...prev, [selectedImage]: true }))}
                  className="h-full w-full object-cover"
                />
                {discount > 0 && (
                  <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1.5 text-sm font-bold text-white shadow-lg">
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
                        "h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                        selectedImage === index
                          ? "border-primary-600 ring-2 ring-primary-600/20"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                      )}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        loading="lazy"
                        decoding="async"
                        onError={() => setImageError((prev) => ({ ...prev, [index]: true }))}
                        className="h-full w-full object-cover"
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
                  <p className="mb-2 text-sm font-medium text-primary-600 dark:text-primary-400">
                    {specs.brand}
                  </p>
                )}
                <h1 className="text-2xl font-bold tracking-tightest dark:text-white md:text-3xl">
                  {product.name}
                </h1>
                {product.sku && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    SKU: {product.sku}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < Math.round(averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      )}
                    />
                  ))}
                  <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                    {averageRating > 0 ? `${averageRating} (${reviews.length} avis)` : ""}
                  </span>
                </div>
                <a
                  href="#reviews"
                  className="text-sm text-primary-600 hover:underline dark:text-primary-400"
                >
                  Voir les avis
                </a>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold dark:text-white">
                  {formatPrice(product.price)}
                </span>
                {product.compare_price && (
                  <span className="text-xl text-gray-400 line-through dark:text-gray-500">
                    {formatPrice(product.compare_price)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-1 text-sm font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    Economisez {formatPrice(product.compare_price! - product.price)}
                  </span>
                )}
              </div>

              <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                {product.description}
              </p>

              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "font-medium",
                    product.stock > 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-500 dark:text-red-400"
                  )}
                >
                  {product.stock > 0
                    ? `En stock (${product.stock} disponibles)`
                    : "Rupture de stock"}
                </span>
              </div>

              {product.stock > 0 && (
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-600 dark:text-gray-300">Quantite:</span>
                    <div className="flex items-center rounded-lg border-2 border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="p-3 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                        className="p-3 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {product.stock === 0 && <StockNotificationButton product={product} />}

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="btn-primary flex-1"
                >
                  <ShoppingCart className="h-5 w-5" />
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
                    "rounded-lg p-3.5 transition-colors",
                    isWishlisted
                      ? "bg-red-500 text-white"
                      : "border-2 border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
                  )}
                >
                  <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                {features.map((feature) => (
                  <div key={feature.title} className="flex items-center gap-3">
                    <div className="icon-box-primary h-10 w-10">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium dark:text-white">{feature.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {feature.description}
                      </p>
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
              <h2 className="mb-6 text-xl font-bold tracking-tightest dark:text-white">
                Specifications
              </h2>
              <div className="card overflow-hidden">
                <div className="grid grid-cols-2 gap-px bg-gray-100 dark:bg-gray-800">
                  {Object.entries(specs).map(([key, value], index) => (
                    <div
                      key={key}
                      className={cn(
                        "flex flex-col p-4 sm:flex-row sm:items-center",
                        index % 2 === 0
                          ? "bg-white dark:bg-gray-900"
                          : "bg-gray-50 dark:bg-gray-800/60"
                      )}
                    >
                      <span className="flex-shrink-0 text-sm capitalize text-gray-500 dark:text-gray-400 sm:w-40">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="mt-1 font-medium dark:text-white sm:mt-0">
                        {String(value)}
                      </span>
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
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tightest dark:text-white">
                  Produits similaires
                </h2>
                <Link
                  to={`/products?category=${product.category?.slug || ""}`}
                  className="font-medium text-primary-600 hover:underline dark:text-primary-400"
                >
                  Voir tout
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {relatedProducts.map((p, index) => (
                  <ProductCard key={p.id} product={p} index={index} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
