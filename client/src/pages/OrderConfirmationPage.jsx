import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HiOutlineCheckCircle, HiOutlineMail } from 'react-icons/hi';
import { getOrder } from '../api/orderApi';
import { formatCurrency } from '../utils/formatCurrency';
import LoadingSpinner from '../components/common/LoadingSpinner';

const OrderConfirmationPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(orderNumber)
      .then((res) => setOrder(res.data.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) return <LoadingSpinner />;

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-serif mb-4">Order not found</h1>
        <Link to="/shop" className="text-brand-blush-dark font-medium hover:underline">
          Back to the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <div className="text-center mb-10 animate-(--animate-fade-up)">
        <div className="inline-flex w-20 h-20 rounded-full bg-brand-sage/30 items-center justify-center mb-5 animate-(--animate-scale-in)">
          <HiOutlineCheckCircle size={44} className="text-brand-sage-dark" />
        </div>
        <p className="text-brand-blush-dark font-medium tracking-[0.25em] uppercase text-xs mb-3">
          Order Confirmed
        </p>
        <h1 className="text-4xl font-serif mb-3">Thank you!</h1>
        <p className="text-brand-warm-gray">
          Your order{' '}
          <span className="font-mono font-semibold text-brand-charcoal">
            {order.orderNumber}
          </span>{' '}
          has been received.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-brand-linen p-6 mb-6 animate-(--animate-fade-up)">
        <h2 className="font-serif text-lg mb-4">Items</h2>
        <ul className="space-y-3">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.name}</div>
                <div className="text-xs text-brand-warm-gray">
                  Qty {item.quantity}
                </div>
              </div>
              <div className="font-medium">
                {formatCurrency(item.price * item.quantity)}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-brand-linen space-y-1.5 text-sm">
          <Row label="Subtotal" value={formatCurrency(order.pricing.subtotal)} />
          <Row
            label="Shipping"
            value={
              order.pricing.shipping === 0
                ? 'Free'
                : formatCurrency(order.pricing.shipping)
            }
          />
          <Row label="Tax" value={formatCurrency(order.pricing.tax)} />
          <Row
            label="Total"
            value={formatCurrency(order.pricing.total)}
            bold
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 animate-(--animate-fade-up)">
        <div className="bg-white rounded-2xl border border-brand-linen p-5">
          <h3 className="text-xs uppercase tracking-wider text-brand-warm-gray font-semibold mb-2">
            Shipping to
          </h3>
          <p className="text-sm leading-relaxed">
            {order.shippingAddress.street}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
            {order.shippingAddress.zipCode}
            <br />
            {order.shippingAddress.country}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-brand-linen p-5">
          <h3 className="text-xs uppercase tracking-wider text-brand-warm-gray font-semibold mb-2">
            Payment
          </h3>
          <p className="text-sm capitalize">{order.payment.method}</p>
          <p className="text-xs text-brand-warm-gray mt-1">
            {order.payment.status === 'completed' && '✓ Paid'}
          </p>
        </div>
      </div>

      <div className="mt-8 bg-brand-cream rounded-2xl p-6 flex items-start gap-4 animate-(--animate-fade-up)">
        <HiOutlineMail size={24} className="text-brand-blush-dark shrink-0 mt-1" />
        <div className="text-sm">
          <p className="font-medium text-brand-charcoal mb-1">What's next?</p>
          <p className="text-brand-warm-gray leading-relaxed">
            We'll send a confirmation email shortly. Once your order ships, you'll
            receive tracking information. Most orders process within 3-5 business
            days. Thank you for supporting handmade!
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Link
          to="/shop"
          className="px-5 py-2.5 border border-brand-linen rounded-xl font-medium hover:bg-brand-cream"
        >
          Continue shopping
        </Link>
        <Link
          to="/account/orders"
          className="px-5 py-2.5 bg-brand-charcoal text-white rounded-xl font-medium hover:bg-brand-charcoal/90"
        >
          View all orders
        </Link>
      </div>
    </div>
  );
};

const Row = ({ label, value, bold }) => (
  <div className={`flex justify-between ${bold ? 'font-semibold text-base pt-1.5 border-t border-brand-linen' : ''}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export default OrderConfirmationPage;
