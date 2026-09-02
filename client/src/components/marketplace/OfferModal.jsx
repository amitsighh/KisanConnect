import React, { useState } from 'react';
import { X, Handshake, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const OfferModal = ({ listing, isOpen, onClose, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [offeredPrice, setOfferedPrice] = useState(listing ? listing.pricePerUnit : 0);
  const [offeredQty, setOfferedQty] = useState(listing ? listing.minOrderQuantity || 1 : 1);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !listing) return null;

  const totalAmount = Number(offeredPrice) * Number(offeredQty);
  const originalTotal = listing.pricePerUnit * Number(offeredQty);
  const savings = originalTotal - totalAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user.role === 'farmer' && listing.farmer?._id === user._id) {
      setError('You cannot make an offer on your own listing');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await API.post('/offers', {
        listingId: listing._id,
        offeredPricePerUnit: Number(offeredPrice),
        offeredQuantity: Number(offeredQty),
        message
      });

      if (res.data.success) {
        setSuccessMsg('Your price offer was sent directly to the farmer!');
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
          if (onSuccess) onSuccess(res.data.offer);
        }, 1800);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit offer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Handshake size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Direct Price Negotiation</h2>
            <p className="text-xs text-slate-500">
              Submit your customized offer directly to <span className="font-semibold text-slate-700">{listing.farmer?.name || 'the farmer'}</span>
            </p>
          </div>
        </div>

        {/* Produce Summary Badge */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 mb-5 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800">{listing.cropName}</h4>
            <span className="text-xs text-slate-500">
              Listed at ₹{listing.pricePerUnit}/{listing.unit} • Available: {listing.quantity} {listing.unit}
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
            {listing.qualityGrade}
          </span>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4 flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Offer Price (₹/{listing.unit})
              </label>
              <input
                type="number"
                min="1"
                required
                value={offeredPrice}
                onChange={(e) => setOfferedPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity ({listing.unit})
              </label>
              <input
                type="number"
                min={listing.minOrderQuantity || 1}
                max={listing.quantity}
                required
                value={offeredQty}
                onChange={(e) => setOfferedQty(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Deal Value Calculation */}
          <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block">Total Proposed Value:</span>
              <span className="text-base font-extrabold text-slate-900">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
            {savings !== 0 && (
              <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                savings > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {savings > 0 ? `₹${savings.toLocaleString('en-IN')} below listing` : `₹${Math.abs(savings).toLocaleString('en-IN')} premium`}
              </span>
            )}
          </div>

          {/* Optional Note / Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Add a Note to Farmer (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="e.g., We require self-pickup tomorrow morning with quality verification at farm-gate..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Send Offer to Farmer'}
              <ArrowRight size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferModal;
