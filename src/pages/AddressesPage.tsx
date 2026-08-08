import { useState, useEffect, useCallback } from 'react';
import { logger } from '../lib/logger';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import type { Address } from '../types';
import { MapPin, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { fetchAddresses, createAddress, updateAddress, deleteAddress } from '../services/address';
import { InputField } from '../components/ui/FormField';
import { ConfirmDialog } from '../components/admin/ConfirmDialog';
import { useEscape, useEnter } from '../hooks/useKeyPress';

type AddressErrors = Partial<Record<'full_name' | 'phone' | 'address_line1' | 'city', string>>;

const validateAddress = (data: typeof initialForm): AddressErrors => {
  const errors: AddressErrors = {};
  if (!data.full_name.trim()) errors.full_name = 'Le nom complet est requis';
  if (!data.phone.trim()) errors.phone = 'Le telephone est requis';
  else if (!/^[+\d][\d\s()-]{7,}$/.test(data.phone.trim())) errors.phone = 'Numero de telephone invalide';
  if (!data.address_line1.trim()) errors.address_line1 = "L'adresse est requise";
  if (!data.city.trim()) errors.city = 'La ville est requise';
  return errors;
};

const initialForm = {
  label: '',
  full_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: 'Lome',
  region: 'Maritime',
  country: 'Togo',
  postal_code: '',
  is_default: false
};

export function AddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState<AddressErrors>({});

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);

   useEscape(() => { setShowAddForm(false); setEditingId(null); }, showAddForm || !!editingId);
   useEnter(() => { if (showAddForm) handleAddAddress(); }, showAddForm);

   const loadAddresses = useCallback(async () => {
     if (!user) return;

     try {
       const data = await fetchAddresses();
       setAddresses(data);
     } catch (error) {
       logger.error('Failed to load addresses:', error);
     }
   }, [user]);

   useEffect(() => {
     loadAddresses();
   }, [loadAddresses]);

  const handleAddAddress = async () => {
    if (!user) return;

    const validationErrors = validateAddress(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      await createAddress({
        user_id: user.id,
        ...formData,
        postal_code: formData.postal_code || null,
        is_default: addresses.length === 0 || formData.is_default
      });
      await loadAddresses();
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      logger.error('Failed to add address:', error);
    }
  };

  const handleUpdateAddress = async (addressId: string) => {
    if (!user) return;

    const validationErrors = validateAddress(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      await updateAddress(addressId, {
        ...formData,
        user_id: user.id
      });
      await loadAddresses();
      setEditingId(null);
      resetForm();
    } catch (error) {
      logger.error('Failed to update address:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmTargetId) return;
    try {
      await deleteAddress(confirmTargetId);
      setAddresses(prev => prev.filter(a => a.id !== confirmTargetId));
    } catch (error) {
      logger.error('Failed to delete address:', error);
    } finally {
      setConfirmOpen(false);
      setConfirmTargetId(null);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setErrors({});
  };

  const startEditing = (address: Address) => {
    setEditingId(address.id);
    setErrors({});
    setFormData({
      label: address.label || '',
      full_name: address.full_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      region: address.region || '',
      country: address.country,
      postal_code: address.postal_code || '',
      is_default: address.is_default
    });
  };

  return (
    <div className="min-h-screen page-bg">
      <div className="page-header">
        <div className="page-section py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold dark:text-white">Mes adresses</h1>
            <p className="dark:text-gray-500 mt-1">
              Gerez vos adresses de livraison
            </p>
          </motion.div>
        </div>
      </div>

      <div className="page-section py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="flex items-center gap-2 btn-primary"
          >
            <Plus className="w-5 h-5" />
            Ajouter une adresse
          </button>
        </motion.div>

        <AnimatePresence>
          {addresses.length === 0 && !showAddForm ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-12 text-center"
            >
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 dark:text-gray-500" />
              </div>
              <h2 className="text-lg font-bold dark:text-white mb-2">
                Aucune adresse
              </h2>
              <p className="dark:text-gray-400 mb-6">
                Ajoutez une adresse de livraison
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {addresses.map((address, index) => (
                  <motion.div
                    key={address.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="card p-6"
                  >
                    {editingId === address.id ? (
                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <InputField
                            name="edit_full_name"
                            label="Nom complet"
                            required
                            autoComplete="name"
                            value={formData.full_name}
                            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                            error={errors.full_name}
                          />
                          <InputField
                            name="edit_phone"
                            label="Telephone"
                            required
                            type="tel"
                            autoComplete="tel"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            error={errors.phone}
                          />
                        </div>

                        <InputField
                          name="edit_address_line1"
                          label="Adresse"
                          required
                          autoComplete="street-address"
                          value={formData.address_line1}
                          onChange={e => setFormData({ ...formData, address_line1: e.target.value })}
                          error={errors.address_line1}
                          placeholder="Quartier, Rue, Numero"
                        />

                        <div className="grid sm:grid-cols-2 gap-4">
                          <InputField
                            name="edit_city"
                            label="Ville"
                            required
                            autoComplete="address-level2"
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                            error={errors.city}
                          />
                          <InputField
                            name="edit_region"
                            label="Region"
                            value={formData.region}
                            onChange={e => setFormData({ ...formData, region: e.target.value })}
                          />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={() => handleUpdateAddress(address.id)}
                            className="flex items-center gap-2 btn-primary"
                          >
                            <Check className="w-4 h-4" />
                            Enregistrer
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              resetForm();
                            }}
                            className="px-6 py-2.5 border dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:dark:bg-gray-900 transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center dark:text-primary-400 mt-1">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold dark:text-white">{address.full_name}</p>
                              {address.is_default && (
                                <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400 text-xs font-medium rounded-full">
                                  Defaut
                                </span>
                              )}
                            </div>
                            <p className="dark:text-gray-500 mt-1">{address.phone}</p>
                            <p className="dark:text-gray-500 mt-1">
                              {address.address_line1}
                              {address.address_line2 && `, ${address.address_line2}`}
                            </p>
                            <p className="dark:text-gray-500">
                              {address.city}, {address.region} {address.country}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditing(address)}
                            className="p-2 hover:bg-gray-50 hover:dark:bg-gray-800 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4 dark:text-gray-500" />
                          </button>
                          {!address.is_default && (
                          <button
                            onClick={() => { setConfirmTargetId(address.id); setConfirmOpen(true); }}
                            className="p-2 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {showAddForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="card p-6"
                  >
                    <h3 className="font-bold dark:text-white mb-4">Nouvelle adresse</h3>

                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <InputField
                          name="add_full_name"
                          label="Nom complet"
                          required
                          autoComplete="name"
                          value={formData.full_name}
                          onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                          error={errors.full_name}
                        />
                        <InputField
                          name="add_phone"
                          label="Telephone"
                          required
                          type="tel"
                          autoComplete="tel"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          error={errors.phone}
                        />
                      </div>

                      <InputField
                        name="add_address_line1"
                        label="Adresse"
                        required
                        autoComplete="street-address"
                        value={formData.address_line1}
                        onChange={e => setFormData({ ...formData, address_line1: e.target.value })}
                        error={errors.address_line1}
                        placeholder="Quartier, Rue, Numero"
                      />

                      <div className="grid sm:grid-cols-2 gap-4">
                        <InputField
                          name="add_city"
                          label="Ville"
                          required
                          autoComplete="address-level2"
                          value={formData.city}
                          onChange={e => setFormData({ ...formData, city: e.target.value })}
                          error={errors.city}
                        />
                        <InputField
                          name="add_region"
                          label="Region"
                          value={formData.region}
                          onChange={e => setFormData({ ...formData, region: e.target.value })}
                        />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          id="address-is-default"
                          name="is_default"
                          checked={formData.is_default}
                          onChange={e => setFormData({ ...formData, is_default: e.target.checked })}
                           className="w-4 h-4 dark:text-primary-400 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm dark:text-gray-500">
                          Definir comme adresse par defaut
                        </span>
                      </label>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleAddAddress}
                          className="flex items-center gap-2 btn-primary"
                        >
                          <Check className="w-4 h-4" />
                          Enregistrer
                        </button>
                        <button
                          onClick={() => {
                            setShowAddForm(false);
                            resetForm();
                          }}
                          className="px-6 py-2.5 border dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:dark:bg-gray-900 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setConfirmTargetId(null); }}
        onConfirm={handleConfirmDelete}
        title="Supprimer cette adresse ?"
        message="Cette action est irreversible."
        variant="danger"
      />
    </div>
  );
}
