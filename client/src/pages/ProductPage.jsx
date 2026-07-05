import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HiOutlineHeart, HiHeart, HiMinus, HiPlus } from 'react-icons/hi';
import { getProduct } from '../api/productApi';
import { getProductReviews } from '../api/reviewApi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import StarRating from '../components/common/StarRating';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

const ProductPage = () => {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getProduct(slug);
        setProduct(data.data);
        const reviewRes = await getProductReviews(data.data._id);
        setReviews(reviewRes.data.data);
      } catch {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="text-center py-16"><p className="text-brand-warm-gray">Product not found</p></div>;

  const images = product.images || [];
  const currentImage = images[selectedImage] || images[0];
  const attributes = product.attributes instanceof Map
    ? Object.fromEntries(product.attributes)
    : product.attributes || {};
  const inStock = !product.inventory?.trackInventory || product.inventory.quantity > 0;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to your bag');
      return;
    }
    addItem(product._id, quantity);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-brand-linen mb-4">
            <img
              src={currentImage?.url || 'https://placehold.co/600x600/E8DFD4/7A7470?text=No+Image'}
              alt={currentImage?.altText || product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-colors ${
                    i === selectedImage ? 'border-brand-blush-dark' : 'border-brand-linen'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.category && (
            <p className="text-sm text-brand-blush-dark font-medium mb-2">{product.category.name}</p>
          )}
          <h1 className="text-3xl lg:text-4xl font-serif mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={Math.round(product.ratings?.average || 0)} count={product.ratings?.count} />
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-semibold">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-lg text-brand-warm-gray line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-brand-warm-gray leading-relaxed mb-6">{product.shortDescription}</p>
          )}

          {/* Attributes */}
          {Object.keys(attributes).length > 0 && (
            <div className="mb-6 space-y-2">
              {Object.entries(attributes).map(([key, value]) => (
                <div key={key} className="flex gap-2 text-sm">
                  <span className="text-brand-warm-gray capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="text-brand-charcoal font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center border border-brand-linen rounded-xl">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-brand-cream transition-colors rounded-l-xl"
              >
                <HiMinus size={16} />
              </button>
              <span className="px-4 text-center min-w-[40px]">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 hover:bg-brand-cream transition-colors rounded-r-xl"
              >
                <HiPlus size={16} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="flex-1 py-3 px-8 bg-brand-charcoal text-white rounded-xl font-medium hover:bg-brand-charcoal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inStock ? 'Add to Bag' : 'Sold Out'}
            </button>

            <button
              onClick={() => setWishlisted(!wishlisted)}
              className="p-3 border border-brand-linen rounded-xl hover:bg-brand-cream transition-colors"
            >
              {wishlisted ? (
                <HiHeart size={20} className="text-brand-blush-dark" />
              ) : (
                <HiOutlineHeart size={20} />
              )}
            </button>
          </div>

          {/* Shipping info */}
          <div className="bg-brand-cream rounded-xl p-4 space-y-2 text-sm">
            {product.shipping?.freeShipping ? (
              <p className="text-brand-sage-dark font-medium">Free Shipping</p>
            ) : (
              <p className="text-brand-warm-gray">Free shipping on orders over ₹999</p>
            )}
            <p className="text-brand-warm-gray">
              Handmade to order &mdash; ships in {product.shipping?.processingDays || 3}-{(product.shipping?.processingDays || 3) + 2} business days
            </p>
          </div>

          {/* Description */}
          <div className="mt-8 pt-8 border-t border-brand-linen">
            <h3 className="font-serif text-xl mb-4">Description</h3>
            <div
              className="text-brand-warm-gray leading-relaxed prose prose-sm"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>

          {/* Reviews */}
          <div className="mt-8 pt-8 border-t border-brand-linen">
            <h3 className="font-serif text-xl mb-4">
              Reviews ({product.ratings?.count || 0})
            </h3>
            {reviews.length === 0 ? (
              <p className="text-brand-warm-gray text-sm">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="pb-4 border-b border-brand-linen last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StarRating rating={review.rating} size={14} />
                      {review.isVerifiedPurchase && (
                        <span className="text-xs text-brand-sage font-medium">Verified Purchase</span>
                      )}
                    </div>
                    <p className="font-medium text-sm">{review.title}</p>
                    <p className="text-sm text-brand-warm-gray mt-1">{review.comment}</p>
                    <p className="text-xs text-brand-warm-gray mt-2">
                      {review.user?.firstName} {review.user?.lastName?.[0]}.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
