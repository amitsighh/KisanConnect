const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  respondToNotification
} = require('../controllers/notificationController');

const { protect } = require('../middleware/auth');

router.get('/', protect, getUserNotifications);
router.put('/:id/read', protect, markAsRead);
router.post('/respond', protect, respondToNotification);

module.exports = router;
