import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Download, FileSpreadsheet, Loader2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const options = [
  { id: 'orders', label: 'Commandes', desc: 'Exporte toutes les commandes' },
  { id: 'customers', label: 'Clients', desc: 'Liste des clients inscrits' },
  { id: 'products', label: 'Produits', desc: 'Catalogue complet' },
  { id: 'newsletter', label: 'Newsletter', desc: 'Liste des abonnes' }
];

export function AdminExportPage() {
  const [exporting, setExporting] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = async (type: string) => {
    setExporting(type); setSuccess(null);
    try {
      let data: any[] = [];
      switch (type) {
        case 'orders':
          const { data: orders } = await supabase.from('orders').select('order_number, status, payment_status, total, created_at').order('created_at', { ascending: false });
          data = orders?.map(o => ({ 'Numero': o.order_number, 'Statut': o.status, 'Paiement': o.payment_status, 'Total': o.total, 'Date': format(new Date(o.created_at), 'dd/MM/yyyy') })) || [];
          break;
        case 'customers':
          const { data: profiles } = await supabase.from('profiles').select('email, full_name, phone, created_at').order('created_at', { ascending: false });
          data = profiles?.map(p => ({ 'Nom': p.full_name || '', 'Email': p.email || '', 'Telephone': p.phone || '', 'Inscrit': format(new Date(p.created_at), 'dd/MM/yyyy') })) || [];
          break;
        case 'products':
          const { data: products } = await supabase.from('products').select('name, price, stock, is_active').order('name');
          data = products?.map(p => ({ 'Nom': p.name, 'Prix': p.price, 'Stock': p.stock, 'Actif': p.is_active ? 'Oui' : 'Non' })) || [];
          break;
        case 'newsletter':
          const { data: subs } = await supabase.from('newsletter_subscribers').select('email, is_active, subscribed_at').order('subscribed_at', { ascending: false });
          data = subs?.map(s => ({ 'Email': s.email, 'Actif': s.is_active ? 'Oui' : 'Non', 'Date': format(new Date(s.subscribed_at), 'dd/MM/yyyy') })) || [];
          break;
      }
      if (data.length > 0) {
        const csv = [Object.keys(data[0]).join(';'), ...data.map(r => Object.values(r).map(v => `"${v}"`).join(';'))].join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${type}_${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click();
        setSuccess(type);
      }
    } finally { setExporting(null); }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8"><h1 className="text-2xl font-bold text-gray-900">Export de donnees</h1><p className="text-gray-500">Exportez vos donnees au format CSV</p></motion.div>
        <div className="grid md:grid-cols-2 gap-4">{options.map((opt, i) => (
          <motion.div key={opt.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center"><FileSpreadsheet className="w-6 h-6 text-blue-600" /></div><div><h3 className="font-bold text-gray-900">{opt.label}</h3><p className="text-sm text-gray-500">{opt.desc}</p></div></div>
            <button onClick={() => handleExport(opt.id)} disabled={exporting !== null} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50">{exporting === opt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : success === opt.id ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Download className="w-4 h-4" />}{exporting === opt.id ? 'Export...' : success === opt.id ? 'Exporte !' : 'Exporter CSV'}</button>
          </motion.div>
        ))}</div>
      </div>
    </AdminLayout>
  );
}