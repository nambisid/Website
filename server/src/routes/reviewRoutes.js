const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createReviewValidator } = require('../utils/validators/reviewValidators');

// Public
router.get('/product/:productId', reviewController.getProductReviews);

// Authenticated
router.post('/product/:productId', auth, createReviewValidator, validate, reviewController.createReview);
router.put('/:id', auth, reviewController.updateReview);
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;
