const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllUsers,
  getAllListings,
  getAllOrders,
  toggleListingStatus
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Guard all admin routes
router.use(protect, roleCheck('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/listings', getAllListings);
router.get('/orders', getAllOrders);
router.put('/listings/:id/toggle-status', toggleListingStatus);

module.exports = router;
