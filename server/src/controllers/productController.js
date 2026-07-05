const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// @desc    Get all products (paginated, filterable, sortable)
// @route   GET /api/v1/products
exports.getProducts = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    minPrice,
    maxPrice,
    tags,
    sort = 'newest',
    inStock,
  } = req.query;

  const filter = { isActive: true };

  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseInt(minPrice);
    if (maxPrice) filter.price.$lte = parseInt(maxPrice);
  }
  if (tags) filter.tags = { $in: tags.split(',').map((t) => t.trim().toLowerCase()) };
  if (inStock === 'true') filter['inventory.quantity'] = { $gt: 0 };

  const sortOptions = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { 'ratings.average': -1 },
    name_asc: { name: 1 },
  };

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get single product by slug
// @route   GET /api/v1/products/:slug
exports.getProduct = catchAsync(async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true,
  }).populate('category', 'name slug');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({ success: true, data: product });
});

// @desc    Get single product by id (Admin) — includes inactive
// @route   GET /api/v1/products/admin/:id
exports.getProductByIdAdmin = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    'category',
    'name slug'
  );

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({ success: true, data: product });
});

// @desc    List all products including inactive (Admin)
// @route   GET /api/v1/products/admin/all
exports.getAllProductsAdmin = catchAsync(async (req, res) => {
  const products = await Product.find({})
    .populate('category', 'name slug')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: products });
});

// @desc    Get featured products
// @route   GET /api/v1/products/featured
exports.getFeaturedProducts = catchAsync(async (req, res) => {
  const products = await Product.find({ isActive: true, isFeatured: true })
    .populate('category', 'name slug')
    .limit(8);

  res.json({ success: true, data: products });
});

// @desc    Search products
// @route   GET /api/v1/products/search
exports.searchProducts = catchAsync(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;

  if (!q) {
    throw new ApiError(400, 'Search query is required');
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const filter = {
    isActive: true,
    $text: { $search: q },
  };

  const [products, total] = await Promise.all([
    Product.find(filter, { score: { $meta: 'textScore' } })
      .populate('category', 'name slug')
      .sort({ score: { $meta: 'textScore' } })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// @desc    Create a product (Admin)
// @route   POST /api/v1/products
exports.createProduct = catchAsync(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

// @desc    Update a product (Admin)
// @route   PUT /api/v1/products/:id
exports.updateProduct = catchAsync(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({ success: true, data: product });
});

// @desc    Delete a product (Admin - soft delete)
// @route   DELETE /api/v1/products/:id
exports.deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({ success: true, message: 'Product deactivated' });
});
