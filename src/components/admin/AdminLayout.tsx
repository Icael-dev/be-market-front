import { ReactNode, useState, useEffect, useCallback } from 'react';
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
  ChevronLeft,
  Image,
  FileText,
  BarChart3,
  Tag,
  Download,
  Zap,
  Grid3X3,
  Home,
  UserCog,
  CreditCard,
  Gift,
  Headphones,
  AlertTriangle,
  Ticket,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { WishlistDrawer } from '../WishlistDrawer';
import { Footer } from '../layout/Footer';

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
  { path: '/admin/statistics/top-products', label: 'Top produits', icon: Package, section: 'Principal', adminOnly: true },
  { path: '/admin/statistics/low-stock', label: 'Stock bas', icon: AlertTriangle, section: 'Principal', adminOnly: true },
  { path: '/admin/statistics/coupons', label: 'Coupons', icon: Ticket, section: 'Principal', adminOnly: true },
  { path: '/admin/statistics/category-sales', label: 'Ventes par categorie', icon: Tag, section: 'Principal', adminOnly: true },
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

const SIDEBAR_EXPANDED_W = 'w-72';
const SIDEBAR_COLLAPSED_W = 'w-20';

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin, isSuperAdmin, signOut, profile, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('admin_sidebar_collapsed');
      if (stored !== null) return stored === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

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

  const sidebarWidthClass = sidebarCollapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W;
  const mainMarginClass = sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72';

  return (
    <div className="min-h-screen page-bg overflow-hidden">
      <div className={cn(
        'fixed inset-y-0 left-0 border-r border-gray-200 dark:border-gray-800 z-50 transform transition-all duration-300 ease-in-out lg:translate-x-0 shadow-xl lg:shadow-none flex flex-col',
        sidebarWidthClass,
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="h-full flex flex-col">
        <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-3 group min-w-0">
              <div className="w-11 h-11 rounded-xl brand-gradient flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow shrink-0">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <span className="font-bold dark:text-white text-lg tracking-tight">BE-Market</span>
                  <p className="text-xs dark:text-gray-500 font-medium">Administration</p>
                </div>
              )}
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2.5 ml-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={sidebarCollapsed ? 'Deplier la barre latérale' : 'Replier la barre latérale'}
            >
              {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

          <nav className="flex-1 overflow-y-auto scrollbar-hide p-4">
            {visibleSections.map(section => (
              <div key={section} className="mb-6">
                {!sidebarCollapsed && (
                  <p className="px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                    {section}
                  </p>
                )}
                <div className="space-y-1">
                  {visibleItems
                    .filter(item => item.section === section)
                    .map(item => {
                      const isActive = location.pathname === item.path;
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
                            'w-5 h-5 shrink-0 transition-colors',
                            isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-400'
                          )} />
                          {!sidebarCollapsed && (
                            <>
                              <span className="text-sm font-medium truncate">{item.label}</span>
                              {isActive && (
                                <ChevronRight className="w-4 h-4 ml-auto text-primary-600 dark:text-primary-400" />
                              )}
                            </>
                          )}
                        </Link>
                      );
                    })}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            {!sidebarCollapsed ? (
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
            ) : (
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center text-white font-semibold shadow-md">
                  {profile?.full_name?.[0] || 'A'}
                </div>
              </div>
            )}

            {!sidebarCollapsed ? (
              <div className="space-y-1">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                >
                  <Home className="w-4 h-4 shrink-0" />
                  Voir le site
                </Link>

                <button
                  onClick={signOut}
                  className="flex items-center gap-3 px-3 py-2 text-sm dark:text-red-400 hover:text-red-700 dark:hover:bg-red-900/30 rounded-lg transition-all w-full"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Deconnexion
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Link
                  to="/"
                  className="flex items-center justify-center p-2 text-sm text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                  title="Voir le site"
                >
                  <Home className="w-4 h-4" />
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center justify-center p-2 text-sm dark:text-red-400 hover:text-red-700 dark:hover:bg-red-900/30 rounded-lg transition-all"
                  title="Deconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <main className={cn(`${mainMarginClass} min-h-screen px-4 sm:px-6 lg:px-8 overflow-y-auto scrollbar-hide`)}>
        {children}
      </main>

      <div className={mainMarginClass}>
        <Footer compact />
      </div>

      <WishlistDrawer isOpen={showWishlist} onClose={() => setShowWishlist(false)} />
    </div>
  );
}