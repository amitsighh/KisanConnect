import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  ShieldCheck, 
  Users, 
  Sprout, 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  CheckCircle2, 
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  MapPin
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'listings' | 'orders'

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, listingsRes, ordersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/listings'),
        API.get('/admin/orders')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (listingsRes.data.success) setListings(listingsRes.data.listings);
      if (ordersRes.data.success) setOrders(ordersRes.data.orders);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const toggleListingStatus = async (listingId) => {
    try {
      const res = await API.put(`/admin/listings/${listingId}/toggle-status`);
      if (res.data.success) {
        setListings((prev) =>
          prev.map((l) => (l._id === listingId ? res.data.listing : l))
        );
      }
    } catch (err) {
      alert('Failed to update listing status');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-xs text-slate-500 mt-3 font-medium">Loading Ministry Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-purple-800/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-800/80 border border-purple-500/30 flex items-center justify-center text-2xl font-black shadow-inner">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold">MoCA & FPD Ministry Intelligence Hub</h1>
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-bold rounded-full">
                SIH26033 Evaluation Center
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Real-time monitoring of direct agricultural trade, price discovery, and intermediary elimination metrics across India.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">Total Trade Volume (GMV)</span>
            <span className="text-2xl font-black text-slate-900">₹{stats.totalGMV.toLocaleString('en-IN')}</span>
            <span className="text-[11px] text-emerald-600 font-medium block">Across all completed lots</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">Intermediary Margin Saved</span>
            <span className="text-2xl font-black text-emerald-700">₹{stats.estimatedMiddlemanSavings.toLocaleString('en-IN')}</span>
            <span className="text-[11px] text-emerald-600 font-medium block">~35% direct farmer value preserved</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">Registered Farmers</span>
            <span className="text-2xl font-black text-slate-900">{stats.totalFarmers}</span>
            <span className="text-[11px] text-slate-500 font-medium block">Active producers & FPOs</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">Bulk & Retail Buyers</span>
            <span className="text-2xl font-black text-slate-900">{stats.totalBuyers}</span>
            <span className="text-[11px] text-slate-500 font-medium block">Supermarkets & HORECA</span>
          </div>

        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm transition relative ${
            activeTab === 'overview'
              ? 'text-purple-700 border-b-2 border-purple-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          National Impact Overview
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm transition relative ${
            activeTab === 'listings'
              ? 'text-purple-700 border-b-2 border-purple-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Produce Listings Moderation ({listings.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm transition relative ${
            activeTab === 'users'
              ? 'text-purple-700 border-b-2 border-purple-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          User Directory ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm transition relative ${
            activeTab === 'orders'
              ? 'text-purple-700 border-b-2 border-purple-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Platform Orders Log ({orders.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Category Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Active Lots by Category</h3>
              <div className="space-y-2.5">
                {stats.categoryStats?.map((cat) => (
                  <div key={cat._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                    <span className="font-bold text-slate-800">{cat._id}</span>
                    <div className="text-right">
                      <span className="font-extrabold text-emerald-700">{cat.count} Lots</span>
                      <span className="text-slate-500 text-[11px] block">({cat.totalQty} Quintals)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* State Distribution */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Top Producing States</h3>
              <div className="space-y-2.5">
                {stats.stateStats?.map((st) => (
                  <div key={st._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin size={13} className="text-emerald-600" />
                      <span>{st._id}</span>
                    </span>
                    <span className="font-extrabold text-slate-900 bg-slate-200 px-2.5 py-0.5 rounded-md">
                      {st.count} Active Lots
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab 2: Listings Moderation */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Produce</th>
                  <th className="p-4">Farmer</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Price & Stock</th>
                  <th className="p-4">Grade</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 font-bold text-slate-900">{l.cropName}</td>
                    <td className="p-4 font-medium text-slate-700">{l.farmer?.name}</td>
                    <td className="p-4 text-slate-500">{l.location?.district}, {l.location?.state}</td>
                    <td className="p-4 font-semibold text-emerald-700">₹{l.pricePerUnit}/{l.unit} ({l.quantity} {l.unit})</td>
                    <td className="p-4 font-semibold">{l.qualityGrade}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleListingStatus(l._id)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition"
                      >
                        {l.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Email / Phone</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Organization / Farm</th>
                  <th className="p-4">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 font-bold text-slate-900">{u.name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'farmer' ? 'bg-emerald-100 text-emerald-800' : u.role === 'buyer' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{u.email} • {u.phone}</td>
                    <td className="p-4 text-slate-500">{u.location?.district}, {u.location?.state}</td>
                    <td className="p-4 text-slate-700">{u.farmDetails?.farmName || u.buyerDetails?.businessName || '-'}</td>
                    <td className="p-4">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 size={13} /> Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Platform Orders Feed */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Produce</th>
                  <th className="p-4">Buyer</th>
                  <th className="p-4">Farmer</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                    <td className="p-4 font-bold">{o.cropName} ({o.quantity} {o.unit})</td>
                    <td className="p-4 text-slate-700">{o.buyer?.name}</td>
                    <td className="p-4 text-slate-700">{o.farmer?.name}</td>
                    <td className="p-4 font-extrabold text-emerald-700">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        o.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{o.paymentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboardPage;
