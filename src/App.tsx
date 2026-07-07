import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Layout } from './components/layout/Layout';

const scrollPositions = new Map<string, number>();

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('App error:', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-lg text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Une erreur est survenue</h1>
            <pre className="text-sm text-red-600 bg-red-50 p-4 rounded-xl text-left overflow-auto mb-4">
              {(this.state.error as Error).message}
            </pre>
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 text-white rounded-xl">
              Recharger la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { OrdersPage, OrderDetailPage } from './pages/OrdersPage';
import { AddressesPage } from './pages/AddressesPage';
import { SupportPage, TicketDetailPage } from './pages/SupportPage';
import { FAQPage } from './pages/FAQPage';
import { LegalPage } from './pages/LegalPage';
import { ComparePage } from './components/CompareDrawer';
import { BlogPage, BlogPostPage } from './pages/BlogPage';
import { LoyaltyPage } from './pages/LoyaltyPage';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminBannersPage } from './pages/admin/AdminBannersPage';
import { AdminBlogPage } from './pages/admin/AdminBlogPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminStatisticsPage } from './pages/admin/AdminStatisticsPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminExportPage } from './pages/admin/AdminExportPage';
import { AdminFlashSalesPage } from './pages/admin/AdminFlashSalesPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const location = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType === 'POP') {
      const savedPos = scrollPositions.get(location.key || location.pathname);
      if (savedPos !== undefined) {
        window.scrollTo(0, savedPos);
      }
    } else {
      window.scrollTo(0, 0);
    }

    const handleScroll = () => {
      scrollPositions.set(location.key || location.pathname, window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location, navType]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<Layout><Outlet /></Layout>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/legal/:slug?" element={<LegalPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />

        <Route path="/checkout" element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        } />
        <Route path="/order-success/:orderId" element={
          <ProtectedRoute>
            <OrderSuccessPage />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/orders/:id" element={
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/addresses" element={
          <ProtectedRoute>
            <AddressesPage />
          </ProtectedRoute>
        } />
        <Route path="/support" element={
          <ProtectedRoute>
            <SupportPage />
          </ProtectedRoute>
        } />
        <Route path="/support/:id" element={
          <ProtectedRoute>
            <TicketDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/loyalty" element={
          <ProtectedRoute>
            <LoyaltyPage />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        } />
        <Route path="/admin/categories" element={
          <AdminRoute>
            <AdminCategoriesPage />
          </AdminRoute>
        } />
        <Route path="/admin/products" element={
          <AdminRoute>
            <AdminProductsPage />
          </AdminRoute>
        } />
        <Route path="/admin/orders" element={
          <AdminRoute>
            <AdminOrdersPage />
          </AdminRoute>
        } />
        <Route path="/admin/customers" element={
          <AdminRoute>
            <AdminCustomersPage />
          </AdminRoute>
        } />
        <Route path="/admin/banners" element={
          <AdminRoute>
            <AdminBannersPage />
          </AdminRoute>
        } />
        <Route path="/admin/blog" element={
          <AdminRoute>
            <AdminBlogPage />
          </AdminRoute>
        } />
        <Route path="/admin/settings" element={
          <AdminRoute>
            <AdminSettingsPage />
          </AdminRoute>
        } />
        <Route path="/admin/statistics" element={
          <AdminRoute>
            <AdminStatisticsPage />
          </AdminRoute>
        } />
        <Route path="/admin/coupons" element={
          <AdminRoute>
            <AdminCouponsPage />
          </AdminRoute>
        } />
        <Route path="/admin/export" element={
          <AdminRoute>
            <AdminExportPage />
          </AdminRoute>
        } />
        <Route path="/admin/flash-sales" element={
          <AdminRoute>
            <AdminFlashSalesPage />
          </AdminRoute>
        } />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1f2937',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '12px 16px'
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff'
                  }
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff'
                  }
                }
              }}
            />
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;