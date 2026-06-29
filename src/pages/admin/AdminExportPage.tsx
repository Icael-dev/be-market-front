import { useState } from 'react';
import { motion } from 'framer-motion';
import { fetchAdminExport } from '../../services/admin';
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
      const rows = await fetchAdminExport(type);
      let data: Record<string, unknown>[] = [];
      switch (type) {
        case 'orders':
          data = rows.map(o => ({ 'Numero': o.order_number, 'Statut': o.status, 'Paiement': o.payment_status, 'Total': o.total, 'Date': format(new Date(String(o.created_at)), 'dd/MM/yyyy') }));
          break;
        case 'customers':
          data = rows.map(p => ({ 'Nom': p.full_name || '', 'Email': p.email || '', 'Telephone': p.phone || '', 'Inscrit': format(new Date(String(p.created_at)), 'dd/MM/yyyy') }));
          break;
        case 'products':
          data = rows.map(p => ({ 'Nom': p.name, 'Prix': p.price, 'Stock': p.stock, 'Actif': p.is_active ? 'Oui' : 'Non' }));
          break;
        case 'newsletter':
          data = rows.map(s => ({ 'Email': s.email, 'Actif': s.is_active ? 'Oui' : 'Non', 'Date': s.subscribed_at ? format(new Date(String(s.subscribed_at)), 'dd/MM/yyyy') : '' }));
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8"><h1 className="text-2xl font-bold dark:text-white">Export de donnees</h1><p className="dark:text-gray-400">Exportez vos donnees au format CSV</p></motion.div>
        <div className="grid md:grid-cols-2 gap-4">{options.map((opt, i) => (
          <motion.div key={opt.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}           className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 rounded-xl dark:bg-blue-900/30 flex items-center justify-center"><FileSpreadsheet className="w-6 h-6 dark:text-blue-400" /></div><div><h3 className="font-bold dark:text-white">{opt.label}</h3><p className="text-sm dark:text-gray-400">{opt.desc}</p></div></div>
            <button onClick={() => handleExport(opt.id)} disabled={exporting !== null} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50">{exporting === opt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : success === opt.id ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Download className="w-4 h-4" />}{exporting === opt.id ? 'Export...' : success === opt.id ? 'Exporte !' : 'Exporter CSV'}</button>
          </motion.div>
        ))}</div>
      </div>
    </AdminLayout>
  );
}
