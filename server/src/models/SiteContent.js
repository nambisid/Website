const mongoose = require('mongoose');

/**
 * Singleton document holding editable site copy. Admin updates this from
 * /admin/site-content; public pages (Home, About) consume it from
 * GET /api/v1/site-content. There is always exactly one document with
 * key='default'.
 */
const trustBadgeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, required: true, trim: true, maxlength: 200 },
    icon: { type: String, default: '✨', maxlength: 8 },
  },
  { _id: false }
);

const aboutParagraphSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 1500 },
  },
  { _id: false }
);

const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true, index: true },

    // Hero
    heroEyebrow: { type: String, default: 'Handmade with Love', maxlength: 80 },
    heroTitle: { type: String, default: 'Beautiful Crochet,', maxlength: 120 },
    heroTitleAccent: {
      type: String,
      default: 'Made Just for You',
      maxlength: 120,
    },
    heroSubtitle: {
      type: String,
      default:
        'Discover one-of-a-kind handmade crochet pieces crafted with care. From cozy blankets to adorable amigurumi, every stitch tells a story.',
      maxlength: 600,
    },
    heroPrimaryCtaLabel: { type: String, default: 'Shop Collection', maxlength: 40 },
    heroPrimaryCtaHref: { type: String, default: '/shop', maxlength: 200 },
    heroSecondaryCtaLabel: { type: String, default: 'Our Story', maxlength: 40 },
    heroSecondaryCtaHref: { type: String, default: '/about', maxlength: 200 },

    // Story section
    storyEyebrow: { type: String, default: 'The Maker', maxlength: 80 },
    storyTitle: { type: String, default: 'Made by Hand,', maxlength: 120 },
    storyTitleAccent: {
      type: String,
      default: 'Crafted with Heart',
      maxlength: 120,
    },
    storyQuote: {
      type: String,
      default: 'Every piece is a labor of love',
      maxlength: 200,
    },
    storyParagraphs: {
      type: [aboutParagraphSchema],
      default: [
        {
          text: "Each piece in our collection is meticulously handcrafted using premium yarns and time-honored crochet techniques. No two items are exactly alike — that's the beauty of handmade.",
        },
        {
          text: 'From choosing the perfect yarn to the final stitch, every step is done with intention and care. We believe in slow fashion and creating pieces that last a lifetime.',
        },
      ],
    },

    // Trust badges
    trustBadges: {
      type: [trustBadgeSchema],
      default: [
        { title: 'Handmade', description: 'Every piece crafted by hand', icon: '✋' },
        { title: 'Secure Checkout', description: 'SSL encrypted payment', icon: '🔒' },
        { title: 'Free Shipping', description: 'On orders over ₹999', icon: '📦' },
        { title: 'Made to Last', description: 'Premium quality yarns', icon: '✨' },
      ],
    },

    // About page
    aboutTitle: {
      type: String,
      default: 'Our Story',
      maxlength: 120,
    },
    aboutLead: {
      type: String,
      default:
        'Yume Yarns was born from a simple love of yarn and the people we make for.',
      maxlength: 400,
    },
    aboutParagraphs: {
      type: [aboutParagraphSchema],
      default: [
        {
          text: "We believe handmade matters. Every stitch carries intention. Every piece is a small act of slow craftsmanship — the opposite of disposable.",
        },
      ],
    },
    aboutFounderName: { type: String, default: '', maxlength: 80 },
    aboutFounderQuote: { type: String, default: '', maxlength: 400 },

    // Contact / footer
    contactEmail: { type: String, default: 'hello@yumeyarns.com', maxlength: 200 },
    socialInstagram: { type: String, default: '', maxlength: 200 },
    socialPinterest: { type: String, default: '', maxlength: 200 },
  },
  { timestamps: true }
);

siteContentSchema.statics.getOrCreate = async function () {
  let doc = await this.findOne({ key: 'default' });
  if (!doc) {
    doc = await this.create({ key: 'default' });
  }
  return doc;
};

module.exports = mongoose.model('SiteContent', siteContentSchema);
