const supabase = require('../config/supabase');

// Helper to normalize Supabase PostgreSQL listing record to expected API JSON format
const formatListing = (r) => {
  if (!r) return null;
  const farmerData = r.farmer || {};

  return {
    _id: r.id,
    id: r.id,
    farmer: {
      _id: farmerData.id || r.farmer_id,
      id: farmerData.id || r.farmer_id,
      name: farmerData.name || 'Verified Farmer',
      phone: farmerData.phone || '',
      email: farmerData.email || '',
      location: {
        district: farmerData.district || r.district,
        state: farmerData.state || r.state,
        pincode: farmerData.pincode || r.pincode,
        village: farmerData.village || r.village,
        address: farmerData.address || ''
      },
      farmDetails: farmerData.farm_details || {},
      trustScore: Number(farmerData.trust_score) || 4.8,
      isVerified: Boolean(farmerData.is_verified)
    },
    farmer_id: r.farmer_id,
    cropName: r.crop_name,
    category: r.category,
    variety: r.variety || 'Standard / Desi',
    quantity: Number(r.quantity),
    minOrderQuantity: Number(r.min_order_quantity) || 1,
    unit: r.unit,
    pricePerUnit: Number(r.price_per_unit),
    qualityGrade: r.quality_grade,
    location: {
      village: r.village || '',
      district: r.district,
      state: r.state,
      pincode: r.pincode
    },
    harvestDate: r.harvest_date,
    images: Array.isArray(r.images) && r.images.length > 0 
      ? r.images 
      : ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600'],
    description: r.description || '',
    isOrganic: Boolean(r.is_organic),
    status: r.status,
    viewsCount: Number(r.views_count) || 0,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
};

// @desc    Get all produce listings with search, filters & pagination
// @route   GET /api/listings
// @access  Public
exports.getListings = async (req, res) => {
  try {
    const {
      search,
      category,
      state,
      district,
      minPrice,
      maxPrice,
      qualityGrade,
      isOrganic,
      sort,
      page = 1,
      limit = 24
    } = req.query;

    let query = supabase.from('listings').select('*').eq('status', 'active');

    // Search filter
    if (search && search.trim() !== '') {
      const s = search.trim();
      query = query.or(`crop_name.ilike.%${s}%,variety.ilike.%${s}%,district.ilike.%${s}%,state.ilike.%${s}%`);
    }

    // Category filter
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    // State filter
    if (state && state !== 'All') {
      query = query.eq('state', state);
    }

    // District filter
    if (district && district !== 'All') {
      query = query.eq('district', district);
    }

    // Quality Grade filter
    if (qualityGrade && qualityGrade !== 'All') {
      query = query.eq('quality_grade', qualityGrade);
    }

    // Organic filter
    if (isOrganic === 'true') {
      query = query.eq('is_organic', true);
    }

    // Price range
    if (minPrice) {
      query = query.gte('price_per_unit', Number(minPrice));
    }
    if (maxPrice) {
      query = query.lte('price_per_unit', Number(maxPrice));
    }

    // Sorting
    if (sort === 'price_asc') {
      query = query.order('price_per_unit', { ascending: true });
    } else if (sort === 'price_desc') {
      query = query.order('price_per_unit', { ascending: false });
    } else if (sort === 'quantity_desc') {
      query = query.order('quantity', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const { data: listings, error, count } = await query.range(from, to);

    if (error) {
      console.error('Supabase query error in getListings:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve listings' });
    }

    const formatted = (listings || []).map(formatListing);
    const total = count || formatted.length;

    res.json({
      success: true,
      count: formatted.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      listings: formatted
    });
  } catch (error) {
    console.error('getListings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving produce listings'
    });
  }
};

// @desc    Get single listing by ID
// @route   GET /api/listings/:id
// @access  Public
exports.getListingById = async (req, res) => {
  try {
    const { data: listing, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !listing) {
      return res.status(404).json({
        success: false,
        message: 'Produce listing not found'
      });
    }

    // Increment views count in Supabase
    await supabase
      .from('listings')
      .update({ views_count: (Number(listing.views_count) || 0) + 1 })
      .eq('id', req.params.id);

    res.json({
      success: true,
      listing: formatListing(listing)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving listing details'
    });
  }
};

// @desc    Create new produce listing (Farmer only)
// @route   POST /api/listings
// @access  Private (Farmer)
exports.createListing = async (req, res) => {
  try {
    const {
      cropName,
      category,
      variety = 'Standard / Desi',
      quantity,
      minOrderQuantity = 1,
      unit = 'quintal',
      pricePerUnit,
      qualityGrade = 'Grade A (Premium)',
      location = {},
      harvestDate,
      images,
      description = '',
      isOrganic = false
    } = req.body;

    const payload = {
      farmer_id: req.user.id,
      crop_name: cropName,
      category,
      variety,
      quantity: Number(quantity),
      min_order_quantity: Number(minOrderQuantity) || 1,
      unit,
      price_per_unit: Number(pricePerUnit),
      quality_grade: qualityGrade,
      village: location.village || req.user.village || '',
      district: location.district || req.user.district,
      state: location.state || req.user.state,
      pincode: location.pincode || req.user.pincode,
      harvest_date: harvestDate || new Date().toISOString().split('T')[0],
      images: Array.isArray(images) && images.length > 0 
        ? images 
        : ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600'],
      description,
      is_organic: Boolean(isOrganic),
      status: 'active',
      views_count: 0
    };

    const { data: newListing, error } = await supabase
      .from('listings')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error creating listing:', error);
      return res.status(500).json({ success: false, message: 'Failed to create listing' });
    }

    res.status(201).json({
      success: true,
      message: 'Produce listed successfully on KisanConnect marketplace!',
      listing: formatListing(newListing)
    });
  } catch (error) {
    console.error('createListing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating listing'
    });
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private (Farmer Owner or Admin)
exports.updateListing = async (req, res) => {
  try {
    const { data: existing } = await supabase
      .from('listings')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (existing.farmer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this listing' });
    }

    const updates = {};
    if (req.body.pricePerUnit) updates.price_per_unit = Number(req.body.pricePerUnit);
    if (req.body.quantity !== undefined) updates.quantity = Number(req.body.quantity);
    if (req.body.status) updates.status = req.body.status;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.cropName) updates.crop_name = req.body.cropName;

    const { data: updated, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to update listing' });
    }

    res.json({
      success: true,
      message: 'Listing updated successfully',
      listing: formatListing(updated)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating listing' });
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private (Farmer Owner or Admin)
exports.deleteListing = async (req, res) => {
  try {
    const { data: existing } = await supabase
      .from('listings')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (existing.farmer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this listing' });
    }

    await supabase.from('listings').delete().eq('id', req.params.id);

    res.json({
      success: true,
      message: 'Listing removed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting listing' });
  }
};

// @desc    Get listings for logged in farmer
// @route   GET /api/listings/farmer/my-listings
// @access  Private (Farmer)
exports.getMyListings = async (req, res) => {
  try {
    const { data: listings, error } = await supabase
      .from('listings')
      .select('*')
      .eq('farmer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch your listings' });
    }

    const formatted = (listings || []).map(formatListing);

    res.json({
      success: true,
      count: formatted.length,
      listings: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching your listings' });
  }
};
