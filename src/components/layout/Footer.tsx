import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Globe } from 'lucide-react';

export function Footer({ compact = false }: { compact?: boolean }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (compact) {
    return (
      <footer className={cn(
        "sticky bottom-0 z-30 bg-gray-900 text-gray-300 dark:bg-gray-950 dark:text-gray-400",
        isAdmin && "lg:ml-72"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="border-t border-gray-700/50 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400 dark:text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              <span className="text-gray-400 dark:text-gray-500">&copy; {new Date().getFullYear()} BE-Market. Tous droits reserves.</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-gray-500">Suivez-nous :</span>
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" aria-label="TikTok" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.16z"/></svg>
              </a>
              <span className="text-gray-600">|</span>
              <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link>
              <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={cn(
      "bg-gray-900 text-gray-300 dark:bg-gray-950 dark:text-gray-400",
      isAdmin && "lg:ml-72"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          <div className="text-center sm:text-left">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="font-bold text-xl text-white">BE-Market</span>
            </Link>
            <p className="text-sm dark:text-gray-500 mb-4 max-w-md mx-auto sm:mx-0">
              Votre boutique de confiance pour tous vos accessoires electroniques.
              Qualite, prix competitifs et service irreprochable.
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-5 mb-6">
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" aria-label="TikTok" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.16z"/></svg>
              </a>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-white mb-4">Service Client</h3>
            <ul className="space-y-2">
              <li><Link to="/orders" className="text-sm hover:text-white transition-colors">Suivi de commande</Link></li>
              <li><Link to="/faq" className="text-sm hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/support" className="text-sm hover:text-white transition-colors">Support</Link></li>
              <li><Link to="/loyalty" className="text-sm hover:text-white transition-colors">Programme Fidelite</Link></li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-white mb-4">Informations</h3>
            <ul className="space-y-2">
              <li><Link to="/legal/cgv" className="text-sm hover:text-white transition-colors">CGV</Link></li>
              <li><Link to="/legal/returns" className="text-sm hover:text-white transition-colors">Retours</Link></li>
              <li><Link to="/legal/privacy" className="text-sm hover:text-white transition-colors">Confidentialite</Link></li>
              <li><Link to="/legal/terms" className="text-sm hover:text-white transition-colors">Mentions Legales</Link></li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-center sm:justify-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm">Lome, Togo</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-3">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm">+228 90 00 00 00</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-3">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm">contact@be-market.tg</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-3">
                <Globe className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm">Lun-Sam: 8h - 19h</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm dark:text-gray-500">
          <p>&copy; {new Date().getFullYear()} BE-Market. Tous droits reserves.</p>
          <Link to="/blog" className="hover:text-white transition-colors">Blog & Actualites</Link>
        </div>
      </div>
    </footer>
  );
}
