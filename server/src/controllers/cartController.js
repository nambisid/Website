const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// @desc    Get current user's cart
// @route   GET /api/v1/cart
exports.getCart = catchAsync(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product',
    'name slug price images inventory.quantity isActive'
  );

  if (!cart) {
    cart = { items: [] };
  }

  res.json({ success: true, data: cart });
});

// @desc    Add item to cart
// @route   POST /api/v1/cart/items
exports.addItem = catchAsync(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, 'Product not found');
  }

  if (product.inventory.trackInventory && product.inventory.quantity < quantity) {
    throw new ApiError(400, 'Not enough stock available');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity, priceAtAdd: product.price });
  }

  await cart.save();

  cart = await Cart.findById(cart._id).populate(
    'items.product',
    'name slug price images inventory.quantity isActive'
  );

  res.json({ success: true, data: cart });
});

// @desc    Update item quantity
// @route   PUT /api/v1/cart/items/:productId
exports.updateItem = catchAsync(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const item = cart.items.find(
    (i) => i.product.toString() === req.params.productId
  );

  if (!item) {
    throw new ApiError(404, 'Item not in cart');
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter(
      (i) => i.product.toString() !== req.params.productId
    );
  } else {
    item.quantity = quantity;
  }

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate(
    'items.product',
    'name slug price images inventory.quantity isActive'
  );

  res.json({ success: true, data: populatedCart });
});

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/items/:productId
exports.removeItem = catchAsync(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  cart.items = cart.items.filter(
    (i) => i.product.toString() !== req.params.productId
  );

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate(
    'items.product',
    'name slug price images inventory.quantity isActive'
  );

  res.json({ success: true, data: populatedCart });
});

// @desc    Clear entire cart
// @route   DELETE /api/v1/cart
exports.clearCart = catchAsync(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ success: true, data: { items: [] } });
});
