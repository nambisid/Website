import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineCurrencyDollar,
  HiOutlineShoppingCart,
  HiOutlineUserGroup,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';
import { getDashboard, getRevenue } from '../../api/adminApi';
import { formatCurrency } from '../../utils/formatCurrency';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const StatCard = ({ icon: Icon, label, value, accent, delay = 0 }) => (
  <div
    className="bg-white rounded-2xl border border-brand-linen p-5 hover:shadow-md transition-all animate-(--animate-fade-up)"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-brand-warm-gray font-medium">
          {label}
        </p>
        <p className="text-2xl font-serif text-brand-charcoal mt-2">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon size={22} />
      </div>
    </div>
  </div>
);

const StatusPill = ({ status, count }) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };
  return (
    <div className="flex items-center justify-between bg-brand-cream rounded-xl px-4 py-3">
      <span
        className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
          colors[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status}
      </span>
      <span className="text-lg font-serif text-brand-charcoal">{count}</span>
    </div>
  );
};

const formatRevenuePoint = (entry) => {
  const { _id, revenue } = entry;
  const date = _id.day
    ? `${_id.month}/${_id.day}`
    : _id.week
    ? `W${_id.week}`
    : `${_id.year}-${String(_id.month).padStart(2, '0')}`;
  return { date, revenue: revenue / 100 };
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, revRes] = await Promise.all([
          getDashboard(),
          getRevenue({ period: 'daily' }),
        ]);
        setData(dashRes.data.data);
        setRevenueSeries((revRes.data.data || []).map(formatRevenuePoint));
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <p className="text-brand-error">Failed to load dashboard.</p>;

  return (
    <div className="space-y-6">
      <div className="animate-(--animate-fade-down)">
        <h1 className="text-3xl font-serif text-brand-charcoal">Dashboard</h1>
        <p className="text-brand-warm-gray mt-1">An overview of your shop today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={HiOutlineCurrencyDollar}
          label="Today's Revenue"
          value={formatCurrency(data.revenue.today)}
          accent="bg-brand-blush/30 text-brand-blush-dark"
          delay={0}
        />
        <StatCard
          icon={HiOutlineCurrencyDollar}
          label="This Month"
          value={formatCurrency(data.revenue.thisMonth)}
          accent="bg-brand-sage/30 text-brand-sage-dark"
          delay={100}
        />
        <StatCard
          icon={HiOutlineUserGroup}
          label="New Customers (Week)"
          value={data.newCustomersThisWeek}
          accent="bg-brand-gold/30 text-brand-gold"
          delay={200}
        />
        <StatCard
          icon={HiOutlineCurrencyDollar}
          label="All-Time Revenue"
          value={formatCurrency(data.revenue.total)}
          accent="bg-brand-charcoal/10 text-brand-charcoal"
          delay={300}
        />
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border border-brand-linen p-5 animate-(--animate-fade-up) delay-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif">Revenue (last 30 days)</h2>
        </div>
        {revenueSeries.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-brand-warm-gray text-sm">
            No completed orders yet — your chart will appear once sales come in.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9928E" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#C9928E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E8DFD4" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#7A7470" fontSize={11} />
                <YAxis stroke="#7A7470" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: '#FFFBF5',
                    border: '1px solid #E8DFD4',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v) => [`$${v.toFixed(2)}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C9928E"
                  strokeWidth={2}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by status */}
        <div className="bg-white rounded-2xl border border-brand-linen p-5 animate-(--animate-fade-up) delay-300">
          <h2 className="text-lg font-serif mb-4">Orders by Status</h2>
          {Object.keys(data.ordersByStatus || {}).length === 0 ? (
            <p className="text-sm text-brand-warm-gray">No orders yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(data.ordersByStatus).map(([status, count]) => (
                <StatusPill key={status} status={status} count={count} />
              ))}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="bg-white rounded-2xl border border-brand-linen p-5 animate-(--animate-fade-up) delay-400">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif">Low Stock</h2>
            <Link
              to="/admin/inventory"
              className="text-xs text-brand-blush-dark hover:underline"
            >
              View all
            </Link>
          </div>
          {data.lowStockProducts?.length ? (
            <ul className="space-y-2">
              {data.lowStockProducts.slice(0, 5).map((p) => (
                <li
                  key={p._id}
                  className="flex items-center justify-between bg-brand-cream rounded-xl px-4 py-2.5"
                >
                  <span className="text-sm text-brand-charcoal truncate pr-2">
                    {p.name}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-brand-error font-medium">
                    <HiOutlineExclamationCircle size={14} />
                    {p.inventory.quantity} left
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-brand-warm-gray">All products well stocked.</p>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-brand-linen p-5 animate-(--animate-fade-up) delay-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs text-brand-blush-dark hover:underline">
            View all
          </Link>
        </div>
        {data.recentOrders?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-brand-warm-gray uppercase tracking-wider border-b border-brand-linen">
                  <th className="pb-2">Order</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o._id} className="border-b border-brand-linen/50">
                    <td className="py-3 font-mono text-xs">
                      {o.orderNumber || o._id.slice(-8)}
                    </td>
                    <td className="py-3">
                      {o.user?.firstName} {o.user?.lastName}
                    </td>
                    <td className="py-3 capitalize text-brand-warm-gray">{o.status}</td>
                    <td className="py-3 text-right font-medium">
                      {formatCurrency(o.pricing?.total || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-brand-warm-gray text-sm">
            <HiOutlineShoppingCart size={20} />
            <span>No orders yet — once customers buy, orders will appear here.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
