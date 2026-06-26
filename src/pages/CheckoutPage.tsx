import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
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

  const [newAddress, setNewAddress] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address_line1: '',
    address_line2: '',
    city: 'Lome',
    region: 'Maritime',
    country: 'Togo'
  });

  const [useNewAddress, setUseNewAddress] = useState(true);

  const shippingFee = total > 50000 ? 0 : 2500;
  const grandTotal = total + shippingFee;

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

    fetchAddresses();
  }, [user, items]);

  const fetchAddresses = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });

    if (data && data.length > 0) {
      setAddresses(data as Address[]);
      const defaultAddress = data.find(a => a.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        setUseNewAddress(false);
      }
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const shippingAddress = useNewAddress
        ? newAddress
        : addresses.find(a => a.id === selectedAddressId);

      if (!shippingAddress) {
        setLoading(false);
        return;
      }

      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: 'pending',
          payment_status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
          payment_method: paymentMethod,
          subtotal: total,
          shipping_fee: shippingFee,
          total: grandTotal,
          shipping_address: shippingAddress,
          notes
        })
        .select()
        .single();

      if (orderError || !order) {
        throw new Error('Erreur lors de la creation de la commande');
      }

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product?.name || 'Produit',
        product_sku: item.product?.sku || null,
        price: item.product?.price || 0,
        quantity: item.quantity,
        total: (item.product?.price || 0) * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw new Error('Erreur lors de l\'ajout des articles');
      }

      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          payment_method: paymentMethod,
          amount: grandTotal,
          status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
          phone_number: paymentMethod !== 'cash_on_delivery' ? phoneNumber : null
        });

      if (paymentError) {
        console.error('Payment insert error:', paymentError);
      }

      if (useNewAddress && user) {
        await supabase.from('addresses').insert({
          user_id: user.id,
          ...newAddress,
          is_default: addresses.length === 0
        });
      }

      await clearCart();
      navigate(`/order-success/${order.id}`);
    } catch (error) {
      console.error('Order error:', error);
      alert('Erreur lors de la commande. Veuillez reessayer.');
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <Link to="/cart" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Retour au panier</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Commande</h1>
            <div className="w-16" />
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors',
                  index < currentStepIndex
                    ? 'bg-green-500 text-white'
                    : index === currentStepIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                )}>
                  {index < currentStepIndex ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={cn(
                  'ml-2 text-sm font-medium hidden sm:block',
                  index <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'
                )}>
                  {s.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={cn(
                    'w-8 sm:w-16 lg:w-24 h-0.5 mx-2',
                    index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-2xl border border-gray-100 p-6"
                >
                  <h2 className="text-lg font-bold text-gray-900 mb-6">
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
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{address.full_name}</p>
                              <p className="text-sm text-gray-500">{address.phone}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {address.address_line1}
                                {address.address_line2 && `, ${address.address_line2}`}
                              </p>
                              <p className="text-sm text-gray-500">
                                {address.city}, {address.region || ''} {address.country}
                              </p>
                            </div>
                            {address.is_default && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
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
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <p className="font-medium text-gray-900">Nouvelle adresse</p>
                    </button>
                  </div>

                  {useNewAddress && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 mt-4"
                    >
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom complet *
                          </label>
                          <input
                            type="text"
                            value={newAddress.full_name}
                            onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telephone *
                          </label>
                          <input
                            type="tel"
                            value={newAddress.phone}
                            onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="+228 XX XX XX XX"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Adresse *
                        </label>
                        <input
                          type="text"
                          value={newAddress.address_line1}
                          onChange={e => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          placeholder="Quartier, Rue, Numero"
                          required
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ville
                          </label>
                          <input
                            type="text"
                            value={newAddress.city}
                            onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Region
                          </label>
                          <input
                            type="text"
                            value={newAddress.region}
                            onChange={e => setNewAddress({ ...newAddress, region: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => setStep('payment')}
                      disabled={(!useNewAddress && !selectedAddressId) || (useNewAddress && !newAddress.address_line1)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="bg-white rounded-2xl border border-gray-100 p-6"
                >
                  <h2 className="text-lg font-bold text-gray-900 mb-6">
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
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          method.color === 'yellow' && 'bg-yellow-100 text-yellow-700',
                          method.color === 'blue' && 'bg-blue-100 text-blue-700',
                          method.color === 'green' && 'bg-green-100 text-green-700'
                        )}>
                          <method.icon className="w-6 h-6" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-medium text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-500">{method.description}</p>
                        </div>
                        <div className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                          paymentMethod === method.id
                            ? 'border-blue-600 bg-blue-600'
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numero de telephone {paymentMethod === 'tmoney' ? 'Tmoney' : 'Flooz'}
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="+228 XX XX XX XX"
                      />
                    </motion.div>
                  )}

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="Instructions speciales pour la livraison..."
                    />
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between">
                    <button
                      onClick={() => setStep('shipping')}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retour
                    </button>
                    <button
                      onClick={() => setStep('confirm')}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
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
                  className="bg-white rounded-2xl border border-gray-100 p-6"
                >
                  <h2 className="text-lg font-bold text-gray-900 mb-6">
                    Confirmation de la commande
                  </h2>

                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Adresse de livraison</h3>
                        <p className="text-gray-900">
                          {useNewAddress
                            ? `${newAddress.full_name}, ${newAddress.phone}`
                            : addresses.find(a => a.id === selectedAddressId)?.full_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {useNewAddress
                            ? newAddress.address_line1
                            : addresses.find(a => a.id === selectedAddressId)?.address_line1}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Paiement</h3>
                        <p className="text-gray-900">
                          {paymentMethods.find(m => m.id === paymentMethod)?.name}
                        </p>
                        {paymentMethod !== 'cash_on_delivery' && phoneNumber && (
                          <p className="text-sm text-gray-500">{phoneNumber}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Articles ({count})</h3>
                      <div className="space-y-2">
                        {items.map(item => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={item.product?.images?.[0]}
                                alt={item.product?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.product?.name}
                              </p>
                              <p className="text-xs text-gray-500">x{item.quantity}</p>
                            </div>
                            <p className="text-sm font-medium">
                              {formatPrice((item.product?.price || 0) * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between">
                    <button
                      onClick={() => setStep('payment')}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retour
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
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
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                recapitulatif
              </h2>

              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product?.images?.[0]}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatPrice((item.product?.price || 0) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                    {shippingFee === 0 ? 'Gratuite' : formatPrice(shippingFee)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-lg font-bold text-gray-900">
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
