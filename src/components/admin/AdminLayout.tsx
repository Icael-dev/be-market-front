import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Image,
  FileText,
  BarChart3,
  Tag,
  Download,
  Zap,
  Grid3X3,
  Home,
  Heart,
  ShoppingCart,
  Sun,
  Moon,
  UserCog,
  CreditCard,
  Gift,
  Headphones
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { WishlistDrawer } from '../WishlistDrawer';

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  section?: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { path: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, section: 'Principal', adminOnly: true },
  { path: '/admin/statistics', label: 'Statistiques', icon: BarChart3, section: 'Principal', adminOnly: true },
  { path: '/admin/categories', label: 'Categories', icon: Grid3X3, section: 'Catalogue' },
  { path: '/admin/products', label: 'Produits', icon: ShoppingBag, section: 'Catalogue' },
  { path: '/admin/banners', label: 'Bannieres', icon: Image, section: 'Catalogue' },
  { path: '/admin/flash-sales', label: 'Flash Sales', icon: Zap, section: 'Catalogue' },
  { path: '/admin/coupons', label: 'Codes promo', icon: Tag, section: 'Catalogue' },
  { path: '/admin/blog', label: 'Blog', icon: FileText, section: 'Catalogue' },
  { path: '/admin/orders', label: 'Commandes', icon: Package, section: 'Ventes' },
  { path: '/admin/payments', label: 'Paiements', icon: CreditCard, section: 'Ventes' },
  { path: '/admin/customers', label: 'Clients', icon: Users, section: 'Ventes' },
  { path: '/admin/loyalty', label: 'Fidelite', icon: Gift, section: 'Ventes' },
  { path: '/admin/support', label: 'Support', icon: Headphones, section: 'Ventes' },
  { path: '/admin/export', label: 'Export', icon: Download, section: 'Outils' },
  { path: '/admin/users', label: 'Utilisateurs', icon: UserCog, section: 'Outils', adminOnly: true },
  { path: '/admin/settings', label: 'Parametres', icon: Settings, section: 'Outils', adminOnly: true },
];

const sections = [...new Set(navItems.map(item => item.section).filter(Boolean))] as string[];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin, isSuperAdmin, signOut, profile, loading } = useAuth();
  const { count } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-2 border-gray-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const visibleItems = navItems.filter(item => isSuperAdmin || !item.adminOnly);
  const visibleSections = sections.filter(section =>
    visibleItems.some(item => item.section === section)
  );

  return (
    <div className="min-h-screen page-bg">
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50 flex items-center px-4 justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-bold text-gray-900 dark:text-white">Admin</span>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
          className="p-3 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
          >
            {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowWishlist(true)}
            className="relative p-3 text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Favoris"
          >
            <Heart className="w-5 h-5" />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </button>
          <Link
            to="/cart"
           className="relative p-3 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Panier"
          >
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <Link
            to="/"
          className="p-3 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Voir le site"
          >
            <Home className="w-5 h-5" />
          </Link>
          <button
            onClick={signOut}
            className="p-3 text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Deconnexion"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className={cn(
        'fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 shadow-xl lg:shadow-none',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="h-full flex flex-col">
          <div className="p-5 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-xl brand-gradient flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <div>
                  <span className="font-bold dark:text-white text-lg tracking-tight">BE-Market</span>
                  <p className="text-xs dark:text-gray-500 font-medium">Administration</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            {visibleSections.map(section => (
              <div key={section} className="mb-6">
                <p className="px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                  {section}
                </p>
                <div className="space-y-1">
                  {visibleItems
                    .filter(item => item.section === section)
                    .map(item => {
                      const isActive = location.pathname === item.path ||
                        (item.path !== '/admin' && location.pathname.startsWith(item.path));
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative',
                            isActive
                              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-semibold shadow-sm shadow-primary-100 dark:shadow-primary-900/20'
                              : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                          )}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-600 rounded-r-full" />
                          )}
                          <item.icon className={cn(
                            'w-5 h-5 transition-colors',
                            isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-400'
                          )} />
                          <span className="text-sm font-medium">{item.label}</span>
                           {isActive && (
                            <ChevronRight className="w-4 h-4 ml-auto text-primary-600 dark:text-primary-400" />
                          )}
                        </Link>
                      );
                    })}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center text-white font-semibold shadow-md">
                {profile?.full_name?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {profile?.full_name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{isSuperAdmin ? 'Administrateur' : 'Staff'}</p>
              </div>
            </div>

            <div className="space-y-1">
              <Link
                to="/"
                className="hidden lg:flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                <Home className="w-4 h-4" />
                Voir le site
              </Link>

              <button
                onClick={signOut}
                className="hidden lg:flex items-center gap-3 px-3 py-2 text-sm dark:text-red-400 hover:text-red-700 dark:hover:bg-red-900/30 rounded-lg transition-all w-full"
              >
                <LogOut className="w-4 h-4" />
                Deconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <main className="lg:ml-72 pt-20 lg:pt-0 min-h-screen">
        {children}
      </main>

      <WishlistDrawer isOpen={showWishlist} onClose={() => setShowWishlist(false)} />
    </div>
  );
}
