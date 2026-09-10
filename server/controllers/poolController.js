const supabase = require('../config/supabase');
const { getHaversineDistance } = require('../utils/haversine');
const crypto = require('crypto');

// Default coordinates for districts if not provided
const DISTRICT_COORDS = {
  Lucknow: { lat: 26.8467, lng: 80.9462 },
  Kanpur: { lat: 26.4499, lng: 80.3319 },
  Sehore: { lat: 23.2032, lng: 77.0844 },
  Ludhiana: { lat: 30.9010, lng: 75.8573 },
  Nashik: { lat: 19.9975, lng: 73.7898 },
  Erode: { lat: 11.3410, lng: 77.7172 },
  Ratnagiri: { lat: 16.9902, lng: 73.3120 },
  Kolhapur: { lat: 16.7050, lng: 74.2433 },
  Delhi: { lat: 28.7041, lng: 77.1025 },
  Navi_Mumbai: { lat: 19.0330, lng: 73.0297 }
};

// Helper: Calculate AI Matching score for a farmer relative to a bulk order pool
const calculateAIMatchScore = (farmer, pool, farmerListings = []) => {
  let score = 0;

  // 1. Crop Match (30%)
  const primaryCrops = farmer.farmDetails?.primaryCrops || [];
  const farmerCropNames = farmerListings.map((l) => (l.crop_name || l.cropName || '').toLowerCase());
  const poolCrop = (pool.crop || '').toLowerCase();

  const exactMatch = primaryCrops.some((c) => c.toLowerCase().includes(poolCrop)) ||
                     farmerCropNames.some((c) => c.includes(poolCrop));

  if (exactMatch) {
    score += 30;
  } else {
    // Category partial match
    score += 15;
  }

  // 2. Location Distance (25%)
  const farmerDistrict = farmer.district || farmer.location?.district || 'Sehore';
  const farmerCoords = DISTRICT_COORDS[farmerDistrict] || DISTRICT_COORDS['Lucknow'];
  const poolLat = Number(pool.delivery_lat || pool.deliveryLat || 26.8467);
  const poolLng = Number(pool.delivery_lng || pool.deliveryLng || 80.9462);

  const distanceKm = getHaversineDistance(farmerCoords.lat, farmerCoords.lng, poolLat, poolLng);
  const maxRadius = Number(pool.radius_km || pool.radiusKm || 100);

  if (distanceKm <= 25) {
    score += 25;
  } else if (distanceKm <= maxRadius) {
    const locFraction = 1 - (distanceKm - 25) / (maxRadius - 25);
    score += Math.max(5, Math.round(25 * locFraction));
  } else {
    score += 2;
  }

  // 3. Available Quantity Potential (20%)
  const farmerStock = farmerListings.reduce((sum, l) => sum + Number(l.quantity || 0), 0);
  const reqQty = Number(pool.required_quantity || pool.requiredQuantity || 500);

  if (farmerStock >= reqQty * 0.2) {
    score += 20;
  } else if (farmerStock > 0) {
    score += 12;
  } else {
    score += 8; // Small farmer default capability
  }

  // 4. Harvest Date Compatibility (15%)
  if (pool.harvest_date || pool.harvestDate) {
    score += 15;
  } else {
    score += 10;
  }

  // 5. Quality Grade Compatibility (10%)
  const quality = pool.quality_grade || pool.qualityGrade || 'Grade A';
  if (quality.includes('Grade A')) {
    score += 10;
  } else {
    score += 8;
  }

  return {
    score: Math.min(98, Math.max(45, score)),
    distanceKm
  };
};

