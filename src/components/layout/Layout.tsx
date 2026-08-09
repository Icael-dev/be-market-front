import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
  compactFooter?: boolean;
}

export function Layout({ children, hideHeader, hideFooter }: LayoutProps) {
  const location = useLocation();
  const isHomepage = location.pathname === "/";
  const isAuthPage = ["/login", "/register", "/forgot-password", "/reset-password"].some(
    (path) => location.pathname === path || location.pathname.startsWith(path + "/")
  );

  return (
    <div className="page-bg flex min-h-screen flex-col">
      {!hideHeader && !isAuthPage && <Header />}
      <main className="flex-1">{children}</main>
      {!hideFooter && !isAuthPage && <Footer compact={!isHomepage} />}
    </div>
  );
}
