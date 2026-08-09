import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { logger } from "./lib/logger";
import { Component, ErrorInfo, ReactNode, useEffect, lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { Layout } from "./components/layout/Layout";
import { AdminLayout } from "./components/admin/AdminLayout";
import { PageLoading } from "./components/LoadingSpinner";

const scrollPositions = new Map<string, number>();
const MAX_SCROLL_POSITIONS = 50;

function saveScrollPosition(key: string, position: number) {
  scrollPositions.set(key, position);
  if (scrollPositions.size > MAX_SCROLL_POSITIONS) {
    const firstKey = scrollPositions.keys().next().value;
    scrollPositions.delete(firstKey);
  }
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error("App error:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center p-8">
          <div className="max-w-lg text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">Une erreur est survenue</h1>
            <pre className="mb-4 overflow-auto rounded-lg bg-red-50 p-4 text-left text-sm text-red-600">
              {(this.state.error as Error).message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-primary-600 px-6 py-3 text-white"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const LazyHomePage = lazy(() => import("./pages/HomePage").then((m) => ({ default: m.HomePage })));
const LazyProductsPage = lazy(() =>
  import("./pages/ProductsPage").then((m) => ({ default: m.ProductsPage }))
);
const LazyCategoriesPage = lazy(() =>
  import("./pages/CategoriesPage").then((m) => ({ default: m.CategoriesPage }))
);
const LazyProductDetailPage = lazy(() =>
  import("./pages/ProductDetailPage").then((m) => ({ default: m.ProductDetailPage }))
);
const LazyCartPage = lazy(() => import("./pages/CartPage").then((m) => ({ default: m.CartPage })));
const LazyCheckoutPage = lazy(() =>
  import("./pages/CheckoutPage").then((m) => ({ default: m.CheckoutPage }))
);
const LazyOrderSuccessPage = lazy(() =>
  import("./pages/OrderSuccessPage").then((m) => ({ default: m.OrderSuccessPage }))
);
const LazyLoginPage = lazy(() =>
  import("./pages/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const LazyRegisterPage = lazy(() =>
  import("./pages/RegisterPage").then((m) => ({ default: m.RegisterPage }))
);
const LazyProfilePage = lazy(() =>
  import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage }))
);
const LazyOrdersPage = lazy(() =>
  import("./pages/OrdersPage").then((m) => ({ default: m.OrdersPage }))
);
const LazyOrderDetailPage = lazy(() =>
  import("./pages/OrdersPage").then((m) => ({ default: m.OrderDetailPage }))
);
const LazyAddressesPage = lazy(() =>
  import("./pages/AddressesPage").then((m) => ({ default: m.AddressesPage }))
);
const LazySupportPage = lazy(() =>
  import("./pages/SupportPage").then((m) => ({ default: m.SupportPage }))
);
const LazyTicketDetailPage = lazy(() =>
  import("./pages/SupportPage").then((m) => ({ default: m.TicketDetailPage }))
);
const LazyFAQPage = lazy(() => import("./pages/FAQPage").then((m) => ({ default: m.FAQPage })));
const LazyLegalPage = lazy(() =>
  import("./pages/LegalPage").then((m) => ({ default: m.LegalPage }))
);
const LazyComparePage = lazy(() =>
  import("./components/CompareDrawer").then((m) => ({ default: m.ComparePage }))
);
const LazyBlogPage = lazy(() => import("./pages/BlogPage").then((m) => ({ default: m.BlogPage })));
const LazyBlogPostPage = lazy(() =>
  import("./pages/BlogPage").then((m) => ({ default: m.BlogPostPage }))
);
const LazyLoyaltyPage = lazy(() =>
  import("./pages/LoyaltyPage").then((m) => ({ default: m.LoyaltyPage }))
);
const LazyPaymentsPage = lazy(() =>
  import("./pages/PaymentsPage").then((m) => ({ default: m.PaymentsPage }))
);
const LazyWishlistPage = lazy(() =>
  import("./pages/WishlistPage").then((m) => ({ default: m.WishlistPage }))
);
const LazySearchPage = lazy(() =>
  import("./pages/SearchPage").then((m) => ({ default: m.SearchPage }))
);
const LazyNotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage }))
);
const LazyForgotPasswordPage = lazy(() =>
  import("./pages/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage }))
);
const LazyResetPasswordPage = lazy(() =>
  import("./pages/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage }))
);

const LazyAdminTestimonialsPage = lazy(() =>
  import("./pages/admin/AdminTestimonialsPage").then((m) => ({ default: m.AdminTestimonialsPage }))
);
const LazyAdminFAQPage = lazy(() =>
  import("./pages/admin/AdminFAQPage").then((m) => ({ default: m.AdminFAQPage }))
);
const LazyAdminLegalPage = lazy(() =>
  import("./pages/admin/AdminLegalPage").then((m) => ({ default: m.AdminLegalPage }))
);

const LazyAdminDashboardPage = lazy(() =>
  import("./pages/admin/AdminDashboardPage").then((m) => ({ default: m.AdminDashboardPage }))
);
const LazyAdminCategoriesPage = lazy(() =>
  import("./pages/admin/AdminCategoriesPage").then((m) => ({ default: m.AdminCategoriesPage }))
);
const LazyAdminProductsPage = lazy(() =>
  import("./pages/admin/AdminProductsPage").then((m) => ({ default: m.AdminProductsPage }))
);
const LazyAdminOrdersPage = lazy(() =>
  import("./pages/admin/AdminOrdersPage").then((m) => ({ default: m.AdminOrdersPage }))
);
const LazyAdminCustomersPage = lazy(() =>
  import("./pages/admin/AdminCustomersPage").then((m) => ({ default: m.AdminCustomersPage }))
);
const LazyAdminBannersPage = lazy(() =>
  import("./pages/admin/AdminBannersPage").then((m) => ({ default: m.AdminBannersPage }))
);
const LazyAdminBlogPage = lazy(() =>
  import("./pages/admin/AdminBlogPage").then((m) => ({ default: m.AdminBlogPage }))
);
const LazyAdminSettingsPage = lazy(() =>
  import("./pages/admin/AdminSettingsPage").then((m) => ({ default: m.AdminSettingsPage }))
);
const LazyAdminStatisticsPage = lazy(() =>
  import("./pages/admin/AdminStatisticsPage").then((m) => ({ default: m.AdminStatisticsPage }))
);
const LazyAdminTopProductsPage = lazy(() =>
  import("./pages/admin/AdminTopProductsPage").then((m) => ({ default: m.AdminTopProductsPage }))
);
const LazyAdminLowStockPage = lazy(() =>
  import("./pages/admin/AdminLowStockPage").then((m) => ({ default: m.AdminLowStockPage }))
);
const LazyAdminCouponUsagePage = lazy(() =>
  import("./pages/admin/AdminCouponUsagePage").then((m) => ({ default: m.AdminCouponUsagePage }))
);
const LazyAdminCategorySalesPage = lazy(() =>
  import("./pages/admin/AdminCategorySalesPage").then((m) => ({
    default: m.AdminCategorySalesPage,
  }))
);
const LazyAdminCouponsPage = lazy(() =>
  import("./pages/admin/AdminCouponsPage").then((m) => ({ default: m.AdminCouponsPage }))
);
const LazyAdminExportPage = lazy(() =>
  import("./pages/admin/AdminExportPage").then((m) => ({ default: m.AdminExportPage }))
);
const LazyAdminFlashSalesPage = lazy(() =>
  import("./pages/admin/AdminFlashSalesPage").then((m) => ({ default: m.AdminFlashSalesPage }))
);
const LazyAdminUsersPage = lazy(() =>
  import("./pages/admin/AdminUsersPage").then((m) => ({ default: m.AdminUsersPage }))
);
const LazyAdminCustomerDetailPage = lazy(() =>
  import("./pages/admin/AdminCustomerDetailPage").then((m) => ({
    default: m.AdminCustomerDetailPage,
  }))
);
const LazyAdminProductDetailPage = lazy(() =>
  import("./pages/admin/AdminProductDetailPage").then((m) => ({
    default: m.AdminProductDetailPage,
  }))
);
const LazyAdminPaymentsPage = lazy(() =>
  import("./pages/admin/AdminPaymentsPage").then((m) => ({ default: m.AdminPaymentsPage }))
);
const LazyAdminLoyaltyPage = lazy(() =>
  import("./pages/admin/AdminLoyaltyPage").then((m) => ({ default: m.AdminLoyaltyPage }))
);
const LazyAdminSupportPage = lazy(() =>
  import("./pages/admin/AdminSupportPage").then((m) => ({ default: m.AdminSupportPage }))
);
const LazyAdminSupportDetailPage = lazy(() =>
  import("./pages/admin/AdminSupportDetailPage").then((m) => ({
    default: m.AdminSupportDetailPage,
  }))
);
const LazyAdminFailedPaymentsPage = lazy(() =>
  import("./pages/admin/AdminFailedPaymentsPage").then((m) => ({
    default: m.AdminFailedPaymentsPage,
  }))
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

function AdminSuperAdminRoute() {
  const { isSuperAdmin } = useAuth();
  if (!isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }
  return <Outlet />;
}

function AdminIndexRoute() {
  const { isSuperAdmin } = useAuth();
  if (!isSuperAdmin) {
    return <Navigate to="/admin/orders" replace />;
  }
  return <LazyAdminDashboardPage />;
}

function AppRoutes() {
  const location = useLocation();
  const navType = useNavigationType();
  const routeKey = location.pathname.startsWith("/admin") ? "admin" : location.pathname;

  useEffect(() => {
    if (navType === "POP") {
      const savedPos = scrollPositions.get(location.key || location.pathname);
      if (savedPos !== undefined) {
        window.scrollTo(0, savedPos);
      }
    } else {
      window.scrollTo(0, 0);
    }

    const handleScroll = () => {
      saveScrollPosition(location.key || location.pathname, window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location, navType]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <Suspense fallback={<PageLoading />}>
          <Routes location={location}>
            <Route
              element={
                <Layout>
                  <Outlet />
                </Layout>
              }
            >
              <Route path="/login" element={<LazyLoginPage />} />
              <Route path="/register" element={<LazyRegisterPage />} />
              <Route path="/forgot-password" element={<LazyForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<LazyResetPasswordPage />} />
              <Route path="/" element={<LazyHomePage />} />
              <Route path="/products" element={<LazyProductsPage />} />
              <Route path="/search" element={<LazySearchPage />} />
              <Route path="/categories" element={<LazyCategoriesPage />} />
              <Route path="/product/:slug" element={<LazyProductDetailPage />} />
              <Route path="/cart" element={<LazyCartPage />} />
              <Route path="/compare" element={<LazyComparePage />} />
              <Route path="/faq" element={<LazyFAQPage />} />
              <Route path="/legal/:slug?" element={<LazyLegalPage />} />
              <Route path="/blog" element={<LazyBlogPage />} />
              <Route path="/blog/:slug" element={<LazyBlogPostPage />} />

              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <LazyCheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-success/:orderId"
                element={
                  <ProtectedRoute>
                    <LazyOrderSuccessPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <LazyProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <LazyOrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute>
                    <LazyOrderDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/addresses"
                element={
                  <ProtectedRoute>
                    <LazyAddressesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/support"
                element={
                  <ProtectedRoute>
                    <LazySupportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/support/:id"
                element={
                  <ProtectedRoute>
                    <LazyTicketDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/loyalty"
                element={
                  <ProtectedRoute>
                    <LazyLoyaltyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payments"
                element={
                  <ProtectedRoute>
                    <LazyPaymentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <LazyWishlistPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<LazyNotFoundPage />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminIndexRoute />} />
              <Route path="/admin/categories" element={<LazyAdminCategoriesPage />} />
              <Route path="/admin/products" element={<LazyAdminProductsPage />} />
              <Route path="/admin/products/:id" element={<LazyAdminProductDetailPage />} />
              <Route path="/admin/orders" element={<LazyAdminOrdersPage />} />
              <Route path="/admin/customers" element={<LazyAdminCustomersPage />} />
              <Route path="/admin/customers/:id" element={<LazyAdminCustomerDetailPage />} />
              <Route path="/admin/payments" element={<LazyAdminPaymentsPage />} />
              <Route path="/admin/loyalty" element={<LazyAdminLoyaltyPage />} />
              <Route path="/admin/support" element={<LazyAdminSupportPage />} />
              <Route path="/admin/support/:id" element={<LazyAdminSupportDetailPage />} />
              <Route path="/admin/banners" element={<LazyAdminBannersPage />} />
              <Route path="/admin/blog" element={<LazyAdminBlogPage />} />
              <Route path="/admin/testimonials" element={<LazyAdminTestimonialsPage />} />
              <Route path="/admin/faq" element={<LazyAdminFAQPage />} />
              <Route path="/admin/coupons" element={<LazyAdminCouponsPage />} />
              <Route path="/admin/export" element={<LazyAdminExportPage />} />
              <Route path="/admin/flash-sales" element={<LazyAdminFlashSalesPage />} />
              <Route
                path="/admin/statistics/failed-payments"
                element={<LazyAdminFailedPaymentsPage />}
              />
              <Route path="/admin/statistics/top-products" element={<LazyAdminTopProductsPage />} />
              <Route path="/admin/statistics/low-stock" element={<LazyAdminLowStockPage />} />
              <Route path="/admin/statistics/coupons" element={<LazyAdminCouponUsagePage />} />
              <Route
                path="/admin/statistics/category-sales"
                element={<LazyAdminCategorySalesPage />}
              />
              <Route element={<AdminSuperAdminRoute />}>
                <Route path="/admin/legal-pages" element={<LazyAdminLegalPage />} />
                <Route path="/admin/settings" element={<LazyAdminSettingsPage />} />
                <Route path="/admin/users" element={<LazyAdminUsersPage />} />
                <Route path="/admin/statistics" element={<LazyAdminStatisticsPage />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "#1f2937",
                    color: "#fff",
                    borderRadius: "12px",
                    padding: "12px 16px",
                  },
                  success: {
                    iconTheme: {
                      primary: "#10b981",
                      secondary: "#fff",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#ef4444",
                      secondary: "#fff",
                    },
                  },
                }}
              />
              <ErrorBoundary>
                <AppRoutes />
              </ErrorBoundary>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
