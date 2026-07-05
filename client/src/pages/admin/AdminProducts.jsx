import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getAllProductsAdmin, deleteProduct } from '../../api/productApi';
import { formatCurrency } from '../../utils/formatCurrency';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAllProductsAdmin();
      setProducts(data.data || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product._id);
    try {
      await deleteProduct(product._id);
      toast.success('Product deleted');
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 animate-(--animate-fade-down)">
        <div>
          <h1 className="text-3xl font-serif text-brand-charcoal">Products</h1>
          <p className="text-brand-warm-gray mt-1">
            Manage your shop inventory — {products.length}{' '}
            {products.length === 1 ? 'item' : 'items'}.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-charcoal text-white rounded-xl font-medium hover:bg-brand-charcoal/90 transition-all hover:shadow-md"
        >
          <HiOutlinePlus size={18} />
          New Product
        </Link>
      </div>

      {/* Search */}
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
          <p className="text-brand-warm-gray mb-4">
            {search ? 'No products match your search.' : 'No products yet.'}
          </p>
          {!search && (
            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-charcoal text-white rounded-xl font-medium hover:bg-brand-charcoal/90 transition-all"
            >
              <HiOutlinePlus size={18} />
              Add your first product
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-linen overflow-hidden animate-(--animate-fade-up)">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-cream">
                <tr className="text-left text-xs text-brand-warm-gray uppercase tracking-wider">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => {
                  const img = p.images?.find((i) => i.isPrimary) || p.images?.[0];
                  const lowStock =
                    p.inventory?.trackInventory &&
                    p.inventory.quantity <= (p.inventory.lowStockThreshold || 5);
                  return (
                    <tr
                      key={p._id}
                      className="border-t border-brand-linen hover:bg-brand-cream/50 transition-colors animate-(--animate-fade-in)"
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
                            className="w-12 h-12 rounded-lg object-cover bg-brand-linen"
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-brand-charcoal truncate">
                              {p.name}
                            </div>
                            {p.isFeatured && (
                              <span className="inline-block mt-0.5 text-[10px] uppercase tracking-wider text-brand-gold font-medium">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-brand-warm-gray">
                        {p.inventory?.sku || '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {p.inventory?.trackInventory ? (
                          <span
                            className={lowStock ? 'text-brand-error font-medium' : ''}
                          >
                            {p.inventory.quantity}
                          </span>
                        ) : (
                          <span className="text-brand-warm-gray">∞</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            p.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/products/${p._id}/edit`}
                            className="p-2 text-brand-warm-gray hover:text-brand-blush-dark hover:bg-brand-blush/20 rounded-lg transition-all"
                            title="Edit"
                          >
                            <HiOutlinePencil size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(p)}
                            disabled={deletingId === p._id}
                            className="p-2 text-brand-warm-gray hover:text-brand-error hover:bg-red-50 rounded-lg transition-all disabled:opacity-40"
                            title="Delete"
                          >
                            <HiOutlineTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
