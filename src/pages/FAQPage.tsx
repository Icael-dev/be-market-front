import { useEffect, useState } from "react";
import { logger } from "../lib/logger";
import { motion } from "framer-motion";
import { fetchFaqs } from "../services/content";
import type { FAQ } from "../types";
import { ChevronDown, HelpCircle } from "lucide-react";

export function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openItems, setOpenItems] = useState<string[]>([]);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const data = await fetchFaqs();
      setFaqs(data);
    } catch (error) {
      logger.error("Error fetching FAQs:", error);
    }
  };

  const toggleItem = (id: string) =>
    setOpenItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const grouped = faqs.reduce(
    (acc, faq) => {
      const cat = faq.category || "general";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(faq);
      return acc;
    },
    {} as Record<string, FAQ[]>
  );

  const labels: Record<string, string> = {
    general: "Questions generales",
    livraison: "Livraison",
    paiement: "Paiement",
    retours: "Retours",
    commandes: "Commandes",
    garantie: "Garantie",
  };

  return (
    <div className="page-bg min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <HelpCircle className="mx-auto mb-4 h-16 w-16 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Questions frequentes</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Trouvez rapidement les reponses a vos questions
          </p>
        </motion.div>

        <div className="space-y-8">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                {labels[cat] || cat}
              </h2>
              <div className="space-y-3">
                {items.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(faq.id)}
                      className="flex w-full items-center justify-between p-4 text-left"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {faq.question}
                      </span>
                      <motion.div animate={{ rotate: openItems.includes(faq.id) ? 180 : 0 }}>
                        <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </motion.div>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: openItems.includes(faq.id) ? "auto" : 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 text-gray-600 dark:text-gray-300">{faq.answer}</div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
