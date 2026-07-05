import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, searchProducts } from '../api/productApi';
import { getCategories } from '../api/adminApi';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name_asc', label: 'A - Z' },
];

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentQuery = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    getCategories().then(({ data }) => setCategories(data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        let response;
        if (currentQuery) {
          response = await searchProducts({ q: currentQuery, page: currentPage, limit: 12 });
        } else {
          const params = { page: currentPage, limit: 12, sort: currentSort };
          if (currentCategory) params.category = currentCategory;
          response = await getProducts(params);
        }
        setProducts(response.data.data);
        setPagination(response.data.pagination);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [currentCategory, currentSort, currentQuery, currentPage]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-serif mb-2">
          {currentQuery ? `Results for "${currentQuery}"` : 'Shop All'}
        </h1>
        {pagination.total !== undefined && (
          <p className="text-brand-warm-gray">{pagination.total} products</p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="sticky top-24">
            <h3 className="font-sans font-semibold text-sm uppercase tracking-wider mb-3">Categories</h3>
            <ul className="space-y-1 mb-8">
              <li>
                <button
                  onClick={() => updateFilter('category', '')}
                  className={`block w-full text-left py-1.5 px-3 rounded-lg text-sm transition-colors ${
                    !currentCategory ? 'bg-brand-blush/20 text-brand-blush-dark font-medium' : 'text-brand-charcoal hover:bg-brand-cream'
                  }`}
                >
                  All Products
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat._id}>
                  <button
                    onClick={() => updateFilter('category', cat.slug)}
                    className={`block w-full text-left py-1.5 px-3 rounded-lg text-sm transition-colors ${
                      currentCategory === cat.slug ? 'bg-brand-blush/20 text-brand-blush-dark font-medium' : 'text-brand-charcoal hover:bg-brand-cream'
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>

            <h3 className="font-sans font-semibold text-sm uppercase tracking-wider mb-3">Sort By</h3>
            <select
              value={currentSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-brand-linen rounded-lg text-sm focus:outline-none focus:border-brand-blush-dark"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {loading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-brand-warm-gray text-lg">No products found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('page', page);
                        setSearchParams(params);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        page === currentPage
                          ? 'bg-brand-charcoal text-white'
                          : 'bg-white border border-brand-linen text-brand-charcoal hover:bg-brand-cream'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ShopPage;
