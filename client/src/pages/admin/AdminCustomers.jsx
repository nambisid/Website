import { useEffect, useState } from 'react';
import { HiOutlineSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getCustomers } from '../../api/adminApi';
import { formatCurrency } from '../../utils/formatCurrency';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getCustomers({ limit: 100 });
        setCustomers(data.data || []);
      } catch {
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.firstName?.toLowerCase().includes(q) ||
      c.lastName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="animate-(--animate-fade-down)">
        <h1 className="text-3xl font-serif text-brand-charcoal">Customers</h1>
        <p className="text-brand-warm-gray mt-1">
          {customers.length} {customers.length === 1 ? 'customer' : 'customers'}.
        </p>
      </div>

      <div className="relative max-w-md animate-(--animate-fade-up)">
        <HiOutlineSearch
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-warm-gray"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-linen rounded-xl focus:outline-none focus:border-brand-blush-dark"
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-linen p-12 text-center animate-(--animate-fade-up)">
          <p className="text-brand-warm-gray">
            {search ? 'No matching customers.' : 'No customers yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-linen overflow-hidden animate-(--animate-fade-up)">
          <table className="w-full text-sm">
            <thead className="bg-brand-cream">
              <tr className="text-left text-xs text-brand-warm-gray uppercase tracking-wider">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 text-center">Orders</th>
                <th className="px-4 py-3 text-right">Total Spent</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => (
                <tr
                  key={c._id}
                  className="border-t border-brand-linen hover:bg-brand-cream/40 transition-colors animate-(--animate-fade-in)"
                  style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-blush flex items-center justify-center text-brand-blush-dark font-semibold text-sm">
                        {c.firstName?.[0]}
                        {c.lastName?.[0]}
                      </div>
                      <div className="font-medium">
                        {c.firstName} {c.lastName}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-brand-warm-gray">{c.email}</td>
                  <td className="px-4 py-3 text-center">{c.orderCount || 0}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(c.totalSpent || 0)}
                  </td>
                  <td className="px-4 py-3 text-brand-warm-gray text-xs">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
