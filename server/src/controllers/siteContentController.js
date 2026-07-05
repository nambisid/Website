const SiteContent = require('../models/SiteContent');
const catchAsync = require('../utils/catchAsync');

// @desc    Get site content (public)
// @route   GET /api/v1/site-content
exports.getSiteContent = catchAsync(async (req, res) => {
  const content = await SiteContent.getOrCreate();
  res.json({ success: true, data: content });
});

// Editable top-level fields. Anything not in this list is silently ignored.
const EDITABLE_FIELDS = [
  'heroEyebrow',
  'heroTitle',
  'heroTitleAccent',
  'heroSubtitle',
  'heroPrimaryCtaLabel',
  'heroPrimaryCtaHref',
  'heroSecondaryCtaLabel',
  'heroSecondaryCtaHref',
  'storyEyebrow',
  'storyTitle',
  'storyTitleAccent',
  'storyQuote',
  'storyParagraphs',
  'trustBadges',
  'aboutTitle',
  'aboutLead',
  'aboutParagraphs',
  'aboutFounderName',
  'aboutFounderQuote',
  'contactEmail',
  'socialInstagram',
  'socialPinterest',
];

// @desc    Update site content (Admin)
// @route   PUT /api/v1/site-content
exports.updateSiteContent = catchAsync(async (req, res) => {
  const updates = {};
  for (const field of EDITABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  const content = await SiteContent.findOneAndUpdate(
    { key: 'default' },
    updates,
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, data: content });
});
