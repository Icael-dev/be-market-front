import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Search,
  LogOut,
  Settings,
  Package,
  LayoutDashboard,
  ChevronDown,
  Heart,
  Sun,
  Moon,
  Gift
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { WishlistDrawer } from '../WishlistDrawer';

export function Header() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showWishlist, setShowWishlist] = useState(false);

  const navLinks = [
    { path: '/', label: 'Accueil' },
    { path: '/products', label: 'Produits' },
    { path: '/products?category=telephones', label: 'Telephones' },
    { path: '/products?category=ordinateurs', label: 'PC' },
    { path: '/blog', label: 'Blog' }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:block">
                  Electronica
                </span>
              </Link>
              <nav className="hidden lg:flex items-center gap-6">
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-blue-600',
                      location.pathname === link.path
                        ? 'text-blue-600'
                        : 'text-gray-600 dark:text-gray-300'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher des produits..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-full text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setShowWishlist(true)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
              >
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {wishlistItems.length}
                  </motion.span>
                )}
              </button>

              <Link
                to="/cart"
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {count}
                  </motion.span>
                )}
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {profile?.full_name?.[0] || user.email?.[0] || 'U'}
                      </span>
                    </div>
                    <ChevronDown className={cn('w-4 h-4 transition-transform', isUserMenuOpen && 'rotate-180')} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                          <p className="font-medium text-gray-900 dark:text-white">{profile?.full_name || 'Utilisateur'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>

                        {isAdmin && (
                          <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <LayoutDashboard className="w-4 h-4 text-blue-600" />
                            Admin Dashboard
                          </Link>
                        )}

                        <Link to="/loyalty" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <Gift className="w-4 h-4 text-orange-500" />
                          Mes Points
                        </Link>

                        <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <User className="w-4 h-4" />
                          Mon Profil
                        </Link>

                        <Link to="/orders" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <Package className="w-4 h-4" />
                          Mes Commandes
                        </Link>

                        <Link to="/support" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <Settings className="w-4 h-4" />
                          Support
                        </Link>

                        <button onClick={() => { setIsUserMenuOpen(false); signOut(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <LogOut className="w-4 h-4" />
                          Deconnexion
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
                  <User className="w-4 h-4" />
                  Connexion
                </Link>
              )}

              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-gray-600 dark:text-gray-300">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden border-t border-gray-100 dark:border-gray-800 py-4">
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-full text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" />
                  </div>
                </form>
                <nav className="flex flex-col gap-2">
                  {navLinks.map(link => (
                    <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', location.pathname === link.path ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800')}>
                      {link.label}
                    </Link>
                  ))}
                </nav>
                {!user && (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="mt-4 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-medium">
                    <User className="w-4 h-4" />
                    Connexion
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isUserMenuOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsUserMenuOpen(false)} className="fixed inset-0 z-40" />
          )}
        </AnimatePresence>
      </header>

      <WishlistDrawer isOpen={showWishlist} onClose={() => setShowWishlist(false)} />
    </>
  );
}