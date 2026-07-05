const crypto = require('crypto');

// Razorpay returns razorpay_signature = HMAC_SHA256("order_id|payment_id", key_secret).
// Recomputing it server-side is the ONE thing that proves the payment is real and
// untampered — never record an order without it passing.
const verifyRazorpaySignature = ({ orderId, paymentId, signature, secret }) => {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature || '');
  // Constant-time compare; length guard because timingSafeEqual throws on mismatch.
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

module.exports = { verifyRazorpaySignature };
