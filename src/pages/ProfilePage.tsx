import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getStatusColor, getStatusLabel } from '../lib/utils';
import type { Order } from '../types';
import {
  User,
  Mail,
  Phone,
  Package,
  MapPin,
  Edit2,
  Save,
  Loader2,
  ShoppingBag
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || ''
      });
    }
    fetchRecentOrders();
  }, [profile]);

  const fetchRecentOrders = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (data) {
      setRecentOrders(data as Order[]);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone
        })
        .eq('user_id', user.id);

      if (!error) {
        await refreshProfile();
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">Mon compte</h1>
            <p className="text-gray-500 mt-1">Gerez vos informations personnelles</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mb-6"
        >
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Informations personnelles</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Modifier
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
              {profile?.full_name?.[0] || user?.email?.[0] || 'U'}
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">
                {profile?.full_name || 'Utilisateur'}
              </p>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telephone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Enregistrer
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nom</p>
                  <p className="font-medium text-gray-900">
                    {profile?.full_name || 'Non renseigne'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telephone</p>
                  <p className="font-medium text-gray-900">
                    {profile?.phone || 'Non renseigne'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Membre depuis</p>
                  <p className="font-medium text-gray-900">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString('fr-FR', {
                          month: 'long',
                          year: 'numeric'
                        })
                      : 'Non disponible'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <Link
              to="/orders"
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900">Mes commandes</h3>
              <p className="text-sm text-gray-500 mt-1">
                Suivez vos achats
              </p>
            </Link>

            <Link
              to="/addresses"
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900">Adresses</h3>
              <p className="text-sm text-gray-500 mt-1">
                Gerez vos adresses
              </p>
            </Link>

            <Link
              to="/products"
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900">Acheter</h3>
              <p className="text-sm text-gray-500 mt-1">
                Parcourir les produits
              </p>
            </Link>
          </div>
        </motion.div>

        {recentOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Commandes recentes</h2>
              <Link
                to="/orders"
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Voir tout
              </Link>
            </div>

            <div className="space-y-4">
              {recentOrders.map(order => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.order_number}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(order.total)}</p>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Calendar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
