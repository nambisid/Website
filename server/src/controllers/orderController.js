const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const generateOrderNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = uuidv4().slice(0, 4).toUpperCase();
  return `SB-${date}-${suffix}`;
};

// @desc    Place a new order
// @route   POST /api/v1/orders
exports.createOrder = catchAsync(async (req, res) => {
  const { shippingAddress, paymentMethod, transactionId } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  // Build order items from cart, using current prices
  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      throw new ApiError(400, `Product "${item.product?.name || 'Unknown'}" is no longer available`);
    }
    if (product.inventory.trackInventory && product.inventory.quantity < item.quantity) {
      throw new ApiError(400, `Not enough stock for "${product.name}"`);
    }

    const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: primaryImage?.url,
    });

    subtotal += product.price * item.quantity;
  }

  // Calculate totals
  const shipping = subtotal >= 5000 ? 0 : 599; // Free shipping over $50
  const tax = Math.round(subtotal * 0.08); // 8% tax placeholder
  const total = subtotal + shipping + tax;

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    payment: {
      method: paymentMethod,
      transactionId,
      status: 'completed',
      paidAt: new Date(),
    },
    pricing: { subtotal, shipping, tax, discount: 0, total },
    status: 'confirmed',
    statusHistory: [{ status: 'confirmed', note: 'Order placed and payment confirmed' }],
  });

  // Decrement inventory
  for (const item of cart.items) {
    if (item.product.inventory.trackInventory) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { 'inventory.quantity': -item.quantity },
      });
    }
  }

  // Clear cart
  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, data: order });
});

// @desc    Get user's order history
// @route   GET /api/v1/orders
exports.getOrders = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments({ user: req.user._id }),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// @desc    Get single order detail
// @route   GET /api/v1/orders/:orderNumber
exports.getOrder = catchAsync(async (req, res) => {
  const order = await Order.findOne({
    orderNumber: req.params.orderNumber,
    user: req.user._id,
  });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  res.json({ success: true, data: order });
});

// @desc    Cancel an order
// @route   PUT /api/v1/orders/:id/cancel
exports.cancelOrder = catchAsync(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new ApiError(400, 'Order can only be cancelled when pending or confirmed');
  }

  order.status = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by customer' });
  await order.save();

  // Restore inventory
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { 'inventory.quantity': item.quantity },
    });
  }

  res.json({ success: true, data: order });
});
