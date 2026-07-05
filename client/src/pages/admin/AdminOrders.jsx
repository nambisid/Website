import { useEffect, useState } from 'react';
import { HiOutlineX, HiOutlineExternalLink } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getAllOrders, updateOrderStatus } from '../../api/adminApi';
import { formatCurrency } from '../../utils/formatCurrency';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const CARRIERS = ['USPS', 'UPS', 'FedEx', 'Other'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAllOrders({
        ...(statusFilter && { status: statusFilter }),
        limit: 100,
      });
      setOrders(data.data || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="animate-(--animate-fade-down)">
        <h1 className="text-3xl font-serif text-brand-charcoal">Orders</h1>
        <p className="text-brand-warm-gray mt-1">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          {statusFilter ? ` with status "${statusFilter}"` : ''}.
        </p>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 animate-(--animate-fade-up)">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            !statusFilter
              ? 'bg-brand-charcoal text-white'
              : 'bg-white border border-brand-linen hover:bg-brand-cream'
          }`}
        >
          All
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
              statusFilter === s
                ? 'bg-brand-charcoal text-white'
                : 'bg-white border border-brand-linen hover:bg-brand-cream'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-linen p-12 text-center animate-(--animate-fade-up)">
          <p className="text-brand-warm-gray">
            {statusFilter
              ? `No orders with status "${statusFilter}".`
              : 'No orders yet — once customers buy, orders appear here.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-linen overflow-hidden animate-(--animate-fade-up)">
          <table className="w-full text-sm">
            <thead className="bg-brand-cream">
              <tr className="text-left text-xs text-brand-warm-gray uppercase tracking-wider">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o, idx) => (
                <tr
                  key={o._id}
                  className="border-t border-brand-linen hover:bg-brand-cream/40 cursor-pointer transition-colors animate-(--animate-fade-in)"
                  style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
                  onClick={() => setSelected(o)}
                >
                  <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    {o.user ? (
                      <>
                        <div className="font-medium">
                          {o.user.firstName} {o.user.lastName}
                        </div>
                        <div className="text-xs text-brand-warm-gray">
                          {o.user.email}
                        </div>
                      </>
                    ) : (
                      <span className="text-brand-warm-gray">Guest</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-brand-warm-gray">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                        STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(o.pricing?.total || 0)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <HiOutlineExternalLink
                      size={16}
                      className="text-brand-warm-gray inline"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <OrderDetail
          order={selected}
          onClose={() => setSelected(null)}
          onUpdated={(updated) => {
            setSelected(updated);
            setOrders((prev) =>
              prev.map((o) => (o._id === updated._id ? updated : o))
            );
          }}
        />
      )}
    </div>
  );
};

const OrderDetail = ({ order, onClose, onUpdated }) => {
  const [status, setStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [carrier, setCarrier] = useState(order.carrier || '');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const dirty =
    status !== order.status ||
    trackingNumber !== (order.trackingNumber || '') ||
    carrier !== (order.carrier || '') ||
    note.trim() !== '';

  const handleSave = async () => {
    const e = {};
    if (status === 'shipped' && !trackingNumber.trim()) {
      e.trackingNumber = 'Tracking number is required when marking as shipped';
    }
    if (trackingNumber.trim() && !carrier) {
      e.carrier = 'Pick a carrier when adding tracking';
    }
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      const { data } = await updateOrderStatus(order._id, {
        status,
        note: note.trim() || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
        carrier: carrier || undefined,
      });
      toast.success('Order updated');
      onUpdated(data.data);
      setNote('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-(--animate-fade-in)"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-(--animate-scale-in)"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-brand-linen px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif">{order.orderNumber}</h2>
            <p className="text-xs text-brand-warm-gray">
              Placed {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:text-brand-charcoal">
            <HiOutlineX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Items */}
          <Section title="Items">
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-brand-cream rounded-xl p-3"
                >
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
                      Qty {item.quantity} × {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Totals + shipping */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Section title="Shipping Address">
              <p className="text-sm text-brand-charcoal leading-relaxed">
                {order.shippingAddress.street}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zipCode}
                <br />
                {order.shippingAddress.country}
              </p>
            </Section>

            <Section title="Totals">
              <Row label="Subtotal" value={formatCurrency(order.pricing.subtotal)} />
              <Row label="Shipping" value={formatCurrency(order.pricing.shipping)} />
              <Row label="Tax" value={formatCurrency(order.pricing.tax)} />
              <div className="border-t border-brand-linen mt-2 pt-2">
                <Row
                  label="Total"
                  value={formatCurrency(order.pricing.total)}
                  bold
                />
              </div>
            </Section>
          </div>

          {/* Update */}
          <Section title="Update Status">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-brand-linen rounded-xl text-sm bg-white capitalize focus:outline-none focus:border-brand-blush-dark"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Carrier</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-3 py-2 border border-brand-linen rounded-xl text-sm bg-white focus:outline-none focus:border-brand-blush-dark"
                >
                  <option value="">— None —</option>
                  {CARRIERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.carrier && (
                  <p className="text-xs text-brand-error mt-1">{errors.carrier}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">
                  Tracking Number
                </label>
                <input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. 9400 1234 5678 9012 3456 78"
                  className="w-full px-3 py-2 border border-brand-linen rounded-xl text-sm focus:outline-none focus:border-brand-blush-dark"
                />
                {errors.trackingNumber && (
                  <p className="text-xs text-brand-error mt-1">
                    {errors.trackingNumber}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">
                  Note (optional)
                </label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Internal note for the status history"
                  className="w-full px-3 py-2 border border-brand-linen rounded-xl text-sm focus:outline-none focus:border-brand-blush-dark"
                  maxLength={300}
                />
              </div>
            </div>
          </Section>

          {/* History */}
          {order.statusHistory?.length > 0 && (
            <Section title="History">
              <ul className="space-y-2">
                {order.statusHistory.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                        STATUS_COLORS[h.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {h.status}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-brand-charcoal">{h.note || '—'}</p>
                      <p className="text-xs text-brand-warm-gray">
                        {new Date(h.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-brand-linen px-6 py-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-brand-linen rounded-xl text-sm font-medium hover:bg-brand-cream"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="px-4 py-2 bg-brand-charcoal text-white rounded-xl text-sm font-medium hover:bg-brand-charcoal/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div>
    <h3 className="text-xs uppercase tracking-wider text-brand-warm-gray font-semibold mb-3">
      {title}
    </h3>
    {children}
  </div>
);

const Row = ({ label, value, bold }) => (
  <div className={`flex justify-between text-sm ${bold ? 'font-semibold' : ''}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export default AdminOrders;
