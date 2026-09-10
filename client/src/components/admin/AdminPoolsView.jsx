import React, { useState, useEffect } from 'react';
import { Layers, Sparkles, Users, TrendingUp, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import API from '../../services/api';
import PoolDetailsModal from '../common/PoolDetailsModal';
import { useLanguage } from '../../context/LanguageContext';

export const AdminPoolsView = () => {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState(null);
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedPoolForDetails, setSelectedPoolForDetails] = useState(null);

  const fetchAdminAnalytics = async () => {
    try {
      setLoading(true);
      const res = await API.get('/pools/admin/analytics');
      if (res.data.success) {
        setAnalytics(res.data.analytics);
        setPools(res.data.pools || []);
      }
    } catch (err) {
      console.error('Error fetching admin pool analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  const filteredPools = pools.filter((p) => {
    if (statusFilter === 'All') return true;
    return p.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-xs text-slate-500 mt-2 font-medium">Loading Smart Pool Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* KPI Cards Grid */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">Total Pooled Trade Value</span>
            <span className="text-2xl font-black text-purple-700">{analytics.formattedGMV}</span>
            <span className="text-[11px] text-slate-500 font-medium block">Across {analytics.totalPools} Smart Pools</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">Active Filling Pools</span>
            <span className="text-2xl font-black text-emerald-700">{analytics.activePools}</span>
            <span className="text-[11px] text-emerald-600 font-medium block">Currently receiving contributions</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">Total Pooled Quantity</span>
            <span className="text-2xl font-black text-slate-900">{analytics.totalPooledQuantity?.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500 font-medium block">Units aggregated</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">Participating Small Farmers</span>
            <span className="text-2xl font-black text-slate-900">{analytics.participatingFarmersCount}</span>
            <span className="text-[11px] text-slate-500 font-medium block">Farmers benefiting from pooling</span>
          </div>
        </div>
      )}

      {/* Filter & Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Layers size={16} className="text-purple-600" />
            <span>Smart Pools Moderation & Monitoring ({filteredPools.length})</span>
          </h3>

          {/* Status Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {['All', 'OPEN', 'FILLING', 'FULL', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg transition ${
                  statusFilter === st ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Pool Code</th>
                <th className="p-3.5">Crop</th>
                <th className="p-3.5">Buyer</th>
                <th className="p-3.5">Pooled Quantity</th>
                <th className="p-3.5">Farmers</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPools.map((p) => (
                <tr key={p.id || p._id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3.5 font-mono font-bold text-slate-900">{p.poolCode}</td>
                  <td className="p-3.5 font-extrabold text-slate-800">{p.crop}</td>
                  <td className="p-3.5 text-slate-700">{p.buyer?.businessName || p.buyer?.name}</td>
                  <td className="p-3.5 font-bold text-emerald-700">
                    {p.currentQuantity} / {p.requiredQuantity} {p.unit}
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">{p.joinedFarmersCount} Joined</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === 'FULL' || p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : p.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedPoolForDetails(p)}
                      className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg font-semibold transition flex items-center gap-1 ml-auto"
                    >
                      <Eye size={13} /> View Pool Breakdown
                    </button>
                  </td>
                </tr>
              ))}

              {filteredPools.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    No smart pools match the selected status filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Pool Details Modal */}
      <PoolDetailsModal
        isOpen={Boolean(selectedPoolForDetails)}
        onClose={() => setSelectedPoolForDetails(null)}
        pool={selectedPoolForDetails}
        onPoolUpdated={fetchAdminAnalytics}
      />

    </div>
  );
};

export default AdminPoolsView;
