const razorpay = require('../config/razorpay');
const Cart = require('../models/Cart');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');
const { calcPricing } = require('../utils/pricing');
const { verifyRazorpaySignature } = require('../utils/razorpaySignature');

// Recalculate the cart total server-side (never trust the client). Uses the
// shared pricing helper so this always matches what the order will be charged.
const calculateCartTotal = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  let subtotal = 0;
  for (const item of cart.items) {
    if (!item.product || !item.product.isActive) {
      throw new ApiError(400, `Product "${item.product?.name || 'Unknown'}" is unavailable`);
    }
    subtotal += item.product.price * item.quantity;
  }

  return calcPricing(subtotal);
};

// @desc    Create a Razorpay order (amount is authoritative, computed server-side)
// @route   POST /api/v1/payments/razorpay/create-order
exports.createRazorpayOrder = catchAsync(async (req, res) => {
  const { total } = await calculateCartTotal(req.user._id);

  const order = await razorpay.orders.create({
    amount: total, // paise
    currency: 'INR',
    receipt: `rcpt_${req.user._id}_${Date.now()}`,
    notes: { userId: req.user._id.toString() },
  });

  res.json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    },
  });
});

// @desc    Verify a completed Razorpay payment's signature before the order is recorded
// @route   POST /api/v1/payments/razorpay/verify
exports.verifyRazorpayPayment = catchAsync(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ApiError(400, 'Missing payment verification fields');
  }

  const valid = verifyRazorpaySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
    secret: process.env.RAZORPAY_KEY_SECRET,
  });

  if (!valid) {
    logger.warn(`Razorpay signature verification failed for order ${razorpayOrderId}`);
    throw new ApiError(400, 'Payment verification failed');
  }

  logger.info(`Razorpay payment verified: ${razorpayPaymentId}`);

  res.json({
    success: true,
    data: { transactionId: razorpayPaymentId, verified: true },
  });
});
