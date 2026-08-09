import { ReactNode, useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
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
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { WishlistDrawer } from "../WishlistDrawer";
import { Footer } from "../layout/Footer";

const scrollPositions = new Map<string, number>();

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
  {
    path: "/admin",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    section: "Principal",
    adminOnly: true,
  },
  {
    path: "/admin/statistics",
    label: "Statistiques",
    icon: BarChart3,
    section: "Principal",
    adminOnly: true,
  },
  {
    path: "/admin/statistics/top-products",
    label: "Top produits",
    icon: Package,
    section: "Principal",
  },
  {
    path: "/admin/statistics/low-stock",
    label: "Stock bas",
    icon: AlertTriangle,
    section: "Principal",
  },
  { path: "/admin/statistics/coupons", label: "Coupons", icon: Ticket, section: "Principal" },
  {
    path: "/admin/statistics/category-sales",
    label: "Ventes par categorie",
    icon: Tag,
    section: "Principal",
  },
  {
    path: "/admin/statistics/failed-payments",
    label: "Paiements echoues",
    icon: AlertTriangle,
    section: "Principal",
  },
  { path: "/admin/categories", label: "Categories", icon: Grid3X3, section: "Catalogue" },
  { path: "/admin/products", label: "Produits", icon: ShoppingBag, section: "Catalogue" },
  { path: "/admin/banners", label: "Bannieres", icon: Image, section: "Catalogue" },
  { path: "/admin/flash-sales", label: "Flash Sales", icon: Zap, section: "Catalogue" },
  { path: "/admin/coupons", label: "Codes promo", icon: Tag, section: "Catalogue" },
  { path: "/admin/blog", label: "Blog", icon: FileText, section: "Catalogue" },
  { path: "/admin/testimonials", label: "Temoignages", icon: MessageSquare, section: "Catalogue" },
  { path: "/admin/faq", label: "FAQ", icon: HelpCircle, section: "Catalogue" },
  {
    path: "/admin/legal-pages",
    label: "Pages legales",
    icon: FileText,
    section: "Catalogue",
    adminOnly: true,
  },
  { path: "/admin/orders", label: "Commandes", icon: Package, section: "Ventes" },
  { path: "/admin/payments", label: "Paiements", icon: CreditCard, section: "Ventes" },
  { path: "/admin/customers", label: "Clients", icon: Users, section: "Ventes" },
  { path: "/admin/loyalty", label: "Fidelite", icon: Gift, section: "Ventes" },
  { path: "/admin/support", label: "Support", icon: Headphones, section: "Ventes" },
  { path: "/admin/export", label: "Export", icon: Download, section: "Outils" },
  {
    path: "/admin/users",
    label: "Utilisateurs",
    icon: UserCog,
    section: "Outils",
    adminOnly: true,
  },
  {
    path: "/admin/settings",
    label: "Parametres",
    icon: Settings,
    section: "Outils",
    adminOnly: true,
  },
];

const sections = [...new Set(navItems.map((item) => item.section).filter(Boolean))] as string[];

