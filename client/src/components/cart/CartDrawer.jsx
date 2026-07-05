import { Link } from 'react-router-dom';
import { HiOutlineX, HiMinus, HiPlus, HiOutlineTrash } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';

const CartDrawer = () => {
  const { cart, isOpen, setIsOpen, updateItem, removeItem, subtotal } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brand-linen">
          <h2 className="font-serif text-xl">Your Bag</h2>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:text-brand-blush-dark transition-colors">
            <HiOutlineX size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {!isAuthenticated ? (
            <div className="text-center py-12">
              <p className="text-brand-warm-gray mb-4">Sign in to view your bag</p>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="inline-block px-6 py-2 bg-brand-blush-dark text-white rounded-xl font-medium hover:bg-brand-blush transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : cart.items?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-brand-warm-gray mb-4">Your bag is empty</p>
              <Link
                to="/shop"
                onClick={() => setIsOpen(false)}
                className="inline-block px-6 py-2 bg-brand-blush-dark text-white rounded-xl font-medium hover:bg-brand-blush transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => {
                const product = item.product;
                const image = product?.images?.find((img) => img.isPrimary) || product?.images?.[0];

                return (
                  <div key={item._id} className="flex gap-3 pb-4 border-b border-brand-linen last:border-0">
                    <img
                      src={image?.url || 'https://placehold.co/80x80/E8DFD4/7A7470?text=?'}
                      alt={product?.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${product?.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-medium text-brand-charcoal hover:text-brand-blush-dark transition-colors line-clamp-1"
                      >
                        {product?.name}
                      </Link>
                      <p className="text-sm font-semibold mt-1">
                        {formatCurrency(product?.price || 0)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateItem(product?._id, item.quantity - 1)}
                          className="p-1 border border-brand-linen rounded-md hover:bg-brand-cream transition-colors"
                        >
                          <HiMinus size={12} />
                        </button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(product?._id, item.quantity + 1)}
                          className="p-1 border border-brand-linen rounded-md hover:bg-brand-cream transition-colors"
                        >
                          <HiPlus size={12} />
                        </button>
                        <button
                          onClick={() => removeItem(product?._id)}
                          className="ml-auto p-1 text-brand-warm-gray hover:text-brand-error transition-colors"
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {isAuthenticated && cart.items?.length > 0 && (
          <div className="p-4 border-t border-brand-linen">
            {/* Free shipping progress */}
            {subtotal < 99900 && (
              <div className="mb-3">
                <p className="text-xs text-brand-warm-gray mb-1">
                  {formatCurrency(99900 - subtotal)} away from free shipping!
                </p>
                <div className="w-full bg-brand-linen rounded-full h-1.5">
                  <div
                    className="bg-brand-sage h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min((subtotal / 99900) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between mb-3">
              <span className="font-medium">Subtotal</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>

            <Link
              to="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full py-3 bg-brand-charcoal text-white text-center rounded-xl font-medium hover:bg-brand-charcoal/90 transition-colors"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
