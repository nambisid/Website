const { body } = require('express-validator');

const createCategoryValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Category name must be 2-60 characters'),
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 300 })
    .withMessage('Description must be under 300 characters'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0, max: 999 })
    .withMessage('Sort order must be 0-999'),
  body('parent')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid parent category ID'),
  body('image.url')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Image URL must be a valid URL'),
];

const updateCategoryValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Category name must be 2-60 characters'),
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 300 })
    .withMessage('Description must be under 300 characters'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0, max: 999 })
    .withMessage('Sort order must be 0-999'),
  body('parent')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid parent category ID'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

module.exports = { createCategoryValidator, updateCategoryValidator };
