const Razorpay = require('razorpay');

// Instantiate ONLY when real keys are present, so the server still boots with
// payments unconfigured. The SDK throws if key_id is missing, so eager
// construction would crash startup. Controllers check for null and return a
// clean "not configured" error instead.
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

const razorpay =
  RAZORPAY_KEY_ID &&
  RAZORPAY_KEY_SECRET &&
  !RAZORPAY_KEY_ID.includes('placeholder')
    ? new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })
    : null;

module.exports = razorpay;
