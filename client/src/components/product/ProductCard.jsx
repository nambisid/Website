import { Link } from 'react-router-dom';
import { HiOutlineHeart } from 'react-icons/hi';
import { formatCurrency } from '../../utils/formatCurrency';
import StarRating from '../common/StarRating';

const ProductCard = ({ product }) => {
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-brand-linen hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
      <Link to={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden">
        <img
          src={primaryImage?.url || 'https://placehold.co/400x400/E8DFD4/7A7470?text=No+Image'}
          alt={primaryImage?.altText || product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        {/* Soft gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className="absolute top-3 left-3 bg-brand-error text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md animate-(--animate-fade-in)">
            Sale
          </span>
        )}
        {product.inventory?.quantity === 0 && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-brand-charcoal text-white text-sm font-medium px-4 py-2 rounded-full">
              Sold Out
            </span>
          </div>
        )}
        <button
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-brand-blush-dark hover:scale-110 group-hover:translate-y-0 translate-y-2"
          onClick={(e) => e.preventDefault()}
        >
          <HiOutlineHeart size={18} />
        </button>
      </Link>

      <div className="p-4">
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="font-sans font-medium text-brand-charcoal text-sm mb-1 hover:text-brand-blush-dark transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {product.ratings?.count > 0 && (
          <StarRating rating={Math.round(product.ratings.average)} count={product.ratings.count} size={14} />
        )}

        <div className="flex items-center gap-2 mt-2">
          <span className="font-sans font-semibold text-brand-charcoal">
            {formatCurrency(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-brand-warm-gray line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
        </div>

        {product.shortDescription && (
          <p className="text-xs text-brand-warm-gray mt-1 line-clamp-2">
            {product.shortDescription}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
