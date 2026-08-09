import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  User,
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
  CreditCard,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../lib/utils";
import { WishlistDrawer } from "../WishlistDrawer";
import { SearchWithSuggestions } from "../SearchWithSuggestions";
import { useEscape } from "../../hooks/useKeyPress";

export function Header() {
  const { user, profile, isAdmin, isSuperAdmin, signOut } = useAuth();
  const { count } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEscape(() => setIsUserMenuOpen(false), isUserMenuOpen);
  useEscape(() => setIsMenuOpen(false), isMenuOpen);

  const navLinks = [
    { path: "/", label: "Accueil" },
    { path: "/categories", label: "Categories" },
    { path: "/products", label: "Produits" },
    { path: "/blog", label: "Blog" },
  ];

  return (
    <>
      <header
        className={cn(
          "glass sticky top-0 z-50 border-b border-gray-200/80 shadow-sm transition-colors dark:border-gray-800/80",
          location.pathname.startsWith("/admin") && "hidden lg:ml-72 lg:block"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-6 lg:gap-8">
              <Link to="/" className="group flex items-center gap-3">
                <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-lg shadow-md shadow-primary-600/30 transition-shadow group-hover:shadow-primary-600/50">
                  <span className="text-lg font-bold text-white">B</span>
                </div>
                <span className="hidden text-xl font-bold tracking-tightest text-gray-900 dark:text-white sm:block">
                  BE-Market
                </span>
              </Link>

              <nav className="hidden items-center gap-1 lg:flex">
                {navLinks.map((link) => {
                  const isActive =
                    location.pathname === link.path ||
                    (link.path !== "/" && location.pathname.startsWith(link.path));
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={cn(
                        "relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20"
                          : "text-gray-600 hover:bg-gray-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-800"
                      )}
                    >
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary-600"
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="mx-6 hidden max-w-md flex-1 sm:flex">
              <SearchWithSuggestions />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="icon-btn p-3"
                title={theme === "light" ? "Mode sombre" : "Mode clair"}
              >
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>

              <button
                onClick={() => setShowWishlist(true)}
                className="icon-btn relative p-3 hover:text-red-500"
              >
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm"
                  >
                    {wishlistItems.length}
                  </motion.span>
                )}
              </button>

              <Link to="/cart" className="icon-btn relative p-3 hover:text-primary-600">
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white shadow-sm"
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
                    className="flex items-center gap-2 rounded-lg p-1.5 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="brand-gradient flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm">
                      {profile?.full_name?.[0] || user.email?.[0] || "U"}
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-gray-400 transition-transform duration-200 dark:text-gray-500",
                        isUserMenuOpen && "rotate-180"
                      )}
                    />
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
                        className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-lg border border-gray-100 bg-white py-2 shadow-premium dark:border-gray-800 dark:bg-gray-900"
                      >
                        <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/50">
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {profile?.full_name || "Utilisateur"}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                          {isAdmin && (
                            <span
                              className={cn(
                                "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                                isSuperAdmin
                                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                              )}
                            >
                              <ShieldCheck className="h-3 w-3" />
                              {isSuperAdmin ? "Administrateur" : "Staff"}
                            </span>
                          )}
                        </div>

                        <div className="p-2">
                          {isAdmin && (
                            <Link
                              to="/admin"
                              role="menuitem"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:text-gray-200 dark:hover:bg-primary-900/20"
                            >
                              <LayoutDashboard className="h-4 w-4 text-primary-600" />
                              Admin Dashboard
                            </Link>
                          )}

                          <Link
                            to="/loyalty"
                            role="menuitem"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gold-50 hover:text-gold-600 dark:text-gray-200 dark:hover:bg-gold-900/20"
                          >
                            <Gift className="h-4 w-4 text-gold-500" />
                            Mes Points
                          </Link>

                          <Link
                            to="/profile"
                            role="menuitem"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            <User className="h-4 w-4" />
                            Mon Profil
                          </Link>

                          <Link
                            to="/orders"
                            role="menuitem"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            <Package className="h-4 w-4" />
                            Mes Commandes
                          </Link>

                          <Link
                            to="/payments"
                            role="menuitem"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            <CreditCard className="h-4 w-4" />
                            Mes Paiements
                          </Link>

                          <Link
                            to="/support"
                            role="menuitem"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            <LifeBuoy className="h-4 w-4" />
                            Support
                          </Link>
                        </div>

                        <div className="border-t border-gray-100 p-2 dark:border-gray-800">
                          <button
                            role="menuitem"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              signOut();
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <LogOut className="h-4 w-4" />
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
                  className="hidden items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-600/20 transition-all hover:bg-primary-700 hover:shadow-primary-600/40 sm:flex"
                >
                  <User className="h-4 w-4" />
                  Connexion
                </Link>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                className={cn(
                  "rounded-lg p-2.5 transition-all duration-200 lg:hidden",
                  isMenuOpen ? "bg-primary-50 text-primary-600" : "icon-btn"
                )}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                id="mobile-menu"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-gray-100 dark:border-gray-800 lg:hidden"
              >
                <div className="py-4">
                  <div className="mb-4 px-4">
                    <SearchWithSuggestions />
                  </div>
                  <nav className="flex flex-col gap-1 px-3">
                    {navLinks.map((link) => {
                      const isActive =
                        location.pathname === link.path ||
                        (link.path !== "/" && location.pathname.startsWith(link.path));
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={cn(
                            "rounded-lg px-4 py-3 text-sm font-medium transition-all",
                            isActive
                              ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20"
                              : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                          )}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </nav>
                  {!user && (
                    <div className="mt-4 px-4">
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="btn-primary w-full"
                      >
                        <User className="h-4 w-4" />
                        Connexion
                      </Link>
                    </div>
                  )}

                  {user && (
                    <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-800">
                      <div className="px-4 pb-2">
                        <div className="flex items-center gap-3">
                          <div className="brand-gradient flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm">
                            {profile?.full_name?.[0] || user.email?.[0] || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                              {profile?.full_name || "Utilisateur"}
                            </p>
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        {isAdmin && (
                          <span
                            className={cn(
                              "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                              isSuperAdmin
                                ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                            )}
                          >
                            <ShieldCheck className="h-3 w-3" />
                            {isSuperAdmin ? "Administrateur" : "Staff"}
                          </span>
                        )}
                      </div>

                      <nav className="flex flex-col gap-1 px-3" aria-label="Menu du compte">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:text-gray-200 dark:hover:bg-primary-900/20"
                          >
                            <LayoutDashboard className="h-4 w-4 text-primary-600" />
                            Admin Dashboard
                          </Link>
                        )}
                        <Link
                          to="/loyalty"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gold-50 hover:text-gold-600 dark:text-gray-200 dark:hover:bg-gold-900/20"
                        >
                          <Gift className="h-4 w-4 text-gold-500" />
                          Mes Points
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                          <User className="h-4 w-4" />
                          Mon Profil
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                          <Package className="h-4 w-4" />
                          Mes Commandes
                        </Link>
                        <Link
                          to="/payments"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                          <CreditCard className="h-4 w-4" />
                          Mes Paiements
                        </Link>
                        <Link
                          to="/support"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                          <LifeBuoy className="h-4 w-4" />
                          Support
                        </Link>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            signOut();
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <LogOut className="h-4 w-4" />
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