const SIDEBAR_EXPANDED_W = "w-72";
const SIDEBAR_COLLAPSED_W = "w-20";

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin, isSuperAdmin, signOut, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin_sidebar_collapsed");
      if (stored !== null) return stored === "true";
    }
    return false;
  });

  const mainRef = useRef<HTMLDivElement>(null);

  const scrollKey = location.key || location.pathname;

  useLayoutEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;
    const saved = scrollPositions.get(scrollKey);
    if (saved !== undefined) {
      mainEl.scrollTop = saved;
    }
  }, [scrollKey]);

  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;
    const handleScroll = () => {
      scrollPositions.set(scrollKey, mainEl.scrollTop);
    };
    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      scrollPositions.set(scrollKey, mainEl.scrollTop);
      mainEl.removeEventListener("scroll", handleScroll);
    };
  }, [scrollKey]);

  useEffect(() => {
    localStorage.setItem("admin_sidebar_collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-primary-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const visibleItems = navItems.filter((item) => isSuperAdmin || !item.adminOnly);
  const visibleSections = sections.filter((section) =>
    visibleItems.some((item) => item.section === section)
  );

  const sidebarWidthClass = sidebarCollapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W;
  const mainMarginClass = sidebarCollapsed ? "lg:ml-20" : "lg:ml-72";

  return (
    <div className="page-bg flex h-[100vh] flex-col overflow-hidden">
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex transform flex-col bg-white transition-all duration-300 ease-in-out dark:bg-gray-900 lg:translate-x-0",
          sidebarWidthClass,
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between bg-gradient-to-r from-primary-50/80 to-transparent p-3 dark:from-primary-900/20 dark:to-transparent">
            <div className="flex items-center gap-2">
              <Link to="/" className="group flex min-w-0 items-center gap-3">
                <div className="brand-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-2 ring-primary-100 dark:ring-primary-800">
                  <span className="text-lg font-bold text-white">B</span>
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <span className="bg-gradient-to-r from-primary-600 to-cyan-500 bg-clip-text text-lg font-bold tracking-tight text-transparent dark:text-white">
                      BE-Market
                    </span>
                    <p className="text-xs font-medium text-primary-600/80 dark:text-gray-500 dark:text-primary-400/80">
                      Administration
                    </p>
                  </div>
                )}
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleSidebar}
                className="hidden rounded-lg p-3 text-primary-600 transition-colors hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30 lg:flex"
                title={sidebarCollapsed ? "Deplier la barre laterale" : "Replier la barre laterale"}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-3 text-primary-600 transition-colors hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30 lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <nav className="scrollbar-hide flex-1 overflow-y-auto p-4">
            {visibleSections.map((section) => (
              <div key={section} className="mb-6">
                {!sidebarCollapsed && (
                  <p className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-blue-600/80 dark:text-blue-400/80">
                    {section}
                  </p>
                )}
                <div className="space-y-1">
                  {visibleItems
                    .filter((item) => item.section === section)
                    .map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200",
                            isActive
                              ? "bg-blue-100 font-semibold text-blue-900 ring-1 ring-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:ring-blue-700"
                              : "text-gray-700 hover:bg-blue-50 hover:text-blue-900 dark:text-gray-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-5 w-5 shrink-0 transition-colors",
                              isActive
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400"
                            )}
                          />
                          {!sidebarCollapsed && (
                            <>
                              <span className="truncate text-sm font-medium">{item.label}</span>
                              {isActive && (
                                <ChevronRight className="ml-auto h-4 w-4 text-blue-600 dark:text-blue-400" />
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

          <div className="bg-gradient-to-t from-primary-50/50 to-transparent p-3 dark:from-primary-900/10 dark:to-transparent">
            {!sidebarCollapsed ? (
              <div className="mb-3 flex items-center gap-3 px-2">
                <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-full font-semibold text-white ring-2 ring-primary-200 dark:ring-primary-700">
                  {profile?.full_name?.[0] || "A"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {profile?.full_name || "Admin"}
                  </p>
                  <p className="truncate text-xs font-medium text-primary-600 dark:text-primary-400">
                    {isSuperAdmin ? "Administrateur" : "Staff"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-3 flex justify-center">
                <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-full font-semibold text-white ring-2 ring-primary-200 dark:ring-primary-700">
                  {profile?.full_name?.[0] || "A"}
                </div>
              </div>
            )}

            {!sidebarCollapsed ? (
              <div className="space-y-1">
                <Link
                  to="/"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-all hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-primary-900/20 dark:hover:text-primary-300"
                >
                  <Home className="h-4 w-4 shrink-0" />
                  Voir le site
                </Link>

                <button
                  onClick={signOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Deconnexion
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Link
                  to="/"
                  className="flex items-center justify-center rounded-lg p-2 text-sm text-gray-700 transition-all hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-primary-900/20 dark:hover:text-primary-300"
                  title="Voir le site"
                >
                  <Home className="h-4 w-4" />
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center justify-center rounded-lg p-2 text-sm text-red-600 transition-all hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                  title="Deconnexion"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <main
        ref={mainRef}
        className={cn(
          `${mainMarginClass} scrollbar-hide flex-1 overflow-y-auto px-6 pb-5 pt-0 sm:px-8 lg:px-10`
        )}
      >
        {children}
      </main>

      <div className={mainMarginClass}>
        <Footer compact />
      </div>

      <WishlistDrawer isOpen={showWishlist} onClose={() => setShowWishlist(false)} />
    </div>
  );
}
