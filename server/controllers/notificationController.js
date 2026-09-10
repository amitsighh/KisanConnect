const supabase = require('../config/supabase');

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = async (req, res) => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }

    const unreadCount = (notifications || []).filter((n) => !n.is_read).length;

    res.json({
      success: true,
      unreadCount,
      count: (notifications || []).length,
      notifications: (notifications || []).map((n) => ({
        _id: n.id,
        id: n.id,
        userId: n.user_id,
        type: n.type,
        title: n.title,
        message: n.message,
        poolId: n.pool_id,
        suggestedQty: n.suggested_qty,
        isRead: Boolean(n.is_read),
        createdAt: n.created_at
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving notifications' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating notification' });
  }
};

// @desc    Respond to notification action (JOIN or IGNORE)
// @route   POST /api/notifications/respond
// @access  Private (Farmer)
exports.respondToNotification = async (req, res) => {
  try {
    const { notificationId, action, poolId, contributionQuantity } = req.body;

    if (!notificationId || !action) {
      return res.status(400).json({ success: false, message: 'Missing notificationId or action' });
    }

    // Mark notification read
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);

    if (action === 'IGNORE') {
      return res.json({
        success: true,
        message: 'Pool invitation ignored.'
      });
    }

    if (action === 'JOIN' && poolId) {
      // Delegate to poolController logic or call join directly
      const qty = Number(contributionQuantity || 50);

      const { data: pool } = await supabase.from('smart_pools').select('*').eq('id', poolId).single();
      if (!pool) return res.status(404).json({ success: false, message: 'Pool not found' });

      const reqQty = Number(pool.required_quantity);
      const currQty = Number(pool.current_quantity);
      const remainingCap = reqQty - currQty;

      if (qty > remainingCap) {
        return res.status(400).json({
          success: false,
          message: `Requested contribution of ${qty} ${pool.unit} exceeds remaining capacity of ${remainingCap} ${pool.unit}`
        });
      }

      const newCurrQty = currQty + qty;
      const newRemainingQty = reqQty - newCurrQty;
      const newStatus = newRemainingQty === 0 ? 'FULL' : 'FILLING';

      await supabase.from('pool_members').insert({
        pool_id: poolId,
        farmer_id: req.user.id,
        contributed_quantity: qty,
        agreed_price: Number(pool.target_price_per_unit),
        status: 'JOINED',
        joined_at: new Date().toISOString()
      });

      await supabase
        .from('smart_pools')
        .update({
          current_quantity: newCurrQty,
          remaining_quantity: newRemainingQty,
          status: newStatus
        })
        .eq('id', poolId);

      return res.json({
        success: true,
        message: `Successfully joined ${pool.crop} pool with ${qty} ${pool.unit}!`
      });
    }

    res.json({ success: true, message: 'Action processed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error handling notification response' });
  }
};
