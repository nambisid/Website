import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineLockClosed, HiOutlineCheck } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getPublicConfig } from '../api/configApi';
import { createRazorpayOrder, verifyRazorpayPayment } from '../api/paymentApi';
import { createOrder } from '../api/orderApi';
import { formatCurrency } from '../utils/formatCurrency';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Must match server/src/utils/pricing.js (paise).
const FREE_SHIPPING_THRESHOLD = 99900; // ₹999
const FLAT_SHIPPING = 7900; // ₹79
const TAX_RATE = 0; // GST-inclusive pricing

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

// Load Razorpay's checkout script once, on demand.
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const initialAddress = {
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'IN',
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { cart, subtotal, fetchCart } = useCart();

  const [step, setStep] = useState('shipping'); // 'shipping' | 'payment'
  const [address, setAddress] = useState(initialAddress);
  const [errors, setErrors] = useState({});

  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [paying, setPaying] = useState(false);

  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;

  // Load public payment config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data } = await getPublicConfig();
        setConfig(data.data);
      } catch {
        toast.error('Could not load payment configuration');
      } finally {
        setLoadingConfig(false);
      }
    };
    loadConfig();
  }, []);

  // Bounce unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true });
  }, [isAuthenticated, navigate]);

  // Bounce empty carts
  useEffect(() => {
    if (cart.items && cart.items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [cart.items, navigate]);

  const validateAddress = () => {
    const e = {};
    if (!address.street.trim()) e.street = 'Street address is required';
    if (!address.city.trim()) e.city = 'City is required';
    if (!address.state.trim()) e.state = 'State is required';
    if (!address.zipCode.trim()) e.zipCode = 'PIN code is required';
    else if (!/^[A-Za-z0-9\s-]{3,12}$/.test(address.zipCode.trim()))
      e.zipCode = 'Enter a valid PIN / postal code';
    if (!address.country.trim()) e.country = 'Country is required';
    return e;
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    const e2 = validateAddress();
    setErrors(e2);
    if (Object.keys(e2).length > 0) return;
    setStep('payment');
  };

  const handleOrderComplete = async (transactionId) => {
    try {
      const { data } = await createOrder({
        shippingAddress: address,
        paymentMethod: 'razorpay',
        transactionId,
      });
      await fetchCart();
      navigate(`/order/${data.data.orderNumber}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record order');
    }
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      // 1. Create the order server-side (amount is authoritative there).
      const { data } = await createRazorpayOrder();
      const { orderId, amount, currency, keyId } = data.data;

      // 2. Make sure the checkout script is available.
      const ok = await loadRazorpayScript();
      if (!ok) {
        toast.error('Could not load payment gateway. Check your connection.');
        setPaying(false);
        return;
      }

      // 3. Open Razorpay's checkout (cards / UPI / GPay / PhonePe / netbanking).
      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: 'Stitch & Bloom',
        description: 'Handmade crochet order',
        prefill: {
          name: user ? `${user.firstName} ${user.lastName}` : '',
          email: user?.email || '',
        },
        theme: { color: '#B85447' },
        handler: async (resp) => {
          try {
            await verifyRazorpayPayment({
              razorpayOrderId: resp.razorpay_order_id,
              razorpayPaymentId: resp.razorpay_payment_id,
              razorpaySignature: resp.razorpay_signature,
            });
            await handleOrderComplete(resp.razorpay_payment_id);
          } catch (err) {
            toast.error(
              err.response?.data?.message || 'Payment could not be verified'
            );
            setPaying(false);
          }
        },
        modal: {
          // User closed the modal without paying.
          ondismiss: () => setPaying(false),
        },
      });

      rzp.on('payment.failed', (resp) => {
        toast.error(resp.error?.description || 'Payment failed. Please try again.');
        setPaying(false);
      });

      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start payment');
      setPaying(false);
    }
  };

  if (loadingConfig) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="mb-8 animate-(--animate-fade-down)">
        <h1 className="text-4xl font-serif">Checkout</h1>
        <Steps current={step} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 animate-(--animate-fade-up)">
          {step === 'shipping' && (
            <ShippingStep
              address={address}
              setAddress={setAddress}
              errors={errors}
              onSubmit={handleProceedToPayment}
            />
          )}
          {step === 'payment' && (
            <PaymentStep
              total={total}
              config={config}
              paying={paying}
              onPay={handlePay}
              onBack={() => setStep('shipping')}
            />
          )}
        </div>

        <aside className="lg:col-span-1">
          <OrderSummary
            cart={cart}
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            total={total}
          />
        </aside>
      </div>
    </div>
  );
};

const Steps = ({ current }) => {
  const steps = [
    { id: 'shipping', label: 'Shipping' },
    { id: 'payment', label: 'Payment' },
  ];
  const idx = steps.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center gap-3 mt-3 text-sm">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
              i <= idx
                ? 'bg-brand-charcoal text-white'
                : 'bg-brand-linen text-brand-warm-gray'
            }`}
          >
            {i < idx ? <HiOutlineCheck size={14} /> : i + 1}
          </div>
          <span
            className={i <= idx ? 'text-brand-charcoal font-medium' : 'text-brand-warm-gray'}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <span className="w-12 h-px bg-brand-linen ml-1" />
          )}
        </div>
      ))}
    </div>
  );
};

