import { toast } from "react-hot-toast";
import { logger } from "../../lib/logger";
import { useState } from "react";
import { motion } from "framer-motion";
import { fetchAdminExport } from "../../services/admin";
import { PageHeader } from "../../components/admin/PageHeader";
import { MobileNotOptimizedBanner } from "../../components/admin/MobileNotOptimizedBanner";
import { Download, FileSpreadsheet, Loader2, CheckCircle } from "lucide-react";
import { format } from "date-fns";

const options = [
  { id: "orders", label: "Commandes", desc: "Exporte toutes les commandes" },
  { id: "customers", label: "Clients", desc: "Liste des clients inscrits" },
  { id: "products", label: "Produits", desc: "Catalogue complet" },
  { id: "newsletter", label: "Newsletter", desc: "Liste des abonnes" },
];

export function AdminExportPage() {
  const [exporting, setExporting] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = async (type: string) => {
    setExporting(type);
    setSuccess(null);
    try {
      const blob = await fetchAdminExport(type);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess(type);
    } catch (error) {
      logger.error("Export error:", error);
      toast.error("Erreur lors de l'export.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader title="Export de donnees" subtitle="Exportez vos donnees au format CSV" />
        <div className="grid gap-4 md:grid-cols-2">
          {options.map((opt, i) => (
            <motion.div
              key={opt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg dark:bg-primary-900/30">
                  <FileSpreadsheet className="h-6 w-6 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-bold dark:text-white">{opt.label}</h3>
                  <p className="text-sm dark:text-gray-400">{opt.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleExport(opt.id)}
                disabled={exporting !== null}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {exporting === opt.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : success === opt.id ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {exporting === opt.id
                  ? "Export..."
                  : success === opt.id
                    ? "Exporte !"
                    : "Exporter CSV"}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
