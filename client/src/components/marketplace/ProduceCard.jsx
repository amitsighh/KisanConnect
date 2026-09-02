import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Sparkles, Scale, Handshake, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const ProduceCard = ({ listing, onOpenOfferModal }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const isOwnListing = user && listing.farmer?._id === user._id;

  const defaultImg = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=60';
  const displayImg = listing.images && listing.images.length > 0 ? listing.images[0] : defaultImg;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition group flex flex-col justify-between">
      <div>
        <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
          <img
            src={displayImg}
            alt={listing.cropName}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            onError={(e) => { e.target.src = defaultImg; }}
          />
          
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
            <span className="px-2.5 py-1 bg-slate-900/85 backdrop-blur text-white text-[11px] font-semibold rounded-lg shadow-sm">
              {listing.category}
            </span>
            {listing.isOrganic && (
              <span className="px-2 py-0.5 bg-emerald-600/90 backdrop-blur text-white text-[10px] font-bold rounded-md flex items-center gap-1 shadow-sm">
                <Sparkles size={11} /> Organic
              </span>
            )}
          </div>

          <div className="absolute top-2.5 right-2.5">
            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shadow-sm backdrop-blur ${
              listing.qualityGrade?.includes('Grade A')
                ? 'bg-emerald-500/90 text-white'
                : listing.qualityGrade?.includes('Grade B')
                ? 'bg-blue-500/90 text-white'
                : 'bg-amber-500/90 text-white'
            }`}>
              {listing.qualityGrade || 'Grade A'}
            </span>
          </div>

          <div className="absolute bottom-2 left-2 right-2 bg-slate-950/70 backdrop-blur-xs text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between">
            <span className="flex items-center gap-1 truncate text-slate-200">
              <MapPin size={13} className="text-emerald-400 shrink-0" />
              <span className="truncate">{listing.location?.district}, {listing.location?.state}</span>
            </span>
            <span className="text-[11px] font-medium text-emerald-300 shrink-0">
              {listing.variety}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <Link to={`/produce/${listing._id}`} className="block group-hover:text-emerald-700 transition">
            <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
              {listing.cropName}
            </h3>
          </Link>

          <div className="flex items-baseline justify-between bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
            <div>
              <span className="text-xs text-slate-500 block leading-tight">Direct Farm Price</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-emerald-700">₹{listing.pricePerUnit}</span>
                <span className="text-xs font-semibold text-slate-600">/{listing.unit}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block leading-tight">Available Stock</span>
              <span className="text-sm font-bold text-slate-800">
                {listing.quantity} {listing.unit}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-1.5 truncate">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                {listing.farmer?.name ? listing.farmer.name[0] : 'F'}
              </div>
              <span className="truncate font-medium text-slate-700">
                {listing.farmer?.name || 'Verified Farmer'}
              </span>
            </div>

            {listing.farmer?.isVerified && (
              <span className="flex items-center gap-0.5 text-emerald-600 text-[11px] font-medium">
                <ShieldCheck size={13} /> Verified
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        <button
          onClick={() => onOpenOfferModal(listing)}
          disabled={isOwnListing}
          className="px-3 py-2 border border-slate-300 hover:border-emerald-600 hover:text-emerald-700 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          title={isOwnListing ? "This is your own listing" : "Negotiate price or make counter offer"}
        >
          <Handshake size={14} />
          <span>Make Offer</span>
        </button>

        <button
          onClick={() => addToCart(listing, listing.minOrderQuantity || 1)}
          disabled={isOwnListing}
          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          title={isOwnListing ? "This is your own listing" : "Add produce to direct checkout cart"}
        >
          <ShoppingCart size={14} />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default ProduceCard;
