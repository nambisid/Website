const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');
const {
  createCategoryValidator,
  updateCategoryValidator,
} = require('../utils/validators/categoryValidators');

// Admin read (must come before /:slug to avoid being matched as a slug)
router.get('/admin/all', auth, admin, categoryController.getAllCategoriesAdmin);

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategory);

// Admin write routes
router.post(
  '/',
  auth,
  admin,
  createCategoryValidator,
  validate,
  categoryController.createCategory
);
router.put(
  '/:id',
  auth,
  admin,
  updateCategoryValidator,
  validate,
  categoryController.updateCategory
);
router.delete('/:id', auth, admin, categoryController.deleteCategory);

module.exports = router;
