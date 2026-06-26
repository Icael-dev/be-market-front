import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import type { LegalPage as LP } from '../types';
import { FileText, Scale, Shield, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

const icons: Record<string, React.ReactNode> = { cgv: <Scale className="w-5 h-5" />, returns: <RotateCcw className="w-5 h-5" />, privacy: <Shield className="w-5 h-5" />, terms: <FileText className="w-5 h-5" /> };
const labels: Record<string, string> = { cgv: 'Conditions Generales de Vente', returns: 'Politique de Retour', privacy: 'Confidentialite', terms: 'Mentions Legales' };

export function LegalPage() {
  const { slug } = useParams();
  const [pages, setPages] = useState<LP[]>([]);
  const [current, setCurrent] = useState<LP | null>(null);

  useEffect(() => { fetchPages(); }, []);

  useEffect(() => {
    if (pages.length > 0) setCurrent(slug ? pages.find(p => p.slug === slug) || pages[0] : pages[0]);
  }, [pages, slug]);

  const fetchPages = async () => {
    const { data } = await supabase.from('legal_pages').select('*');
    if (data) { setPages(data as LP[]); if (data.length > 0 && !slug) setCurrent(data[0] as LP); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <nav className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h2 className="font-bold text-gray-900 mb-4">Pages legales</h2>
              <div className="space-y-1">
                {pages.map(page => (
                  <Link key={page.id} to={`/legal/${page.slug}`} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm ${current?.slug === page.slug ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                    {icons[page.slug] || <FileText className="w-5 h-5" />}
                    {labels[page.slug] || page.title}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
          <div className="flex-1">
            {current ? (
              <motion.div key={current.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{current.title}</h1>
                <p className="text-sm text-gray-500 mb-6">Derniere mise a jour: {format(new Date(current.updated_at), 'dd MMMM yyyy')}</p>
                <p className="whitespace-pre-wrap text-gray-600 leading-relaxed">{current.content}</p>
              </motion.div>
            ) : <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center"><FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Page non trouvee</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
}