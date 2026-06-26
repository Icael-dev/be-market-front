import { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import type { Product } from '../types';
import { createStockNotification } from '../services/content';

interface StockNotificationProps {
  product: Product;
}

export function StockNotificationButton({ product }: StockNotificationProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubscribe = async () => {
    if (!email && !user) return;

    setLoading(true);

    try {
      await createStockNotification(product.id, email || user?.email || '');
      setSuccess(true);
    } catch (error) {
      console.error('Failed to create stock notification:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg"
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
        className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700"
      >
        <Bell className="w-5 h-5" />
        Me prevenir quand disponible
      </button>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex gap-2"
        >
          {!user && (
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Votre email"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          )}
          <button
            onClick={handleSubscribe}
            disabled={loading || (!user && !email)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '...' : 'S\'inscrire'}
          </button>
        </motion.div>
      )}
    </div>
  );
}