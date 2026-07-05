import { useEffect, useState } from 'react';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import {
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../api/adminApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const blank = { name: '', description: '', sortOrder: 0, isActive: true };

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | category object
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAllCategoriesAdmin();
      setCategories(data.data || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing('new');
    setForm(blank);
    setErrors({});
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name || '',
      description: cat.description || '',
      sortOrder: cat.sortOrder ?? 0,
      isActive: cat.isActive ?? true,
    });
    setErrors({});
  };

  const close = () => {
    setEditing(null);
    setForm(blank);
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.trim().length < 2) e.name = 'At least 2 characters';
    else if (form.name.trim().length > 60) e.name = 'Max 60 characters';
    if (form.description && form.description.length > 300) {
      e.description = 'Max 300 characters';
    }
    const so = Number(form.sortOrder);
    if (!Number.isInteger(so) || so < 0 || so > 999)
      e.sortOrder = 'Must be 0-999';
    return e;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const e2 = validate();
    setErrors(e2);
    if (Object.keys(e2).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        sortOrder: Number(form.sortOrder),
        isActive: form.isActive,
      };
      if (editing === 'new') {
        await createCategory(payload);
        toast.success('Category created');
      } else {
        await updateCategory(editing._id, payload);
        toast.success('Category updated');
      }
      close();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (cat.productCount > 0) {
      toast.error(
        `Cannot delete — ${cat.productCount} product(s) still use this category. Reassign them first.`
      );
      return;
    }
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat._id);
      toast.success('Category deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 animate-(--animate-fade-down)">
        <div>
          <h1 className="text-3xl font-serif text-brand-charcoal">Categories</h1>
          <p className="text-brand-warm-gray mt-1">
            Organize your shop. Categories appear in the navigation and on the home page.
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blush-dark text-white rounded-xl font-medium hover:bg-brand-blush-dark/90 transition-all hover:shadow-md"
        >
          <HiOutlinePlus size={18} />
          New Category
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : categories.length === 0 ? (
        <EmptyState onCreate={openNew} />
      ) : (
        <div className="bg-white rounded-2xl border border-brand-linen overflow-hidden animate-(--animate-fade-up)">
          <table className="w-full text-sm">
            <thead className="bg-brand-cream">
              <tr className="text-left text-xs text-brand-warm-gray uppercase tracking-wider">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-center">Order</th>
                <th className="px-4 py-3 text-center">Products</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c, idx) => (
                <tr
                  key={c._id}
                  className="border-t border-brand-linen hover:bg-brand-cream/40 transition-colors animate-(--animate-fade-in)"
                  style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
                >
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-brand-warm-gray truncate max-w-xs">
                    {c.description || '—'}
                  </td>
                  <td className="px-4 py-3 text-center">{c.sortOrder}</td>
                  <td className="px-4 py-3 text-center">{c.productCount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        c.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-2 text-brand-warm-gray hover:text-brand-blush-dark hover:bg-brand-blush/30 rounded-lg transition-all"
                        title="Edit"
                      >
                        <HiOutlinePencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        disabled={c.productCount > 0}
                        title={
                          c.productCount > 0
                            ? `Has ${c.productCount} products`
                            : 'Delete'
                        }
                        className="p-2 text-brand-warm-gray hover:text-brand-error hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <HiOutlineTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {editing && (
        <Modal onClose={close}>
          <form onSubmit={handleSave}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-serif">
                {editing === 'new' ? 'New Category' : `Edit "${editing.name}"`}
              </h2>
              <button
                type="button"
                onClick={close}
                className="p-1 text-brand-warm-gray hover:text-brand-charcoal"
              >
                <HiOutlineX size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <FormField label="Name *" error={errors.name}>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="form-input"
                  maxLength={60}
                  autoFocus
                />
                <CharCount value={form.name} max={60} />
              </FormField>

              <FormField label="Description" error={errors.description}>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="form-input"
                  maxLength={300}
                />
                <CharCount value={form.description} max={300} />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Sort order" error={errors.sortOrder}>
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm({ ...form, sortOrder: e.target.value })
                    }
                    className="form-input"
                  />
                  <p className="text-xs text-brand-warm-gray mt-1">
                    Lower appears first
                  </p>
                </FormField>

                <FormField label="Status">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className="flex items-center gap-2 h-[42px]"
                  >
                    <span
                      className={`relative inline-block w-10 h-6 rounded-full transition-colors ${
                        form.isActive ? 'bg-brand-sage-dark' : 'bg-brand-linen'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          form.isActive ? 'translate-x-4' : ''
                        }`}
                      />
                    </span>
                    <span className="text-sm">
                      {form.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </button>
                </FormField>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-brand-linen">
              <button
                type="button"
                onClick={close}
                className="px-4 py-2 border border-brand-linen rounded-xl text-sm font-medium hover:bg-brand-cream"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-brand-blush-dark text-white rounded-xl text-sm font-medium hover:bg-brand-blush-dark/90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <style>{`
        .form-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          background: white;
          border: 1px solid var(--color-brand-linen);
          border-radius: 0.75rem;
          font-size: 0.875rem;
          transition: border-color 0.15s;
        }
        .form-input:focus {
          outline: none;
          border-color: var(--color-brand-blush-dark);
        }
      `}</style>
    </div>
  );
};

const EmptyState = ({ onCreate }) => (
  <div className="bg-white rounded-2xl border border-brand-linen p-12 text-center">
    <p className="text-brand-warm-gray mb-4">No categories yet.</p>
    <button
      onClick={onCreate}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blush-dark text-white rounded-xl font-medium hover:bg-brand-blush-dark/90"
    >
      <HiOutlinePlus size={18} />
      Add your first category
    </button>
  </div>
);

const Modal = ({ children, onClose }) => (
  <div
    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-(--animate-fade-in)"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-(--animate-scale-in)"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

const FormField = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-brand-error mt-1">{error}</p>}
  </div>
);

const CharCount = ({ value, max }) => (
  <p className="text-xs text-brand-warm-gray mt-1 text-right">
    {(value || '').length} / {max}
  </p>
);

export default AdminCategories;
