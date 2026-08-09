import { useState, useEffect } from "react";
import { X, Monitor, Smartphone } from "lucide-react";

interface MobileNotOptimizedBannerProps {
  threshold?: number;
  message?: string;
}

export function MobileNotOptimizedBanner({
  threshold = 1024,
  message = "Cette page est optimisée pour un écran plus large. Tournez votre appareil ou connectez-vous depuis un ordinateur de bureau pour une meilleure expérience.",
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
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [threshold, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (!isSmallScreen || !isVisible) {
    return null;
  }

  return (
    <div className="animate-in slide-in-from-top fixed left-0 right-0 top-0 z-50">
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-900/90">
        <div className="mx-auto flex max-w-7xl items-start gap-3">
          <div className="mt-0.5 flex-shrink-0">
            {isSmallScreen ? (
              <Smartphone className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            ) : (
              <Monitor className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Affichage non optimisé pour mobile
            </p>
            <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">{message}</p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-amber-100 dark:hover:bg-amber-800"
            aria-label="Fermer le message"
          >
            <X className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
