const express = require('express');
const router = express.Router();
const { getDemandMapData, getBuyersForLocation } = require('../controllers/demandController');

router.get('/', getDemandMapData);
router.get('/buyers/:area', getBuyersForLocation);

module.exports = router;
