import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  Sparkles, 
  Handshake, 
  ShoppingCart, 
  Phone, 
  Building, 
  ArrowLeft,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import OfferModal from '../components/marketplace/OfferModal';
import { getMandiPrice } from '../services/mandiService';
import MandiPriceWidget from '../components/common/MandiPriceWidget';

export const ProduceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [mandiData, setMandiData] = useState(null);
  const [mandiLoading, setMandiLoading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/listings/${id}`);
        if (res.data.success) {
          const fetchedListing = res.data.listing;
          setListing(fetchedListing);
          setSelectedQty(fetchedListing.minOrderQuantity || 1);

          // Fetch live Mandi benchmark price
          if (fetchedListing.cropName) {
            setMandiLoading(true);
            getMandiPrice({
              commodity: fetchedListing.cropName,
              state: fetchedListing.location?.state,
              district: fetchedListing.location?.district,
              market: fetchedListing.location?.village || fetchedListing.location?.address
            }).then((mandiRes) => {
              setMandiData(mandiRes);
            }).catch(() => {
              setMandiData({ available: false });
            }).finally(() => {
              setMandiLoading(false);
            });
          }
        }
      } catch (err) {
        setError('Failed to load produce details.');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="text-xs text-slate-500 mt-3">Loading produce lot information...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto my-12 space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Produce Not Found</h3>
        <p className="text-xs text-slate-500">{error || 'This listing may have been sold out or removed.'}</p>
        <Link to="/marketplace" className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const isOwnListing = user && listing.farmer?._id === user._id;
  const defaultImg = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=70';
  const displayImg = listing.images && listing.images.length > 0 ? listing.images[0] : defaultImg;

  const handleAddToCart = () => {
    addToCart(listing, selectedQty);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(listing, selectedQty);
    navigate('/checkout');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Back button */}
      <div>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition shadow-2xs"
        >
          <ArrowLeft size={14} />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Image & Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={displayImg}
                alt={listing.cropName}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = defaultImg; }}
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-3 py-1 bg-slate-950/80 backdrop-blur text-white text-xs font-semibold rounded-lg">
                  {listing.category}
                </span>
                {listing.isOrganic && (
                  <span className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm">
                    <Sparkles size={12} /> Certified Organic
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Produce Specifications</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Variety</span>
                <span className="font-bold text-slate-800">{listing.variety || 'Standard'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Quality Grade</span>
                <span className="font-bold text-emerald-700">{listing.qualityGrade}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Harvest Date</span>
                <span className="font-bold text-slate-800">
                  {new Date(listing.harvestDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {listing.description && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-700 mb-1">Farmer's Harvest Notes:</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  {listing.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing, Farmer Profile & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Price & Purchase Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Direct Farm-Gate Lot
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-2 leading-tight">
                {listing.cropName}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <MapPin size={14} className="text-emerald-600" />
                <span>{listing.location?.village ? `${listing.location.village}, ` : ''}{listing.location?.district}, {listing.location?.state}</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Direct Price</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-emerald-700">₹{listing.pricePerUnit}</span>
                  <span className="text-sm font-semibold text-slate-600">/ {listing.unit}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block">In Stock</span>
                <span className="text-base font-bold text-slate-800">
                  {listing.quantity} {listing.unit}
                </span>
              </div>
            </div>

            {/* Middleman Savings Indicator */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-800">
              <TrendingDown size={16} className="text-blue-600 shrink-0" />
              <span>
                <strong>Zero Commission:</strong> Sourcing directly saves approx <strong>₹{Math.round(listing.pricePerUnit * 0.18)}/{listing.unit}</strong> vs traditional wholesale terminal mandis.
              </span>
            </div>

            {/* Live Mandi Benchmark & Price Comparison */}
            <MandiPriceWidget
              mandiData={mandiData}
              farmerPrice={listing.pricePerUnit}
              unit={listing.unit}
              loading={mandiLoading}
              compact={true}
            />

            {/* Quantity Selector */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Select Order Quantity ({listing.unit})</span>
                <span className="text-slate-500">Min Order: {listing.minOrderQuantity || 1} {listing.unit}</span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={listing.minOrderQuantity || 1}
                  max={listing.quantity}
                  value={selectedQty}
                  onChange={(e) => setSelectedQty(Math.max(1, Math.min(listing.quantity, Number(e.target.value))))}
                  className="w-24 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-base focus:ring-2 focus:ring-emerald-500"
                />

                <div className="text-xs text-slate-600 flex-1">
                  Subtotal: <strong className="text-sm text-slate-900 font-extrabold">₹{(selectedQty * listing.pricePerUnit).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            {addedToast && (
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Added {selectedQty} {listing.unit} to cart!</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isOwnListing}
                  className="py-3 px-4 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingCart size={15} />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOwnListing}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <span>Buy Directly</span>
                </button>
              </div>

              <button
                onClick={() => setIsOfferModalOpen(true)}
                disabled={isOwnListing}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Handshake size={16} />
                <span>Negotiate Price / Make Counter Offer</span>
              </button>
            </div>
          </div>

          {/* Farmer Credibility Profile */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Verified Farmer Profile</h3>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-base">
                {listing.farmer?.name ? listing.farmer.name[0] : 'F'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span>{listing.farmer?.name}</span>
                  {listing.farmer?.isVerified && (
                    <ShieldCheck size={16} className="text-emerald-600" />
                  )}
                </h4>
                <p className="text-xs text-slate-500">
                  {listing.farmer?.farmDetails?.farmName || 'Independent Farm Producer'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Landholding</span>
                <span className="font-bold text-slate-700">
                  {listing.farmer?.farmDetails?.farmSizeAcres || 10} Acres
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Trust Rating</span>
                <span className="font-bold text-emerald-700">
                  ★ {listing.farmer?.trustScore || 4.8} / 5.0
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
              <Phone size={13} className="text-emerald-600" />
              <span>Contact Verified: {listing.farmer?.phone}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Negotiation Modal */}
      <OfferModal
        listing={listing}
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
      />

    </div>
  );
};

export default ProduceDetailPage;
