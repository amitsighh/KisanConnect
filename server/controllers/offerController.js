const supabase = require('../config/supabase');

const formatOffer = (o) => {
  if (!o) return null;
  const listing = o.listing || {};
  const farmer = o.farmer || {};
  const buyer = o.buyer || {};

  return {
    _id: o.id,
    id: o.id,
    listing: {
      _id: listing.id || o.listing_id,
      id: listing.id || o.listing_id,
      cropName: listing.crop_name || listing.cropName,
      variety: listing.variety,
      category: listing.category,
      pricePerUnit: Number(listing.price_per_unit || listing.pricePerUnit),
      unit: listing.unit || o.unit,
      location: {
        district: listing.district || listing.location?.district,
        state: listing.state || listing.location?.state
      },
      images: listing.images || [],
      qualityGrade: listing.quality_grade || listing.qualityGrade
    },
    buyer: {
      _id: buyer.id || o.buyer_id,
      id: buyer.id || o.buyer_id,
      name: buyer.name || 'Buyer',
      phone: buyer.phone || '',
      buyerDetails: buyer.buyer_details || buyer.buyerDetails || {},
      location: {
        district: buyer.district || buyer.location?.district,
        state: buyer.state || buyer.location?.state
      }
    },
    farmer: {
      _id: farmer.id || o.farmer_id,
      id: farmer.id || o.farmer_id,
      name: farmer.name || 'Farmer',
      phone: farmer.phone || '',
      location: {
        district: farmer.district || farmer.location?.district,
        state: farmer.state || farmer.location?.state
      },
      trustScore: Number(farmer.trust_score || farmer.trustScore) || 4.8
    },
    offeredPricePerUnit: Number(o.offered_price_per_unit),
    offeredQuantity: Number(o.offered_quantity),
    unit: o.unit,
    originalListingPrice: Number(o.original_listing_price),
    totalOfferedAmount: Number(o.total_offered_amount),
    status: o.status,
    lastActionBy: o.last_action_by,
    currentAgreedPrice: o.current_agreed_price ? Number(o.current_agreed_price) : Number(o.offered_price_per_unit),
    currentAgreedQuantity: o.current_agreed_quantity ? Number(o.current_agreed_quantity) : Number(o.offered_quantity),
    messages: (o.messages || []).map((m) => ({
      senderRole: m.sender_role || m.senderRole,
      senderName: m.sender_name || m.senderName,
      message: m.message,
      actionType: m.action_type || m.actionType,
      counterPrice: m.counter_price ? Number(m.counter_price) : undefined,
      counterQuantity: m.counter_quantity ? Number(m.counter_quantity) : undefined,
      createdAt: m.created_at || m.createdAt
    })),
    convertedOrderId: o.converted_order_id,
    createdAt: o.created_at,
    updatedAt: o.updated_at
  };
};

// @desc    Buyer creates a negotiation offer on a produce listing
// @route   POST /api/offers
// @access  Private (Buyer)
exports.createOffer = async (req, res) => {
  try {
    const { listingId, offeredPricePerUnit, offeredQuantity, message } = req.body;

    const { data: listing, error: listingErr } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (listingErr || !listing) {
      return res.status(404).json({ success: false, message: 'Produce listing not found' });
    }

    if (listing.farmer_id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Farmers cannot make offers on their own listings' });
    }

    const price = Number(offeredPricePerUnit);
    const qty = Number(offeredQuantity);
    const totalOfferedAmount = price * qty;

    const offerPayload = {
      listing_id: listing.id,
      buyer_id: req.user.id,
      farmer_id: listing.farmer_id,
      offered_price_per_unit: price,
      offered_quantity: qty,
      unit: listing.unit,
      original_listing_price: Number(listing.price_per_unit),
      total_offered_amount: totalOfferedAmount,
      current_agreed_price: price,
      current_agreed_quantity: qty,
      last_action_by: 'buyer',
      status: 'pending'
    };

    const { data: offer, error: offerErr } = await supabase
      .from('offers')
      .insert(offerPayload)
      .select('*')
      .single();

    if (offerErr) {
      return res.status(500).json({ success: false, message: 'Failed to create offer' });
    }

    // Insert initial message into offer_messages table
    await supabase.from('offer_messages').insert({
      offer_id: offer.id,
      sender_role: 'buyer',
      sender_name: req.user.name,
      message: message || `Offered ₹${price}/${listing.unit} for ${qty} ${listing.unit}`,
      action_type: 'initial_offer',
      counter_price: price,
      counter_quantity: qty
    });

    const { data: fullOffer } = await supabase.from('offers').select('*').eq('id', offer.id).single();

    res.status(201).json({
      success: true,
      message: 'Offer submitted to farmer successfully!',
      offer: formatOffer(fullOffer)
    });
  } catch (error) {
    console.error('createOffer error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating offer' });
  }
};

