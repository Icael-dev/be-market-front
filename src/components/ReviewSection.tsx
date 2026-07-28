import { useEffect, useState, useCallback } from 'react';
import { logger } from '../lib/logger';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchReviews as fetchReviewsService, submitReview } from '../services/content';
import type { Review } from '../types';

import { Star, MessageSquare, Send, User } from 'lucide-react';
import { InputField, TextareaField } from './ui/FormField';
import { useEscape } from '../hooks/useKeyPress';

interface ReviewSectionProps {
  productId: string;
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  useEscape(() => setShowForm(false), showForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ rating: 5, title: '', comment: '' });

  const fetchReviews = useCallback(async () => {
    try {
      const data = await fetchReviewsService(productId);
      setReviews(data);
    } catch (error) {
      logger.error('Failed to load reviews:', error);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.comment.trim()) {
      setCommentError('Le commentaire est requis');
      return;
    }
    setCommentError(null);
    setError(null);
    setSubmitting(true);

    try {
      await submitReview(productId, {
        rating: formData.rating,
        title: formData.title || undefined,
        comment: formData.comment || undefined
      });
      await fetchReviews();
      setShowForm(false);
      setFormData({ rating: 5, title: '', comment: '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'avis';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
      : 0
  }));

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold dark:text-white">Avis clients</h2>
        {user && !reviews.some(r => r.user_id === user.id) && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700"
          >
            <MessageSquare className="w-4 h-4" />
            Laisser un avis
          </button>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-8">
            <div className="text-center">
              <p className="text-5xl font-bold dark:text-white">{averageRating.toFixed(1)}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{reviews.length} avis</p>
            </div>

            <div className="flex-1 space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-8">{rating} etoile{rating > 1 ? 's' : ''}</span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <form onSubmit={handleSubmit} className="card p-6">
              <h3 className="font-bold dark:text-white mb-4">Donnez votre avis</h3>

              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium dark:text-gray-300 mb-2">Note</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating })}
                      className="p-1"
                      aria-label={`Noter ${rating} etoile${rating > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${rating <= formData.rating ? 'text-yellow-400 fill-yellow-400' : 'dark:text-gray-500'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <InputField
                name="review_title"
                label="Titre (optionnel)"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />

              <div className="mt-4">
                <TextareaField
                  name="review_comment"
                  label="Commentaire"
                  required
                  rows={4}
                  value={formData.comment}
                  onChange={e => setFormData({ ...formData, comment: e.target.value })}
                  error={commentError || undefined}
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary-sm"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Envoi...' : 'Envoyer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-ghost-sm"
                >
                  Annuler
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-2xl">
          <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Aucun avis pour ce produit</p>
          {user ? (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-primary-600 font-medium hover:underline"
            >
              Soyez le premier a donner votre avis
            </button>
          ) : (
            <Link to="/login" className="mt-4 inline-block text-primary-600 font-medium hover:underline">
              Connectez-vous pour laisser un avis
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card p-4"
              >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-cyan-500 flex items-center justify-center text-white font-medium">
                  {review.user?.profile?.full_name?.[0] || <User className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium dark:text-white">
                      {review.user?.profile?.full_name || 'Utilisateur'}
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'dark:text-gray-500'}`}
                        />
                      ))}
                    </div>
                    {review.is_verified_purchase && (
                      <span className="text-xs bg-green-50 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded-full">
                        Achat verifie
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <p className="font-medium dark:text-white mt-2">{review.title}</p>
                  )}
                  {review.comment && (
                    <p className="dark:text-gray-500 mt-1">{review.comment}</p>
                  )}
                  <p className="text-xs dark:text-gray-500 mt-2">
                    {new Date(review.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}