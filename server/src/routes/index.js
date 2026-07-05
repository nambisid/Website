const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/categories', require('./categoryRoutes'));
router.use('/cart', require('./cartRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/reviews', require('./reviewRoutes'));
router.use('/wishlist', require('./wishlistRoutes'));
router.use('/payments', require('./paymentRoutes'));
router.use('/uploads', require('./uploadRoutes'));
router.use('/site-content', require('./siteContentRoutes'));
router.use('/config', require('./configRoutes'));
router.use('/admin', require('./adminRoutes'));

module.exports = router;
