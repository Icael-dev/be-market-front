import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  User,
  Search,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Heart,
  Sun,
  Moon,
  Gift,
  LifeBuoy,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { WishlistDrawer } from '../WishlistDrawer';

export function Header() {
  const { user, profile, isAdmin, isSuperAdmin, signOut } = useAuth();
  const { count } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showWishlist, setShowWishlist] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Ferme le menu profil au clic exterieur ou touche Echap.
  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsUserMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserMenuOpen]);

  const navLinks = [
    { path: '/', label: 'Accueil' },
    { path: '/categories', label: 'Categories' },
    { path: '/products', label: 'Produits' },
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
      <header className={cn(
        "sticky top-0 z-50 glass border-b border-gray-200/80 dark:border-gray-800/80 shadow-sm transition-colors",
        location.pathname.startsWith('/admin') && "lg:ml-72 hidden lg:block"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-6 lg:gap-8">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center shadow-md shadow-primary-600/30 group-hover:shadow-primary-600/50 transition-shadow">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:block tracking-tightest">
                  BE-Market
                </span>
              </Link>

              <nav className="hidden lg:flex items-center gap-1">
                {navLinks.map(link => {
                  const isActive = location.pathname === link.path ||
                    (link.path !== '/' && location.pathname.startsWith(link.path));
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={cn(
                        'relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                    >
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary-600 rounded-full"
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="hidden sm:flex flex-1 max-w-md mx-6">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="text"
                    id="header-search-desktop"
                    name="search"
                    aria-label="Rechercher des produits"
                    placeholder="Rechercher des produits..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="input-premium pl-10"
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="icon-btn"
                title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setShowWishlist(true)}
                className="icon-btn relative hover:text-red-500"
              >
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm"
                  >
                    {wishlistItems.length}
                  </motion.span>
                )}
              </button>

              <Link
                to="/cart"
                className="icon-btn relative hover:text-primary-600"
              >
                <ShoppingCart className="w-5 h-5" />
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm"
                  >
                    {count}
                  </motion.span>
                )}
              </Link>

              {user ? (
                <div className="relative hidden lg:block" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    aria-label="Menu du compte"
                    aria-haspopup="menu"
                    aria-expanded={isUserMenuOpen}
                    className="flex items-center gap-2 p-1.5 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                      {profile?.full_name?.[0] || user.email?.[0] || 'U'}
                    </div>
                    <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform duration-200', isUserMenuOpen && 'rotate-180')} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        role="menu"
                        aria-label="Menu du compte"
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-900 rounded-2xl shadow-premium border border-gray-100 dark:border-gray-800 py-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {profile?.full_name || 'Utilisateur'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.email}</p>
                          {isAdmin && (
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[11px] font-medium',
                                isSuperAdmin
                                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                              )}
                            >
                              <ShieldCheck className="w-3 h-3" />
                              {isSuperAdmin ? 'Administrateur' : 'Staff'}
                            </span>
                          )}
                        </div>

                        <div className="p-2">
                          {isAdmin && (
                            <Link to="/admin" role="menuitem" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 rounded-xl transition-colors">
                              <LayoutDashboard className="w-4 h-4 text-primary-600" />
                              Admin Dashboard
                            </Link>
                          )}

                          <Link to="/loyalty" role="menuitem" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gold-50 dark:hover:bg-gold-900/20 hover:text-gold-600 rounded-xl transition-colors">
                            <Gift className="w-4 h-4 text-gold-500" />
                            Mes Points
                          </Link>

                          <Link to="/profile" role="menuitem" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                            <User className="w-4 h-4" />
                            Mon Profil
                          </Link>

                          <Link to="/orders" role="menuitem" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                            <Package className="w-4 h-4" />
                            Mes Commandes
                          </Link>

                          <Link to="/payments" role="menuitem" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                            <CreditCard className="w-4 h-4" />
                            Mes Paiements
                          </Link>

                          <Link to="/support" role="menuitem" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                            <LifeBuoy className="w-4 h-4" />
                            Support
                          </Link>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800 p-2">
                          <button role="menuitem" onClick={() => { setIsUserMenuOpen(false); signOut(); }} className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors w-full">
                            <LogOut className="w-4 h-4" />
                            Deconnexion
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 shadow-md shadow-primary-600/20 hover:shadow-primary-600/40 transition-all"
                >
                  <User className="w-4 h-4" />
                  Connexion
                </Link>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                className={cn(
                  'lg:hidden p-2.5 rounded-xl transition-all duration-200',
                  isMenuOpen
                    ? 'bg-primary-50 text-primary-600'
                    : 'icon-btn'
                )}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                id="mobile-menu"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden border-t border-gray-100 dark:border-gray-800 overflow-hidden"
              >
                <div className="py-4">
                  <form onSubmit={handleSearch} className="px-4 mb-4">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        id="header-search-mobile"
                        name="search"
                        aria-label="Rechercher"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="input-premium pl-10"
                      />
                    </div>
                  </form>
                  <nav className="flex flex-col gap-1 px-3">
                    {navLinks.map(link => {
                      const isActive = location.pathname === link.path ||
                        (link.path !== '/' && location.pathname.startsWith(link.path));
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={cn(
                            'px-4 py-3 rounded-xl text-sm font-medium transition-all',
                            isActive
                              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          )}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </nav>
                  {!user && (
                    <div className="px-4 mt-4">
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="btn-primary w-full"
                      >
                        <User className="w-4 h-4" />
                        Connexion
                      </Link>
                    </div>
                  )}

                  {user && (
                    <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-3">
                      <div className="px-4 pb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full brand-gradient flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                            {profile?.full_name?.[0] || user.email?.[0] || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                              {profile?.full_name || 'Utilisateur'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                          </div>
                        </div>
                        {isAdmin && (
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[11px] font-medium',
                              isSuperAdmin
                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            )}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            {isSuperAdmin ? 'Administrateur' : 'Staff'}
                          </span>
                        )}
                      </div>

                      <nav className="flex flex-col gap-1 px-3" aria-label="Menu du compte">
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors">
                            <LayoutDashboard className="w-4 h-4 text-primary-600" />
                            Admin Dashboard
                          </Link>
                        )}
                        <Link to="/loyalty" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gold-50 dark:hover:bg-gold-900/20 hover:text-gold-600 transition-colors">
                          <Gift className="w-4 h-4 text-gold-500" />
                          Mes Points
                        </Link>
                        <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <User className="w-4 h-4" />
                          Mon Profil
                        </Link>
                        <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <Package className="w-4 h-4" />
                          Mes Commandes
                        </Link>
                        <Link to="/payments" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <CreditCard className="w-4 h-4" />
                          Mes Paiements
                        </Link>
                        <Link to="/support" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <LifeBuoy className="w-4 h-4" />
                          Support
                        </Link>
                        <button onClick={() => { setIsMenuOpen(false); signOut(); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left">
                          <LogOut className="w-4 h-4" />
                          Deconnexion
                        </button>
                      </nav>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <WishlistDrawer isOpen={showWishlist} onClose={() => setShowWishlist(false)} />
    </>
  );
}
