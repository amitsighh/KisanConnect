const supabase = require('../config/supabase');

// @desc    Get comprehensive platform analytics & KPIs from Supabase
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res) => {
  try {
    const { data: users = [] } = await supabase.from('profiles').select('*');
    const { data: listings = [] } = await supabase.from('listings').select('*');
    const { data: orders = [] } = await supabase.from('orders').select('*');
    const { data: offers = [] } = await supabase.from('offers').select('*');

    const totalUsers = users.length;
    const totalFarmers = users.filter((u) => u.role === 'farmer').length;
    const totalBuyers = users.filter((u) => u.role === 'buyer').length;

    const totalListings = listings.length;
    const activeListings = listings.filter((l) => l.status === 'active').length;

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.order_status === 'Delivered').length;

    // Gross Merchandise Value (GMV)
    const validOrders = orders.filter((o) => o.order_status !== 'Cancelled');
    const totalGMV = validOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const estimatedMiddlemanSavings = Math.round(totalGMV * 0.35);

    // Category distribution
    const categoryMap = {};
    listings.filter((l) => l.status === 'active').forEach((l) => {
      const cat = l.category;
      if (!categoryMap[cat]) categoryMap[cat] = { _id: cat, count: 0, totalQty: 0 };
      categoryMap[cat].count += 1;
      categoryMap[cat].totalQty += Number(l.quantity) || 0;
    });
    const categoryStats = Object.values(categoryMap);

    // State distribution
    const stateMap = {};
    listings.filter((l) => l.status === 'active').forEach((l) => {
      const st = l.state;
      if (!stateMap[st]) stateMap[st] = { _id: st, count: 0 };
      stateMap[st].count += 1;
    });
    const stateStats = Object.values(stateMap).sort((a, b) => b.count - a.count).slice(0, 8);

    const totalOffers = offers.length;
    const acceptedOffers = offers.filter((o) => o.status === 'accepted' || o.status === 'converted_to_order').length;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalFarmers,
        totalBuyers,
        totalListings,
        activeListings,
        totalOrders,
        completedOrders,
        totalGMV,
        estimatedMiddlemanSavings,
        totalOffers,
        acceptedOffers,
        categoryStats,
        stateStats
      }
    });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving admin statistics'
    });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }

    const formatted = (users || []).map((u) => ({
      _id: u.id,
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      location: {
        district: u.district,
        state: u.state,
        pincode: u.pincode,
        address: u.address,
        village: u.village
      },
      farmDetails: u.farm_details || {},
      buyerDetails: u.buyer_details || {},
      trustScore: Number(u.trust_score) || 4.8,
      isVerified: Boolean(u.is_verified),
      createdAt: u.created_at
    }));

    res.json({
      success: true,
      count: formatted.length,
      users: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

// @desc    Get all listings for admin
// @route   GET /api/admin/listings
// @access  Private (Admin)
exports.getAllListings = async (req, res) => {
  try {
    const { data: listings, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch listings' });
    }

    const formatted = (listings || []).map((l) => {
      const farmer = l.farmer || {};
      return {
        _id: l.id,
        id: l.id,
        cropName: l.crop_name,
        category: l.category,
        variety: l.variety,
        quantity: Number(l.quantity),
        unit: l.unit,
        pricePerUnit: Number(l.price_per_unit),
        qualityGrade: l.quality_grade,
        location: {
          district: l.district,
          state: l.state,
          village: l.village,
          pincode: l.pincode
        },
        farmer: {
          _id: farmer.id || l.farmer_id,
          id: farmer.id || l.farmer_id,
          name: farmer.name || 'Farmer',
          phone: farmer.phone || '',
          email: farmer.email || '',
          location: {
            district: farmer.district || l.district,
            state: farmer.state || l.state
          }
        },
        status: l.status,
        createdAt: l.created_at
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      listings: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching admin listings' });
  }
};

// @desc    Get all orders for admin
// @route   GET /api/admin/orders
// @access  Private (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }

    const formatted = (orders || []).map((o) => {
      const buyer = o.buyer || {};
      const farmer = o.farmer || {};
      return {
        _id: o.id,
        id: o.id,
        orderNumber: o.order_number,
        cropName: o.crop_name,
        quantity: Number(o.quantity),
        unit: o.unit,
        pricePerUnit: Number(o.price_per_unit),
        totalAmount: Number(o.total_amount),
        buyer: {
          _id: buyer.id || o.buyer_id,
          id: buyer.id || o.buyer_id,
          name: buyer.name || 'Buyer',
          phone: buyer.phone || '',
          email: buyer.email || ''
        },
        farmer: {
          _id: farmer.id || o.farmer_id,
          id: farmer.id || o.farmer_id,
          name: farmer.name || 'Farmer',
          phone: farmer.phone || '',
          email: farmer.email || ''
        },
        orderStatus: o.order_status,
        paymentStatus: o.payment_status,
        createdAt: o.created_at
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      orders: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching admin orders' });
  }
};

// @desc    Toggle listing status
// @route   PUT /api/admin/listings/:id/toggle-status
// @access  Private (Admin)
exports.toggleListingStatus = async (req, res) => {
  try {
    const { data: listing, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const nextStatus = listing.status === 'active' ? 'inactive' : 'active';
    const { data: updated } = await supabase
      .from('listings')
      .update({ status: nextStatus })
      .eq('id', req.params.id)
      .select('*')
      .single();

    res.json({
      success: true,
      message: `Listing status updated to ${nextStatus}`,
      listing: {
        _id: updated.id,
        id: updated.id,
        status: updated.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error toggling status' });
  }
};
