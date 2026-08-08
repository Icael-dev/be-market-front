import { useState, useEffect } from 'react';
import { logger } from '../lib/logger';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getStatusColor, getStatusLabel } from '../lib/utils';
import type { Order } from '../types';
import { User, Mail, Phone, Package, MapPin, Edit2, Save, Loader2, ShoppingBag, Calendar, CreditCard, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchRecentOrders } from '../services/orders';
import { updateProfile } from '../services/profile';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { InputField } from '../components/ui/FormField';
import { useEscape, useEnter } from '../hooks/useKeyPress';

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: ''
  });

  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEscape(() => setIsEditing(false), isEditing);
  useEnter(() => { if (isEditing) handleSave(); }, isEditing);

  useEffect(() => {
    if (!profile) return;

    setFormData({
      full_name: profile.full_name || '',
      phone: profile.phone || ''
    });
  }, [profile]);

  useEffect(() => {
    fetchRecentOrders(3)
      .then(setRecentOrders)
      .catch(error => {
        logger.error('Error fetching recent orders:', error);
      });
  }, []);

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true;
    const phoneRegex = /^[0-9]{8,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      setPhoneError('Le numero de telephone doit contenir 8 à 15 chiffres');
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handleSave = async () => {
    if (!user) return;
    setError(null);

    if (!validatePhone(formData.phone)) return;

    setLoading(true);
    try {
      await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone
      });
      await refreshProfile();
      setIsEditing(false);
    } catch (err) {
      const error = err as { error?: string };
      setError(error?.error || 'Erreur lors de la mise a jour du profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-bg">
      <div className="page-header">
        <div className="page-section py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold dark:text-white">Mon compte</h1>
            <p className="dark:text-gray-500 mt-1">Gerez vos informations personnelles</p>
          </motion.div>
        </div>
      </div>

      <div className="page-section py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 md:p-8 mb-6"
        >
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-lg font-bold dark:text-white">Informations personnelles</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 dark:text-primary-400 hover:dark:text-primary-300 font-medium transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Modifier
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                {profile?.full_name?.[0] || user?.email?.[0] || 'U'}
              </div>
            )}
            <div>
              <p className="text-xl font-bold dark:text-white">
                {profile?.full_name || 'Utilisateur'}
              </p>
              <p className="dark:text-gray-500">{user?.email}</p>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              <InputField
                name="profile_full_name"
                label="Nom complet"
                autoComplete="name"
                icon={<User className="w-5 h-5" />}
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              />

              <InputField
                name="profile_phone"
                label="Telephone"
                type="tel"
                autoComplete="tel"
                icon={<Phone className="w-5 h-5" />}
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                onBlur={e => validatePhone(e.target.value)}
                error={phoneError || undefined}
                placeholder="Ex: 90000000"
              />

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 btn-primary disabled:opacity-50"
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
                  className="px-6 py-2.5 border dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:dark:bg-gray-900 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-500">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm dark:text-gray-500">Nom</p>
                  <p className="font-medium dark:text-white">
                    {profile?.full_name || 'Non renseigne'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-500">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm dark:text-gray-500">Email</p>
                  <p className="font-medium dark:text-white">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-500">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm dark:text-gray-500">Telephone</p>
                  <p className="font-medium dark:text-white">
                    {profile?.phone || 'Non renseigne'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-500">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm dark:text-gray-500">Membre depuis</p>
                  <p className="font-medium dark:text-white">
                    {profile?.created_at
                      ? format(new Date(profile.created_at), "MMMM yyyy", { locale: fr })
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Link
              to="/orders"
              className="card p-6 hover:shadow-premium transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center dark:text-primary-400 mb-4">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-semibold dark:text-white">Mes commandes</h3>
              <p className="text-sm dark:text-gray-500 mt-1">
                Suivez vos achats
              </p>
            </Link>

            <Link
              to="/addresses"
              className="card p-6 hover:shadow-premium transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center dark:text-green-400 mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-semibold dark:text-white">Adresses</h3>
              <p className="text-sm dark:text-gray-500 mt-1">
                Gerez vos adresses
              </p>
            </Link>

            <Link
              to="/products"
              className="card p-6 hover:shadow-premium transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center dark:text-orange-400 mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-semibold dark:text-white">Acheter</h3>
              <p className="text-sm dark:text-gray-500 mt-1">
                Parcourir les produits
              </p>
            </Link>

            <Link
              to="/loyalty"
              className="card p-6 hover:shadow-premium transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center dark:text-gold-400 mb-4">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="font-semibold dark:text-white">Mes points</h3>
              <p className="text-sm dark:text-gray-500 mt-1">
                Programme fidelite
              </p>
            </Link>

            <Link
              to="/payments"
              className="card p-6 hover:shadow-premium transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center dark:text-blue-400 mb-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-semibold dark:text-white">Mes paiements</h3>
              <p className="text-sm dark:text-gray-500 mt-1">
                Historique des transactions
              </p>
            </Link>
          </div>
        </motion.div>

        {recentOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6 md:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold dark:text-white">Commandes recentes</h2>
              <Link
                to="/orders"
                className="dark:text-primary-400 font-medium hover:dark:text-primary-300 transition-colors"
              >
                Voir tout
              </Link>
            </div>

            <div className="space-y-4">
              {recentOrders.map(order => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 hover:dark:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center dark:text-primary-400">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">{order.order_number}</p>
                      <p className="text-sm dark:text-gray-500">
                        {format(new Date(order.created_at), 'dd MMMM yyyy', { locale: fr })}
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


