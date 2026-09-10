import React, { useState } from 'react';
import { X, Sprout, MapPin, Calendar, ShieldCheck, IndianRupee, Layers } from 'lucide-react';
import API from '../../services/api';

export const CreateBulkOrderModal = ({ isOpen, onClose, onPoolCreated }) => {
  const [formData, setFormData] = useState({
    crop: 'Tomato',
    requiredQuantity: 500,
    unit: 'kg',
    deliveryLocation: 'Lucknow Wholesale Hub',
    deliveryLat: 26.8467,
    deliveryLng: 80.9462,
    radiusKm: 100,
    harvestDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    qualityGrade: 'Grade A (Premium)',
    expectedPricePerUnit: 45,
    logisticsCostTotal: 2500,
    expiresInDays: 7
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.crop || !formData.requiredQuantity || !formData.expectedPricePerUnit) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await API.post('/pools/create', formData);
      if (res.data.success) {
        alert(`Smart Pool created successfully! AI matched ${res.data.matchedFarmersCount || 0} compatible farmers.`);
        if (onPoolCreated) onPoolCreated(res.data.pool);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create bulk order pool.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 border border-slate-200 shadow-2xl animate-in fade-in zoom-in duration-150 my-8">
        
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-xl font-bold">
              📦
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Create Bulk Order (Smart Pool)</h2>
              <p className="text-xs text-slate-500">Group small farmers to fulfill bulk demand</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Crop & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Crop *</label>
              <select
                value={formData.crop}
                onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Tomato">🍅 Tomato</option>
                <option value="Wheat">🌾 Wheat</option>
                <option value="Rice">🍚 Rice</option>
                <option value="Potato">🥔 Potato</option>
                <option value="Onion">🧅 Onion</option>
                <option value="Green Moong">🫘 Green Moong</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Required Quantity *</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={formData.requiredQuantity}
                  onChange={(e) => setFormData({ ...formData, requiredQuantity: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-none"
                  placeholder="e.g. 500"
                  required
                />
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-none"
                >
                  <option value="kg">kg</option>
                  <option value="quintal">quintal</option>
                  <option value="ton">ton</option>
                </select>
              </div>
            </div>
          </div>

          {/* Delivery Location & Radius */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Delivery Location Hub *</label>
              <input
                type="text"
                value={formData.deliveryLocation}
                onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-none"
                placeholder="e.g. Lucknow APMC Yard"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Maximum Matching Radius (km)</label>
              <input
                type="number"
                value={formData.radiusKm}
                onChange={(e) => setFormData({ ...formData, radiusKm: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-none"
                placeholder="e.g. 100"
              />
            </div>
          </div>

          {/* Price & Quality Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Price (₹ per {formData.unit}) *</label>
              <input
                type="number"
                value={formData.expectedPricePerUnit}
                onChange={(e) => setFormData({ ...formData, expectedPricePerUnit: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-extrabold text-blue-700 text-sm outline-none"
                placeholder="e.g. 45"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Required Quality Grade</label>
              <select
                value={formData.qualityGrade}
                onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-none"
              >
                <option value="Grade A (Premium)">Grade A (Premium)</option>
                <option value="Grade B (Standard)">Grade B (Standard)</option>
                <option value="Grade C (Processing)">Grade C (Processing)</option>
              </select>
            </div>
          </div>

          {/* Harvest Date & Logistics Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Harvest / Delivery Date</label>
              <input
                type="date"
                value={formData.harvestDate}
                onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Estimated Total Logistics Budget (₹)</label>
              <input
                type="number"
                value={formData.logisticsCostTotal}
                onChange={(e) => setFormData({ ...formData, logisticsCostTotal: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-none"
                placeholder="e.g. 2500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              <span>{loading ? 'Creating & Matching...' : '🚀 Create Smart Pool'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateBulkOrderModal;
