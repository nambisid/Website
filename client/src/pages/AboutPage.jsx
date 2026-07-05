import { useEffect, useState } from 'react';
import { getSiteContent } from '../api/siteContentApi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AboutPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteContent()
      .then((res) => setContent(res.data.data))
      .catch(() => setContent({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const c = content || {};
  const paragraphs = c.aboutParagraphs?.length
    ? c.aboutParagraphs
    : [
        {
          text: "Stitch & Bloom was born from a simple love for the craft of crochet and a belief that handmade items carry a warmth that mass-produced goods never can.",
        },
        {
          text: 'Every piece in our collection is meticulously handcrafted using premium yarns sourced for their softness, durability, and beautiful color. From adorable amigurumi friends to cozy blankets and stylish accessories, each creation is a labor of love.',
        },
        {
          text: "We believe in slow fashion — taking the time to create something beautiful, something that will be treasured for years to come. When you purchase from Stitch & Bloom, you're not just buying a product; you're supporting handmade artisanship.",
        },
      ];

  return (
    <div className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-20 w-96 h-96 bg-brand-blush/30 rounded-full blur-3xl animate-(--animate-blob)" />
        <div
          className="absolute top-1/2 -left-20 w-72 h-72 bg-brand-sage/20 rounded-full blur-3xl animate-(--animate-blob)"
          style={{ animationDelay: '5s' }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-14 animate-(--animate-fade-up)">
          <p className="text-brand-blush-dark font-medium tracking-[0.25em] uppercase text-xs mb-4">
            About Us
          </p>
          <h1 className="text-5xl lg:text-6xl font-serif mb-6 leading-tight">
            {c.aboutTitle || 'Our Story'}
          </h1>
          {c.aboutLead && (
            <p className="text-xl text-brand-warm-gray font-accent italic max-w-2xl mx-auto">
              {c.aboutLead}
            </p>
          )}
        </div>

        <div className="prose prose-lg mx-auto text-brand-warm-gray leading-relaxed space-y-6">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="animate-(--animate-fade-up)"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {p.text}
            </p>
          ))}

          {c.aboutFounderQuote && (
            <div className="bg-gradient-to-br from-brand-cream to-brand-blush/30 rounded-3xl p-10 my-12 text-center not-prose animate-(--animate-fade-up)">
              <p className="font-accent italic text-2xl text-brand-charcoal leading-relaxed">
                "{c.aboutFounderQuote}"
              </p>
              {c.aboutFounderName && (
                <p className="mt-4 text-sm uppercase tracking-[0.2em] text-brand-blush-dark font-semibold">
                  — {c.aboutFounderName}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
