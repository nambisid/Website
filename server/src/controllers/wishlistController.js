const Wishlist = require('../models/Wishlist');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// @desc    Get user's wishlist
// @route   GET /api/v1/wishlist
exports.getWishlist = catchAsync(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
    'products',
    'name slug price images ratings isActive'
  );

  if (!wishlist) {
    wishlist = { products: [] };
  }

  res.json({ success: true, data: wishlist });
});

// @desc    Add product to wishlist
// @route   POST /api/v1/wishlist/:productId
exports.addToWishlist = catchAsync(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user._id, products: [] });
  }

  if (wishlist.products.includes(req.params.productId)) {
    throw new ApiError(400, 'Product already in wishlist');
  }

  wishlist.products.push(req.params.productId);
  await wishlist.save();

  wishlist = await Wishlist.findById(wishlist._id).populate(
    'products',
    'name slug price images ratings isActive'
  );

  res.json({ success: true, data: wishlist });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/v1/wishlist/:productId
exports.removeFromWishlist = catchAsync(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    throw new ApiError(404, 'Wishlist not found');
  }

  wishlist.products = wishlist.products.filter(
    (p) => p.toString() !== req.params.productId
  );
  await wishlist.save();

  const populatedWishlist = await Wishlist.findById(wishlist._id).populate(
    'products',
    'name slug price images ratings isActive'
  );

  res.json({ success: true, data: populatedWishlist });
});
