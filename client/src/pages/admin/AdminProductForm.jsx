import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineX, HiOutlineUpload, HiOutlineStar } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getProductByIdAdmin, createProduct, updateProduct } from '../../api/productApi';
import { getCategories, uploadImages } from '../../api/adminApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const blankForm = {
  name: '',
  shortDescription: '',
  description: '',
  price: '', // rupees in UI, converted to paise on save
  compareAtPrice: '',
  category: '',
  tags: '',
  images: [],
  inventory: {
    quantity: 0,
    sku: '',
    trackInventory: true,
    lowStockThreshold: 5,
  },
  shipping: {
    weight: '',
    processingDays: 3,
    freeShipping: false,
  },
  isActive: true,
  isFeatured: false,
};

const dollarsToCents = (val) => {
  if (val === '' || val === null || val === undefined) return undefined;
  const num = parseFloat(val);
  return Math.round(num * 100);
};

const centsToDollars = (cents) => {
  if (cents === null || cents === undefined) return '';
  return (cents / 100).toFixed(2);
};

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(blankForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const catRes = await getCategories();
        setCategories(catRes.data.data || []);

        if (isEdit) {
          const { data } = await getProductByIdAdmin(id);
          const p = data.data;
          setForm({
            name: p.name || '',
            shortDescription: p.shortDescription || '',
            description: p.description || '',
            price: centsToDollars(p.price),
            compareAtPrice: centsToDollars(p.compareAtPrice),
            category: p.category?._id || p.category || '',
            tags: (p.tags || []).join(', '),
            images: p.images || [],
            inventory: {
              quantity: p.inventory?.quantity ?? 0,
              sku: p.inventory?.sku || '',
              trackInventory: p.inventory?.trackInventory ?? true,
              lowStockThreshold: p.inventory?.lowStockThreshold ?? 5,
            },
            shipping: {
              weight: p.shipping?.weight ?? '',
              processingDays: p.shipping?.processingDays ?? 3,
              freeShipping: p.shipping?.freeShipping ?? false,
            },
            isActive: p.isActive ?? true,
            isFeatured: p.isFeatured ?? false,
          });
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const update = (path, value) => {
    setForm((prev) => {
      const next = { ...prev };
      const keys = path.split('.');
      let cursor = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cursor[keys[i]] = { ...cursor[keys[i]] };
        cursor = cursor[keys[i]];
      }
      cursor[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('images', f));
      const { data } = await uploadImages(fd);
      const newImages = data.data.map((img, idx) => ({
        url: img.url,
        publicId: img.publicId,
        isPrimary: form.images.length === 0 && idx === 0,
      }));
      setForm((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
      toast.success(`${newImages.length} image(s) uploaded`);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Upload failed. Cloudinary may not be configured — paste image URLs instead.'
      );
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addImageByUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      toast.error('Image URL must start with http:// or https://');
      return;
    }
    setForm((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        {
          url,
          publicId: `external-${Date.now()}`,
          isPrimary: prev.images.length === 0,
        },
      ],
    }));
    setImageUrlInput('');
  };

  const removeImage = (idx) => {
    setForm((prev) => {
      const newImages = prev.images.filter((_, i) => i !== idx);
      // Ensure something remains primary
      if (newImages.length > 0 && !newImages.some((img) => img.isPrimary)) {
        newImages[0].isPrimary = true;
      }
      return { ...prev, images: newImages };
    });
  };

  const setPrimary = (idx) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({ ...img, isPrimary: i === idx })),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Product name is required');
    if (!form.description.trim()) return toast.error('Description is required');
    if (!form.price) return toast.error('Price is required');
    if (form.images.length === 0) return toast.error('Add at least one image');
    if (!form.category) return toast.error('Pick a category');

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        shortDescription: form.shortDescription.trim() || undefined,
        description: form.description.trim(),
        price: dollarsToCents(form.price),
        compareAtPrice: form.compareAtPrice ? dollarsToCents(form.compareAtPrice) : undefined,
        category: form.category,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        images: form.images,
        inventory: {
          quantity: Number(form.inventory.quantity) || 0,
          sku: form.inventory.sku.trim() || undefined,
          trackInventory: form.inventory.trackInventory,
          lowStockThreshold: Number(form.inventory.lowStockThreshold) || 5,
        },
        shipping: {
          weight: form.shipping.weight ? Number(form.shipping.weight) : undefined,
          processingDays: Number(form.shipping.processingDays) || 3,
          freeShipping: form.shipping.freeShipping,
        },
        isActive: form.isActive,
        isFeatured: form.isFeatured,
      };

      if (isEdit) {
        await updateProduct(id, payload);
        toast.success('Product updated');
      } else {
        await createProduct(payload);
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between animate-(--animate-fade-down)">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-lg text-brand-warm-gray hover:bg-brand-cream"
          >
            <HiOutlineArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-serif">
              {isEdit ? 'Edit Product' : 'New Product'}
            </h1>
            <p className="text-sm text-brand-warm-gray">
              {isEdit ? 'Update product details' : 'Add a new product to your shop'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 border border-brand-linen rounded-xl font-medium hover:bg-brand-cream transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-brand-charcoal text-white rounded-xl font-medium hover:bg-brand-charcoal/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Basic Info">
            <Field label="Product Name *">
              <input
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="input"
                placeholder="e.g. Cozy Teddy Bear"
              />
            </Field>
            <Field label="Short Description">
              <input
                value={form.shortDescription}
                onChange={(e) => update('shortDescription', e.target.value)}
                className="input"
                placeholder="One-line teaser shown on cards"
              />
            </Field>
            <Field label="Description *">
              <textarea
                rows={6}
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                className="input font-sans"
                placeholder="Tell the story of this piece — materials, dimensions, care..."
              />
              <p className="text-xs text-brand-warm-gray mt-1">
                HTML allowed (e.g. <code>&lt;p&gt;</code>, <code>&lt;strong&gt;</code>)
              </p>
            </Field>
          </Card>

          <Card title="Images">
            {form.images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                {form.images.map((img, idx) => (
                  <div
                    key={img.publicId + idx}
                    className="relative group aspect-square rounded-xl overflow-hidden bg-brand-linen border-2 border-transparent data-[primary=true]:border-brand-blush-dark"
                    data-primary={img.isPrimary}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPrimary(idx)}
                        title="Set as primary"
                        className="p-1.5 bg-white rounded-full text-brand-charcoal hover:text-brand-gold"
                      >
                        <HiOutlineStar size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        title="Remove"
                        className="p-1.5 bg-white rounded-full text-brand-error"
                      >
                        <HiOutlineX size={16} />
                      </button>
                    </div>
                    {img.isPrimary && (
                      <span className="absolute top-1.5 left-1.5 bg-brand-blush-dark text-white text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-brand-linen rounded-xl cursor-pointer hover:border-brand-blush-dark hover:bg-brand-cream transition-colors">
                <HiOutlineUpload size={18} />
                <span className="text-sm font-medium">
                  {uploading ? 'Uploading...' : 'Upload images'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="...or paste an image URL"
                className="input flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImageByUrl();
                  }
                }}
              />
              <button
                type="button"
                onClick={addImageByUrl}
                className="px-4 py-2.5 border border-brand-linen rounded-xl text-sm font-medium hover:bg-brand-cream"
              >
                Add URL
              </button>
            </div>
          </Card>

          <Card title="Pricing">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price * (INR)">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => update('price', e.target.value)}
                  className="input"
                  placeholder="899"
                />
              </Field>
              <Field label="Compare-at Price (for sales)">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.compareAtPrice}
                  onChange={(e) => update('compareAtPrice', e.target.value)}
                  className="input"
                  placeholder="1299"
                />
              </Field>
            </div>
          </Card>

          <Card title="Inventory">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Quantity in stock">
                <input
                  type="number"
                  min="0"
                  value={form.inventory.quantity}
                  onChange={(e) => update('inventory.quantity', e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="SKU (optional)">
                <input
                  value={form.inventory.sku}
                  onChange={(e) => update('inventory.sku', e.target.value)}
                  className="input"
                  placeholder="SB-AMI-001"
                />
              </Field>
              <Field label="Low-stock alert threshold">
                <input
                  type="number"
                  min="0"
                  value={form.inventory.lowStockThreshold}
                  onChange={(e) =>
                    update('inventory.lowStockThreshold', e.target.value)
                  }
                  className="input"
                />
              </Field>
              <Field label="Track inventory">
                <Toggle
                  checked={form.inventory.trackInventory}
                  onChange={(v) => update('inventory.trackInventory', v)}
                />
              </Field>
            </div>
          </Card>

          <Card title="Shipping">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Weight (oz)">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.shipping.weight}
                  onChange={(e) => update('shipping.weight', e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Processing days">
                <input
                  type="number"
                  min="1"
                  value={form.shipping.processingDays}
                  onChange={(e) => update('shipping.processingDays', e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Free shipping">
                <Toggle
                  checked={form.shipping.freeShipping}
                  onChange={(v) => update('shipping.freeShipping', v)}
                />
              </Field>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card title="Visibility">
            <Field label="Status">
              <Toggle
                checked={form.isActive}
                onChange={(v) => update('isActive', v)}
                label={form.isActive ? 'Active (visible)' : 'Hidden'}
              />
            </Field>
            <Field label="Featured">
              <Toggle
                checked={form.isFeatured}
                onChange={(v) => update('isFeatured', v)}
                label={form.isFeatured ? 'Shown on homepage' : 'Not featured'}
              />
            </Field>
          </Card>

          <Card title="Organization">
            <Field label="Category *">
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="input"
              >
                <option value="">— Select category —</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tags">
              <input
                value={form.tags}
                onChange={(e) => update('tags', e.target.value)}
                className="input"
                placeholder="amigurumi, cotton, gift"
              />
              <p className="text-xs text-brand-warm-gray mt-1">
                Comma-separated
              </p>
            </Field>
          </Card>
        </div>
      </div>

      {/* Field/input/toggle helpers via Tailwind classes — see arbitrary class names below */}
      <style>{`
        .input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          background: white;
          border: 1px solid var(--color-brand-linen);
          border-radius: 0.75rem;
          font-size: 0.875rem;
          color: var(--color-brand-charcoal);
          transition: border-color 0.15s;
        }
        .input:focus {
          outline: none;
          border-color: var(--color-brand-blush-dark);
        }
      `}</style>
    </form>
  );
};

const Card = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-brand-linen p-5 space-y-4 animate-(--animate-fade-up)">
    <h3 className="font-serif text-lg">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="block text-sm font-medium text-brand-charcoal mb-1.5">{label}</span>
    {children}
  </label>
);

const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`flex items-center gap-2 ${label ? '' : 'h-[42px]'}`}
  >
    <span
      className={`relative inline-block w-10 h-6 rounded-full transition-colors ${
        checked ? 'bg-brand-sage-dark' : 'bg-brand-linen'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-4' : ''
        }`}
      />
    </span>
    {label && <span className="text-sm text-brand-charcoal">{label}</span>}
  </button>
);

export default AdminProductForm;
