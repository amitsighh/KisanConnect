import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  PlusCircle, 
  X, 
  ArrowRight,
  Info,
  ShieldCheck
} from 'lucide-react';
import API from '../../services/api';
import PoolDetailsModal from '../common/PoolDetailsModal';
import { useLanguage } from '../../context/LanguageContext';

export const SmartPoolsView = () => {
  const { t } = useLanguage();
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);

  // Join pool modal state
  const [selectedPoolForJoin, setSelectedPoolForJoin] = useState(null);
  const [contributionQty, setContributionQty] = useState(50);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  // View Pool Details modal state
  const [selectedPoolForDetails, setSelectedPoolForDetails] = useState(null);

  const fetchMatchedPools = async () => {
    try {
      setLoading(true);
      const res = await API.get('/pools/farmer/matched');
      if (res.data.success) {
        setPools(res.data.pools || []);
      }
    } catch (err) {
      console.error('Error fetching matched pools:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchedPools();
  }, []);

  const handleOpenJoinModal = (pool) => {
    setSelectedPoolForJoin(pool);
    // Suggest contribution: smaller of 50 or remaining quantity
    const defaultContrib = Math.min(50, Math.max(10, pool.remainingQuantity));
    setContributionQty(defaultContrib);
    setJoinError('');
  };

  const handleConfirmJoinPool = async (e) => {
    e.preventDefault();
    setJoinError('');

    if (!selectedPoolForJoin) return;
    const qty = Number(contributionQty);

    if (isNaN(qty) || qty <= 0) {
      setJoinError('Please enter a valid contribution quantity greater than 0.');
      return;
    }

    if (qty > selectedPoolForJoin.remainingQuantity) {
      setJoinError(`Cannot exceed remaining capacity of ${selectedPoolForJoin.remainingQuantity} ${selectedPoolForJoin.unit}.`);
      return;
    }

    try {
      setIsJoining(true);
      const res = await API.post(`/pools/${selectedPoolForJoin.id || selectedPoolForJoin._id}/join`, {
        contributionQuantity: qty
      });

      if (res.data.success) {
        alert(`Successfully joined ${selectedPoolForJoin.crop} Smart Pool with ${qty} ${selectedPoolForJoin.unit}!`);
        setSelectedPoolForJoin(null);
        fetchMatchedPools();
      }
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Failed to join pool.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-teal-700/40 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold rounded-full flex items-center gap-1">
              <Sparkles size={12} /> AI Farmer Grouping Engine
            </span>
          </div>
          <h2 className="text-xl font-extrabold">{t('smartPoolsTitle', 'Smart Pooling Hub')}</h2>
          <p className="text-xs text-slate-300">
            {t('smartPoolsSubtitle', 'Group small produce lots to fulfill high-value bulk buyer orders collectively')}
          </p>
        </div>
      </div>

      {/* Pools List Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Scanning AI matched Smart Pools...</p>
        </div>
      ) : pools.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl">
            🌾
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Matching Pools Found</h3>
          <p className="text-xs text-slate-500">
            When bulk buyers place large orders matching your crop category and region, AI Smart Pools will appear here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pools.map((pool) => {
            const reqQty = pool.requiredQuantity;
            const currQty = pool.currentQuantity;
            const remainingQty = pool.remainingQuantity;
            const percentFilled = Math.min(100, Math.round((currQty / reqQty) * 100));

            return (
              <div
                key={pool.id || pool._id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">

                  {/* Top Badges */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md block w-max mb-1">
                        {pool.poolCode}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                        <span>🌾 {pool.crop} Bulk Pool</span>
                      </h3>
                    </div>

                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full border border-emerald-300 flex items-center gap-1 shrink-0">
                      <Sparkles size={11} /> {pool.aiMatchScore || 88}% AI Match
                    </span>
                  </div>

                  {/* Buyer & Location details */}
                  <div className="space-y-1 text-xs text-slate-600 border-t border-b border-slate-100 py-2.5">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Users size={14} className="text-emerald-600" />
                      <span>{pool.buyer?.businessName || 'FreshMart Supermarkets'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin size={14} className="text-slate-400" />
                      <span>{pool.deliveryLocation} ({pool.distanceKm || 18} km away)</span>
                    </div>
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-semibold">Progress</span>
                      <span className="font-extrabold text-emerald-700">{currQty} / {reqQty} {pool.unit} ({percentFilled}%)</span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentFilled}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">Remaining: <strong className="text-slate-900">{remainingQty} {pool.unit}</strong></span>
                      <span className="text-slate-500">Price: <strong className="text-emerald-700">₹{pool.targetPricePerUnit}/{pool.unit}</strong></span>
                    </div>
                  </div>

                  {/* Joined Badge if user already joined */}
                  {pool.isJoined && (
                    <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={14} /> Joined this pool
                      </span>
                      <span>Your Qty: {pool.myContributionQuantity} {pool.unit}</span>
                    </div>
                  )}

                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2">
                  {!pool.isJoined && remainingQty > 0 ? (
                    <button
                      onClick={() => handleOpenJoinModal(pool)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1"
                    >
                      <PlusCircle size={14} /> JOIN POOL
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedPoolForDetails(pool)}
                      className="flex-1 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition hover:bg-slate-300"
                    >
                      {pool.isJoined ? 'Manage My Contribution' : 'Pool Full'}
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedPoolForDetails(pool)}
                    className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition"
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Join Pool Confirmation Modal */}
      {selectedPoolForJoin && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl animate-in fade-in zoom-in duration-150">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-600 uppercase">Confirm Smart Pool Join</span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Contribute to {selectedPoolForJoin.crop} Pool
                </h3>
              </div>
              <button
                onClick={() => setSelectedPoolForJoin(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {joinError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
                {joinError}
              </div>
            )}

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Buyer:</span>
                <span className="font-bold text-slate-900">{selectedPoolForJoin.buyer?.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Price:</span>
                <span className="font-extrabold text-emerald-700">₹{selectedPoolForJoin.targetPricePerUnit} / {selectedPoolForJoin.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Remaining Pool Capacity:</span>
                <span className="font-extrabold text-slate-900">{selectedPoolForJoin.remainingQuantity} {selectedPoolForJoin.unit}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmJoinPool} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Your Produce Contribution ({selectedPoolForJoin.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedPoolForJoin.remainingQuantity}
                  value={contributionQty}
                  onChange={(e) => setContributionQty(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-extrabold text-slate-900 text-sm outline-none"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Must be ≤ {selectedPoolForJoin.remainingQuantity} {selectedPoolForJoin.unit}
                </span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 space-y-0.5">
                <span className="font-bold block">Estimated Gross Payout:</span>
                <span className="text-base font-black text-emerald-800">
                  ₹{((Number(contributionQty) || 0) * Number(selectedPoolForJoin.targetPricePerUnit)).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPoolForJoin(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isJoining}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  {isJoining ? 'Joining...' : 'Confirm Contribution'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Pool Details Modal */}
      <PoolDetailsModal
        isOpen={Boolean(selectedPoolForDetails)}
        onClose={() => setSelectedPoolForDetails(null)}
        pool={selectedPoolForDetails}
        onPoolUpdated={fetchMatchedPools}
      />

    </div>
  );
};

export default SmartPoolsView;
