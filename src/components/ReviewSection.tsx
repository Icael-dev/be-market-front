import { useEffect, useState, useCallback } from "react";
import { logger } from "../lib/logger";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchReviews as fetchReviewsService, submitReview } from "../services/content";
import type { Review } from "../types";

import { Star, MessageSquare, Send, User } from "lucide-react";
import { InputField, TextareaField } from "./ui/FormField";
import { useEscape } from "../hooks/useKeyPress";

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
  const [formData, setFormData] = useState({ rating: 5, title: "", comment: "" });

  const fetchReviews = useCallback(async () => {
    try {
      const data = await fetchReviewsService(productId);
      setReviews(data);
    } catch (error) {
      logger.error("Failed to load reviews:", error);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.comment.trim()) {
      setCommentError("Le commentaire est requis");
      return;
    }
    setCommentError(null);
    setError(null);
    setSubmitting(true);

    try {
      await submitReview(productId, {
        rating: formData.rating,
        title: formData.title || undefined,
        comment: formData.comment || undefined,
      });
      await fetchReviews();
      setShowForm(false);
      setFormData({ rating: 5, title: "", comment: "" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'envoi de l'avis";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating =
    reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100
        : 0,
  }));

  return (
    <div className="mt-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold dark:text-white">Avis clients</h2>
        {user && !reviews.some((r) => r.user_id === user.id) && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 font-medium text-primary-600 hover:text-primary-700"
          >
            <MessageSquare className="h-4 w-4" />
            Laisser un avis
          </button>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="card mb-6 p-6">
          <div className="flex flex-col gap-8 sm:flex-row">
            <div className="text-center">
              <p className="text-5xl font-bold dark:text-white">{averageRating.toFixed(1)}</p>
              <div className="mt-2 flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                  />
                ))}
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{reviews.length} avis</p>
            </div>

            <div className="flex-1 space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="w-8 text-sm text-gray-500 dark:text-gray-400">
                    {rating} etoile{rating > 1 ? "s" : ""}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full bg-yellow-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-sm text-gray-500 dark:text-gray-400">{count}</span>
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
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <form onSubmit={handleSubmit} className="card p-6">
              <h3 className="mb-4 font-bold dark:text-white">Donnez votre avis</h3>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/50 dark:text-red-300">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">Note</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating })}
                      className="p-1"
                      aria-label={`Noter ${rating} etoile${rating > 1 ? "s" : ""}`}
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${rating <= formData.rating ? "fill-yellow-400 text-yellow-400" : "dark:text-gray-500"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <InputField
                name="review_title"
                label="Titre (optionnel)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              <div className="mt-4">
                <TextareaField
                  name="review_comment"
                  label="Commentaire"
                  required
                  rows={4}
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  error={commentError || undefined}
                />
              </div>

              <div className="mt-2 flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary-sm">
                  <Send className="h-4 w-4" />
                  {submitting ? "Envoi..." : "Envoyer"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost-sm">
                  Annuler
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {reviews.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-12 text-center dark:bg-gray-900">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">Aucun avis pour ce produit</p>
          {user ? (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 font-medium text-primary-600 hover:underline"
            >
              Soyez le premier a donner votre avis
            </button>
          ) : (
            <Link
              to="/login"
              className="mt-4 inline-block font-medium text-primary-600 hover:underline"
            >
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
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-cyan-500 font-medium text-white">
                  {review.user?.profile?.full_name?.[0] || <User className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium dark:text-white">
                      {review.user?.profile?.full_name || "Utilisateur"}
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "dark:text-gray-500"}`}
                        />
                      ))}
                    </div>
                    {review.is_verified_purchase && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs dark:bg-green-900/30 dark:text-green-300">
                        Achat verifie
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <p className="mt-2 font-medium dark:text-white">{review.title}</p>
                  )}
                  {review.comment && <p className="mt-1 dark:text-gray-500">{review.comment}</p>}
                  <p className="mt-2 text-xs dark:text-gray-500">
                    {new Date(review.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
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
