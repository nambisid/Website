const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createOrderValidator } = require('../utils/validators/orderValidators');

router.use(auth);

router.post('/', createOrderValidator, validate, orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:orderNumber', orderController.getOrder);
router.put('/:id/cancel', orderController.cancelOrder);

module.exports = router;
