import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  ShoppingCart, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Percent, 
  Scale, 
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import API from '../services/api';
import ProduceCard from '../components/marketplace/ProduceCard';
import OfferModal from '../components/marketplace/OfferModal';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const HomePage = ({ onOpenCreateModal }) => {
  const { isFarmer, isBuyer, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calcQuantity, setCalcQuantity] = useState(50); // quintals
  const [calcPrice, setCalcPrice] = useState(2500); // ₹/quintal
  const [selectedListingForOffer, setSelectedListingForOffer] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await API.get('/listings?limit=4');
        if (res.data.success) {
          setFeaturedListings(res.data.listings);
        }
      } catch (e) {
        console.error('Error loading featured listings:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // Intermediary Margin Elimination Math
  const grossCropValue = calcQuantity * calcPrice;
  const traditionalFarmerNet = Math.round(grossCropValue * 0.38); // 38% realization in traditional mandis
  const kisanConnectFarmerNet = Math.round(grossCropValue * 0.90); // 90% direct realization on platform
  const farmerExtraEarnings = kisanConnectFarmerNet - traditionalFarmerNet;

  return (
    <div className="space-y-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-8 sm:p-14 shadow-2xl border border-emerald-800/30">
        
        {/* Background decorative blur */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-harvest-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <Sparkles size={14} /> KisanConnect • Direct Farmer-to-Buyer Marketplace
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Eliminating Middlemen. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-harvest-300 to-emerald-200">
              Direct Farmer Prosperity.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            India's agricultural value chain forces farmers through 3–5 layers of commission agents, leaving them with only 30–40% of the value. 
            <strong className="text-white"> KisanConnect </strong> directly links verified farmers with bulk buyers, retail chains, and FPOs with transparent pricing and in-app negotiation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/marketplace"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-500/25 flex items-center gap-2"
            >
              <ShoppingCart size={18} />
              <span>{t('navMarketplace')}</span>
            </Link>

            <button
              onClick={() => {
                if (isFarmer) {
                  onOpenCreateModal();
                } else {
                  navigate('/login');
                }
              }}
              className="px-6 py-3 bg-slate-800/90 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm border border-slate-700 transition flex items-center gap-2"
            >
              <Sprout size={18} className="text-emerald-400" />
              <span>{t('listProduce')}</span>
            </button>
          </div>

          {/* Value Stats Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Farmer Realization</span>
              <span className="text-lg font-bold text-emerald-400">+40% to 50%</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Buyer Sourcing Cost</span>
              <span className="text-lg font-bold text-blue-400">-15% Cheaper</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-slate-400 block">Intermediary Layers</span>
              <span className="text-lg font-bold text-harvest-400">Zero Middlemen</span>
            </div>
          </div>

        </div>
      </section>

      {/* Intermediary Margin Elimination ROI Calculator */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md mb-2">
              <TrendingUp size={14} /> Farmer Income Multiplier
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Calculate Your Direct Sourcing Gain
            </h2>
            <p className="text-xs text-slate-500">
              See the direct financial impact of eliminating arhatiyas and village aggregators.
            </p>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-700">Produce Volume (Quintals)</label>
              <span className="text-sm font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                {calcQuantity} Quintals ({calcQuantity * 100} kg)
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="5"
              value={calcQuantity}
              onChange={(e) => setCalcQuantity(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-700">Market Rate (₹ / Quintal)</label>
              <span className="text-sm font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                ₹{calcPrice.toLocaleString('en-IN')}/Quintal
              </span>
            </div>
            <input
              type="range"
              min="800"
              max="8000"
              step="50"
              value={calcPrice}
              onChange={(e) => setCalcPrice(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
        </div>

        {/* Comparison Result Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-red-50/70 p-5 rounded-2xl border border-red-200/80">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 block mb-1">
              Traditional Mandi Channel
            </span>
            <span className="text-2xl font-extrabold text-red-900">
              ₹{traditionalFarmerNet.toLocaleString('en-IN')}
            </span>
            <p className="text-xs text-red-600 mt-2">
              ~60% lost to village aggregators, local commission agents (arhatiyas), and transport brokers.
            </p>
          </div>

          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 ring-2 ring-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block mb-1">
              KisanConnect Direct
            </span>
            <span className="text-2xl font-extrabold text-emerald-800">
              ₹{kisanConnectFarmerNet.toLocaleString('en-IN')}
            </span>
            <p className="text-xs text-emerald-700 mt-2">
              Farmer sells directly at fair farm-gate pricing with 100% price transparency.
            </p>
          </div>

          <div className="bg-gradient-to-br from-harvest-500 to-amber-600 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-100 block mb-1">
                Net Extra Farmer Profit
              </span>
              <span className="text-3xl font-black">
                +₹{farmerExtraEarnings.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs text-amber-100 mt-3 font-medium">
              +{Math.round((farmerExtraEarnings / traditionalFarmerNet) * 100)}% additional direct revenue!
            </p>
          </div>
        </div>
      </section>

      {/* Featured Produce Marketplace Preview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Featured Farm Produce</h2>
            <p className="text-xs text-slate-500">Verified lots available for immediate purchase or price negotiation</p>
          </div>
          <Link
            to="/marketplace"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
          >
            <span>View All Produce</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredListings.map((listing) => (
              <ProduceCard
                key={listing._id}
                listing={listing}
                onOpenOfferModal={(item) => setSelectedListingForOffer(item)}
              />
            ))}
          </div>
        )}
      </section>

      {/* How KisanConnect Solves Direct Agri Trade */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            3-Step Direct Agri Procurement
          </h2>
          <p className="text-xs text-slate-400">
            A frictionless, transparent workflow built for India's agricultural ecosystem
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-800/70 p-6 rounded-2xl border border-slate-700 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-base text-white">Farmer Lists Produce</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Farmer specifies crop variety, quantity, quality grade, village/mandi location, and expected farm-gate price.
            </p>
          </div>

          <div className="bg-slate-800/70 p-6 rounded-2xl border border-slate-700 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-base text-white">Buyer Discovers & Bids</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Retailers and bulk buyers search by grade, state, or category. They can buy instantly or negotiate prices via the in-app offer desk.
            </p>
          </div>

          <div className="bg-slate-800/70 p-6 rounded-2xl border border-slate-700 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-base text-white">Direct Fulfillment</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Upon deal confirmation, the produce is dispatched with real-time status tracking and direct payment settlement on delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Offer Negotiation Modal */}
      <OfferModal
        listing={selectedListingForOffer}
        isOpen={!!selectedListingForOffer}
        onClose={() => setSelectedListingForOffer(null)}
      />

    </div>
  );
};

export default HomePage;
