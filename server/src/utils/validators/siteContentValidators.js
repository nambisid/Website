const { body } = require('express-validator');

const text = (field, max, label) =>
  body(field)
    .optional({ checkFalsy: false })
    .isString()
    .withMessage(`${label} must be text`)
    .isLength({ max })
    .withMessage(`${label} must be under ${max} characters`);

const optionalUrl = (field, label) =>
  body(field)
    .optional({ checkFalsy: true })
    .custom((v) => {
      if (typeof v !== 'string') return false;
      // Allow internal paths (/shop) or full URLs
      if (v.startsWith('/')) return true;
      try {
        const url = new URL(v);
        return ['http:', 'https:'].includes(url.protocol);
      } catch {
        return false;
      }
    })
    .withMessage(`${label} must be a path (/shop) or a full URL`);

const updateSiteContentValidator = [
  text('heroEyebrow', 80, 'Hero eyebrow'),
  text('heroTitle', 120, 'Hero title'),
  text('heroTitleAccent', 120, 'Hero title accent'),
  text('heroSubtitle', 600, 'Hero subtitle'),
  text('heroPrimaryCtaLabel', 40, 'Primary CTA label'),
  optionalUrl('heroPrimaryCtaHref', 'Primary CTA link'),
  text('heroSecondaryCtaLabel', 40, 'Secondary CTA label'),
  optionalUrl('heroSecondaryCtaHref', 'Secondary CTA link'),

  text('storyEyebrow', 80, 'Story eyebrow'),
  text('storyTitle', 120, 'Story title'),
  text('storyTitleAccent', 120, 'Story title accent'),
  text('storyQuote', 200, 'Story quote'),

  body('storyParagraphs')
    .optional()
    .isArray({ max: 6 })
    .withMessage('Story paragraphs must be an array of up to 6'),
  body('storyParagraphs.*.text')
    .optional()
    .isString()
    .isLength({ min: 1, max: 1500 })
    .withMessage('Each paragraph must be 1-1500 characters'),

  body('trustBadges')
    .optional()
    .isArray({ max: 8 })
    .withMessage('Trust badges must be an array of up to 8'),
  body('trustBadges.*.title')
    .optional()
    .isString()
    .isLength({ min: 1, max: 60 })
    .withMessage('Badge title must be 1-60 characters'),
  body('trustBadges.*.description')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Badge description must be 1-200 characters'),
  body('trustBadges.*.icon')
    .optional()
    .isString()
    .isLength({ max: 8 })
    .withMessage('Badge icon must be a single emoji or short string'),

  text('aboutTitle', 120, 'About title'),
  text('aboutLead', 400, 'About lead'),
  body('aboutParagraphs')
    .optional()
    .isArray({ max: 10 })
    .withMessage('About paragraphs must be an array of up to 10'),
  body('aboutParagraphs.*.text')
    .optional()
    .isString()
    .isLength({ min: 1, max: 1500 })
    .withMessage('Each paragraph must be 1-1500 characters'),
  text('aboutFounderName', 80, 'Founder name'),
  text('aboutFounderQuote', 400, 'Founder quote'),

  body('contactEmail')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Contact email must be a valid email'),
  optionalUrl('socialInstagram', 'Instagram URL'),
  optionalUrl('socialPinterest', 'Pinterest URL'),
];

module.exports = { updateSiteContentValidator };
