import React, { useState } from 'react';
import { 
  X, 
  Users, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Truck, 
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Info
} from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const PoolDetailsModal = ({ isOpen, onClose, pool, onPoolUpdated }) => {
  const { user, isFarmer } = useAuth();
  const { t } = useLanguage();
  const [leaving, setLeaving] = useState(false);

  if (!isOpen || !pool) return null;

  const reqQty = pool.requiredQuantity || 500;
  const currQty = pool.currentQuantity || 0;
  const remainingQty = Math.max(0, reqQty - currQty);
  const percentFilled = Math.min(100, Math.round((currQty / reqQty) * 100));

  const members = pool.members || [];
  const myMemberRecord = isFarmer ? members.find((m) => m.farmerId === user?.id || m.farmerId === user?._id) : null;

  const handleLeavePool = async () => {
    if (!window.confirm('Are you sure you want to withdraw your produce contribution from this Smart Pool?')) return;
    try {
      setLeaving(true);
      const res = await API.post(`/pools/${pool.id || pool._id}/leave`);
      if (res.data.success) {
        alert('Withdrew your contribution from the pool.');
        if (onPoolUpdated) onPoolUpdated();
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave pool');
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 border border-slate-200 shadow-2xl animate-in fade-in zoom-in duration-150 my-8">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                  {pool.poolCode || 'POOL-TOM-500'}
                </span>
                <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                  pool.status === 'FULL' || pool.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : pool.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  Status: {pool.status}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                {pool.crop} Bulk Smart Pool ({pool.qualityGrade || 'Grade A'})
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Stepper */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Fulfillment Lifecycle</span>
          <div className="grid grid-cols-5 gap-1 text-[11px] font-bold text-center">
            {['OPEN', 'FILLING', 'FULL', 'IN_TRANSIT', 'COMPLETED'].map((st, idx) => {
              const statusOrder = ['OPEN', 'FILLING', 'FULL', 'IN_TRANSIT', 'COMPLETED'];
              const currentIdx = statusOrder.indexOf(pool.status);
              const isDone = currentIdx >= idx;
              return (
                <div
                  key={st}
                  className={`py-1.5 px-1 rounded-lg border transition ${
                    isDone ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  {st}
                </div>
              );
            })}
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="bg-emerald-50/70 p-4 sm:p-5 rounded-2xl border border-emerald-200/70 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-extrabold text-slate-800">
              Pooled Quantity Progress: <span className="text-emerald-700 font-black">{currQty} / {reqQty} {pool.unit}</span>
            </span>
            <span className="font-extrabold text-emerald-800">{percentFilled}% Filled</span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentFilled}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-600 font-semibold">
            <span>Remaining required: <strong className="text-slate-900">{remainingQty} {pool.unit}</strong></span>
            <span>Target Price: <strong className="text-emerald-700">₹{pool.targetPricePerUnit}/{pool.unit}</strong></span>
          </div>
        </div>

        {/* Pool Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-semibold block">Buyer</span>
            <span className="font-bold text-slate-900 block truncate">{pool.buyer?.businessName || pool.buyer?.name || 'FreshMart'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-semibold block">Delivery Location</span>
            <span className="font-bold text-slate-900 block truncate">{pool.deliveryLocation || 'Lucknow APMC'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-semibold block">Harvest / Delivery Date</span>
            <span className="font-bold text-slate-900 block">{pool.harvestDate || '2026-03-30'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-semibold block">Participating Farmers</span>
            <span className="font-extrabold text-emerald-700 block">{members.length} Farmers Joined</span>
          </div>
        </div>

        {/* Transparent Payment & Logistics Split Table */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <IndianRupee size={16} className="text-emerald-600" />
              <span>{t('transparentBreakdown', 'Transparent Payment & Logistics Cost Breakdown')}</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">Proportional payout formula</span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">{t('farmer', 'Farmer')}</th>
                    <th className="p-3 text-right">{t('yourContribution', 'Contribution')}</th>
                    <th className="p-3 text-right">{t('farmerShare', 'Share (%)')}</th>
                    <th className="p-3 text-right">{t('grossPayment', 'Gross Payment')}</th>
                    <th className="p-3 text-right">{t('logisticsCost', 'Logistics Cost')}</th>
                    <th className="p-3 text-right">{t('netPayout', 'Net Payout')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {members.map((m, idx) => {
                    const isMe = isFarmer && (m.farmerId === user?.id || m.farmerId === user?._id);
                    const contrib = Number(m.contributedQuantity);
                    const shareFraction = currQty > 0 ? (contrib / currQty) * 100 : 0;

                    return (
                      <tr key={idx} className={isMe ? 'bg-emerald-50/80 font-bold' : 'hover:bg-slate-50'}>
                        <td className="p-3">
                          <span className="text-slate-900">{m.farmerName}</span>
                          {isMe && <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] rounded-md">YOU</span>}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-800">{contrib} {pool.unit}</td>
                        <td className="p-3 text-right text-slate-500 font-mono">{shareFraction.toFixed(1)}%</td>
                        <td className="p-3 text-right font-bold text-emerald-700">₹{(m.grossPayment || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right text-amber-700">₹{(m.logisticsCost || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-extrabold text-emerald-800 text-sm">₹{(m.netPayout || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}

                  {members.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-400">
                        No farmers have joined this Smart Pool yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
            <Info size={16} className="shrink-0 text-amber-600 mt-0.5" />
            <p>
              <strong>Rule:</strong> {t('paymentRuleInfo', 'Farmer Payout = (Farmer Qty / Total Pool Qty) × Total Payment. Logistics costs are shared proportionally based on contributed volume.')}
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-between items-center pt-2">
          {myMemberRecord ? (
            <button
              onClick={handleLeavePool}
              disabled={leaving}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
            >
              <LogOut size={14} />
              <span>{leaving ? 'Withdrawing...' : 'Withdraw My Contribution'}</span>
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition shadow-xs"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
};

export default PoolDetailsModal;
