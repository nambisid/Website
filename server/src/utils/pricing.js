// Money is stored as integer paise (₹1 = 100 paise) everywhere, which is also
// the unit Razorpay expects. Keep pricing in ONE place so the amount charged by
// Razorpay always equals the total recorded on the order.

const FREE_SHIPPING_THRESHOLD = 99900; // ₹999
const FLAT_SHIPPING = 7900; // ₹79
// ponytail: prices are treated as GST-inclusive, so no separate tax line.
// If you register for GST and want to show tax separately, set e.g. 0.05 (5%).
const TAX_RATE = 0;

const calcPricing = (subtotal) => {
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total };
};

module.exports = { calcPricing, FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING, TAX_RATE };
