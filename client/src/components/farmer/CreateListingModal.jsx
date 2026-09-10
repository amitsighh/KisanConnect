import React, { useState, useEffect } from 'react';
import { X, Sprout, Upload, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import API from '../../services/api';
import { generateListing } from '../../services/aiService'; 
import { getMandiPrice } from '../../services/mandiService';
import MandiPriceWidget from '../common/MandiPriceWidget';
import { useAuth } from '../../context/AuthContext';

const PHOTO_PRESETS = [
  { name: 'Wheat / Grains', url: '/images/sharbati_wheat.jpg' },
  { name: 'Basmati Rice', url: '/images/basmati_rice.jpg' },
  { name: 'Red Onions', url: '/images/red_onions.jpg' },
  { name: 'Tomatoes', url: '/images/farm_tomatoes.jpg' },
  { name: 'Green Moong', url: '/images/green_moong.jpg' },
  { name: 'Alphonso Mangoes', url: '/images/alphonso_mangoes.jpg' },
  { name: 'Erode Turmeric', url: '/images/erode_turmeric.jpg' },
  { name: 'Yellow Mustard', url: '/images/yellow_mustard_seeds.jpg' },
  { name: 'Farm Jaggery', url: '/images/kolhapur_jaggery.jpg' },
  { name: 'Soybean', url: '/images/yellow_soybean.jpg' }
];

export const CreateListingModal = ({ isOpen, onClose, onListingCreated }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    cropName: '',
    category: 'Cereals & Grains',
    variety: 'Standard Desi',
    quantity: '',
    minOrderQuantity: '1',
    unit: 'quintal',
    pricePerUnit: '',
    qualityGrade: 'Grade A (Premium)',
    village: user?.location?.village || '',
    district: user?.location?.district || 'Sehore',
    state: user?.location?.state || 'Madhya Pradesh',
    pincode: user?.location?.pincode || '466001',
    harvestDate: new Date().toISOString().split('T')[0],
    imageUrl: PHOTO_PRESETS[0].url,
    description: '',
    isOrganic: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [mandiData, setMandiData] = useState(null);
  const [mandiLoading, setMandiLoading] = useState(false);

  // Live Mandi Reference Price lookup effect (debounced)
  useEffect(() => {
    if (!isOpen) return;
    if (!formData.cropName || formData.cropName.trim().length < 2) {
      setMandiData(null);
      return;
    }

    const timer = setTimeout(async () => {
      setMandiLoading(true);
      try {
        const result = await getMandiPrice({
          commodity: formData.cropName,
          state: formData.state,
          district: formData.district,
          market: formData.village
        });
        setMandiData(result);
      } catch (err) {
        setMandiData({ available: false, message: 'Market price lookup temporarily unavailable.' });
      } finally {
        setMandiLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.cropName, formData.state, formData.district, formData.village, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGenerateAI = async () => {
  if (!formData.cropName.trim()) {
    setError('Please enter the crop / produce name first.');
    return;
  }

  setAiLoading(true);
  setError('');

  try {
    const input = `
Crop: ${formData.cropName}
Category: ${formData.category}
Variety: ${formData.variety}
Quantity: ${formData.quantity} ${formData.unit}
Quality: ${formData.qualityGrade}
Location: ${formData.village}, ${formData.district}, ${formData.state}
Harvest Date: ${formData.harvestDate}
Organic: ${formData.isOrganic ? 'Yes' : 'No'}

Generate a professional marketplace listing description for this farmer's produce.
Keep it clear, trustworthy and suitable for Indian buyers.
`;

    const description = await generateListing(input);

    setFormData((prev) => ({
      ...prev,
      description
    }));
  } catch (err) {
    setError(err.message || 'AI could not generate the description.');
  } finally {
    setAiLoading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        cropName: formData.cropName,
        category: formData.category,
        variety: formData.variety,
        quantity: Number(formData.quantity),
        minOrderQuantity: Number(formData.minOrderQuantity) || 1,
        unit: formData.unit,
        pricePerUnit: Number(formData.pricePerUnit),
        qualityGrade: formData.qualityGrade,
        location: {
          village: formData.village,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode
        },
        harvestDate: formData.harvestDate,
        images: [formData.imageUrl],
        description: formData.description,
        isOrganic: formData.isOrganic
      };

      const res = await API.post('/listings', payload);

      if (res.data.success) {
        setSuccess('Produce listed successfully on KisanConnect marketplace!');
        setTimeout(() => {
          setSuccess('');
          onClose();
          if (onListingCreated) onListingCreated(res.data.listing);
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Sprout size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">List Your Farm Produce</h2>
            <p className="text-xs text-slate-500">
              Direct marketplace listing with instant price discovery for bulk buyers
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4 flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Row 1: Crop Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Crop / Produce Name *
              </label>
              <input
                type="text"
                name="cropName"
                required
                placeholder="e.g., Sharbati Wheat, Basmati Rice, Red Onion"
                value={formData.cropName}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              >
                <option value="Cereals & Grains">Cereals & Grains (Wheat, Rice, Maize)</option>
                <option value="Pulses">Pulses (Chana, Toor, Moong, Urad)</option>
                <option value="Vegetables">Vegetables (Onion, Potato, Tomato)</option>
                <option value="Fruits">Fruits (Mango, Banana, Apple)</option>
                <option value="Spices">Spices (Chilli, Turmeric, Cumin)</option>
                <option value="Oilseeds">Oilseeds (Soybean, Mustard, Groundnut)</option>
                <option value="Other">Other Agricultural Produce</option>
              </select>
            </div>
          </div>

          {/* Row 2: Variety & Quality Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Crop Variety / Specification
              </label>
              <input
                type="text"
                name="variety"
                placeholder="e.g., C-306 Golden, 1121 Pusa, Garwa Red"
                value={formData.variety}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quality Grade *
              </label>
              <select
                name="qualityGrade"
                value={formData.qualityGrade}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              >
                <option value="Grade A (Premium)">Grade A (Premium - Uniform, High Test Weight)</option>
                <option value="Grade B (Standard)">Grade B (Standard Fair Quality)</option>
                <option value="Grade C (Fair)">Grade C (Fair / Processing Quality)</option>
              </select>
            </div>
          </div>

          {/* Row 3: Quantity, Unit, Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                required
                placeholder="e.g. 50"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Measurement Unit *
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="quintal">Quintal (100 kg)</option>
                <option value="ton">Metric Ton (1,000 kg)</option>
                <option value="kg">Kilogram (kg)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Direct Price (₹ / {formData.unit}) *
              </label>
              <input
                type="number"
                name="pricePerUnit"
                min="1"
                required
                placeholder="e.g. 2400"
                value={formData.pricePerUnit}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          {/* Mandi Reference Price & Comparison Widget */}
          {formData.cropName && formData.cropName.trim().length >= 2 && (
            <MandiPriceWidget
              mandiData={mandiData}
              farmerPrice={formData.pricePerUnit}
              unit={formData.unit}
              loading={mandiLoading}
            />
          )}

          {/* Row 4: Farm Location */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Village/Town</label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">District *</label>
              <input
                type="text"
                name="district"
                required
                value={formData.district}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">State *</label>
              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Pincode *</label>
              <input
                type="text"
                name="pincode"
                required
                value={formData.pincode}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Photo Preset Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Produce Photo Preset or Enter Image URL
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
              {PHOTO_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => setFormData((prev) => ({ ...prev, imageUrl: preset.url }))}
                  className={`p-1.5 rounded-xl border text-center transition ${
                    formData.imageUrl === preset.url
                      ? 'border-emerald-600 ring-2 ring-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={preset.url} alt={preset.name} className="w-full h-12 object-cover rounded-lg mb-1" />
                  <span className="text-[10px] font-medium text-slate-700 block truncate">{preset.name}</span>
                </button>
              ))}
            </div>
            <input
              type="url"
              name="imageUrl"
              placeholder="Or paste an image URL..."
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          {/* Description & Organic Checkbox */}
         <div>
  <div className="flex items-center justify-between mb-1">
    <label className="block text-xs font-medium text-slate-600">
      Produce Description & Harvest Notes
    </label>

    <button
      type="button"
      onClick={handleGenerateAI}
      disabled={aiLoading}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold hover:bg-emerald-100 transition disabled:opacity-50"
    >
      <Sparkles size={13} />
      {aiLoading ? 'Generating...' : 'Generate with AI'}
    </button>
  </div>

  <textarea
    name="description"
    rows="3"
    placeholder="Provide crop details, moisture level, harvesting practices, packaging..."
    value={formData.description}
    onChange={handleChange}
    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
  />
</div>

<div className="flex items-center justify-between pt-2">
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <input
      type="checkbox"
      name="isOrganic"
      checked={formData.isOrganic}
      onChange={handleChange}
      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
    />

    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
      <Sparkles size={14} className="text-emerald-600" />
      100% Certified Organic Farm
    </span>
  </label>

  <div className="flex gap-3">
    <button
      type="button"
      onClick={onClose}
      className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-100 transition"
    >
      Cancel
    </button>

    <button
      type="submit"
      disabled={loading}
      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm disabled:opacity-50"
    >
      {loading ? 'Publishing...' : 'Publish Produce Listing'}
    </button>
  </div>
</div>

        </form>
      </div>
    </div>
  );
};

export default CreateListingModal;
