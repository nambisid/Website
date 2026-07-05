const Category = require('../models/Category');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// @desc    Get all categories (public — active only)
// @route   GET /api/v1/categories
exports.getCategories = catchAsync(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate('parent', 'name slug')
    .sort('sortOrder');

  res.json({ success: true, data: categories });
});

// @desc    Get all categories incl. inactive (Admin)
// @route   GET /api/v1/categories/admin/all
exports.getAllCategoriesAdmin = catchAsync(async (req, res) => {
  const categories = await Category.find({})
    .populate('parent', 'name slug')
    .sort('sortOrder');

  // Annotate each with product count (so admin can see what they're deleting)
  const counts = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = counts.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {});

  const enriched = categories.map((c) => ({
    ...c.toObject(),
    productCount: countMap[c._id.toString()] || 0,
  }));

  res.json({ success: true, data: enriched });
});

// @desc    Get single category by slug
// @route   GET /api/v1/categories/:slug
exports.getCategory = catchAsync(async (req, res) => {
  const category = await Category.findOne({
    slug: req.params.slug,
    isActive: true,
  });

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  res.json({ success: true, data: category });
});

// @desc    Create a category (Admin)
// @route   POST /api/v1/categories
exports.createCategory = catchAsync(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

// @desc    Update a category (Admin)
// @route   PUT /api/v1/categories/:id
exports.updateCategory = catchAsync(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  res.json({ success: true, data: category });
});

// @desc    Delete a category (Admin - only if no products)
// @route   DELETE /api/v1/categories/:id
exports.deleteCategory = catchAsync(async (req, res) => {
  const productCount = await Product.countDocuments({ category: req.params.id });
  if (productCount > 0) {
    throw new ApiError(400, `Cannot delete category with ${productCount} products. Reassign them first.`);
  }

  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  res.json({ success: true, message: 'Category deleted' });
});
