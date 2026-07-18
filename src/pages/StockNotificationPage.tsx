import { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import type { Product } from '../types';
import { createStockNotification } from '../services/content';
import { InputField } from '../components/ui/FormField';

interface StockNotificationProps {
  product: Product;
}

export function StockNotificationButton({ product }: StockNotificationProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (!user && !email) return;

    if (!user) {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!valid) {
        setError('Veuillez saisir une adresse email valide');
        return;
      }
    }
    setError(null);
    setLoading(true);

    try {
      await createStockNotification(product.id, email || user?.email || '');
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/50 px-4 py-2 rounded-lg"
      >
        <Check className="w-5 h-5" />
        <span className="text-sm font-medium">Vous serez prevenu(e)</span>
      </motion.div>
    );
  }

  if (product.stock > 0) return null;

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700"
      >
        <Bell className="w-5 h-5" />
        Me prevenir quand disponible
      </button>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2"
        >
          {!user && (
            <InputField
              name="stock_notify_email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={error || undefined}
              placeholder="Votre email"
            />
          )}
          {user && error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <button
            onClick={handleSubscribe}
            disabled={loading || (!user && !email)}
            className="btn-primary-sm disabled:opacity-50"
          >
            {loading ? '...' : 'S\'inscrire'}
          </button>
        </motion.div>
      )}
    </div>
  );
}