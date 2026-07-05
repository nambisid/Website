const { body } = require('express-validator');

const createOrderValidator = [
  body('shippingAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street is required')
    .isLength({ max: 200 })
    .withMessage('Street must be under 200 characters'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 100 })
    .withMessage('City must be under 100 characters'),
  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ max: 100 })
    .withMessage('State must be under 100 characters'),
  body('shippingAddress.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required')
    .isLength({ max: 20 })
    .withMessage('Zip code must be under 20 characters'),
  body('shippingAddress.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('paymentMethod')
    .isIn(['razorpay'])
    .withMessage('Payment method must be razorpay'),
  body('transactionId')
    .trim()
    .notEmpty()
    .withMessage('Transaction ID is required')
    .isLength({ max: 200 }),
];

module.exports = { createOrderValidator };
