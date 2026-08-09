import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="page-bg flex min-h-screen items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="brand-gradient mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-lg shadow-premium"
        >
          <span className="text-5xl font-bold text-white">404</span>
        </motion.div>

        <h1 className="mb-3 text-3xl font-bold tracking-tightest dark:text-white">
          Page introuvable
        </h1>
        <p className="mb-8 leading-relaxed text-gray-500 dark:text-gray-400">
          La page que vous cherchez n'existe pas ou a été déplacée. Revenez à l'accueil pour
          continuer vos achats.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className="btn-primary">
            <Home className="h-5 w-5" />
            Retour à l'accueil
          </Link>
          <Link to="/products" className="btn-ghost">
            <Search className="h-5 w-5" />
            Parcourir les produits
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
