import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineExclamationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getLowStock } from '../../api/adminApi';
import { updateProduct } from '../../api/productApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [drafts, setDrafts] = useState({}); // { [id]: number }

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getLowStock();
      setProducts(data.data || []);
      setDrafts({});
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setDraft = (id, value) => {
    setDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const saveQuantity = async (product) => {
    const draft = drafts[product._id];
    if (draft === undefined || draft === '') return;
    const newQty = Number(draft);
    if (!Number.isInteger(newQty) || newQty < 0) {
      toast.error('Quantity must be 0 or higher');
      return;
    }
    setSavingId(product._id);
    try {
      await updateProduct(product._id, {
        inventory: {
          ...product.inventory,
          quantity: newQty,
        },
      });
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id
            ? { ...p, inventory: { ...p.inventory, quantity: newQty } }
            : p
        )
      );
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[product._id];
        return next;
      });
      toast.success('Stock updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingId(null);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = products.filter(
    (p) => p.inventory?.quantity <= (p.inventory?.lowStockThreshold || 5)
  ).length;

  return (
    <div className="space-y-6">
      <div className="animate-(--animate-fade-down)">
        <h1 className="text-3xl font-serif text-brand-charcoal">Inventory</h1>
        <p className="text-brand-warm-gray mt-1">
          Adjust stock levels for tracked products.
          {lowStockCount > 0 && (
            <span className="ml-2 text-brand-error font-medium">
              {lowStockCount} low-stock alert{lowStockCount === 1 ? '' : 's'}.
            </span>
          )}
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
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-linen rounded-xl focus:outline-none focus:border-brand-blush-dark"
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-linen p-12 text-center animate-(--animate-fade-up)">
          <p className="text-brand-warm-gray">No tracked products found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-linen overflow-hidden animate-(--animate-fade-up)">
          <table className="w-full text-sm">
            <thead className="bg-brand-cream">
              <tr className="text-left text-xs text-brand-warm-gray uppercase tracking-wider">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3 text-center">Threshold</th>
                <th className="px-4 py-3 text-center">Current Stock</th>
                <th className="px-4 py-3 text-center">Adjust</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                const img = p.images?.find((i) => i.isPrimary) || p.images?.[0];
                const low =
                  p.inventory?.quantity <= (p.inventory?.lowStockThreshold || 5);
                const draft = drafts[p._id];
                const dirty =
                  draft !== undefined &&
                  draft !== '' &&
                  Number(draft) !== p.inventory?.quantity;
                return (
                  <tr
                    key={p._id}
                    className="border-t border-brand-linen hover:bg-brand-cream/40 transition-colors animate-(--animate-fade-in)"
                    style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            img?.url ||
                            'https://placehold.co/64x64/E8DFD4/7A7470?text=%20'
                          }
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-brand-linen"
                        />
                        <span className="font-medium truncate max-w-xs">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-brand-warm-gray">
                      {p.inventory?.sku || '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-brand-warm-gray">
                      {p.inventory?.lowStockThreshold ?? 5}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${
                          low ? 'text-brand-error' : 'text-brand-charcoal'
                        }`}
                      >
                        {low && <HiOutlineExclamationCircle size={14} />}
                        {p.inventory?.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={draft ?? ''}
                        placeholder={String(p.inventory?.quantity ?? 0)}
                        onChange={(e) => setDraft(p._id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && dirty) saveQuantity(p);
                        }}
                        className="w-24 mx-auto block px-2 py-1.5 border border-brand-linen rounded-lg text-sm text-center focus:outline-none focus:border-brand-blush-dark"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/products/${p._id}/edit`}
                          className="text-xs text-brand-warm-gray hover:text-brand-blush-dark"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => saveQuantity(p)}
                          disabled={!dirty || savingId === p._id}
                          className="px-3 py-1.5 bg-brand-charcoal text-white rounded-lg text-xs font-medium hover:bg-brand-charcoal/90 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {savingId === p._id ? '...' : 'Save'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
