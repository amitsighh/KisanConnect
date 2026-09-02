import React, { useState, useEffect } from 'react';
import { Handshake, Check, X, ArrowRight, MessageSquare, Clock, ShieldCheck } from 'lucide-react';
import API from '../../services/api';

export const FarmerOffersView = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counterInputs, setCounterInputs] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [messageText, setMessageText] = useState({});

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/offers/farmer');
      if (res.data.success) {
        setOffers(res.data.offers);
      }
    } catch (err) {
      console.error('Error fetching farmer offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleResponse = async (offerId, action) => {
    try {
      setActionLoading((prev) => ({ ...prev, [offerId]: true }));
      const payload = {
        action,
        counterPrice: counterInputs[offerId]?.price,
        counterQuantity: counterInputs[offerId]?.quantity,
        message: messageText[offerId] || ''
      };

      const res = await API.put(`/offers/${offerId}/respond`, payload);
      if (res.data.success) {
        setOffers((prev) =>
          prev.map((o) => (o._id === offerId ? res.data.offer : o))
        );
        setMessageText((prev) => ({ ...prev, [offerId]: '' }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update offer');
    } finally {
      setActionLoading((prev) => ({ ...prev, [offerId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="text-xs text-slate-500 mt-2">Loading price negotiation offers...</p>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <Handshake size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Offers Received Yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          When buyers (retailers, wholesalers, FPOs) submit custom price bids for your produce, they will appear here in real-time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => {
        const isPending = offer.status === 'pending' || (offer.status === 'countered' && offer.lastActionBy === 'buyer');
        const showCounterInput = isPending;

        return (
          <div
            key={offer._id}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4"
          >
            {/* Top Bar: Produce + Buyer Info */}
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
                    Buyer: <span className="font-semibold text-slate-700">{offer.buyer?.name}</span> ({offer.buyer?.buyerDetails?.businessName || offer.buyer?.location?.district})
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                  offer.status === 'accepted' || offer.status === 'converted_to_order'
                    ? 'bg-emerald-100 text-emerald-800'
                    : offer.status === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : offer.status === 'countered'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800 animate-pulse'
                }`}>
                  {offer.status === 'converted_to_order' ? 'Converted to Order' : offer.status}
                </span>
              </div>
            </div>

            {/* Price Comparison Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Listing Price</span>
                <span className="font-bold text-slate-700">₹{offer.originalListingPrice}/{offer.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Buyer's Offer</span>
                <span className="font-extrabold text-amber-700">₹{offer.offeredPricePerUnit}/{offer.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Quantity</span>
                <span className="font-bold text-slate-800">{offer.currentAgreedQuantity || offer.offeredQuantity} {offer.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Total Deal Value</span>
                <span className="font-extrabold text-emerald-700">₹{offer.totalOfferedAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Message Thread History */}
            {offer.messages && offer.messages.length > 0 && (
              <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100 text-xs">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <MessageSquare size={12} /> Negotiation Notes
                </div>
                {offer.messages.map((msg, idx) => (
                  <div key={idx} className="flex items-start gap-2 pt-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      msg.senderRole === 'farmer' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {msg.senderRole === 'farmer' ? 'You' : 'Buyer'}
                    </span>
                    <p className="text-slate-700 flex-1">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Farmer Action Area */}
            {isPending && (
              <div className="pt-2 space-y-3 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Add an optional message or counter note..."
                      value={messageText[offer._id] || ''}
                      onChange={(e) => setMessageText((prev) => ({ ...prev, [offer._id]: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-28">
                      <input
                        type="number"
                        placeholder="Counter ₹"
                        value={counterInputs[offer._id]?.price || ''}
                        onChange={(e) =>
                          setCounterInputs((prev) => ({
                            ...prev,
                            [offer._id]: {
                              ...prev[offer._id],
                              price: e.target.value,
                              quantity: offer.offeredQuantity
                            }
                          }))
                        }
                        className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 placeholder:font-normal"
                      />
                    </div>

                    <button
                      onClick={() => handleResponse(offer._id, 'counter')}
                      disabled={actionLoading[offer._id] || !counterInputs[offer._id]?.price}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                    >
                      Counter
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleResponse(offer._id, 'reject')}
                    disabled={actionLoading[offer._id]}
                    className="px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <X size={14} /> Decline
                  </button>

                  <button
                    onClick={() => handleResponse(offer._id, 'accept')}
                    disabled={actionLoading[offer._id]}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1"
                  >
                    <Check size={14} /> Accept Offer (₹{offer.currentAgreedPrice || offer.offeredPricePerUnit})
                  </button>
                </div>
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
};

export default FarmerOffersView;