// Helper: Format Smart Pool object
const formatPool = (p) => {
  if (!p) return null;
  const buyer = p.buyer || {};
  const members = p.members || [];

  const requiredQty = Number(p.required_quantity);
  const currentQty = Number(p.current_quantity);
  const remainingQty = Math.max(0, requiredQty - currentQty);

  const unit = p.unit || 'kg';
  const targetPrice = Number(p.target_price_per_unit) || 0;
  const totalPayment = Number(p.total_payment) || (currentQty * targetPrice);
  const totalLogistics = Number(p.logistics_cost_total) || 2000;

  // Calculate proportional split for joined members
  const memberBreakdown = members.map((m) => {
    const farmer = m.farmer || {};
    const contribQty = Number(m.contributed_quantity);
    const fraction = currentQty > 0 ? contribQty / currentQty : 0;
    const grossPayment = Math.round(fraction * totalPayment);
    const logisticsCost = Math.round(fraction * totalLogistics);
    const netPayout = Math.max(0, grossPayment - logisticsCost);

    return {
      id: m.id,
      farmerId: m.farmer_id,
      farmerName: farmer.name || 'Verified Farmer',
      farmerPhone: farmer.phone || '',
      farmerDistrict: farmer.district || farmer.location?.district || 'Sehore',
      contributedQuantity: contribQty,
      unit,
      agreedPrice: Number(m.agreed_price) || targetPrice,
      grossPayment,
      logisticsCost,
      netPayout,
      status: m.status,
      joinedAt: m.joined_at
    };
  });

  return {
    _id: p.id,
    id: p.id,
    poolCode: p.pool_code || `POOL-${p.id.slice(0, 6).toUpperCase()}`,
    buyer: {
      _id: buyer.id || p.buyer_id,
      id: buyer.id || p.buyer_id,
      name: buyer.name || 'Bulk Buyer',
      businessName: buyer.buyer_details?.businessName || buyer.name || 'FreshMart Supermarkets',
      phone: buyer.phone || '',
      district: buyer.district || ''
    },
    buyer_id: p.buyer_id,
    crop: p.crop,
    requiredQuantity: requiredQty,
    currentQuantity: currentQty,
    remainingQuantity: remainingQty,
    unit,
    deliveryLocation: p.delivery_location,
    deliveryLat: Number(p.delivery_lat || 26.8467),
    deliveryLng: Number(p.delivery_lng || 80.9462),
    radiusKm: Number(p.radius_km || 100),
    harvestDate: p.harvest_date,
    qualityGrade: p.quality_grade,
    targetPricePerUnit: targetPrice,
    totalPayment,
    logisticsCostTotal: totalLogistics,
    status: p.status,
    createdAt: p.created_at,
    expiresAt: p.expires_at,
    joinedFarmersCount: memberBreakdown.length,
    members: memberBreakdown
  };
};

