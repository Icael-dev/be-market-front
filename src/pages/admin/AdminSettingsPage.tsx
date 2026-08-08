import { toast } from 'react-hot-toast';
import { logger } from '../../lib/logger';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchAdminSettings, updateAdminSettings } from '../../services/admin';
import { Settings, Save, Loader2 } from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { MobileNotOptimizedBanner } from '../../components/admin/MobileNotOptimizedBanner';

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string | number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await fetchAdminSettings();
      setSettings(data as unknown as Record<string, string | number>);
    } catch (error) {
      logger.error('Settings fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const payload: Record<string, unknown> = {};
      for (const key of Object.keys(settings)) {
        const value = (settings as Record<string, unknown>)[key];
        if (value === '' || value === null || value === undefined) continue;
        if (key === 'shipping_fee' || key === 'free_shipping_threshold' || key === 'tax_rate') {
          const n = Number(value);
          payload[key] = Number.isFinite(n) ? n : null;
        } else {
          payload[key] = value;
        }
      }
      await updateAdminSettings(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      logger.error('Settings save error:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const settingsConfig = [
    {
      group: 'Livraison',
      items: [
        { key: 'shipping_fee', label: 'Frais de livraison (FCFA)', type: 'number' },
        { key: 'free_shipping_threshold', label: 'Seuil livraison gratuite (FCFA)', type: 'number' }
      ]
    },
    {
      group: 'Taxes',
      items: [
        { key: 'tax_rate', label: 'Taux de taxe (%)', type: 'number' }
      ]
    },
    {
      group: 'Fidelite',
      items: [
        { key: 'loyalty_points_threshold', label: 'Seuil de depense pour utiliser les points (FCFA)', type: 'number' }
      ]
    },
    {
      group: 'Boutique',
      items: [
        { key: 'store_name', label: 'Nom de la boutique', type: 'text' },
        { key: 'store_email', label: 'Email de contact', type: 'email' },
        { key: 'store_phone', label: 'Telephone de contact', type: 'tel' }
      ]
    }
  ];

  return (
    <>
      <MobileNotOptimizedBanner />
      <div>
        <PageHeader
          title="Configuration"
          subtitle="Parametres de la boutique"
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <span className="text-green-200">Sauvegarde !</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Sauvegarder
              </>
            )}
          </button>
        </PageHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {settingsConfig.map(group => (
              <motion.div
                key={group.group}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6"
              >
                <h2 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 dark:text-gray-500" />
                  {group.group}
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  {group.items.map(item => (
                    <div key={item.key}>
                      <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                        {item.label}
                      </label>
                       <input
                         id={`setting-${item.key}`}
                         name={item.key}
                         type={item.type}
                         value={settings[item.key] || ''}
                         onChange={e => handleChange(item.key, e.target.value)}
                         className="w-full px-4 py-3 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                       />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
