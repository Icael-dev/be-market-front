import { useEffect, useState, useCallback } from 'react';
import { logger } from '../lib/logger';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchBlogPosts, fetchBlogPostBySlug } from '../services/content';
import type { BlogPost } from '../types';
import { Calendar, ArrowLeft, Clock, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { ProductCard } from '../components/ProductCard';
import { getImageUrl } from '../lib/imageUrl';

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const fetchPosts = useCallback(async () => {
    try {
      const data = await fetchBlogPosts();
      setPosts(data);
    } catch (error) {
      logger.error('Failed to load blog posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="min-h-screen page-bg py-12">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Blog & Actualites</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Decouvrez nos articles, guides et conseils sur les dernieres tendances tech
          </p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-800" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400">Aucun article pour le moment</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card hover:shadow-premium transition-all"
              >
                 <Link to={`/blog/${post.slug}`}>
                   <div className="relative h-48 overflow-hidden">
                      {post.image_url && !imageErrors.has(post.slug) ? (
                        <img
                          src={getImageUrl(post.image_url, 'blog')}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          onError={() => setImageErrors(prev => new Set(prev).add(post.slug))}
                        />
                     ) : (
                       <div className="w-full h-full bg-gradient-to-br from-primary-600 to-cyan-500 flex items-center justify-center">
                         <span className="text-white text-6xl font-bold">{post.title[0]}</span>
                       </div>
                     )}
                   </div>
                 </Link>

                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {post.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(post.published_at), 'dd MMM yyyy')}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      5 min de lecture
                    </span>
                  </div>

                  <Link to={`/blog/${post.slug}`}>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                      {post.title}
                    </h2>
                  </Link>

                  {post.excerpt && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                  )}

                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-primary-600 font-medium text-sm hover:underline"
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
      logger.error('Failed to load blog post:', error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  if (loading) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen page-bg py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Article non trouve</p>
          <Link to="/blog" className="text-primary-600 font-medium hover:underline">
            Retour au blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg py-12">
      <article className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-primary-600 font-medium hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au blog
          </Link>

          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
              {post.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(post.published_at), 'dd MMMM yyyy')}
                </span>
              )}
            </div>
          </header>

          {post.image_url && !imageError && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={getImageUrl(post.image_url, 'blog')}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          )}

          <div className="card p-6 md:p-10">
            <div className="prose prose-gray max-w-none">
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-primary-600" />
                Produits lies
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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