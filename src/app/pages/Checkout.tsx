import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { 
  ShieldCheck, 
  Truck, 
  MapPin, 
  Plus, 
  ArrowLeft, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Clock,
  Package,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import { getShippingQuotes, isValidIndianPincode, resolvePincodeInfo, ShippingCourierOption } from '../../services/shipping';
import { openRazorpayCheckout } from '../../lib/razorpay';
import { createOrder, confirmOrderPayment } from '../../services/orders';
import type { Database } from '../../types/supabase';

type Address = Database['public']['Tables']['addresses']['Row'];

export function Checkout() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, openAuthModal } = useAuth();
  const { items, subtotalPaise, refreshCart, clearCart } = useCart();

  // State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // New Address Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [saveAddressToBook, setSaveAddressToBook] = useState(true);

  // Shipping & Delivery Selection
  const [courierOptions, setCourierOptions] = useState<ShippingCourierOption[]>([]);
  const [selectedCourierId, setSelectedCourierId] = useState<string>('delhivery-standard');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirect to products if cart is empty and not loading
  useEffect(() => {
    if (!authLoading && items.length === 0) {
      navigate('/products');
    }
  }, [items, authLoading, navigate]);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      openAuthModal();
    }
  }, [user, authLoading, openAuthModal]);

  // Pre-fill profile info
  useEffect(() => {
    if (profile) {
      if (!name && profile.full_name) setName(profile.full_name);
      if (!phone && profile.phone) setPhone(profile.phone);
    }
  }, [profile]);

  // Fetch saved addresses
  useEffect(() => {
    async function loadAddresses() {
      if (!user) return;
      try {
        setLoadingAddresses(true);
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });

        if (!error && data) {
          setAddresses(data);
          if (data.length > 0) {
            const defaultAddr = data.find((a) => a.is_default) || data[0];
            setSelectedAddressId(defaultAddr.id);
            setPincode(defaultAddr.pincode);
          } else {
            setIsAddingNewAddress(true);
          }
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    }
    loadAddresses();
  }, [user]);

  // Active PIN code to compute courier rates
  const activePincode = selectedAddressId && !isAddingNewAddress
    ? addresses.find((a) => a.id === selectedAddressId)?.pincode || ''
    : pincode;

  // Update shipping options whenever cart subtotal or active pincode changes
  useEffect(() => {
    const quotes = getShippingQuotes(subtotalPaise, activePincode);
    setCourierOptions(quotes);
  }, [subtotalPaise, activePincode]);

  // Auto-fill state if Gujarat pincode detected
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    if (val.length === 6) {
      const info = resolvePincodeInfo(val);
      if (info.state && !state) {
        setState(info.state);
      }
    }
  };

  // Selected courier calculation
  const selectedCourier = courierOptions.find((c) => c.id === selectedCourierId) || courierOptions[0];
  const shippingChargePaise = selectedCourier?.chargePaise || 0;
  const totalAmountPaise = subtotalPaise + shippingChargePaise;

  // Final Address Object resolution
  const resolveCheckoutAddress = () => {
    if (selectedAddressId && !isAddingNewAddress) {
      const saved = addresses.find((a) => a.id === selectedAddressId);
      if (saved) {
        return {
          name: saved.name,
          phone: saved.phone,
          line1: saved.line1,
          line2: saved.line2 || '',
          city: saved.city,
          state: saved.state,
          pincode: saved.pincode,
        };
      }
    }

    // From new form
    if (!name.trim()) throw new Error('Please enter your full name');
    if (!phone.trim() || phone.trim().length < 10) throw new Error('Please enter a valid 10-digit mobile number');
    if (!line1.trim()) throw new Error('Please enter your street address / flat number');
    if (!city.trim()) throw new Error('Please enter your city');
    if (!state.trim()) throw new Error('Please enter your state');
    if (!isValidIndianPincode(pincode)) throw new Error('Please enter a valid 6-digit Indian PIN code');

    return {
      name: name.trim(),
      phone: phone.trim(),
      line1: line1.trim(),
      line2: line2.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
    };
  };

  // Place Order & Pay Handler
  const handlePlaceOrderAndPay = async () => {
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      if (!user) {
        openAuthModal();
        setIsProcessing(false);
        return;
      }

      const shippingAddress = resolveCheckoutAddress();

      // If user selected to save address to address book
      if (isAddingNewAddress && saveAddressToBook) {
        try {
          await supabase.from('addresses').insert({
            user_id: user.id,
            name: shippingAddress.name,
            phone: shippingAddress.phone,
            line1: shippingAddress.line1,
            line2: shippingAddress.line2 || null,
            city: shippingAddress.city,
            state: shippingAddress.state,
            pincode: shippingAddress.pincode,
            is_default: addresses.length === 0,
          });
        } catch (e) {
          console.warn('Address saving skipped:', e);
        }
      }

      // 1. Create order (validates stock & calculates official total in paise server-side)
      const { order, razorpayKeyId } = await createOrder({
        shippingAddress,
        courier: selectedCourier?.name || 'Delhivery Standard',
        shippingPaise: shippingChargePaise,
        notes: deliveryNotes.trim() || undefined,
      });

      // 2. Trigger Razorpay Checkout modal
      const paymentResponse = await openRazorpayCheckout({
        amountPaise: order.total_paise,
        orderNo: order.order_no,
        orderId: order.id,
        razorpayOrderId: order.razorpay_order_id,
        customerName: shippingAddress.name,
        customerEmail: user.email || '',
        customerPhone: shippingAddress.phone,
        keyId: razorpayKeyId || undefined,
      });

      // 3. Confirm and verify payment server-side (decrements stock, records payment, clears cart)
      await confirmOrderPayment({
        orderId: order.id,
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpayOrderId: paymentResponse.razorpay_order_id,
        razorpaySignature: paymentResponse.razorpay_signature,
      });

      // 4. Refresh local cart and navigate to order confirmation
      await refreshCart();
      navigate(`/order-confirmation/${order.order_no}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream/40 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#E8E0D5]">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-primary transition-colors font-body"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full font-body">
            <ShieldCheck size={16} />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-600" />
            <div className="text-sm font-body">
              <strong className="font-semibold block mb-0.5">Payment or Order Notice</strong>
              {errorMessage}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Delivery Address & Shipping Selection */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Delivery Address */}
            <div className="bg-white rounded-2xl p-6 border border-[#E8E0D5] shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h2 className="font-heading font-bold text-xl text-text-dark">
                    Delivery Address
                  </h2>
                </div>

                {addresses.length > 0 && !isAddingNewAddress && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewAddress(true);
                      setSelectedAddressId(null);
                    }}
                    className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 font-body"
                  >
                    <Plus size={14} /> Add New Address
                  </button>
                )}
              </div>

              {/* Saved Addresses List */}
              {addresses.length > 0 && !isAddingNewAddress ? (
                <div className="space-y-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          setPincode(addr.pincode);
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-[#E8E0D5] hover:border-text-muted/40 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-body text-text-dark text-sm">
                                {addr.name}
                              </span>
                              {addr.is_default && (
                                <span className="text-[10px] uppercase font-bold bg-[#D8CEC2]/50 text-text-dark px-1.5 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-text-muted font-body mt-1">
                              {addr.line1}
                              {addr.line2 ? `, ${addr.line2}` : ''}
                            </p>
                            <p className="text-xs text-text-muted font-body">
                              {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                            </p>
                            <p className="text-xs text-text-dark font-medium font-body mt-1">
                              Phone: {addr.phone}
                            </p>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected
                                ? 'border-primary bg-primary text-white'
                                : 'border-[#D8CEC2]'
                            }`}
                          >
                            {isSelected && <CheckCircle2 size={12} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {/* New Address Form */}
              {(isAddingNewAddress || addresses.length === 0) && (
                <div className="space-y-4 pt-2">
                  {addresses.length > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-text-muted font-body">
                        Enter delivery details below:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewAddress(false);
                          if (addresses[0]) setSelectedAddressId(addresses[0].id);
                        }}
                        className="text-xs font-semibold text-text-muted hover:text-text-dark font-body underline"
                      >
                        Cancel & pick saved address
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-dark font-body mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEC2] text-sm font-body focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-dark font-body mb-1">
                        10-Digit Mobile Number *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEC2] text-sm font-body focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-dark font-body mb-1">
                      Flat, House No., Building, Apartment *
                    </label>
                    <input
                      type="text"
                      value={line1}
                      onChange={(e) => setLine1(e.target.value)}
                      placeholder="e.g. 402, Green Orchid Apartments"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEC2] text-sm font-body focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-dark font-body mb-1">
                      Area, Street, Sector, Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={line2}
                      onChange={(e) => setLine2(e.target.value)}
                      placeholder="e.g. Near City Garden, Vesu"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEC2] text-sm font-body focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-dark font-body mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={handlePincodeChange}
                        placeholder="395006"
                        maxLength={6}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEC2] text-sm font-body focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-dark font-body mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Surat"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEC2] text-sm font-body focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-dark font-body mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Gujarat"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEC2] text-sm font-body focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveAddressToBook}
                        onChange={(e) => setSaveAddressToBook(e.target.checked)}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-xs text-text-muted font-body">
                        Save this address to my profile for future orders
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Shipping & Delivery Method */}
            <div className="bg-white rounded-2xl p-6 border border-[#E8E0D5] shadow-xs">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h2 className="font-heading font-bold text-xl text-text-dark">
                    Shipping Method
                  </h2>
                  <p className="text-xs text-text-muted font-body">
                    Automated multi-carrier logistics with direct courier AWB tracking
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {courierOptions.map((courier) => {
                  const isSelected = selectedCourierId === courier.id;
                  return (
                    <div
                      key={courier.id}
                      onClick={() => setSelectedCourierId(courier.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-[#E8E0D5] hover:border-text-muted/40 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'bg-primary text-white' : 'bg-bg-cream text-text-muted'
                          }`}
                        >
                          <Truck size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-body text-sm text-text-dark">
                              {courier.name}
                            </span>
                            {courier.chargePaise === 0 && (
                              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                Free
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-text-muted font-body mt-0.5">
                            <Clock size={12} />
                            <span>Estimated: {courier.deliveryDays}</span>
                          </div>
                          <p className="text-[11px] text-text-muted font-body mt-0.5">
                            {courier.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-sm font-body text-primary">
                          {courier.chargePaise === 0 ? 'FREE' : `₹${courier.chargePaise / 100}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery Instructions (Optional) */}
              <div className="mt-4 pt-4 border-t border-[#E8E0D5]">
                <label className="block text-xs font-semibold text-text-dark font-body mb-1">
                  Delivery Instructions / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Leave package with security gate if unavailable"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D8CEC2] text-xs font-body focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Step 3: Payment Method Preview */}
            <div className="bg-white rounded-2xl p-6 border border-[#E8E0D5] shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h2 className="font-heading font-bold text-xl text-text-dark">
                    Payment Gateway
                  </h2>
                  <p className="text-xs text-text-muted font-body">
                    Instant online payment via Razorpay
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3.5">
                <CreditCard className="text-primary shrink-0 mt-0.5" size={20} />
                <div className="space-y-1">
                  <span className="font-bold text-sm text-text-dark font-body block">
                    Razorpay Secure Online Checkout
                  </span>
                  <p className="text-xs text-text-muted font-body">
                    Supports <strong>UPI</strong> (Google Pay, PhonePe, Paytm, BHIM), <strong>Credit/Debit Cards</strong> (Visa, Mastercard, RuPay), <strong>NetBanking</strong> (50+ banks), and Wallets.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Pay CTA */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 border border-[#E8E0D5] shadow-sm sticky top-24">
              <h3 className="font-heading font-bold text-xl text-text-dark pb-4 border-b border-[#E8E0D5] flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-bold font-body bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                  {items.reduce((acc, i) => acc + i.qty, 0)} Items
                </span>
              </h3>

              {/* Items List */}
              <div className="divide-y divide-[#E8E0D5] max-h-72 overflow-y-auto py-2 my-2">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <img
                      src={item.hero_image || '/placeholder.png'}
                      alt={item.product_name}
                      className="w-12 h-12 rounded-lg object-cover bg-bg-cream shrink-0 border border-[#E8E0D5]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-body font-bold text-xs text-text-dark truncate">
                        {item.product_name}
                      </h4>
                      <p className="text-[11px] text-text-muted font-body">
                        {item.variant_label} × {item.qty}
                      </p>
                    </div>
                    <span className="font-body font-bold text-xs text-primary shrink-0">
                      ₹{(item.price_paise * item.qty) / 100}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-4 border-t border-[#E8E0D5] space-y-2.5 font-body text-sm">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span className="font-medium text-text-dark">₹{subtotalPaise / 100}</span>
                </div>

                <div className="flex justify-between text-text-muted">
                  <span className="flex items-center gap-1.5">
                    Shipping ({selectedCourier?.carrier})
                  </span>
                  <span className="font-medium text-text-dark">
                    {shippingChargePaise === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      `₹${shippingChargePaise / 100}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-text-muted">
                  <span>GST (Included)</span>
                  <span className="italic">5% Included</span>
                </div>

                <div className="pt-3 border-t border-[#E8E0D5] flex justify-between items-baseline">
                  <span className="font-heading font-bold text-lg text-text-dark">
                    Total Payable
                  </span>
                  <div className="text-right">
                    <span className="font-body font-bold text-2xl text-primary block">
                      ₹{(totalAmountPaise / 100).toFixed(2)}
                    </span>
                    <span className="text-[11px] text-text-muted font-body">
                      Inclusive of all taxes
                    </span>
                  </div>
                </div>
              </div>

              {/* Pay CTA */}
              <button
                type="button"
                onClick={handlePlaceOrderAndPay}
                disabled={isProcessing || items.length === 0}
                className="w-full mt-6 py-4 bg-primary text-white font-body font-bold text-base rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/25 flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Processing Secure Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    <span>Pay ₹{(totalAmountPaise / 100).toFixed(2)} with Razorpay</span>
                  </>
                )}
              </button>

              <div className="mt-4 pt-4 border-t border-[#E8E0D5]/70 flex items-center justify-center gap-4 text-[11px] text-text-muted font-body">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-600" /> 100% Secure
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Package size={14} className="text-primary" /> Multi-Carrier Shipping
                </span>
                <span>•</span>
                <span>GST Tax Invoice</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
