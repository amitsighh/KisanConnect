import React, { useState, useEffect } from 'react';
import { PlusCircle, Package, Users, MapPin, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import API from '../../services/api';
import CreateBulkOrderModal from './CreateBulkOrderModal';
import PoolDetailsModal from '../common/PoolDetailsModal';
import { useLanguage } from '../../context/LanguageContext';

export const BuyerPoolsView = () => {
  const { t } = useLanguage();
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPoolForDetails, setSelectedPoolForDetails] = useState(null);

  const fetchBuyerPools = async () => {
    try {
      setLoading(true);
      const res = await API.get('/pools/buyer/my-pools');
      if (res.data.success) {
        setPools(res.data.pools || []);
      }
    } catch (err) {
      console.error('Error fetching buyer pools:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyerPools();
  }, []);

  const handleUpdateStatus = async (poolId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change pool status to ${newStatus}?`)) return;
    try {
      const res = await API.put(`/pools/${poolId}/status`, { status: newStatus });
      if (res.data.success) {
        fetchBuyerPools();
      }
    } catch (err) {
      alert('Failed to update pool status');
    }
  };

  return (
    <div className="space-y-6">

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-extrabold text-slate-900 text-base">{t('tabBulkProcurement')}</h2>
          <p className="text-xs text-slate-500">{t('smartPoolsSubtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-1.5 shrink-0"
          >
            <PlusCircle size={16} />
            <span>+ {t('createBulkOrder')}</span>
          </button>

          <button
            onClick={fetchBuyerPools}
            className="p-2 text-slate-500 hover:text-blue-700 bg-slate-100 rounded-xl transition"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Pools Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Loading your bulk pools...</p>
        </div>
      ) : pools.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl font-bold">
            📦
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Bulk Orders Created Yet</h3>
          <p className="text-xs text-slate-500">
            Create a bulk order pool to let AI automatically match and aggregate small farmers to fulfill your target quantity.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
          >
            + Create Your First Bulk Order
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pools.map((pool) => {
            const reqQty = pool.requiredQuantity;
            const currQty = pool.currentQuantity;
            const percentFilled = Math.min(100, Math.round((currQty / reqQty) * 100));

            return (
              <div
                key={pool.id || pool._id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">

                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md block w-max mb-1">
                        {pool.poolCode}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        {pool.crop} Bulk Order
                      </h3>
                    </div>

                    <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                      pool.status === 'FULL' || pool.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : pool.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {pool.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1 text-xs text-slate-600 border-t border-b border-slate-100 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-400" />
                      <span>{pool.deliveryLocation}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span>Target Price:</span>
                      <strong className="text-emerald-700 font-bold">₹{pool.targetPricePerUnit}/{pool.unit}</strong>
                    </div>
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-semibold">Farmers Joined</span>
                      <span className="font-extrabold text-blue-700">{currQty} / {reqQty} {pool.unit} ({percentFilled}%)</span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentFilled}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>Farmers Count: <strong className="text-slate-900">{pool.joinedFarmersCount} Farmers</strong></span>
                    </div>
                  </div>

                </div>

                {/* Card Actions */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedPoolForDetails(pool)}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
                  >
                    View Breakdown & Farmers
                  </button>

                  {pool.status === 'OPEN' || pool.status === 'FILLING' || pool.status === 'FULL' ? (
                    <button
                      onClick={() => handleUpdateStatus(pool.id || pool._id, 'CANCELLED')}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition"
                    >
                      Cancel Pool
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateBulkOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPoolCreated={() => {
          fetchBuyerPools();
        }}
      />

      <PoolDetailsModal
        isOpen={Boolean(selectedPoolForDetails)}
        onClose={() => setSelectedPoolForDetails(null)}
        pool={selectedPoolForDetails}
        onPoolUpdated={fetchBuyerPools}
      />

    </div>
  );
};

export default BuyerPoolsView;
