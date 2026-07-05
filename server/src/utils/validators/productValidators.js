const { body } = require('express-validator');

const createProductValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 200 })
    .withMessage('Product name must be under 200 characters'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price')
    .isInt({ min: 1 })
    .withMessage('Price must be a positive integer (in cents)'),
  body('category').optional().isMongoId().withMessage('Invalid category ID'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('inventory.quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
];

const updateProductValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Product name must be under 200 characters'),
  body('price')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Price must be a positive integer (in cents)'),
  body('category').optional().isMongoId().withMessage('Invalid category ID'),
];

module.exports = { createProductValidator, updateProductValidator };
