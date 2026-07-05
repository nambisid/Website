// Runnable self-check for the money path. Run: node src/utils/pricing.check.js
const assert = require('assert');
const crypto = require('crypto');
const { calcPricing, FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING } = require('./pricing');
const { verifyRazorpaySignature } = require('./razorpaySignature');

// --- pricing ---
// Below the free-shipping threshold pays flat shipping, total adds up.
const below = calcPricing(50000);
assert.strictEqual(below.shipping, FLAT_SHIPPING);
assert.strictEqual(below.total, 50000 + FLAT_SHIPPING + below.tax);

// At/above threshold ships free.
assert.strictEqual(calcPricing(FREE_SHIPPING_THRESHOLD).shipping, 0);

// Empty cart (subtotal 0) never charges shipping.
assert.strictEqual(calcPricing(0).shipping, 0);
assert.strictEqual(calcPricing(0).total, 0);

// --- Razorpay signature ---
const secret = 'test_secret';
const orderId = 'order_ABC';
const paymentId = 'pay_XYZ';
const goodSig = crypto
  .createHmac('sha256', secret)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');

assert.ok(
  verifyRazorpaySignature({ orderId, paymentId, signature: goodSig, secret }),
  'valid signature must pass'
);
assert.ok(
  !verifyRazorpaySignature({ orderId, paymentId, signature: 'deadbeef', secret }),
  'tampered signature must fail'
);
assert.ok(
  !verifyRazorpaySignature({ orderId, paymentId, signature: goodSig, secret: 'wrong' }),
  'wrong secret must fail'
);

console.log('✓ payment self-check passed');
