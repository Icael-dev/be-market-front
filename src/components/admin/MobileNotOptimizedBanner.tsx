import { useState, useEffect } from 'react';
import { X, Monitor, Smartphone } from 'lucide-react';

interface MobileNotOptimizedBannerProps {
  threshold?: number;
  message?: string;
}

export function MobileNotOptimizedBanner({
  threshold = 1024,
  message = "Cette page est optimisée pour un écran plus large. Tournez votre appareil ou connectez-vous depuis un ordinateur de bureau pour une meilleure expérience."
}: MobileNotOptimizedBannerProps) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const small = window.innerWidth < threshold;
      setIsSmallScreen(small);
      if (small && !isDismissed) {
        setIsVisible(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [threshold, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (!isSmallScreen || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top">
      <div className="bg-amber-50 dark:bg-amber-900/90 border-b border-amber-200 dark:border-amber-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {isSmallScreen ? (
              <Smartphone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            ) : (
              <Monitor className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Affichage non optimisé pour mobile
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              {message}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800 transition-colors"
            aria-label="Fermer le message"
          >
            <X className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
