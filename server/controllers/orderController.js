const supabase = require('../config/supabase');

const formatOrder = (o) => {
  if (!o) return null;
  const buyer = o.buyer || {};
  const farmer = o.farmer || {};
  const listing = o.listing || {};

  return {
    _id: o.id,
    id: o.id,
    orderNumber: o.order_number,
    buyer: {
      _id: buyer.id || o.buyer_id,
      id: buyer.id || o.buyer_id,
      name: buyer.name || 'Buyer',
      phone: buyer.phone || '',
      email: buyer.email || '',
      location: {
        district: buyer.district || '',
        state: buyer.state || ''
      },
      buyerDetails: buyer.buyer_details || {}
    },
    farmer: {
      _id: farmer.id || o.farmer_id,
      id: farmer.id || o.farmer_id,
      name: farmer.name || 'Farmer',
      phone: farmer.phone || '',
      email: farmer.email || '',
      location: {
        district: farmer.district || '',
        state: farmer.state || ''
      },
      farmDetails: farmer.farm_details || {},
      trustScore: Number(farmer.trust_score) || 4.8
    },
    listing: {
      _id: listing.id || o.listing_id,
      id: listing.id || o.listing_id,
      cropName: listing.crop_name || o.crop_name,
      images: listing.images || [],
      qualityGrade: listing.quality_grade || o.quality_grade,
      category: listing.category || ''
    },
    cropName: o.crop_name,
    variety: o.variety,
    qualityGrade: o.quality_grade,
    quantity: Number(o.quantity),
    unit: o.unit,
    pricePerUnit: Number(o.price_per_unit),
    totalAmount: Number(o.total_amount),
    fromOffer: o.from_offer_id,
    deliveryAddress: typeof o.delivery_address === 'string' ? JSON.parse(o.delivery_address) : (o.delivery_address || {}),
    paymentMethod: o.payment_method,
    paymentStatus: o.payment_status,
    orderStatus: o.order_status,
    notes: o.notes || '',
    timeline: (o.timeline || []).map((t) => ({
      status: t.status,
      note: t.note,
      timestamp: t.timestamp
    })),
    createdAt: o.created_at,
    updatedAt: o.updated_at
  };
};

// @desc    Buyer creates direct order
// @route   POST /api/orders
// @access  Private (Buyer)
exports.createOrder = async (req, res) => {
  try {
    const { listingId, quantity, deliveryAddress, paymentMethod, notes } = req.body;

    const { data: listing, error: listingErr } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (listingErr || !listing) {
      return res.status(404).json({ success: false, message: 'Produce listing not found' });
    }

    if (listing.farmer_id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Farmers cannot order their own listings' });
    }

    const orderQty = Number(quantity);
    if (orderQty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    if (orderQty > Number(listing.quantity)) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${orderQty}) exceeds available stock (${listing.quantity} ${listing.unit})`
      });
    }

    const pricePerUnit = Number(listing.price_per_unit);
    const totalAmount = orderQty * pricePerUnit;
    const orderNumber = `KC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderPayload = {
      order_number: orderNumber,
      buyer_id: req.user.id,
      farmer_id: listing.farmer_id,
      listing_id: listing.id,
      crop_name: listing.crop_name,
      variety: listing.variety || '',
      quality_grade: listing.quality_grade || 'Grade A (Premium)',
      quantity: orderQty,
      unit: listing.unit,
      price_per_unit: pricePerUnit,
      total_amount: totalAmount,
      delivery_address: deliveryAddress || {
        street: req.user.address || 'Main Road',
        city: req.user.district || 'Central',
        state: req.user.state || 'Delhi',
        pincode: req.user.pincode || '110001',
        contactPhone: req.user.phone,
        receiverName: req.user.name
      },
      payment_method: paymentMethod || 'Direct Settlement / UPI on Delivery',
      payment_status: 'Pending',
      order_status: 'Placed',
      notes: notes || ''
    };

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select('*')
      .single();

    if (orderErr) {
      return res.status(500).json({ success: false, message: 'Failed to place order' });
    }

    // Insert timeline
    await supabase.from('order_timeline').insert({
      order_id: order.id,
      status: 'Placed',
      note: `Order placed for ${orderQty} ${listing.unit} of ${listing.crop_name} at ₹${pricePerUnit}/${listing.unit}`
    });

    // Deduct stock
    const remainingQty = Math.max(0, Number(listing.quantity) - orderQty);
    await supabase.from('listings').update({
      quantity: remainingQty,
      status: remainingQty === 0 ? 'sold_out' : 'active'
    }).eq('id', listing.id);

    const { data: fullOrder } = await supabase.from('orders').select('*').eq('id', order.id).single();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! The farmer has been notified.',
      order: formatOrder(fullOrder)
    });
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error placing order' });
  }
};

// @desc    Get orders placed by logged in buyer
// @route   GET /api/orders/buyer
// @access  Private (Buyer)
exports.getBuyerOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('buyer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve orders' });
    }

    const formatted = (orders || []).map(formatOrder);

    res.json({
      success: true,
      count: formatted.length,
      orders: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving buyer orders' });
  }
};

// @desc    Get orders received by logged in farmer
// @route   GET /api/orders/farmer
// @access  Private (Farmer)
exports.getFarmerOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('farmer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve farmer orders' });
    }

    const formatted = (orders || []).map(formatOrder);

    res.json({
      success: true,
      count: formatted.length,
      orders: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving farmer orders' });
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.buyer_id !== req.user.id && order.farmer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order' });
    }

    res.json({
      success: true,
      order: formatOrder(order)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching order details' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Farmer Owner or Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note, paymentStatus } = req.body;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.farmer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only designated farmer or admin can update order status' });
    }

    const updates = {};
    if (status) {
      updates.order_status = status;
      if (status === 'Delivered') updates.payment_status = 'Completed';
    }
    if (paymentStatus) {
      updates.payment_status = paymentStatus;
    }

    await supabase.from('orders').update(updates).eq('id', req.params.id);

    if (status) {
      await supabase.from('order_timeline').insert({
        order_id: order.id,
        status,
        note: note || `Order updated to ${status} by farmer`
      });
    }

    const { data: updatedOrder } = await supabase.from('orders').select('*').eq('id', req.params.id).single();

    res.json({
      success: true,
      message: `Order status updated to '${status}' successfully!`,
      order: formatOrder(updatedOrder)
    });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error updating order status' });
  }
};
