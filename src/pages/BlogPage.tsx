import { useEffect, useState, useCallback } from "react";
import { logger } from "../lib/logger";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchBlogPosts, fetchBlogPostBySlug } from "../services/content";
import type { BlogPost } from "../types";
import { Calendar, ArrowLeft, Clock, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { ProductCard } from "../components/ProductCard";
import { getImageUrl } from "../lib/imageUrl";

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const fetchPosts = useCallback(async () => {
    try {
      const data = await fetchBlogPosts();
      setPosts(data);
    } catch (error) {
      logger.error("Failed to load blog posts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="page-bg min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            Blog & Actualites
          </h1>
          <p className="mx-auto max-w-2xl text-gray-500 dark:text-gray-400">
            Decouvrez nos articles, guides et conseils sur les dernieres tendances tech
          </p>
        </motion.div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse overflow-hidden">
                <div className="h-48 bg-gray-200 dark:bg-gray-800" />
                <div className="space-y-3 p-6">
                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-500 dark:text-gray-400">Aucun article pour le moment</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card transition-all hover:shadow-premium"
              >
                <Link to={`/blog/${post.slug}`}>
                  <div className="relative h-48 overflow-hidden">
                    {post.image_url && !imageErrors.has(post.slug) ? (
                      <img
                        src={getImageUrl(post.image_url, "blog")}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        onError={() => setImageErrors((prev) => new Set(prev).add(post.slug))}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-600 to-cyan-500">
                        <span className="text-6xl font-bold text-white">{post.title[0]}</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-6">
                  <div className="mb-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    {post.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(post.published_at), "dd MMM yyyy")}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />5 min de lecture
                    </span>
                  </div>

                  <Link to={`/blog/${post.slug}`}>
                    <h2 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 transition-colors hover:text-primary-600 dark:text-white">
                      {post.title}
                    </h2>
                  </Link>

                  {post.excerpt && (
                    <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
                      {post.excerpt}
                    </p>
                  )}

                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-sm font-medium text-primary-600 hover:underline"
                  >
                    Lire la suite
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!slug) return;

    try {
      const data = await fetchBlogPostBySlug(slug);
      setPost(data);
    } catch (error) {
      logger.error("Failed to load blog post:", error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  if (loading) {
    return (
      <div className="page-bg flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary-600 dark:border-gray-700" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="page-bg min-h-screen py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="mb-4 text-gray-500 dark:text-gray-400">Article non trouve</p>
          <Link to="/blog" className="font-medium text-primary-600 hover:underline">
            Retour au blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen py-12">
      <article className="mx-auto max-w-4xl px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to="/blog"
            className="mb-6 inline-flex items-center gap-2 font-medium text-primary-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au blog
          </Link>

          <header className="mb-8">
            <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
              {post.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(post.published_at), "dd MMMM yyyy")}
                </span>
              )}
            </div>
          </header>

          {post.image_url && !imageError && (
            <div className="mb-8 overflow-hidden rounded-lg">
              <img
                src={getImageUrl(post.image_url, "blog")}
                alt={post.title}
                className="h-64 w-full object-cover md:h-96"
                onError={() => setImageError(true)}
              />
            </div>
          )}

          <div className="card p-6 md:p-10">
            <div className="prose prose-gray max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
                {post.content}
              </p>
            </div>
          </div>

          {post.related_products && post.related_products.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12"
            >
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                <ShoppingBag className="h-6 w-6 text-primary-600" />
                Produits lies
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {post.related_products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </article>
    </div>
  );
}
