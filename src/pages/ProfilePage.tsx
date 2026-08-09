import { useState, useEffect } from "react";
import { logger } from "../lib/logger";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { formatPrice, getStatusColor, getStatusLabel } from "../lib/utils";
import type { Order, LoyaltyPoints, LoyaltyTransaction, Address } from "../types";
import {
  User,
  Mail,
  Phone,
  Package,
  MapPin,
  Edit2,
  Save,
  Loader2,
  ShoppingBag,
  Calendar,
  CreditCard,
  Gift,
  Heart,
  Lock,
  Upload,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import { fetchRecentOrders, fetchOrders } from "../services/orders";
import { updateProfile, uploadAvatar, changePassword } from "../services/profile";
import { fetchLoyaltyPoints, fetchLoyaltyTransactions } from "../services/content";
import { fetchWishlist } from "../services/wishlist";
import { fetchAddresses } from "../services/address";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { InputField } from "../components/ui/FormField";
import { useEscape } from "../hooks/useKeyPress";

type Tab = "profile" | "security";

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyPoints | null>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  });

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEscape(() => setIsEditing(false), isEditing);

  useEffect(() => {
    if (!profile) return;

    setFormData({
      full_name: profile.full_name || "",
      phone: profile.phone || "",
    });
    setAvatarPreview(profile.avatar_url);
  }, [profile]);

  useEffect(() => {
    fetchRecentOrders(3)
      .then(setRecentOrders)
      .catch((error) => {
        logger.error("Error fetching recent orders:", error);
      });

    fetchOrders()
      .then(setAllOrders)
      .catch((error) => {
        logger.error("Error fetching all orders:", error);
      });

    fetchLoyaltyPoints()
      .then(setLoyalty)
      .catch((error) => {
        logger.error("Error fetching loyalty points:", error);
      });

    fetchWishlist()
      .then((items) => setWishlistCount(items.length))
      .catch((error) => {
        logger.error("Error fetching wishlist:", error);
      });

    fetchAddresses()
      .then(setAddresses)
      .catch((error) => {
        logger.error("Error fetching addresses:", error);
      });

    fetchLoyaltyTransactions()
      .then(setTransactions)
      .catch((error) => {
        logger.error("Error fetching loyalty transactions:", error);
      });
  }, []);

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true;
    const phoneRegex = /^[0-9]{8,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      setPhoneError("Le numero de telephone doit contenir 8 à 15 chiffres");
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
      let avatarUrl = profile?.avatar_url || null;

      if (avatarFile) {
        const uploadResult = await uploadAvatar(avatarFile);
        avatarUrl = uploadResult.avatar_url;
        setAvatarPreview(avatarUrl);
        setAvatarFile(null);
      }

      await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      });
      await refreshProfile();
      setIsEditing(false);
    } catch (err) {
      const error = err as { error?: string };
      setError(error?.error || "Erreur lors de la mise a jour du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas depasser 5 Mo");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordData.password !== passwordData.password_confirmation) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.password.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword({
        current_password: passwordData.current_password,
        password: passwordData.password,
        password_confirmation: passwordData.password_confirmation,
      });
      setPasswordSuccess(result.message);
      setPasswordData({ current_password: "", password: "", password_confirmation: "" });
    } catch (err) {
      const error = err as { errors?: { current_password?: string[]; error?: string } };
      setPasswordError(
        error?.errors?.current_password?.[0] ||
          error?.errors?.error ||
          "Erreur lors du changement de mot de passe"
      );
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = allOrders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, order) => sum + (order.total || 0), 0);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profil", icon: <User className="h-4 w-4" /> },
    { key: "security", label: "Securite", icon: <Lock className="h-4 w-4" /> },
  ];

  return (
    <div className="page-bg min-h-screen">
      <div className="page-header">
        <div className="page-section py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold dark:text-white">Mon compte</h1>
            <p className="mt-1 dark:text-gray-500">Gerez vos informations personnelles</p>
          </motion.div>
        </div>
      </div>

      <div className="page-section py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6 p-6 md:p-8"
        >
          <div className="mb-6 flex items-center gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === t.key
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                } `}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === "profile" && (
            <>
              <div className="mb-6 flex items-start justify-between">
                <h2 className="text-lg font-bold dark:text-white">Informations personnelles</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 font-medium transition-colors dark:text-primary-400 hover:dark:text-primary-300"
                  >
                    <Edit2 className="h-4 w-4" />
                    Modifier
                  </button>
                )}
              </div>

              <div className="mb-6 flex items-center gap-4">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-cyan-500 text-2xl font-bold text-white">
                      {profile?.full_name?.[0] || user?.email?.[0] || "U"}
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-700">
                      <Upload className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <p className="text-xl font-bold dark:text-white">
                    {profile?.full_name || "Utilisateur"}
                  </p>
                  <p className="dark:text-gray-500">{user?.email}</p>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/50 dark:text-red-300">
                      {error}
                    </div>
                  )}

                  <InputField
                    name="profile_full_name"
                    label="Nom complet"
                    autoComplete="name"
                    icon={<User className="h-5 w-5" />}
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />

                  <InputField
                    name="profile_phone"
                    label="Telephone"
                    type="tel"
                    autoComplete="tel"
                    icon={<Phone className="h-5 w-5" />}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    onBlur={(e) => validatePhone(e.target.value)}
                    error={phoneError || undefined}
                    placeholder="Ex: 90000000"
                  />

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Enregistrer
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setError(null);
                        setAvatarPreview(profile?.avatar_url || null);
                        setAvatarFile(null);
                      }}
                      className="rounded-lg border px-6 py-2.5 font-medium transition-colors hover:bg-gray-50 dark:border-gray-700 hover:dark:bg-gray-900"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm dark:text-gray-500">Nom</p>
                      <p className="font-medium dark:text-white">
                        {profile?.full_name || "Non renseigne"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm dark:text-gray-500">Email</p>
                      <p className="font-medium dark:text-white">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm dark:text-gray-500">Telephone</p>
                      <p className="font-medium dark:text-white">
                        {profile?.phone || "Non renseigne"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm dark:text-gray-500">Membre depuis</p>
                      <p className="font-medium dark:text-white">
                        {profile?.created_at
                          ? format(new Date(profile.created_at), "MMMM yyyy", { locale: fr })
                          : "Non disponible"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="mb-1 text-lg font-bold dark:text-white">Mot de passe</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Modifiez votre mot de passe pour securiser votre compte
                </p>
              </div>

              {passwordSuccess && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/50 dark:text-green-300">
                  {passwordSuccess}
                </div>
              )}

              {passwordError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/50 dark:text-red-300">
                  {passwordError}
                </div>
              )}

              <div className="max-w-md space-y-4">
                <InputField
                  name="current_password"
                  label="Mot de passe actuel"
                  type="password"
                  icon={<Lock className="h-5 w-5" />}
                  value={passwordData.current_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, current_password: e.target.value })
                  }
                />

                <InputField
                  name="password"
                  label="Nouveau mot de passe"
                  type="password"
                  icon={<Shield className="h-5 w-5" />}
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                />

                <InputField
                  name="password_confirmation"
                  label="Confirmer le nouveau mot de passe"
                  type="password"
                  icon={<Shield className="h-5 w-5" />}
                  value={passwordData.password_confirmation}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, password_confirmation: e.target.value })
                  }
                />

                <button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Mettre a jour le mot de passe
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/orders" className="card p-6 transition-all hover:shadow-premium">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="font-semibold dark:text-white">Mes commandes</h3>
              <p className="mt-1 text-2xl font-bold text-primary-600 dark:text-primary-400">
                {allOrders.length}
              </p>
              <p className="mt-1 text-sm dark:text-gray-500">
                Total depense: {formatPrice(totalSpent)}
              </p>
            </Link>

            <Link to="/addresses" className="card p-6 transition-all hover:shadow-premium">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/30 dark:text-green-400">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="font-semibold dark:text-white">Adresses</h3>
              <p className="mt-1 text-sm dark:text-gray-500">Gerez vos adresses</p>
            </Link>

            <Link to="/products" className="card p-6 transition-all hover:shadow-premium">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="font-semibold dark:text-white">Acheter</h3>
              <p className="mt-1 text-sm dark:text-gray-500">Parcourir les produits</p>
            </Link>

            <Link to="/wishlist" className="card p-6 transition-all hover:shadow-premium">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="font-semibold dark:text-white">Mes souhaits</h3>
              <p className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
                {wishlistCount}
              </p>
              <p className="mt-1 text-sm dark:text-gray-500">Articles sauvegardes</p>
            </Link>

            <Link to="/loyalty" className="card p-6 transition-all hover:shadow-premium">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gold-50 dark:bg-gold-900/20 dark:text-gold-400">
                <Gift className="h-6 w-6" />
              </div>
              <h3 className="font-semibold dark:text-white">Mes points</h3>
              <p className="mt-1 text-2xl font-bold text-gold-600 dark:text-gold-400">
                {loyalty?.points || 0}
              </p>
              <p className="mt-1 text-sm dark:text-gray-500">Programme fidelite</p>
            </Link>

            <Link to="/payments" className="card p-6 transition-all hover:shadow-premium">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="font-semibold dark:text-white">Mes paiements</h3>
              <p className="mt-1 text-sm dark:text-gray-500">Historique des transactions</p>
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
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold dark:text-white">Commandes recentes</h2>
              <Link
                to="/orders"
                className="font-medium transition-colors dark:text-primary-400 hover:dark:text-primary-300"
              >
                Voir tout
              </Link>
            </div>

            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-900 hover:dark:bg-gray-800"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:text-primary-400">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">{order.order_number}</p>
                      <p className="text-sm dark:text-gray-500">
                        {format(new Date(order.created_at), "dd MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(order.total)}</p>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {addresses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card mb-6 p-6 md:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold dark:text-white">Mes adresses</h2>
              <Link
                to="/addresses"
                className="font-medium transition-colors dark:text-primary-400 hover:dark:text-primary-300"
              >
                Voir tout
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {addresses.slice(0, 2).map((address) => (
                <div key={address.id} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <div className="mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <p className="font-medium dark:text-white">{address.label || "Adresse"}</p>
                    {address.is_default && (
                      <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                        Par defaut
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {address.full_name}
                    <br />
                    {address.address_line1}
                    <br />
                    {address.city}, {address.country}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {transactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card mb-6 p-6 md:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold dark:text-white">Points fidélité</h2>
              <Link
                to="/loyalty"
                className="font-medium transition-colors dark:text-primary-400 hover:dark:text-primary-300"
              >
                Voir tout
              </Link>
            </div>

            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        transaction.type === "earned"
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {transaction.type === "earned" ? (
                        <Gift className="h-5 w-5" />
                      ) : (
                        <CreditCard className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium dark:text-white">
                        {transaction.type === "earned"
                          ? "Points gagnés"
                          : transaction.type === "redeemed"
                            ? "Points utilisés"
                            : "Points expirés"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.description ||
                          format(new Date(transaction.created_at), "dd MMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      transaction.type === "earned"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {transaction.type === "earned" ? "+" : "-"}
                    {Math.abs(transaction.points)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
