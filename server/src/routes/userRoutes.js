const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { changePasswordValidator } = require('../utils/validators/userValidators');

router.use(auth); // All user routes require authentication

router.get('/me', userController.getMe);
router.put('/me', userController.updateMe);
router.put(
  '/me/password',
  changePasswordValidator,
  validate,
  userController.changePassword
);
router.post('/me/addresses', userController.addAddress);
router.put('/me/addresses/:addressId', userController.updateAddress);
router.delete('/me/addresses/:addressId', userController.deleteAddress);

module.exports = router;
