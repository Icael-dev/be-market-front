import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Globe } from "lucide-react";

export function Footer({ compact = false, className }: { compact?: boolean; className?: string }) {
  if (compact) {
    return (
      <footer
        className={cn(
          "w-full border-t border-gray-200 bg-white text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400",
          className
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="brand-gradient flex h-6 w-6 items-center justify-center rounded-md">
                <span className="text-xs font-bold text-white">B</span>
              </div>
              <span className="text-gray-500 dark:text-gray-500">
                &copy; {new Date().getFullYear()} BE-Market. Tous droits reserves.
              </span>
            </div>
            <div className="flex items-center gap-5">
              <span className="hidden text-gray-500 dark:text-gray-400 sm:inline">
                Suivez-nous :
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://facebook.com/bemarkettg"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com/bemarkettg"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-gray-500 transition-colors hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com/bemarkettg"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="text-gray-500 transition-colors hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-400"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://tiktok.com/@bemarkettg"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="text-gray-500 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.16z" />
                  </svg>
                </a>
              </div>
              <span className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
              <Link
                to="/faq"
                className="text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                FAQ
              </Link>
              <Link
                to="/blog"
                className="text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                Blog
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className={cn(
        "w-full border-t border-gray-200 bg-white text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="text-center">
            <Link to="/" className="mb-4 inline-flex items-center gap-2.5">
              <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-lg">
                <span className="text-lg font-bold text-white">B</span>
              </div>
              <span className="text-xl font-bold tracking-tightest text-gray-900 dark:text-white">
                BE-Market
              </span>
            </Link>
            <p className="mx-auto mb-5 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Votre boutique de confiance pour tous vos accessoires electroniques. Qualite, prix
              competitifs et service irreprochable.
            </p>
            <div className="flex items-center justify-center gap-3.5">
              <a
                href="https://facebook.com/bemarkettg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-all hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/bemarkettg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-all hover:bg-pink-50 hover:text-pink-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-pink-900/30 dark:hover:text-pink-400"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/bemarkettg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-all hover:bg-sky-50 hover:text-sky-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-sky-900/30 dark:hover:text-sky-400"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://tiktok.com/@bemarkettg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.16z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="text-center">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Service Client
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/orders"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Suivi de commande
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link
                  to="/loyalty"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Programme Fidelite
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Informations
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/legal/cgv"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  CGV
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/returns"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Retours
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/privacy"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Confidentialite
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/terms"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Mentions Legales
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-center gap-3">
                <MapPin className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Lome, Togo</span>
              </li>
              <li className="flex items-center justify-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">+228 90 00 00 00</span>
              </li>
              <li className="flex items-center justify-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  contact@be-market.tg
                </span>
              </li>
              <li className="flex items-center justify-center gap-3">
                <Globe className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Lun-Sam: 8h - 19h</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} BE-Market. Tous droits reserves.</p>
          <Link
            to="/blog"
            className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
          >
            Blog & Actualites
          </Link>
        </div>
      </div>
    </footer>
  );
}
