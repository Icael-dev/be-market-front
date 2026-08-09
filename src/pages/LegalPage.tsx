import { useEffect, useState, useCallback } from "react";
import { logger } from "../lib/logger";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchLegalPages } from "../services/content";
import type { LegalPage as LP } from "../types";
import { FileText, Scale, Shield, RotateCcw } from "lucide-react";
import { format } from "date-fns";

const icons: Record<string, React.ReactNode> = {
  cgv: <Scale className="h-5 w-5" />,
  returns: <RotateCcw className="h-5 w-5" />,
  privacy: <Shield className="h-5 w-5" />,
  terms: <FileText className="h-5 w-5" />,
};
const labels: Record<string, string> = {
  cgv: "Conditions Generales de Vente",
  returns: "Politique de Retour",
  privacy: "Confidentialite",
  terms: "Mentions Legales",
};

export function LegalPage() {
  const { slug } = useParams();
  const [pages, setPages] = useState<LP[]>([]);
  const [current, setCurrent] = useState<LP | null>(null);

  const fetchPages = useCallback(async () => {
    try {
      const data = await fetchLegalPages();
      if (data) {
        setPages(data);
        if (data.length > 0 && !slug) setCurrent(data[0]);
      }
    } catch (error) {
      logger.error("Failed to load legal pages:", error);
    }
  }, [slug]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return (
    <div className="page-bg min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-8 lg:flex-row">
          <nav className="shrink-0 lg:w-64">
            <div className="card p-4">
              <h2 className="mb-4 font-bold text-gray-900 dark:text-white">Pages legales</h2>
              <div className="space-y-1">
                {pages.map((page) => (
                  <Link
                    key={page.id}
                    to={`/legal/${page.slug}`}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm ${current?.slug === page.slug ? "bg-primary-50 font-medium text-primary-600" : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"}`}
                  >
                    {icons[page.slug] || <FileText className="h-5 w-5" />}
                    {labels[page.slug] || page.title}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
          <div className="flex-1">
            {current ? (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-8"
              >
                <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {current.title}
                </h1>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                  Derniere mise a jour: {format(new Date(current.updated_at), "dd MMMM yyyy")}
                </p>
                <p className="whitespace-pre-wrap leading-relaxed text-gray-600 dark:text-gray-300">
                  {current.content}
                </p>
              </motion.div>
            ) : (
              <div className="card p-12 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">Page non trouvee</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
