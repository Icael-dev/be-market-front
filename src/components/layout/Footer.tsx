import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { NewsletterSignup } from '../../pages/NewsletterPage';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 dark:bg-gray-950 dark:text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="font-bold text-xl text-white">Electronica</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Votre boutique de confiance pour tous vos accessoires electroniques.
              Qualite, prix competitifs et service irreprochable.
            </p>
            <div className="flex items-center gap-4 mb-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>

            <div className="bg-gray-800 dark:bg-gray-800/50 rounded-xl p-4">
              <h4 className="font-semibold text-white mb-3">Newsletter</h4>
              <p className="text-sm text-gray-400 mb-3">Recevez nos offres exclusives</p>
              <NewsletterSignup />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><Link to="/products?category=telephones" className="text-sm hover:text-white transition-colors">Telephones</Link></li>
              <li><Link to="/products?category=ordinateurs" className="text-sm hover:text-white transition-colors">Ordinateurs</Link></li>
              <li><Link to="/products?category=chargeurs" className="text-sm hover:text-white transition-colors">Chargeurs</Link></li>
              <li><Link to="/products?category=ecouteurs" className="text-sm hover:text-white transition-colors">Ecouteurs</Link></li>
              <li><Link to="/products?category=casques-audio" className="text-sm hover:text-white transition-colors">Casques Audio</Link></li>
              <li><Link to="/products?category=enceintes" className="text-sm hover:text-white transition-colors">Enceintes</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Service Client</h3>
            <ul className="space-y-2">
              <li><Link to="/orders" className="text-sm hover:text-white transition-colors">Suivi de commande</Link></li>
              <li><Link to="/faq" className="text-sm hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/support" className="text-sm hover:text-white transition-colors">Support</Link></li>
              <li><Link to="/loyalty" className="text-sm hover:text-white transition-colors">Programme Fidelite</Link></li>
            </ul>

            <h3 className="font-semibold text-white mb-4 mt-6">Informations</h3>
            <ul className="space-y-2">
              <li><Link to="/legal/cgv" className="text-sm hover:text-white transition-colors">CGV</Link></li>
              <li><Link to="/legal/returns" className="text-sm hover:text-white transition-colors">Retours</Link></li>
              <li><Link to="/legal/privacy" className="text-sm hover:text-white transition-colors">Confidentialite</Link></li>
              <li><Link to="/legal/terms" className="text-sm hover:text-white transition-colors">Mentions Legales</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Lome, Togo</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm">+228 90 00 00 00</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm">contact@electronica.tg</span>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="font-semibold text-white mb-3">Paiement securise</h4>
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3 py-1.5 bg-yellow-500 text-yellow-900 rounded text-xs font-bold">TMoney</div>
                <div className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold">Flooz</div>
                <div className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-bold">Livraison</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Electronica. Tous droits reserves.</p>
          <Link to="/blog" className="hover:text-white transition-colors">Blog & Actualites</Link>
        </div>
      </div>
    </footer>
  );
}