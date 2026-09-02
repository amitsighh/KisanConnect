const express = require('express');
const router = express.Router();
const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings
} = require('../controllers/listingController');
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', getListings);
router.get('/farmer/my-listings', protect, roleCheck('farmer'), getMyListings);
router.get('/:id', getListingById);
router.post('/', protect, roleCheck('farmer'), createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;