// @desc    Get all offers sent by logged in buyer
// @route   GET /api/offers/buyer
// @access  Private (Buyer)
exports.getBuyerOffers = async (req, res) => {
  try {
    const { data: offers, error } = await supabase
      .from('offers')
      .select('*')
      .eq('buyer_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve buyer offers' });
    }

    const formatted = (offers || []).map(formatOffer);

    res.json({
      success: true,
      count: formatted.length,
      offers: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving buyer offers' });
  }
};

// @desc    Get all offers received by logged in farmer
// @route   GET /api/offers/farmer
// @access  Private (Farmer)
exports.getFarmerOffers = async (req, res) => {
  try {
    const { data: offers, error } = await supabase
      .from('offers')
      .select('*')
      .eq('farmer_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve farmer offers' });
    }

    const formatted = (offers || []).map(formatOffer);

    res.json({
      success: true,
      count: formatted.length,
      offers: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving farmer offers' });
  }
};

// @desc    Farmer responds to an offer (Accept / Reject / Counter-offer)
// @route   PUT /api/offers/:id/respond
// @access  Private (Farmer)
exports.respondToOffer = async (req, res) => {
  try {
    const { action, counterPrice, counterQuantity, message } = req.body;

    const { data: offer, error } = await supabase
      .from('offers')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (offer.farmer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You are not the farmer for this offer.' });
    }

    const updates = { last_action_by: 'farmer' };
    let msgActionType = action;

    if (action === 'accept') {
      updates.status = 'accepted';
    } else if (action === 'reject') {
      updates.status = 'rejected';
    } else if (action === 'counter') {
      if (!counterPrice) {
        return res.status(400).json({ success: false, message: 'Counter price is required for counter-offer' });
      }
      updates.status = 'countered';
      updates.current_agreed_price = Number(counterPrice);
      if (counterQuantity) updates.current_agreed_quantity = Number(counterQuantity);
      updates.total_offered_amount = updates.current_agreed_price * (updates.current_agreed_quantity || offer.offered_quantity);
      msgActionType = 'counter_offer';
    }

    await supabase.from('offers').update(updates).eq('id', req.params.id);

    // Record message in offer_messages
    await supabase.from('offer_messages').insert({
      offer_id: offer.id,
      sender_role: 'farmer',
      sender_name: req.user.name,
      message: message || (action === 'accept' ? `Accepted offer at ₹${updates.current_agreed_price || offer.current_agreed_price}/${offer.unit}` : action === 'counter' ? `Counter-offered at ₹${counterPrice}/${offer.unit}` : 'Declined offer'),
      action_type: msgActionType,
      counter_price: counterPrice ? Number(counterPrice) : undefined,
      counter_quantity: counterQuantity ? Number(counterQuantity) : undefined
    });

    const { data: updatedOffer } = await supabase.from('offers').select('*').eq('id', req.params.id).single();

    res.json({
      success: true,
      message: `Offer ${action}ed successfully!`,
      offer: formatOffer(updatedOffer)
    });
  } catch (error) {
    console.error('respondToOffer error:', error);
    res.status(500).json({ success: false, message: 'Server error updating offer' });
  }
};

