const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const updateProductRatings = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(stats[0].average * 10) / 10,
      'ratings.count': stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': 0,
      'ratings.count': 0,
    });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/v1/reviews/product/:productId
exports.getProductReviews = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const filter = { product: req.params.productId, isApproved: true };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Review.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: reviews,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// @desc    Create a review
// @route   POST /api/v1/reviews/product/:productId
exports.createReview = catchAsync(async (req, res) => {
  const { rating, title, comment } = req.body;
  const productId = req.params.productId;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    user: req.user._id,
    product: productId,
  });
  if (existingReview) {
    throw new ApiError(400, 'You have already reviewed this product');
  }

  // Check if user purchased this product
  const hasPurchased = await Order.findOne({
    user: req.user._id,
    'items.product': productId,
    status: { $in: ['delivered', 'shipped'] },
  });

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating,
    title,
    comment,
    isVerifiedPurchase: !!hasPurchased,
  });

  await updateProductRatings(product._id);

  const populatedReview = await Review.findById(review._id).populate(
    'user',
    'firstName lastName'
  );

  res.status(201).json({ success: true, data: populatedReview });
});

// @desc    Update own review
// @route   PUT /api/v1/reviews/:id
exports.updateReview = catchAsync(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  const { rating, title, comment } = req.body;
  if (rating) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment !== undefined) review.comment = comment;
  await review.save();

  await updateProductRatings(review.product);

  res.json({ success: true, data: review });
});

// @desc    Delete own review
// @route   DELETE /api/v1/reviews/:id
exports.deleteReview = catchAsync(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  const productId = review.product;
  await review.deleteOne();
  await updateProductRatings(productId);

  res.json({ success: true, message: 'Review deleted' });
});
