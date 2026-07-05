import { Link } from 'react-router-dom';
import { HiOutlineTrash, HiMinus, HiPlus, HiOutlineShoppingBag } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';

// Must match server/src/utils/pricing.js (paise).
const FREE_SHIPPING_THRESHOLD = 99900; // ₹999
const FLAT_SHIPPING = 7900; // ₹79
const TAX_RATE = 0; // GST-inclusive pricing

const CartPage = () => {
  const { cart, updateItem, removeItem, subtotal, itemCount } = useCart();
  const { isAuthenticated } = useAuth();

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Please sign in to view your bag"
        cta={{ to: '/login', label: 'Sign In' }}
      />
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <EmptyState
        title="Your bag is empty"
        subtitle="Browse the shop and add some handmade pieces."
        cta={{ to: '/shop', label: 'Start Shopping' }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <h1 className="text-4xl font-serif mb-2 animate-(--animate-fade-down)">
        Your Bag
      </h1>
      <p className="text-brand-warm-gray mb-8 animate-(--animate-fade-down)">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.items.map((item, idx) => {
            const product = item.product;
            const image =
              product?.images?.find((i) => i.isPrimary) || product?.images?.[0];
            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-brand-linen p-4 flex gap-4 animate-(--animate-fade-up)"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <Link
                  to={`/product/${product?.slug}`}
                  className="shrink-0"
                >
                  <img
                    src={
                      image?.url ||
                      'https://placehold.co/120x120/E8DFD4/7A7470?text=?'
                    }
                    alt={product?.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/product/${product?.slug}`}
                      className="font-medium text-brand-charcoal hover:text-brand-blush-dark line-clamp-2"
                    >
                      {product?.name}
                    </Link>
                    <button
                      onClick={() => removeItem(product?._id)}
                      className="p-1 text-brand-warm-gray hover:text-brand-error"
                      title="Remove"
                    >
                      <HiOutlineTrash size={18} />
                    </button>
                  </div>
                  <p className="text-brand-warm-gray text-sm">
                    {formatCurrency(product?.price || 0)} each
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="inline-flex items-center border border-brand-linen rounded-lg">
                      <button
                        onClick={() =>
                          updateItem(product?._id, Math.max(1, item.quantity - 1))
                        }
                        disabled={item.quantity <= 1}
                        className="p-1.5 hover:bg-brand-cream disabled:opacity-30"
                      >
                        <HiMinus size={14} />
                      </button>
                      <span className="px-3 text-sm font-medium min-w-[32px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItem(product?._id, item.quantity + 1)}
                        className="p-1.5 hover:bg-brand-cream"
                      >
                        <HiPlus size={14} />
                      </button>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency((product?.price || 0) * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-brand-linen p-6 sticky top-24 animate-(--animate-fade-up)">
            <h2 className="font-serif text-xl mb-4">Order Summary</h2>

            {subtotal < FREE_SHIPPING_THRESHOLD && subtotal > 0 && (
              <div className="bg-brand-cream rounded-xl p-3 mb-4">
                <p className="text-xs text-brand-charcoal mb-1.5">
                  Add{' '}
                  <strong>{formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)}</strong>{' '}
                  for free shipping!
                </p>
                <div className="w-full bg-brand-linen rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-brand-sage-dark h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <Row label="Subtotal" value={formatCurrency(subtotal)} />
              <Row
                label="Shipping"
                value={shipping === 0 ? 'Free' : formatCurrency(shipping)}
              />
              {tax > 0 && <Row label="Tax (est.)" value={formatCurrency(tax)} />}
            </div>
            <div className="border-t border-brand-linen mt-3 pt-3">
              <Row
                label="Total"
                value={formatCurrency(total)}
                className="text-base font-semibold"
              />
            </div>

            <Link
              to="/checkout"
              className="mt-5 block w-full py-3 bg-brand-charcoal text-white text-center rounded-xl font-medium hover:bg-brand-charcoal/90 transition-all hover:shadow-lg"
            >
              Proceed to Checkout
            </Link>
            <Link
              to="/shop"
              className="mt-2 block text-center text-sm text-brand-warm-gray hover:text-brand-blush-dark"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

const Row = ({ label, value, className = '' }) => (
  <div className={`flex justify-between ${className}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

const EmptyState = ({ title, subtitle, cta }) => (
  <div className="max-w-md mx-auto px-4 py-24 text-center">
    <div className="w-20 h-20 mx-auto rounded-full bg-brand-blush/30 flex items-center justify-center mb-6 animate-(--animate-float)">
      <HiOutlineShoppingBag size={32} className="text-brand-blush-dark" />
    </div>
    <h1 className="text-3xl font-serif mb-2">{title}</h1>
    {subtitle && <p className="text-brand-warm-gray mb-6">{subtitle}</p>}
    <Link
      to={cta.to}
      className="inline-block px-6 py-2.5 bg-brand-charcoal text-white rounded-xl font-medium hover:bg-brand-charcoal/90"
    >
      {cta.label}
    </Link>
  </div>
);

export default CartPage;
