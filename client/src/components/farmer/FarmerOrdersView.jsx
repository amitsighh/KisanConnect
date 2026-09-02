import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Phone, MapPin, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import API from '../../services/api';

export const FarmerOrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get('/orders/farmer');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error fetching farmer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus, note) => {
    try {
      setUpdatingId(orderId);
      const res = await API.put(`/orders/${orderId}/status`, {
        status: newStatus,
        note: note || `Order updated to ${newStatus} by farmer`
      });

      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? res.data.order : o))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="text-xs text-slate-500 mt-2">Loading received orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <Package size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Orders Received Yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          When buyers order your listed produce or convert accepted negotiation bids into confirmed orders, they will appear here for fulfillment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const isPlaced = order.orderStatus === 'Placed';
        const isConfirmed = order.orderStatus === 'Confirmed';
        const isDispatched = order.orderStatus === 'Dispatched';
        const isDelivered = order.orderStatus === 'Delivered';

        return (
          <div
            key={order._id}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4"
          >
            {/* Header: Order ID & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm font-mono">{order.orderNumber}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base mt-1">{order.cropName}</h4>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isDelivered
                    ? 'bg-emerald-100 text-emerald-800'
                    : isDispatched
                    ? 'bg-blue-100 text-blue-800'
                    : isConfirmed
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {order.orderStatus}
                </span>

                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                  order.paymentStatus === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  Payment: {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Order Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Quantity</span>
                <span className="font-bold text-slate-800">{order.quantity} {order.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Rate</span>
                <span className="font-bold text-slate-800">₹{order.pricePerUnit}/{order.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Total Payout</span>
                <span className="font-extrabold text-emerald-700 text-sm">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Payment Mode</span>
                <span className="font-medium text-slate-700 truncate block">{order.paymentMethod}</span>
              </div>
            </div>

            {/* Buyer Contact & Delivery Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">Buyer Details:</span>
                <p className="text-slate-900 font-semibold">{order.buyer?.name}</p>
                <p className="text-slate-600">{order.buyer?.buyerDetails?.businessName || 'Direct Buyer'}</p>
                <div className="flex items-center gap-1 text-slate-600 pt-1">
                  <Phone size={12} className="text-emerald-600" />
                  <span>{order.deliveryAddress?.contactPhone || order.buyer?.phone}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">Delivery Address:</span>
                <div className="flex items-start gap-1 text-slate-700">
                  <MapPin size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    {order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Stepper & Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock size={13} />
                <span>Last Updated: {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {isPlaced && (
                  <button
                    onClick={() => updateStatus(order._id, 'Confirmed', 'Order confirmed by farmer. Preparing produce.')}
                    disabled={updatingId === order._id}
                    className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                  >
                    Confirm Order
                  </button>
                )}

                {isConfirmed && (
                  <button
                    onClick={() => updateStatus(order._id, 'Dispatched', 'Produce loaded on transport vehicle. In transit.')}
                    disabled={updatingId === order._id}
                    className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Truck size={14} />
                    <span>Dispatch Produce</span>
                  </button>
                )}

                {isDispatched && (
                  <button
                    onClick={() => updateStatus(order._id, 'Delivered', 'Produce delivered to buyer warehouse. Direct payment received.')}
                    disabled={updatingId === order._id}
                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} />
                    <span>Mark Delivered & Paid</span>
                  </button>
                )}

                {isDelivered && (
                  <div className="flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-lg">
                    <CheckCircle2 size={15} />
                    <span>Order Completed</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default FarmerOrdersView;
