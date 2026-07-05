import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-brand-charcoal text-brand-linen mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="font-serif text-2xl text-white mb-3">Yume Yarns</h3>
            <p className="text-sm text-brand-warm-gray leading-relaxed">
              Handmade with love, one stitch at a time. Every piece tells a story of care, creativity, and craftsmanship.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-sans font-semibold text-white text-sm uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><Link to="/shop" className="text-sm text-brand-warm-gray hover:text-brand-blush transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=amigurumi" className="text-sm text-brand-warm-gray hover:text-brand-blush transition-colors">Amigurumi</Link></li>
              <li><Link to="/shop?category=home-decor" className="text-sm text-brand-warm-gray hover:text-brand-blush transition-colors">Home Decor</Link></li>
              <li><Link to="/shop?category=accessories" className="text-sm text-brand-warm-gray hover:text-brand-blush transition-colors">Accessories</Link></li>
              <li><Link to="/shop?category=baby-kids" className="text-sm text-brand-warm-gray hover:text-brand-blush transition-colors">Baby & Kids</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-sans font-semibold text-white text-sm uppercase tracking-wider mb-4">Help</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-brand-warm-gray hover:text-brand-blush transition-colors">Our Story</Link></li>
              <li><Link to="/contact" className="text-sm text-brand-warm-gray hover:text-brand-blush transition-colors">Contact Us</Link></li>
              <li><span className="text-sm text-brand-warm-gray">Shipping & Returns</span></li>
              <li><span className="text-sm text-brand-warm-gray">Care Instructions</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-sans font-semibold text-white text-sm uppercase tracking-wider mb-4">Stay in the Loop</h4>
            <p className="text-sm text-brand-warm-gray mb-3">Get updates on new creations and exclusive offers.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder:text-brand-warm-gray focus:outline-none focus:border-brand-blush"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-blush-dark text-white text-sm font-medium rounded-lg hover:bg-brand-blush transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-brand-warm-gray">
            &copy; {new Date().getFullYear()} Yume Yarns. All rights reserved. Made with care.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
