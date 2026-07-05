import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineShoppingBag, HiOutlineHeart, HiOutlineUser, HiOutlineSearch, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <header className="bg-brand-ivory border-b border-brand-linen sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-brand-charcoal hover:text-brand-blush-dark transition-colors"
          >
            {mobileMenuOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Yume Yarns"
              className="h-14 w-14 lg:h-16 lg:w-16 rounded-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="flex flex-col leading-tight">
              <span className="font-serif text-2xl lg:text-3xl text-brand-charcoal tracking-tight lowercase">
                yume yarns
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-brand-warm-gray font-sans">
                Dreams Woven in Every Loop
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/shop" className="text-brand-charcoal hover:text-brand-blush-dark transition-colors font-medium">
              Shop
            </Link>
            <Link to="/shop?category=amigurumi" className="text-brand-charcoal hover:text-brand-blush-dark transition-colors font-medium">
              Amigurumi
            </Link>
            <Link to="/shop?category=home-decor" className="text-brand-charcoal hover:text-brand-blush-dark transition-colors font-medium">
              Home Decor
            </Link>
            <Link to="/shop?category=accessories" className="text-brand-charcoal hover:text-brand-blush-dark transition-colors font-medium">
              Accessories
            </Link>
            <Link to="/about" className="text-brand-charcoal hover:text-brand-blush-dark transition-colors font-medium">
              Our Story
            </Link>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-brand-charcoal hover:text-brand-blush-dark transition-colors"
            >
              <HiOutlineSearch size={22} />
            </button>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link to="/wishlist" className="p-2 text-brand-charcoal hover:text-brand-blush-dark transition-colors hidden sm:block">
                <HiOutlineHeart size={22} />
              </Link>
            )}

            {/* Account */}
            <div className="relative group">
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                className="p-2 text-brand-charcoal hover:text-brand-blush-dark transition-colors"
              >
                <HiOutlineUser size={22} />
              </Link>
              {isAuthenticated && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-brand-linen opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                  <p className="px-4 py-1 text-sm text-brand-warm-gray">Hi, {user?.firstName}</p>
                  <hr className="my-1 border-brand-linen" />
                  <Link to="/account" className="block px-4 py-2 text-sm hover:bg-brand-cream transition-colors">My Account</Link>
                  <Link to="/account/orders" className="block px-4 py-2 text-sm hover:bg-brand-cream transition-colors">Orders</Link>
                  {isAdmin && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-brand-sage-dark font-medium hover:bg-brand-cream transition-colors">Admin Dashboard</Link>
                  )}
                  <hr className="my-1 border-brand-linen" />
                  <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-brand-error hover:bg-brand-cream transition-colors">
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 text-brand-charcoal hover:text-brand-blush-dark transition-colors relative"
            >
              <HiOutlineShoppingBag size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-blush-dark text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search bar dropdown */}
        {searchOpen && (
          <div className="pb-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search handmade treasures..."
                className="w-full px-4 py-3 bg-white border border-brand-linen rounded-xl focus:outline-none focus:border-brand-blush-dark font-sans text-brand-charcoal placeholder:text-brand-warm-gray"
                autoFocus
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-warm-gray hover:text-brand-blush-dark">
                <HiOutlineSearch size={20} />
              </button>
            </form>
          </div>
        )}
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-brand-linen">
          <div className="px-4 py-4 space-y-3">
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-brand-charcoal font-medium">Shop All</Link>
            <Link to="/shop?category=amigurumi" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-brand-charcoal font-medium">Amigurumi</Link>
            <Link to="/shop?category=home-decor" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-brand-charcoal font-medium">Home Decor</Link>
            <Link to="/shop?category=accessories" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-brand-charcoal font-medium">Accessories</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-brand-charcoal font-medium">Our Story</Link>
            {isAuthenticated && (
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-brand-charcoal font-medium">Wishlist</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
