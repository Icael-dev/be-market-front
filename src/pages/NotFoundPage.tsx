import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen page-bg flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="brand-gradient w-24 h-24 rounded-lg flex items-center justify-center mx-auto mb-8 shadow-premium"
        >
          <span className="text-white font-bold text-5xl">404</span>
        </motion.div>

        <h1 className="text-3xl font-bold dark:text-white tracking-tightest mb-3">
          Page introuvable
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          La page que vous cherchez n'existe pas ou a été déplacée.
          Revenez à l'accueil pour continuer vos achats.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary">
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </Link>
          <Link to="/products" className="btn-ghost">
            <Search className="w-5 h-5" />
            Parcourir les produits
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
