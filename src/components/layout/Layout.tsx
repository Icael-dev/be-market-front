import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
  compactFooter?: boolean;
}

export function Layout({ children, hideHeader, hideFooter, compactFooter }: LayoutProps) {
  const location = useLocation();
  const isHomepage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {!hideHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {!hideFooter && <Footer compact={!isHomepage} />}
    </div>
  );
}