// @desc    Create a new Bulk Order Smart Pool (Buyer only)
// @route   POST /api/pools/create
// @access  Private (Buyer)
exports.createSmartPool = async (req, res) => {
  try {
    const {
      crop,
      requiredQuantity,
      unit = 'kg',
      deliveryLocation = 'Lucknow Wholesale Yard',
      deliveryLat = 26.8467,
      deliveryLng = 80.9462,
      radiusKm = 100,
      harvestDate,
      qualityGrade = 'Grade A (Premium)',
      expectedPricePerUnit,
      logisticsCostTotal = 2500,
      expiresInDays = 7
    } = req.body;

    if (!crop || !requiredQuantity || !expectedPricePerUnit) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Crop, Required Quantity, and Expected Price per unit.'
      });
    }

    const reqQty = Number(requiredQuantity);
    const price = Number(expectedPricePerUnit);
    const poolCode = `POOL-${crop.slice(0, 3).toUpperCase()}-${reqQty}`;

    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

    const poolPayload = {
      pool_code: poolCode,
      buyer_id: req.user.id,
      crop,
      required_quantity: reqQty,
      current_quantity: 0,
      remaining_quantity: reqQty,
      unit,
      delivery_location: deliveryLocation,
      delivery_lat: Number(deliveryLat),
      delivery_lng: Number(deliveryLng),
      radius_km: Number(radiusKm),
      harvest_date: harvestDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quality_grade: qualityGrade,
      target_price_per_unit: price,
      logistics_cost_total: Number(logisticsCostTotal) || 2500,
      total_payment: reqQty * price,
      status: 'OPEN',
      expires_at: expiresAt
    };

    const { data: newPool, error } = await supabase
      .from('smart_pools')
      .insert(poolPayload)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error creating pool:', error);
      return res.status(500).json({ success: false, message: 'Failed to create Smart Pool' });
    }

    // Run AI Matching engine to notify nearby compatible farmers
    const { data: profiles } = await supabase.from('profiles').select('*').eq('role', 'farmer');
    const { data: listings } = await supabase.from('listings').select('*').eq('status', 'active');

    const matchedFarmers = [];
    if (profiles && profiles.length > 0) {
      for (const farmer of profiles) {
        const farmerListings = (listings || []).filter((l) => l.farmer_id === farmer.id);
        const { score, distanceKm } = calculateAIMatchScore(farmer, newPool, farmerListings);

        if (score >= 40) {
          matchedFarmers.push({ farmer, score, distanceKm });

          // Send notification to farmer
          const suggestedQty = Math.min(100, Math.ceil(reqQty * 0.15));
          await supabase.from('notifications').insert({
            user_id: farmer.id,
            type: 'POOL_MATCH',
            title: `🌾 Bulk ${crop} Order Available Near You!`,
            message: `Buyer ${req.user.name} requires ${reqQty} ${unit} ${crop} within ${Math.ceil(distanceKm + 5)} km. AI Match Score: ${score}%. Suggested contribution: ${suggestedQty} ${unit}.`,
            pool_id: newPool.id,
            suggested_qty: suggestedQty,
            is_read: false
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      message: `Smart Pool created successfully! AI matched ${matchedFarmers.length} nearby farmers.`,
      pool: formatPool(newPool),
      matchedFarmersCount: matchedFarmers.length
    });
  } catch (error) {
    console.error('createSmartPool error:', error);
    res.status(500).json({ success: false, message: 'Server error creating smart pool' });
  }
};

// @desc    Get all active Smart Pools (Public / Farmer)
// @route   GET /api/pools
// @access  Public / Authenticated
exports.getAllPools = async (req, res) => {
  try {
    const { crop = 'All', status = 'All' } = req.query;

    let query = supabase.from('smart_pools').select('*').order('created_at', { ascending: false });

    if (crop && crop !== 'All') {
      query = query.ilike('crop', `%${crop}%`);
    }

    if (status && status !== 'All') {
      query = query.eq('status', status);
    }

    const { data: pools, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch smart pools' });
    }

    const formatted = (pools || []).map(formatPool);

    res.json({
      success: true,
      count: formatted.length,
      pools: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving pools' });
  }
};

// @desc    Get AI-matched pools for logged-in farmer
// @route   GET /api/pools/farmer/matched
// @access  Private (Farmer)
exports.getFarmerMatchedPools = async (req, res) => {
  try {
    const farmer = req.user;
    const { data: pools } = await supabase
      .from('smart_pools')
      .select('*')
      .neq('status', 'CANCELLED')
      .order('created_at', { ascending: false });

    const { data: farmerListings } = await supabase
      .from('listings')
      .select('*')
      .eq('farmer_id', farmer.id);

    const { data: myMemberships } = await supabase
      .from('pool_members')
      .select('*')
      .eq('farmer_id', farmer.id);

    const matchedPools = (pools || []).map((pool) => {
      const formatted = formatPool(pool);
      const { score, distanceKm } = calculateAIMatchScore(farmer, pool, farmerListings || []);

      const existingMember = (myMemberships || []).find(
        (m) => m.pool_id === pool.id && m.status !== 'WITHDRAWN'
      );

      return {
        ...formatted,
        aiMatchScore: score,
        distanceKm,
        isJoined: Boolean(existingMember),
        myContributionQuantity: existingMember ? Number(existingMember.contributed_quantity) : 0
      };
    });

    // Sort by AI Match Score descending
    matchedPools.sort((a, b) => b.aiMatchScore - a.aiMatchScore);

    res.json({
      success: true,
      count: matchedPools.length,
      pools: matchedPools
    });
  } catch (error) {
    console.error('getFarmerMatchedPools error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching matched pools' });
  }
};

// @desc    Get pools created by logged in buyer
// @route   GET /api/pools/buyer/my-pools
// @access  Private (Buyer)
exports.getBuyerPools = async (req, res) => {
  try {
    const { data: pools, error } = await supabase
      .from('smart_pools')
      .select('*')
      .eq('buyer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve your pools' });
    }

    const formatted = (pools || []).map(formatPool);

    res.json({
      success: true,
      count: formatted.length,
      pools: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving buyer pools' });
  }
};

// @desc    Get single Smart Pool details by ID with transparent cost/payment breakdown
// @route   GET /api/pools/:id
// @access  Public / Authenticated
exports.getPoolById = async (req, res) => {
  try {
    const { data: pool, error } = await supabase
      .from('smart_pools')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !pool) {
      return res.status(404).json({ success: false, message: 'Smart Pool not found' });
    }

    res.json({
      success: true,
      pool: formatPool(pool)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching pool details' });
  }
};

// @desc    Farmer joins a Smart Pool with contribution quantity
// @route   POST /api/pools/:id/join
// @access  Private (Farmer)
exports.joinSmartPool = async (req, res) => {
  try {
    const { contributionQuantity } = req.body;
    const farmerId = req.user.id;
    const poolId = req.params.id;

    const contribQty = Number(contributionQuantity);
    if (isNaN(contribQty) || contribQty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid contribution quantity greater than 0.'
      });
    }

    // Fetch pool
    const { data: pool } = await supabase
      .from('smart_pools')
      .select('*')
      .eq('id', poolId)
      .single();

    if (!pool) {
      return res.status(404).json({ success: false, message: 'Smart Pool not found' });
    }

    if (pool.status === 'COMPLETED' || pool.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: `Cannot join pool. Pool is currently ${pool.status}.`
      });
    }

    // Check pool expiry
    if (pool.expires_at && new Date(pool.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot join pool. Pool deadline has expired.'
      });
    }

    // Check duplicate membership
    const { data: existingMembers } = await supabase
      .from('pool_members')
      .select('*')
      .eq('pool_id', poolId)
      .eq('farmer_id', farmerId)
      .neq('status', 'WITHDRAWN');

    if (existingMembers && existingMembers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already joined this pool! Modify or withdraw your existing contribution.'
      });
    }

    // STRICT CAPACITY ENFORCEMENT EDGE CASE
    const reqQty = Number(pool.required_quantity);
    const currQty = Number(pool.current_quantity);
    const remainingCap = reqQty - currQty;

    if (contribQty > remainingCap) {
      return res.status(400).json({
        success: false,
        message: `Contribution of ${contribQty} ${pool.unit} exceeds remaining required capacity of ${remainingCap} ${pool.unit}. Please lower your contribution.`
      });
    }

    // Insert pool member
    const newCurrQty = currQty + contribQty;
    const newRemainingQty = reqQty - newCurrQty;
    const newStatus = newRemainingQty === 0 ? 'FULL' : 'FILLING';

    await supabase.from('pool_members').insert({
      pool_id: poolId,
      farmer_id: farmerId,
      contributed_quantity: contribQty,
      agreed_price: Number(pool.target_price_per_unit),
      status: 'JOINED',
      joined_at: new Date().toISOString()
    });

    // Update pool stats
    const { data: updatedPool } = await supabase
      .from('smart_pools')
      .update({
        current_quantity: newCurrQty,
        remaining_quantity: newRemainingQty,
        status: newStatus
      })
      .eq('id', poolId)
      .select('*')
      .single();

    // Send notification to buyer
    await supabase.from('notifications').insert({
      user_id: pool.buyer_id,
      type: 'POOL_JOIN',
      title: '👨‍🌾 Farmer Joined Your Smart Pool!',
      message: `${req.user.name} contributed ${contribQty} ${pool.unit} to your ${pool.crop} bulk pool. Total filled: ${newCurrQty}/${reqQty} ${pool.unit}.`,
      pool_id: poolId,
      is_read: false
    });

    res.json({
      success: true,
      message: `Successfully joined ${pool.crop} Smart Pool with ${contribQty} ${pool.unit}!`,
      pool: formatPool(updatedPool)
    });
  } catch (error) {
    console.error('joinSmartPool error:', error);
    res.status(500).json({ success: false, message: 'Server error joining pool' });
  }
};

