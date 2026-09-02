import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, MapPin, Phone, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';

const STATUS_STEPS = ['Placed', 'Confirmed', 'Dispatched', 'Delivered'];

export const BuyerOrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get('/orders/buyer');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error fetching buyer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="text-xs text-slate-500 mt-2">Loading your orders & live tracking...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <Package size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Orders Placed Yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Discover verified farm produce at direct farm-gate prices on the marketplace.
        </p>
        <button
          onClick={() => navigate('/marketplace')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          Browse Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const currentStepIndex = STATUS_STEPS.indexOf(order.orderStatus);

        return (
          <div
            key={order._id}
            className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5"
          >
            {/* Header: Order ID & Date */}
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
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                  Total: ₹{order.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* 4-Step Order Tracking Stepper */}
            <div className="py-2">
              <div className="grid grid-cols-4 gap-2 relative">
                {STATUS_STEPS.map((step, idx) => {
                  const isPassed = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div key={step} className="text-center relative">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition ${
                        isCurrent
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {isPassed ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>
                      <span className={`text-[11px] sm:text-xs font-semibold block leading-tight ${
                        isPassed ? 'text-emerald-800' : 'text-slate-400'
                      }`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Details & Farmer Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl">
              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">Farmer & Sourcing Details:</span>
                <p className="text-slate-900 font-semibold">{order.farmer?.name}</p>
                <p className="text-slate-600">{order.farmer?.farmDetails?.farmName || `${order.farmer?.location?.district}, ${order.farmer?.location?.state}`}</p>
                <div className="flex items-center gap-1 text-slate-600 pt-1">
                  <Phone size={12} className="text-emerald-600" />
                  <span>Contact: {order.farmer?.phone}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">Delivery Destination & Settlement:</span>
                <div className="flex items-start gap-1 text-slate-700">
                  <MapPin size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    {order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  Payment: <span className="font-medium text-slate-700">{order.paymentMethod}</span> ({order.paymentStatus})
                </p>
              </div>
            </div>

            {/* Timeline Notes */}
            {order.timeline && order.timeline.length > 0 && (
              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">Tracking Logs</span>
                {order.timeline.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}:
                    </span>
                    <span className="text-slate-700">{entry.note || entry.status}</span>
                  </div>
                ))}
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
};

export default BuyerOrdersView;
