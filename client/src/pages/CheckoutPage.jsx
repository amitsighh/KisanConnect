import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { 
  ShoppingCart, 
  Trash2, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  Building,
  CreditCard,
  Truck
} from 'lucide-react';

export const CheckoutPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotalAmount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    street: user?.location?.address || 'Warehouse No 4B, APMC Yard',
    city: user?.location?.district || 'Navi Mumbai',
    state: user?.location?.state || 'Maharashtra',
    pincode: user?.location?.pincode || '400703',
    contactPhone: user?.phone || '9811223344',
    receiverName: user?.name || 'Rajesh Agarwal'
  });

  const [paymentMethod, setPaymentMethod] = useState('Direct Settlement / UPI on Delivery');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAddressChange = (e) => {
    setShippingAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) return;

    setLoading(true);
    setError('');

    try {
      // Place order for each listing in the cart
      for (const item of cartItems) {
        await API.post('/orders', {
          listingId: item.listing._id,
          quantity: item.quantity,
          deliveryAddress: shippingAddress,
          paymentMethod
        });
      }

      clearCart();
      setSuccess(true);
      setTimeout(() => {
        navigate('/buyer/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto my-12 space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Order Placed Successfully!</h2>
        <p className="text-xs text-slate-500">
          The farmer has been notified and will prepare the produce for farm-gate dispatch.
        </p>
        <div className="pt-2">
          <span className="text-xs text-slate-400">Redirecting to order tracking stepper...</span>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto my-12 space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <ShoppingCart size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Your Procurement Cart is Empty</h3>
        <p className="text-xs text-slate-500">
          Explore the agricultural marketplace to discover lots directly from verified farmers.
        </p>
        <Link
          to="/marketplace"
          className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      <div>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition shadow-2xs"
        >
          <ArrowLeft size={14} />
          <span>Continue Sourcing</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          Direct Farm Sourcing Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Cart Items & Delivery Address (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Cart Items List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Selected Farm Lots ({cartItems.length})</h3>

            <div className="divide-y divide-slate-100">
              {cartItems.map((item) => (
                <div key={item.listing._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.listing.images?.[0] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200'}
                      alt={item.listing.cropName}
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.listing.cropName}</h4>
                      <p className="text-xs text-slate-500">
                        ₹{item.listing.pricePerUnit}/{item.listing.unit} • {item.listing.location?.district}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <input
                        type="number"
                        min="1"
                        max={item.listing.quantity}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.listing._id, e.target.value)}
                        className="w-16 px-2 py-1 text-xs text-center font-bold bg-transparent focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500 pr-2">{item.listing.unit}</span>
                    </div>

                    <span className="font-extrabold text-slate-900 text-sm">
                      ₹{(item.quantity * item.listing.pricePerUnit).toLocaleString('en-IN')}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.listing._id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-emerald-600" />
              <h3 className="font-extrabold text-slate-900 text-base">Delivery Warehouse / Destination Address</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Receiver / Business Name *</label>
                <input
                  type="text"
                  name="receiverName"
                  required
                  value={shippingAddress.receiverName}
                  onChange={handleAddressChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone Number *</label>
                <input
                  type="tel"
                  name="contactPhone"
                  required
                  value={shippingAddress.contactPhone}
                  onChange={handleAddressChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Street Address / Warehouse Yard *</label>
              <input
                type="text"
                name="street"
                required
                value={shippingAddress.street}
                onChange={handleAddressChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">City / District *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={shippingAddress.city}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={shippingAddress.state}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  value={shippingAddress.pincode}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Settlement Mode (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="font-extrabold text-slate-900 text-base">Procurement Summary</h3>

            <div className="space-y-2.5 text-xs text-slate-600 border-b border-slate-100 pb-4">
              <div className="flex justify-between">
                <span>Produce Gross Total</span>
                <span className="font-bold text-slate-900">₹{cartTotalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Intermediary / Commission Agent Fee</span>
                <span>₹0 (Eliminated)</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Platform Facilitation Fee</span>
                <span>₹0 (Hackathon MVP)</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="font-bold text-slate-800 text-sm">Total Settlement Amount</span>
              <span className="text-2xl font-black text-emerald-700">₹{cartTotalAmount.toLocaleString('en-IN')}</span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700">Select Direct Settlement Method</label>
              
              <label className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/40 bg-emerald-50/50 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Direct Settlement / UPI on Delivery"
                  checked={paymentMethod === 'Direct Settlement / UPI on Delivery'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Direct Settlement / UPI on Delivery</span>
                  <span className="text-slate-500 text-[11px]">Pay directly to farmer's UPI upon grain inspection</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash on Delivery"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Cash on Delivery (Farm-Gate)</span>
                  <span className="text-slate-500 text-[11px]">Instant cash handover on vehicle loading</span>
                </div>
              </label>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {error}
              </p>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Truck size={18} />
              <span>{loading ? 'Processing Order...' : 'Confirm & Place Direct Farm Order'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CheckoutPage;