// @desc    Farmer leaves / withdraws contribution from Smart Pool
// @route   POST /api/pools/:id/leave
// @access  Private (Farmer)
exports.leaveSmartPool = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const poolId = req.params.id;

    const { data: pool } = await supabase.from('smart_pools').select('*').eq('id', poolId).single();
    if (!pool) return res.status(404).json({ success: false, message: 'Pool not found' });

    const { data: member } = await supabase
      .from('pool_members')
      .select('*')
      .eq('pool_id', poolId)
      .eq('farmer_id', farmerId)
      .neq('status', 'WITHDRAWN')
      .single();

    if (!member) {
      return res.status(400).json({ success: false, message: 'You are not an active member of this pool' });
    }

    const withdrawnQty = Number(member.contributed_quantity);
    const newCurrQty = Math.max(0, Number(pool.current_quantity) - withdrawnQty);
    const newRemainingQty = Number(pool.required_quantity) - newCurrQty;
    const newStatus = newCurrQty === 0 ? 'OPEN' : 'FILLING';

    // Mark member withdrawn
    await supabase.from('pool_members').update({ status: 'WITHDRAWN' }).eq('id', member.id);

    // Update pool
    const { data: updatedPool } = await supabase
      .from('smart_pools')
      .update({
        current_quantity: newCurrQty,
        remaining_quantity: newRemainingQty,
        status: newStatus
      })
      .eq('id', poolId)
      .select('*')
      .single();

    res.json({
      success: true,
      message: `Withdrew your contribution of ${withdrawnQty} ${pool.unit} from the pool.`,
      pool: formatPool(updatedPool)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error leaving pool' });
  }
};

