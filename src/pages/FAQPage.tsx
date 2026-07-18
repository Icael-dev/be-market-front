import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchFaqs } from '../services/content';
import type { FAQ } from '../types';
import { ChevronDown, HelpCircle } from 'lucide-react';

export function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openItems, setOpenItems] = useState<string[]>([]);

  useEffect(() => { fetchFAQs(); }, []);

  const fetchFAQs = async () => {
    try {
      const data = await fetchFaqs();
      setFaqs(data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const toggleItem = (id: string) => setOpenItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const grouped = faqs.reduce((acc, faq) => {
    const cat = faq.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  const labels: Record<string, string> = { general: 'Questions generales', livraison: 'Livraison', paiement: 'Paiement', retours: 'Retours', commandes: 'Commandes', garantie: 'Garantie' };

  return (
    <div className="min-h-screen page-bg py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <HelpCircle className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Questions frequentes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Trouvez rapidement les reponses a vos questions</p>
        </motion.div>

        <div className="space-y-8">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{labels[cat] || cat}</h2>
              <div className="space-y-3">
                {items.map((faq, index) => (
                  <motion.div key={faq.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="card overflow-hidden">
                    <button onClick={() => toggleItem(faq.id)} className="w-full flex items-center justify-between p-4 text-left">
                      <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                      <motion.div animate={{ rotate: openItems.includes(faq.id) ? 180 : 0 }}><ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" /></motion.div>
                    </button>
                    <motion.div initial={false} animate={{ height: openItems.includes(faq.id) ? 'auto' : 0 }} className="overflow-hidden">
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