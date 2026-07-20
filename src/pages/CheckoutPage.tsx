import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { formatPrice, cn } from '../lib/utils';
import type { Address } from '../types';
import {
  CreditCard,
  Smartphone,
  Truck,
  ChevronRight,
  Check,
  ArrowLeft
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { InputField } from '../components/ui/FormField';
import { fetchAddresses, createAddress } from '../services/address';
import { placeOrder } from '../services/orders';
import { initiatePayment } from '../services/payments';
import { fetchLoyaltyPoints } from '../services/content';
import type { LoyaltyPoints } from '../types';

type Step = 'shipping' | 'payment' | 'confirm';
type PaymentMethod = 'tmoney' | 'flooz' | 'cash_on_delivery';

const paymentMethods = [
  {
    id: 'tmoney',
    name: 'Tmoney',
    description: 'Payez avec votre compte Tmoney',
    icon: Smartphone,
    color: 'yellow'
  },
  {
    id: 'flooz',
    name: 'Flooz',
    description: 'Payez avec votre compte Flooz',
    icon: CreditCard,
    color: 'blue'
  },
  {
    id: 'cash_on_delivery',
    name: 'Paiement a la livraison',
    description: 'Payez en especes a la reception',
    icon: Truck,
    color: 'green'
  }
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { items, total, count, clearCart } = useCart();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<Step>('shipping');
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tmoney');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loyaltyPoints, setLoyaltyPoints] = useState<LoyaltyPoints | null>(null);
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState(0);

  const [newAddress, setNewAddress] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address_line1: '',
    address_line2: '',
    city: 'Lome',
    region: 'Maritime',
    country: 'Togo',
    postal_code: '',
    is_default: false,
    label: ''
  });

  const [useNewAddress, setUseNewAddress] = useState(true);

  const shippingFee = total > 50000 ? 0 : 2500;
  const maxLoyaltyDiscount = Math.min(
    loyaltyPoints?.points || 0,
    Math.floor((total - (total > 50000 ? 0 : 2500)) / 50)
  );
  const loyaltyDiscount = Math.min(loyaltyPointsToRedeem * 50, total);
  const grandTotal = total + shippingFee - loyaltyDiscount;

  useEffect(() => {
    if (!user) {
      const redirect = searchParams.get('redirect');
      navigate(redirect || '/login', { replace: true });
      return;
    }

    if (items.length === 0) {
      navigate('/cart', { replace: true });
      return;
    }

    loadAddresses();
    loadLoyaltyPoints();
  }, [user, items]);

  const loadLoyaltyPoints = async () => {
    if (!user) return;
    try {
      const data = await fetchLoyaltyPoints();
      setLoyaltyPoints(data);
    } catch (error) {
      console.error('Failed to load loyalty points:', error);
    }
  };

  const loadAddresses = async () => {
    if (!user) return;

    try {
      const data = await fetchAddresses();
      setAddresses(data);
      const defaultAddress = data.find(a => a.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        setUseNewAddress(false);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  };

const handlePlaceOrder = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const shippingAddress = useNewAddress
        ? {
            full_name: newAddress.full_name,
            phone: newAddress.phone,
            address_line1: newAddress.address_line1,
            address_line2: newAddress.address_line2,
            city: newAddress.city,
            region: newAddress.region,
            country: newAddress.country,
            postal_code: newAddress.postal_code,
          }
        : {
            full_name: addresses.find(a => a.id === selectedAddressId)?.full_name,
            phone: addresses.find(a => a.id === selectedAddressId)?.phone,
            address_line1: addresses.find(a => a.id === selectedAddressId)?.address_line1,
            address_line2: addresses.find(a => a.id === selectedAddressId)?.address_line2,
            city: addresses.find(a => a.id === selectedAddressId)?.city,
            region: addresses.find(a => a.id === selectedAddressId)?.region,
            country: addresses.find(a => a.id === selectedAddressId)?.country,
            postal_code: addresses.find(a => a.id === selectedAddressId)?.postal_code,
          };

      if (!shippingAddress.full_name) {
        setLoading(false);
        return;
      }

      const order = await placeOrder({
        shipping_address: shippingAddress,
        billing_address: useNewAddress ? undefined : addresses.find(a => a.id === selectedAddressId) as Record<string, unknown> | undefined,
        payment_method: paymentMethod,
        notes,
        loyalty_points_to_redeem: loyaltyPointsToRedeem || undefined,
      });

      if (paymentMethod !== 'cash_on_delivery') {
        try {
          await initiatePayment(order.id, paymentMethod, shippingAddress.phone);
        } catch (paymentError) {
          console.error('Payment initiation error:', paymentError);
        }
      }

      if (useNewAddress && user) {
        await createAddress({
          user_id: user.id,
          ...newAddress,
          postal_code: newAddress.postal_code || null,
          is_default: addresses.length === 0 || newAddress.is_default,
          label: newAddress.label || null
        });
      }

      await clearCart();
      navigate(`/order-success/${order.id}`);
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Erreur lors de la commande. Veuillez reessayer.');
    } finally {
      setLoading(false);
    }
  };

  const steps: { id: Step; label: string }[] = [
    { id: 'shipping', label: 'Livraison' },
    { id: 'payment', label: 'Paiement' },
    { id: 'confirm', label: 'Confirmation' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="min-h-screen page-bg">
      <div className="page-header">
        <div className="page-section py-8">
          <div className="flex items-center justify-between mb-8">
            <Link to="/cart" className="flex items-center gap-2 dark:text-gray-500 hover:dark:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Retour au panier</span>
            </Link>
            <h1 className="text-2xl font-bold dark:text-white">Commande</h1>
            <div className="w-16" />
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors',
                  index < currentStepIndex
                    ? 'dark:bg-green-900/30 text-white'
                    : index === currentStepIndex
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                )}>
                  {index < currentStepIndex ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={cn(
                  'ml-2 text-sm font-medium hidden sm:block',
                  index <= currentStepIndex ? 'dark:text-white' : 'dark:text-gray-500'
                )}>
                  {s.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={cn(
                    'w-8 sm:w-16 lg:w-24 h-0.5 mx-2',
                    index < currentStepIndex ? 'bg-green-600 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-800'
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="page-section py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="card p-6"
                >
                  <h2 className="text-lg font-bold dark:text-white mb-6">
                    Adresse de livraison
                  </h2>

                  {addresses.length > 0 && (
                    <div className="mb-6 space-y-3">
                      {addresses.map(address => (
                        <button
                          key={address.id}
                          onClick={() => {
                            setSelectedAddressId(address.id);
                            setUseNewAddress(false);
                          }}
                          className={cn(
                            'w-full text-left p-4 rounded-xl border-2 transition-all',
                            !useNewAddress && selectedAddressId === address.id
                              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                              : 'dark:border-gray-700 dark:hover:border-gray-600'
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium dark:text-white">{address.full_name}</p>
                              <p className="text-sm dark:text-gray-500">{address.phone}</p>
                              <p className="text-sm dark:text-gray-500 mt-1">
                                {address.address_line1}
                                {address.address_line2 && `, ${address.address_line2}`}
                              </p>
                              <p className="text-sm dark:text-gray-500">
                                {address.city}, {address.region || ''} {address.country}
                              </p>
                            </div>
                            {address.is_default && (
                              <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full">
                                Defaut
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mb-4">
                    <button
                      onClick={() => setUseNewAddress(true)}
                      className={cn(
                        'w-full text-left p-4 rounded-xl border-2 transition-all',
                        useNewAddress
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                          : 'dark:border-gray-700 dark:hover:border-gray-600'
                      )}
                    >
                      <p className="font-medium dark:text-white">Nouvelle adresse</p>
                    </button>
                  </div>

                  {useNewAddress && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 mt-4"
                    >
                      <div className="grid sm:grid-cols-2 gap-4">
                        <InputField
                          name="checkout_full_name"
                          label="Nom complet"
                          required
                          autoComplete="name"
                          value={newAddress.full_name}
                          onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })}
                        />
                        <InputField
                          name="checkout_phone"
                          label="Telephone"
                          required
                          type="tel"
                          autoComplete="tel"
                          value={newAddress.phone}
                          onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                          placeholder="+228 XX XX XX XX"
                        />
                      </div>

                      <InputField
                        name="checkout_address_line1"
                        label="Adresse"
                        required
                        autoComplete="street-address"
                        value={newAddress.address_line1}
                        onChange={e => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                        placeholder="Quartier, Rue, Numero"
                      />

                      <div className="grid sm:grid-cols-2 gap-4">
                        <InputField
                          name="checkout_city"
                          label="Ville"
                          autoComplete="address-level2"
                          value={newAddress.city}
                          onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                        />
                        <InputField
                          name="checkout_region"
                          label="Region"
                          value={newAddress.region}
                          onChange={e => setNewAddress({ ...newAddress, region: e.target.value })}
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="mt-6 pt-6 border-t dark:border-gray-700 flex justify-end">
                    <button
                      onClick={() => setStep('payment')}
                      disabled={(!useNewAddress && !selectedAddressId) || (useNewAddress && !newAddress.address_line1)}
                      className="flex items-center gap-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continuer
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="card p-6"
                >
                  <h2 className="text-lg font-bold dark:text-white mb-6">
                    Mode de paiement
                  </h2>

                  <div className="space-y-3">
                    {paymentMethods.map(method => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                        className={cn(
                          'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
                          paymentMethod === method.id
                            ? 'border-primary-600 dark:bg-primary-900/30'
                            : 'dark:border-gray-700 dark:hover:border-gray-600'
                        )}
                      >
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          method.color === 'yellow' && 'bg-yellow-100 text-yellow-700',
                          method.color === 'blue' && 'bg-primary-100 text-primary-700',
                          method.color === 'green' && 'bg-green-100 text-green-700'
                        )}>
                          <method.icon className="w-6 h-6" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-medium dark:text-white">{method.name}</p>
                          <p className="text-sm dark:text-gray-500">{method.description}</p>
                        </div>
                        <div className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                          paymentMethod === method.id
                            ? 'border-primary-600 bg-primary-600'
                            : 'border-gray-300'
                        )}>
                          {paymentMethod === method.id && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {paymentMethod !== 'cash_on_delivery' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6"
                    >
                      <InputField
                        name="checkout_payment_phone"
                        label={`Numero de telephone ${paymentMethod === 'tmoney' ? 'Tmoney' : 'Flooz'}`}
                        type="tel"
                        autoComplete="tel"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        placeholder="+228 XX XX XX XX"
                      />
                    </motion.div>
                  )}

                  <div className="mt-6">
                    <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                      Notes (optionnel)
                    </label>
                    <textarea
                      id="checkout_notes"
                      name="checkout_notes"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      placeholder="Instructions speciales pour la livraison..."
                    />
                  </div>

                  <div className="mt-6 pt-6 border-t dark:border-gray-700 flex justify-between">
                    <button
                      onClick={() => setStep('shipping')}
                      className="flex items-center gap-2 dark:text-gray-500 hover:dark:text-white font-medium transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retour
                    </button>
                    <button
                      onClick={() => setStep('confirm')}
                      className="flex items-center gap-2 btn-primary"
                    >
                      Continuer
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="card p-6"
                >
                  <h2 className="text-lg font-bold dark:text-white mb-6">
                    Confirmation de la commande
                  </h2>

                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium dark:text-gray-500 mb-2">Adresse de livraison</h3>
                        <p className="dark:text-white">
                          {useNewAddress
                            ? `${newAddress.full_name}, ${newAddress.phone}`
                            : addresses.find(a => a.id === selectedAddressId)?.full_name}
                        </p>
                        <p className="text-sm dark:text-gray-500">
                          {useNewAddress
                            ? newAddress.address_line1
                            : addresses.find(a => a.id === selectedAddressId)?.address_line1}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium dark:text-gray-500 mb-2">Paiement</h3>
                        <p className="dark:text-white">
                          {paymentMethods.find(m => m.id === paymentMethod)?.name}
                        </p>
                        {paymentMethod !== 'cash_on_delivery' && phoneNumber && (
                          <p className="text-sm dark:text-gray-500">{phoneNumber}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium dark:text-gray-500 mb-2">Articles ({count})</h3>
                      <div className="space-y-2">
                        {items.map(item => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                              <img
                                src={item.product?.images?.[0]}
                                alt={item.product?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium dark:text-white truncate">
                                {item.product?.name}
                              </p>
                              <p className="text-xs dark:text-gray-500">x{item.quantity}</p>
                            </div>
                            <p className="text-sm font-medium">
                              {formatPrice((item.product?.effective_price ?? item.product?.price ?? 0) * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t dark:border-gray-700 flex justify-between">
                    <button
                      onClick={() => setStep('payment')}
                      className="flex items-center gap-2 dark:text-gray-500 hover:dark:text-white font-medium transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retour
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="flex items-center gap-2 btn-primary disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Traitement...
                        </>
                      ) : (
                        <>
                          Confirmer la commande
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-bold dark:text-white mb-6">
                recapitulatif
              </h2>

              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product?.images?.[0]}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium dark:text-white truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-xs dark:text-gray-500">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatPrice((item.product?.effective_price ?? item.product?.price ?? 0) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t dark:border-gray-700 space-y-3">
                <div className="flex justify-between dark:text-gray-500">
                  <span>Sous-total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between dark:text-gray-500">
                  <span>Livraison</span>
                  <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                    {shippingFee === 0 ? 'Gratuite' : formatPrice(shippingFee)}
                  </span>
                </div>

                {loyaltyPoints && loyaltyPoints.points > 0 && (
                  <div className="pt-3 border-t border-dashed dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Points de fidelite disponibles : {loyaltyPoints.points} ({formatPrice(loyaltyPoints.points * 50)} de reduction)
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max={maxLoyaltyDiscount}
                        value={loyaltyPointsToRedeem}
                        onChange={e => setLoyaltyPointsToRedeem(Math.max(0, Math.min(maxLoyaltyDiscount, parseInt(e.target.value || '0'))))}
                        className="w-24 px-3 py-2 border dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        = {formatPrice(loyaltyPointsToRedeem * 50)} de reduction
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between text-lg font-bold dark:text-white">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
