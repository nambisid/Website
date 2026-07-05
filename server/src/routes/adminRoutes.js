const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');
const { updateRoleValidator } = require('../utils/validators/userValidators');

router.use(auth, admin); // All admin routes require auth + admin role

router.get('/dashboard', adminController.getDashboard);
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.get('/inventory', adminController.getLowStock);
router.get('/customers', adminController.getCustomers);
router.get('/reviews', adminController.getReviewsForModeration);
router.put('/reviews/:id/approve', adminController.moderateReview);
router.get('/revenue', adminController.getRevenue);

// User management
router.get('/users', adminController.listAllUsers);
router.put(
  '/users/:id/role',
  updateRoleValidator,
  validate,
  adminController.updateUserRole
);

module.exports = router;
