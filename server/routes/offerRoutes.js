const express = require('express');
const router = express.Router();
const {
  createOffer,
  getBuyerOffers,
  getFarmerOffers,
  respondToOffer,
  buyerRespondToOffer,
  convertOfferToOrder
} = require('../controllers/offerController');
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', protect, roleCheck('buyer'), createOffer);
router.get('/buyer', protect, roleCheck('buyer'), getBuyerOffers);
router.get('/farmer', protect, roleCheck('farmer'), getFarmerOffers);
router.put('/:id/respond', protect, roleCheck('farmer'), respondToOffer);
router.put('/:id/buyer-respond', protect, roleCheck('buyer'), buyerRespondToOffer);
router.post('/:id/convert-to-order', protect, roleCheck('buyer'), convertOfferToOrder);

module.exports = router;
