import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchAdminSettings, updateAdminSettings } from '../../services/admin';
import { Settings, Save, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';

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
      console.error('Settings fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      await updateAdminSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Settings save error:', error);
      alert('Erreur lors de la sauvegarde');
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
      group: 'Boutique',
      items: [
        { key: 'store_name', label: 'Nom de la boutique', type: 'text' },
        { key: 'store_email', label: 'Email de contact', type: 'email' },
        { key: 'store_phone', label: 'Telephone de contact', type: 'tel' }
      ]
    }
  ];

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold dark:text-white">Configuration</h1>
            <p className="dark:text-gray-500 mt-1">Parametres de la boutique</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
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
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {settingsConfig.map(group => (
              <motion.div
                key={group.group}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6"
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
                        type={item.type}
                        value={settings[item.key] || ''}
                        onChange={e => handleChange(item.key, e.target.value)}
                        className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