// @desc    Buyer responds to farmer's counter offer
// @route   PUT /api/offers/:id/buyer-respond
// @access  Private (Buyer)
exports.buyerRespondToOffer = async (req, res) => {
  try {
    const { action, message } = req.body;

    const { data: offer, error } = await supabase
      .from('offers')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (offer.buyer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You are not the buyer for this offer.' });
    }

    const updates = {
      status: action === 'accept' ? 'accepted' : 'rejected',
      last_action_by: 'buyer'
    };

    await supabase.from('offers').update(updates).eq('id', req.params.id);

    await supabase.from('offer_messages').insert({
      offer_id: offer.id,
      sender_role: 'buyer',
      sender_name: req.user.name,
      message: message || (action === 'accept' ? `Accepted counter-offer of ₹${offer.current_agreed_price}/${offer.unit}` : 'Declined counter-offer'),
      action_type: action === 'accept' ? 'accept' : 'reject'
    });

    const { data: updatedOffer } = await supabase.from('offers').select('*').eq('id', req.params.id).single();

    res.json({
      success: true,
      message: `Counter-offer ${action}ed successfully!`,
      offer: formatOffer(updatedOffer)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error responding to counter offer' });
  }
};

// @desc    Convert accepted offer into confirmed Order in Supabase
// @route   POST /api/offers/:id/convert-to-order
// @access  Private (Buyer)
exports.convertOfferToOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod } = req.body;

    const { data: offer, error: offerErr } = await supabase
      .from('offers')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (offerErr || !offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (offer.buyer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized. Only the bidding buyer can convert to order.' });
    }

    if (offer.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Only accepted offers can be converted to an order' });
    }

    const { data: listing } = await supabase.from('listings').select('*').eq('id', offer.listing_id).single();

    const orderNumber = `KC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalQty = Number(offer.current_agreed_quantity || offer.offered_quantity);
    const finalPrice = Number(offer.current_agreed_price || offer.offered_price_per_unit);
    const finalAmount = finalQty * finalPrice;

    const orderPayload = {
      order_number: orderNumber,
      buyer_id: offer.buyer_id,
      farmer_id: offer.farmer_id,
      listing_id: offer.listing_id,
      crop_name: listing?.crop_name || 'Produce',
      variety: listing?.variety || '',
      quality_grade: listing?.quality_grade || 'Grade A (Premium)',
      quantity: finalQty,
      unit: offer.unit,
      price_per_unit: finalPrice,
      total_amount: finalAmount,
      from_offer_id: offer.id,
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
      notes: ''
    };

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select('*')
      .single();

    if (orderErr) {
      return res.status(500).json({ success: false, message: 'Failed to create order' });
    }

    // Insert timeline entry in order_timeline table
    await supabase.from('order_timeline').insert({
      order_id: order.id,
      status: 'Placed',
      note: `Order converted from accepted negotiation offer (${finalQty} ${offer.unit} @ ₹${finalPrice}/${offer.unit})`
    });

    // Mark offer as converted
    await supabase.from('offers').update({
      status: 'converted_to_order',
      converted_order_id: order.id
    }).eq('id', offer.id);

    // Deduct stock in listing
    if (listing) {
      const remainingQty = Math.max(0, Number(listing.quantity) - finalQty);
      await supabase.from('listings').update({
        quantity: remainingQty,
        status: remainingQty === 0 ? 'sold_out' : 'active'
      }).eq('id', listing.id);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully from negotiated offer!',
      order: {
        _id: order.id,
        id: order.id,
        orderNumber: order.order_number,
        totalAmount: order.total_amount,
        quantity: order.quantity,
        unit: order.unit
      }
    });
  } catch (error) {
    console.error('convertOfferToOrder error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating order' });
  }
};
