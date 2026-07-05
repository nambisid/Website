const catchAsync = require('../utils/catchAsync');

// Returns ONLY public-safe configuration to the frontend.
// The Razorpay key_id is publishable; key_secret MUST stay server-side.
exports.getPublicConfig = catchAsync(async (req, res) => {
  res.json({
    success: true,
    data: {
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
      currency: 'INR',
      // Flag so the client can show a clear message when keys aren't set yet.
      razorpayEnabled: Boolean(
        process.env.RAZORPAY_KEY_ID &&
          !process.env.RAZORPAY_KEY_ID.includes('placeholder')
      ),
    },
  });
});
