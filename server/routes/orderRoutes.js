const express = require('express');
const router = express.Router();
const {
  createOrder,
  getBuyerOrders,
  getFarmerOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', protect, roleCheck('buyer'), createOrder);
router.get('/buyer', protect, roleCheck('buyer'), getBuyerOrders);
router.get('/farmer', protect, roleCheck('farmer'), getFarmerOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