// @desc    Update pool lifecycle status (Buyer owner or Admin)
// @route   PUT /api/pools/:id/status
// @access  Private (Buyer or Admin)
exports.updatePoolStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { data: pool } = await supabase.from('smart_pools').select('*').eq('id', req.params.id).single();

    if (!pool) return res.status(404).json({ success: false, message: 'Pool not found' });

    if (pool.buyer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to manage this pool' });
    }

    const { data: updated } = await supabase
      .from('smart_pools')
      .update({ status })
      .eq('id', req.params.id)
      .select('*')
      .single();

    // If cancelled, notify members
    if (status === 'CANCELLED') {
      const { data: members } = await supabase.from('pool_members').select('*').eq('pool_id', req.params.id);
      for (const m of (members || [])) {
        await supabase.from('notifications').insert({
          user_id: m.farmer_id,
          type: 'POOL_CANCELLED',
          title: '⚠️ Smart Pool Cancelled',
          message: `The ${pool.crop} bulk pool has been cancelled by the buyer. Your produce allocation has been released back to your inventory.`,
          pool_id: pool.id,
          is_read: false
        });
      }
    }

    res.json({
      success: true,
      message: `Pool status updated to ${status}`,
      pool: formatPool(updated)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating pool status' });
  }
};

// @desc    Get Admin analytics for Smart Pools
// @route   GET /api/pools/admin/analytics
// @access  Private (Admin)
exports.getAdminPoolAnalytics = async (req, res) => {
  try {
    const { data: pools } = await supabase.from('smart_pools').select('*');
    const { data: members } = await supabase.from('pool_members').select('*').neq('status', 'WITHDRAWN');

    const totalPools = (pools || []).length;
    const activePools = (pools || []).filter((p) => ['OPEN', 'FILLING', 'FULL', 'CONFIRMED'].includes(p.status)).length;
    const completedPools = (pools || []).filter((p) => p.status === 'COMPLETED').length;
    const cancelledPools = (pools || []).filter((p) => p.status === 'CANCELLED').length;

    const totalPooledQuantity = (pools || []).reduce((sum, p) => sum + Number(p.current_quantity || 0), 0);
    const totalGMV = (pools || []).reduce((sum, p) => sum + (Number(p.current_quantity || 0) * Number(p.target_price_per_unit || 0)), 0);

    const uniqueFarmers = new Set((members || []).map((m) => m.farmer_id)).size;

    res.json({
      success: true,
      analytics: {
        totalPools,
        activePools,
        completedPools,
        cancelledPools,
        totalPooledQuantity,
        totalGMV,
        participatingFarmersCount: uniqueFarmers,
        formattedGMV: `₹${totalGMV.toLocaleString('en-IN')}`
      },
      pools: (pools || []).map(formatPool)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving pool analytics' });
  }
};
