const express = require('express');
const router = express.Router();
const { fetchMandiPrice } = require('../services/mandiPriceService');

// Handler function
const handleGetPrice = async (req, res) => {
  try {
    const { commodity, state, district, market } = req.query;

    if (!commodity) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "commodity" is required'
      });
    }

    const result = await fetchMandiPrice({ commodity, state, district, market });

    res.json(result);
  } catch (error) {
    console.error('[Mandi Route Error]', error);
    res.status(500).json({
      success: false,
      available: false,
      message: 'Server error retrieving mandi prices'
    });
  }
};

// @route   GET /api/mandi & GET /api/mandi/price
// @desc    Get live Agmarknet/eNAM mandi benchmark price for a crop & location
// @access  Public
router.get('/price', handleGetPrice);
router.get('/', handleGetPrice);

module.exports = router;
