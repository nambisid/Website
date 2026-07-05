import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProducts } from '../api/productApi';
import { getSiteContent } from '../api/siteContentApi';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, contentRes] = await Promise.all([
          getFeaturedProducts(),
          getSiteContent(),
        ]);
        setFeatured(prodRes.data.data);
        setContent(contentRes.data.data);
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const c = content || {};

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-blush/40 via-brand-ivory to-brand-sage/20 overflow-hidden">
        {/* Animated decorative blobs */}
        <div className="absolute -right-32 -top-32 w-96 h-96 bg-brand-blush/40 rounded-full blur-3xl animate-(--animate-blob)" />
        <div
          className="absolute right-1/4 top-1/3 w-72 h-72 bg-brand-sage/30 rounded-full blur-3xl animate-(--animate-blob)"
          style={{ animationDelay: '4s' }}
        />
        <div
          className="absolute -left-20 bottom-0 w-80 h-80 bg-brand-gold/20 rounded-full blur-3xl animate-(--animate-blob)"
          style={{ animationDelay: '8s' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-2xl">
            <p className="text-brand-blush-dark font-medium tracking-[0.25em] uppercase text-xs mb-5 animate-(--animate-fade-down)">
              ✿ {c.heroEyebrow || 'Handmade with Love'}
            </p>
            <h1 className="text-5xl lg:text-7xl font-serif text-brand-charcoal leading-[1.05] mb-6 animate-(--animate-fade-up)">
              {c.heroTitle || 'Beautiful Crochet,'}{' '}
              <span className="text-brand-blush-dark italic font-accent inline-block animate-(--animate-fade-up) delay-200">
                {c.heroTitleAccent || 'Made Just for You'}
              </span>
            </h1>
            <p className="text-lg text-brand-warm-gray leading-relaxed mb-10 max-w-lg animate-(--animate-fade-up) delay-300">
              {c.heroSubtitle ||
                'Discover one-of-a-kind handmade crochet pieces crafted with care. From cozy blankets to adorable amigurumi, every stitch tells a story.'}
            </p>
            <div className="flex flex-wrap gap-4 animate-(--animate-fade-up) delay-400">
              <Link
                to={c.heroPrimaryCtaHref || '/shop'}
                className="group relative px-8 py-3.5 bg-brand-charcoal text-white rounded-xl font-medium overflow-hidden transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                <span className="relative z-10">
                  {c.heroPrimaryCtaLabel || 'Shop Collection'} &rarr;
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-brand-blush-dark to-brand-charcoal translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
              </Link>
              <Link
                to={c.heroSecondaryCtaHref || '/about'}
                className="px-8 py-3.5 border-2 border-brand-charcoal text-brand-charcoal rounded-xl font-medium hover:bg-brand-charcoal hover:text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                {c.heroSecondaryCtaLabel || 'Our Story'}
              </Link>
            </div>
          </div>

          {/* Floating decorative elements */}
          <div className="hidden lg:block absolute right-12 top-24 text-7xl animate-(--animate-float) opacity-80">
            🧶
          </div>
          <div
            className="hidden lg:block absolute right-32 bottom-20 text-5xl animate-(--animate-float-slow) opacity-70"
            style={{ animationDelay: '1.5s' }}
          >
            🌸
          </div>
          <div
            className="hidden lg:block absolute right-1/3 top-1/2 text-4xl animate-(--animate-float) opacity-60"
            style={{ animationDelay: '3s' }}
          >
            ✿
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12 animate-(--animate-fade-up)">
          <p className="text-brand-blush-dark font-medium tracking-[0.25em] uppercase text-xs mb-3">
            Browse
          </p>
          <h2 className="text-4xl font-serif">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[
            { name: 'Amigurumi', slug: 'amigurumi', color: 'bg-brand-blush/30', icon: '🧸' },
            { name: 'Home Decor', slug: 'home-decor', color: 'bg-brand-sage/30', icon: '🏡' },
            { name: 'Accessories', slug: 'accessories', color: 'bg-brand-gold/30', icon: '👜' },
            { name: 'Baby & Kids', slug: 'baby-kids', color: 'bg-brand-cream', icon: '👶' },
          ].map((cat, idx) => (
            <Link
              key={cat.slug}
              to={`/shop?category=${cat.slug}`}
              className={`${cat.color} rounded-3xl p-8 text-center hover:shadow-xl transition-all group hover:-translate-y-2 hover:rotate-1 animate-(--animate-fade-up)`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="text-5xl mb-3 inline-block transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-12">
                {cat.icon}
              </div>
              <h3 className="font-serif text-xl text-brand-charcoal group-hover:text-brand-blush-dark transition-colors">
                {cat.name}
              </h3>
              <p className="text-sm text-brand-warm-gray mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Explore &rarr;
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="relative bg-gradient-to-b from-brand-cream/40 to-brand-ivory py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 animate-(--animate-fade-up)">
            <div>
              <p className="text-brand-blush-dark font-medium tracking-[0.25em] uppercase text-xs mb-3">
                Just Arrived
              </p>
              <h2 className="text-4xl font-serif">New Arrivals</h2>
            </div>
            <Link
              to="/shop"
              className="text-brand-blush-dark font-medium hover:underline group inline-flex items-center gap-1"
            >
              View All
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : featured.length === 0 ? (
            <p className="text-center text-brand-warm-gray py-8">
              Check back soon for new pieces.
            </p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {featured.map((product, idx) => (
                <div
                  key={product._id}
                  className="animate-(--animate-fade-up)"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative animate-(--animate-fade-up)">
            <div className="bg-gradient-to-br from-brand-blush/30 to-brand-sage/20 rounded-[3rem] aspect-square flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 shimmer-bg pointer-events-none" />
              <div className="text-center p-8 relative z-10">
                <span className="text-7xl mb-4 block animate-(--animate-float)">🧶</span>
                <p className="font-accent italic text-2xl text-brand-charcoal leading-snug">
                  "{c.storyQuote || 'Every piece is a labor of love'}"
                </p>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-brand-gold/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-brand-blush/30 rounded-full blur-2xl" />
          </div>

          <div className="animate-(--animate-fade-up) delay-200">
            <p className="text-brand-blush-dark font-medium tracking-[0.25em] uppercase text-xs mb-4">
              {c.storyEyebrow || 'The Maker'}
            </p>
            <h2 className="text-4xl lg:text-5xl font-serif mb-6 leading-tight">
              {c.storyTitle || 'Made by Hand,'}
              <br />
              <span className="font-accent italic text-brand-blush-dark">
                {c.storyTitleAccent || 'Crafted with Heart'}
              </span>
            </h2>
            {(c.storyParagraphs?.length
              ? c.storyParagraphs
              : [
                  {
                    text: "Each piece in our collection is meticulously handcrafted using premium yarns and time-honored crochet techniques. No two items are exactly alike — that's the beauty of handmade.",
                  },
                  {
                    text: 'From choosing the perfect yarn to the final stitch, every step is done with intention and care. We believe in slow fashion and creating pieces that last a lifetime.',
                  },
                ]
            ).map((p, i) => (
              <p
                key={i}
                className={`text-brand-warm-gray leading-relaxed ${
                  i === 0 ? 'text-lg mb-4' : 'mb-8'
                }`}
              >
                {p.text}
              </p>
            ))}
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-brand-blush-dark font-medium group"
            >
              Read Our Story
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="relative bg-gradient-to-r from-brand-blush/20 via-brand-cream to-brand-sage/20 py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand-blush rounded-full blur-3xl animate-(--animate-blob)" />
          <div
            className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-sage rounded-full blur-3xl animate-(--animate-blob)"
            style={{ animationDelay: '5s' }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {(c.trustBadges?.length
              ? c.trustBadges
              : [
                  { title: 'Handmade', description: 'Every piece crafted by hand', icon: '✋' },
                  { title: 'Secure Checkout', description: 'SSL encrypted payment', icon: '🔒' },
                  { title: 'Free Shipping', description: 'On orders over ₹999', icon: '📦' },
                  { title: 'Made to Last', description: 'Premium quality yarns', icon: '✨' },
                ]
            ).map((badge, idx) => (
              <div
                key={`${badge.title}-${idx}`}
                className="animate-(--animate-fade-up)"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="text-3xl mb-2 inline-block hover:scale-125 hover:-rotate-12 transition-transform duration-300 cursor-default">
                  {badge.icon}
                </div>
                <h4 className="font-sans font-semibold text-brand-charcoal mb-1">
                  {badge.title}
                </h4>
                <p className="text-sm text-brand-warm-gray">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
