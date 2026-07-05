const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');
const {
  createProductValidator,
  updateProductValidator,
} = require('../utils/validators/productValidators');

// Public routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/search', productController.searchProducts);

// Admin read routes (must come BEFORE /:slug to avoid being matched as a slug)
router.get('/admin/all', auth, admin, productController.getAllProductsAdmin);
router.get('/admin/:id', auth, admin, productController.getProductByIdAdmin);

router.get('/:slug', productController.getProduct);

// Admin write routes
router.post('/', auth, admin, createProductValidator, validate, productController.createProduct);
router.put('/:id', auth, admin, updateProductValidator, validate, productController.updateProduct);
router.delete('/:id', auth, admin, productController.deleteProduct);

module.exports = router;