const ShippingStep = ({ address, setAddress, errors, onSubmit }) => (
  <form
    onSubmit={onSubmit}
    className="bg-white rounded-2xl border border-brand-linen p-6 space-y-4"
  >
    <h2 className="font-serif text-xl mb-2">Shipping Address</h2>

    <Field
      label="Street address *"
      value={address.street}
      onChange={(v) => setAddress({ ...address, street: v })}
      error={errors.street}
      maxLength={200}
    />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field
        label="City *"
        value={address.city}
        onChange={(v) => setAddress({ ...address, city: v })}
        error={errors.city}
        maxLength={100}
      />
      <Field
        label="State *"
        value={address.state}
        onChange={(v) => setAddress({ ...address, state: v })}
        error={errors.state}
        maxLength={100}
      />
      <Field
        label="PIN / Postal Code *"
        value={address.zipCode}
        onChange={(v) => setAddress({ ...address, zipCode: v })}
        error={errors.zipCode}
        maxLength={20}
      />
      <div>
        <label className="block text-sm font-medium mb-1.5">Country *</label>
        <select
          value={address.country}
          onChange={(e) => setAddress({ ...address, country: e.target.value })}
          className="checkout-input"
        >
          <option value="IN">India</option>
          <option value="US">United States</option>
          <option value="GB">United Kingdom</option>
          <option value="AU">Australia</option>
          <option value="CA">Canada</option>
          <option value="OTHER">Other</option>
        </select>
        {errors.country && (
          <p className="text-xs text-brand-error mt-1">{errors.country}</p>
        )}
      </div>
    </div>

    <button
      type="submit"
      className="w-full mt-3 py-3 bg-brand-charcoal text-white rounded-xl font-medium hover:bg-brand-charcoal/90 disabled:opacity-50"
    >
      Continue to Payment
    </button>

    <style>{`
      .checkout-input {
        width: 100%;
        padding: 0.625rem 0.875rem;
        background: white;
        border: 1px solid var(--color-brand-linen);
        border-radius: 0.75rem;
        font-size: 0.875rem;
      }
      .checkout-input:focus {
        outline: none;
        border-color: var(--color-brand-blush-dark);
      }
    `}</style>
  </form>
);

const Field = ({ label, value, onChange, error, maxLength }) => (
  <div>
    <label className="block text-sm font-medium mb-1.5">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={maxLength}
      className="checkout-input"
    />
    {error && <p className="text-xs text-brand-error mt-1">{error}</p>}
  </div>
);

const PaymentStep = ({ total, config, paying, onPay, onBack }) => (
  <div className="bg-white rounded-2xl border border-brand-linen p-6 space-y-5">
    <div className="flex items-center justify-between">
      <h2 className="font-serif text-xl">Payment</h2>
      <button onClick={onBack} className="text-sm text-brand-warm-gray hover:underline">
        ← Edit shipping
      </button>
    </div>

    {!config?.razorpayEnabled ? (
      <NotConfigured />
    ) : (
      <>
        <p className="text-sm text-brand-warm-gray">
          Pay securely with credit / debit card, UPI, Google Pay, PhonePe, or
          net banking. You'll complete payment in a secure Razorpay window.
        </p>

        <div className="flex flex-wrap gap-2 text-xs text-brand-warm-gray">
          {['Cards', 'UPI', 'Google Pay', 'PhonePe', 'Net Banking'].map((m) => (
            <span key={m} className="px-2.5 py-1 rounded-full bg-brand-linen/60">
              {m}
            </span>
          ))}
        </div>

        <button
          onClick={onPay}
          disabled={paying}
          className="w-full py-3 bg-brand-charcoal text-white rounded-xl font-medium hover:bg-brand-charcoal/90 disabled:opacity-50"
        >
          {paying ? 'Processing…' : `Pay ${formatCurrency(total)}`}
        </button>
      </>
    )}

    <div className="flex items-center gap-2 text-xs text-brand-warm-gray pt-3 border-t border-brand-linen">
      <HiOutlineLockClosed size={14} />
      <span>Encrypted, PCI-compliant payment processing by Razorpay</span>
    </div>
  </div>
);

const NotConfigured = () => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
    <p className="font-medium text-yellow-900 mb-1">
      Payment gateway not yet configured
    </p>
    <p className="text-yellow-800">
      The site owner needs to add Razorpay API keys (
      <code className="bg-yellow-100 px-1 rounded">RAZORPAY_KEY_ID</code> and{' '}
      <code className="bg-yellow-100 px-1 rounded">RAZORPAY_KEY_SECRET</code>) to
      the server environment and restart it. See the deployment guide.
    </p>
  </div>
);

const OrderSummary = ({ cart, subtotal, shipping, tax, total }) => (
  <div className="bg-white rounded-2xl border border-brand-linen p-6 sticky top-24 animate-(--animate-fade-up)">
    <h2 className="font-serif text-xl mb-4">Order Summary</h2>
    <ul className="space-y-2 mb-4 max-h-64 overflow-y-auto">
      {cart.items?.map((item) => {
        const product = item.product;
        const image =
          product?.images?.find((i) => i.isPrimary) || product?.images?.[0];
        return (
          <li key={item._id} className="flex items-center gap-3 text-sm">
            <div className="relative">
              <img
                src={
                  image?.url ||
                  'https://placehold.co/56x56/E8DFD4/7A7470?text=?'
                }
                alt={product?.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <span className="absolute -top-1 -right-1 bg-brand-charcoal text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <p className="flex-1 line-clamp-1 text-brand-charcoal">{product?.name}</p>
            <p className="font-medium">
              {formatCurrency((product?.price || 0) * item.quantity)}
            </p>
          </li>
        );
      })}
    </ul>
    <div className="border-t border-brand-linen pt-3 space-y-1.5 text-sm">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span>Shipping</span>
        <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
      </div>
      {tax > 0 && (
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{formatCurrency(tax)}</span>
        </div>
      )}
      <div className="flex justify-between font-semibold text-base pt-2 border-t border-brand-linen">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
    <Link to="/cart" className="block mt-3 text-xs text-brand-warm-gray text-center hover:underline">
      Edit cart
    </Link>
  </div>
);

export default CheckoutPage;
