const supabase = require('../config/supabase');
const { getHaversineDistance } = require('../utils/haversine');

// Default reference location (Lucknow UP) if user geolocation is unavailable
const DEFAULT_CENTER = { lat: 26.8467, lng: 80.9462, name: 'Lucknow' };

// @desc    Get Demand Map locations with crop filtering, Haversine distance, and AI insights
// @route   GET /api/demand
// @access  Public / Authenticated
exports.getDemandMapData = async (req, res) => {
  try {
    const { crop = 'Tomato', demandLevel = 'All', maxDistance, lat, lng } = req.query;

    const userLat = lat ? Number(lat) : DEFAULT_CENTER.lat;
    const userLng = lng ? Number(lng) : DEFAULT_CENTER.lng;

    const { data: locations, error } = await supabase.from('demand_locations').select('*');

    if (error) {
      console.error('Error fetching demand locations:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve demand map data' });
    }

    let processedLocations = (locations || []).map((loc) => {
      const distanceKm = getHaversineDistance(userLat, userLng, loc.lat, loc.lng);

      // Find matching crop or get highest demand crop
      let matchedCropData = null;
      if (crop && crop !== 'All') {
        matchedCropData = (loc.crops || []).find(
          (c) => c.crop.toLowerCase() === crop.toLowerCase()
        );
      }

      // If specific crop not found or 'All', pick the primary high-demand crop for location
      if (!matchedCropData) {
        matchedCropData = (loc.crops || [])[0] || {
          crop: crop === 'All' ? 'Tomato' : crop,
          demand_level: 'MEDIUM',
          demand_quantity: 1500,
          unit: 'kg',
          buyers_count: 5,
          avg_price_per_unit: 35
        };
      }

      return {
        id: loc.id,
        area: loc.area,
        state: loc.state,
        lat: loc.lat,
        lng: loc.lng,
        distanceKm,
        selectedCrop: matchedCropData.crop,
        demandLevel: matchedCropData.demand_level,
        demandQuantity: matchedCropData.demand_quantity,
        unit: matchedCropData.unit || 'kg',
        buyersCount: matchedCropData.buyers_count,
        avgPricePerUnit: matchedCropData.avg_price_per_unit,
        crops: loc.crops || [],
        buyersList: loc.buyers_list || []
      };
    });

    // Apply Demand Level filter
    if (demandLevel && demandLevel !== 'All') {
      processedLocations = processedLocations.filter(
        (loc) => loc.demandLevel.toUpperCase() === demandLevel.toUpperCase()
      );
    }

    // Apply Distance filter
    if (maxDistance && !isNaN(Number(maxDistance))) {
      const maxDist = Number(maxDistance);
      processedLocations = processedLocations.filter((loc) => loc.distanceKm <= maxDist);
    }

    // Sort by distance (closest first)
    processedLocations.sort((a, b) => a.distanceKm - b.distanceKm);

    // Compute AI Insights dynamically based on nearby high-demand locations
    const highDemandNear = processedLocations.filter(
      (l) => l.demandLevel === 'HIGH' && l.distanceKm <= 100
    );

    const totalQtyNear = highDemandNear.reduce((sum, l) => sum + l.demandQuantity, 0);
    const totalBuyersNear = highDemandNear.reduce((sum, l) => sum + l.buyersCount, 0);

    let aiInsightText = '';
    if (highDemandNear.length > 0) {
      const topLoc = highDemandNear[0];
      aiInsightText = `High ${crop === 'All' ? 'produce' : crop} demand detected within ${Math.ceil(topLoc.distanceKm + 10)} km in ${topLoc.area} area (${topLoc.demandQuantity.toLocaleString()} ${topLoc.unit} requested by ${topLoc.buyersCount} bulk buyers). Selling in this hub can yield up to 18% higher margins!`;
    } else if (processedLocations.length > 0) {
      const closest = processedLocations[0];
      aiInsightText = `${closest.demandLevel} ${crop === 'All' ? 'crop' : crop} demand detected ${closest.distanceKm} km away in ${closest.area}. (${closest.demandQuantity.toLocaleString()} ${closest.unit} requested by ${closest.buyersCount} buyers).`;
    } else {
      aiInsightText = `No high-demand clusters found within selected filters. Try expanding search radius.`;
    }

    res.json({
      success: true,
      selectedCrop: crop,
      userLocation: { lat: userLat, lng: userLng },
      count: processedLocations.length,
      aiInsight: {
        title: `AI Selling Area Insight`,
        description: aiInsightText,
        totalDemandQtyNear: totalQtyNear,
        totalBuyersNear: totalBuyersNear
      },
      locations: processedLocations
    });
  } catch (error) {
    console.error('getDemandMapData error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving demand map data' });
  }
};

// @desc    Get buyers and active requirement details for a specific demand area
// @route   GET /api/demand/buyers/:area
// @access  Public / Authenticated
exports.getBuyersForLocation = async (req, res) => {
  try {
    const { area } = req.params;
    const { crop = 'Tomato' } = req.query;

    const { data: loc } = await supabase
      .from('demand_locations')
      .select('*')
      .ilike('area', `%${area}%`)
      .single();

    if (!loc) {
      return res.status(404).json({ success: false, message: 'Demand location not found' });
    }

    const matchedCrop = (loc.crops || []).find((c) => c.crop.toLowerCase() === crop.toLowerCase()) || loc.crops[0];

    res.json({
      success: true,
      area: loc.area,
      state: loc.state,
      coordinates: { lat: loc.lat, lng: loc.lng },
      crop: matchedCrop ? matchedCrop.crop : crop,
      demandLevel: matchedCrop ? matchedCrop.demand_level : 'HIGH',
      demandQuantity: matchedCrop ? matchedCrop.demand_quantity : 3000,
      buyersCount: matchedCrop ? matchedCrop.buyers_count : 10,
      avgPricePerUnit: matchedCrop ? matchedCrop.avg_price_per_unit : 40,
      buyers: loc.buyers_list || [
        { name: 'FreshMart Supermarkets', requirement: '1500 kg', buyer_type: 'Retailer' },
        { name: 'Regional Mandi FPO', requirement: '2000 kg', buyer_type: 'Wholesaler' }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching location buyers' });
  }
};
