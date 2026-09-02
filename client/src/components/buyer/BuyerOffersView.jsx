import React, { useState, useEffect } from 'react';
import { Handshake, CheckCircle2, XCircle, ArrowRight, MessageSquare, ShoppingBag } from 'lucide-react';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const BuyerOffersView = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [convertingId, setConvertingId] = useState(null);
  const navigate = useNavigate();

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/offers/buyer');
      if (res.data.success) {
        setOffers(res.data.offers);
      }
    } catch (err) {
      console.error('Error fetching buyer offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleBuyerResponse = async (offerId, action) => {
    try {
      const res = await API.put(`/offers/${offerId}/buyer-respond`, { action });
      if (res.data.success) {
        setOffers((prev) =>
          prev.map((o) => (o._id === offerId ? res.data.offer : o))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to respond to counter offer');
    }
  };

  const convertToOrder = async (offerId) => {
    try {
      setConvertingId(offerId);
      const res = await API.post(`/offers/${offerId}/convert-to-order`, {});
      if (res.data.success) {
        alert('🎉 Negotiated offer successfully converted into a confirmed Order!');
        fetchOffers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to convert offer into order');
    } finally {
      setConvertingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="text-xs text-slate-500 mt-2">Loading your price offers...</p>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
          <Handshake size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Price Offers Sent</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Browse the marketplace and use the "Make Offer" button on any produce listing to negotiate prices directly with farmers.
        </p>
        <button
          onClick={() => navigate('/marketplace')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          Explore Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => {
        const isCountered = offer.status === 'countered' && offer.lastActionBy === 'farmer';
        const isAccepted = offer.status === 'accepted';
        const isConverted = offer.status === 'converted_to_order';

        return (
          <div
            key={offer._id}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={offer.listing?.images?.[0] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200'}
                  alt={offer.listing?.cropName}
                  className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {offer.listing?.cropName || 'Produce Listing'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Farmer: <span className="font-semibold text-slate-700">{offer.farmer?.name}</span> ({offer.listing?.location?.district}, {offer.listing?.location?.state})
                  </p>
                </div>
              </div>

              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                  isConverted
                    ? 'bg-emerald-100 text-emerald-800'
                    : isAccepted
                    ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                    : offer.status === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : isCountered
                    ? 'bg-blue-100 text-blue-800 animate-pulse'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {isConverted ? 'Converted to Order' : isCountered ? 'Farmer Counter-Offered' : offer.status}
                </span>
              </div>
            </div>

            {/* Price Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Listing Price</span>
                <span className="font-bold text-slate-700">₹{offer.originalListingPrice}/{offer.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Your Bid</span>
                <span className="font-bold text-slate-700">₹{offer.offeredPricePerUnit}/{offer.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Current Agreed Rate</span>
                <span className="font-extrabold text-emerald-700">₹{offer.currentAgreedPrice || offer.offeredPricePerUnit}/{offer.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Total Deal Amount</span>
                <span className="font-extrabold text-slate-900">₹{offer.totalOfferedAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Message Thread History */}
            {offer.messages && offer.messages.length > 0 && (
              <div className="space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100 text-xs">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <MessageSquare size={12} /> Negotiation Thread
                </div>
                {offer.messages.map((msg, idx) => (
                  <div key={idx} className="flex items-start gap-2 pt-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      msg.senderRole === 'buyer' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {msg.senderRole === 'buyer' ? 'You' : 'Farmer'}
                    </span>
                    <p className="text-slate-700 flex-1">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Buyer Action Area */}
            {isCountered && (
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <p className="text-xs font-semibold text-blue-800">
                  Farmer countered with ₹{offer.currentAgreedPrice}/{offer.unit}. Do you accept?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBuyerResponse(offer._id, 'reject')}
                    className="px-3 py-1.5 border border-red-200 text-red-700 hover:bg-red-50 rounded-xl text-xs font-bold transition"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleBuyerResponse(offer._id, 'accept')}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Accept Counter Rate
                  </button>
                </div>
              </div>
            )}

            {isAccepted && !isConverted && (
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 bg-emerald-50/50 p-3 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-emerald-800">
                    Deal Accepted at ₹{offer.currentAgreedPrice}/{offer.unit}!
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Proceed to confirm delivery address and generate order.
                  </p>
                </div>

                <button
                  onClick={() => convertToOrder(offer._id)}
                  disabled={convertingId === offer._id}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <ShoppingBag size={14} />
                  <span>{convertingId === offer._id ? 'Generating Order...' : 'Convert to Order'}</span>
                </button>
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
};

export default BuyerOffersView;
