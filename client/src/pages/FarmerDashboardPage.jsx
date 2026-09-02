import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Package, 
  Handshake, 
  PlusCircle, 
  TrendingUp, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import FarmerOffersView from '../components/farmer/FarmerOffersView';
import FarmerOrdersView from '../components/farmer/FarmerOrdersView';
import CreateListingModal from '../components/farmer/CreateListingModal';

export const FarmerDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'offers' | 'orders'
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [stats, setStats] = useState({
    activeListingsCount: 0,
    totalQuantity: 0,
    estimatedValue: 0
  });

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/listings/farmer/my-listings');
      if (res.data.success) {
        setMyListings(res.data.listings);
        
        const activeListings = res.data.listings.filter((l) => l.status === 'active');
        const totalQty = activeListings.reduce((sum, l) => sum + l.quantity, 0);
        const estVal = activeListings.reduce((sum, l) => sum + l.quantity * l.pricePerUnit, 0);
        
        setStats({
          activeListingsCount: activeListings.length,
          totalQuantity: totalQty,
          estimatedValue: estVal
        });
      }
    } catch (err) {
      console.error('Error fetching farmer listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to remove this produce listing?')) return;
    try {
      const res = await API.delete(`/listings/${listingId}`);
      if (res.data.success) {
        setMyListings((prev) => prev.filter((l) => l._id !== listingId));
      }
    } catch (err) {
      alert('Failed to delete listing');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700/80 border border-emerald-500/30 flex items-center justify-center text-2xl font-black shadow-inner">
            👨‍🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold">{user?.name}</h1>
              {user?.isVerified && (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold rounded-full flex items-center gap-1">
                  <ShieldCheck size={12} /> Verified Farmer
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {user?.farmDetails?.farmName || 'Patel Organic Farms'} • {user?.location?.district}, {user?.location?.state} ({user?.farmDetails?.farmSizeAcres || 12} Acres)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md flex items-center gap-1.5 shrink-0"
        >
          <PlusCircle size={16} />
          <span>List New Produce</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Sprout size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Active Crop Lots</span>
            <span className="text-2xl font-extrabold text-slate-900">{stats.activeListingsCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Package size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Available Stock</span>
            <span className="text-2xl font-extrabold text-slate-900">{stats.totalQuantity} <span className="text-sm font-semibold text-slate-500">Quintals</span></span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Active Inventory Value</span>
            <span className="text-2xl font-extrabold text-emerald-700">₹{stats.estimatedValue.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex gap-2">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm transition relative ${
            activeTab === 'listings'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          My Listed Produce ({myListings.length})
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm transition relative flex items-center gap-1.5 ${
            activeTab === 'offers'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Handshake size={16} />
          <span>Price Negotiations Desk</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm transition relative flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package size={16} />
          <span>Received Orders</span>
        </button>
      </div>

      {/* Tab 1: My Produce Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            </div>
          ) : myListings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Sprout size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Produce Listed Yet</h3>
              <p className="text-xs text-slate-500">
                List your harvested crops to start receiving direct orders and purchase bids from bulk buyers across India.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
              >
                + List Your First Produce Lot
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myListings.map((listing) => (
                <div
                  key={listing._id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 w-full bg-slate-100">
                      <img
                        src={listing.images?.[0] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'}
                        alt={listing.cropName}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-1 bg-slate-900/80 text-white text-[10px] font-semibold rounded-md">
                        {listing.category}
                      </span>
                      <span className={`absolute top-2 right-2 px-2.5 py-1 text-[10px] font-bold rounded-md ${
                        listing.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-200'
                      }`}>
                        {listing.status === 'active' ? 'Active on Market' : 'Sold Out'}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-slate-900 text-base">{listing.cropName}</h3>
                      <p className="text-xs text-slate-500">{listing.variety} • {listing.qualityGrade}</p>

                      <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Price</span>
                          <span className="font-extrabold text-emerald-700 text-sm">₹{listing.pricePerUnit}/{listing.unit}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px]">Stock Left</span>
                          <span className="font-bold text-slate-800">{listing.quantity} {listing.unit}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex justify-between items-center border-t border-slate-100 pt-3">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Eye size={13} /> {listing.viewsCount || 0} views
                    </span>

                    <button
                      onClick={() => handleDeleteListing(listing._id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Remove Listing"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Offers / Negotiation Desk */}
      {activeTab === 'offers' && <FarmerOffersView />}

      {/* Tab 3: Orders Fulfillment */}
      {activeTab === 'orders' && <FarmerOrdersView />}

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onListingCreated={(newListing) => {
          setMyListings((prev) => [newListing, ...prev]);
          fetchMyListings();
        }}
      />

    </div>
  );
};

export default FarmerDashboardPage;
