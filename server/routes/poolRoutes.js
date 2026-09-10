const express = require('express');
const router = express.Router();
const {
  createSmartPool,
  getAllPools,
  getFarmerMatchedPools,
  getBuyerPools,
  getPoolById,
  joinSmartPool,
  leaveSmartPool,
  updatePoolStatus,
  getAdminPoolAnalytics
} = require('../controllers/poolController');

const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', getAllPools);
router.get('/farmer/matched', protect, roleCheck('farmer'), getFarmerMatchedPools);
router.get('/buyer/my-pools', protect, roleCheck('buyer'), getBuyerPools);
router.get('/admin/analytics', protect, roleCheck('admin'), getAdminPoolAnalytics);
router.get('/:id', getPoolById);

router.post('/create', protect, roleCheck('buyer'), createSmartPool);
router.post('/:id/join', protect, roleCheck('farmer'), joinSmartPool);
router.post('/:id/leave', protect, roleCheck('farmer'), leaveSmartPool);
router.put('/:id/status', protect, updatePoolStatus);

module.exports = router;
