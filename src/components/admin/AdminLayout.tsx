import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: '/admin/statistics', label: 'Statistiques', icon: BarChart3 },
  { path: '/admin/products', label: 'Produits', icon: ShoppingBag },
  { path: '/admin/orders', label: 'Commandes', icon: Package },
  { path: '/admin/customers', label: 'Clients', icon: Users },
  { path: '/admin/coupons', label: 'Codes promo', icon: Tag },
  { path: '/admin/flash-sales', label: 'Flash Sales', icon: Zap },
  { path: '/admin/banners', label: 'Bannieres', icon: Image },
  { path: '/admin/blog', label: 'Blog', icon: FileText },
  { path: '/admin/export', label: 'Export', icon: Download },
  { path: '/admin/settings', label: 'Parametres', icon: Settings }
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin, signOut, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAdmin) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-4 font-bold text-gray-900">Admin</span>
      </div>

      <div className={cn(
        'fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div>
                <span className="font-bold text-gray-900">Electronica</span>
                <p className="text-xs text-gray-500">Administration</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-medium">
              {profile?.full_name?.[0] || 'A'}
            </div>
            <div>
              <p className="font-medium text-gray-900">{profile?.full_name || 'Admin'}</p>
              <p className="text-xs text-gray-500">Administrateur</p>
            </div>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors mb-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Voir le site
          </Link>

          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Deconnexion
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
