import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sprout, 
  Upload, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  Camera, 
  Image as ImageIcon, 
  Trash2, 
  RefreshCw 
} from 'lucide-react';
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
  const fileInputRef = useRef(null);

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

  const [imageSource, setImageSource] = useState('upload'); // 'upload' | 'preset'
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [mandiData, setMandiData] = useState(null);
  const [mandiLoading, setMandiLoading] = useState(false);

  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Image Upload & Canvas Compression Handler
  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setImageError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageError('Image file is too large (max 10MB). Please select a smaller photo.');
      return;
    }

    setImageError('');
    setIsProcessingImage(true);

    try {
      const originalSize = formatBytes(file.size);
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

          setFormData((prev) => ({
            ...prev,
            imageUrl: compressedDataUrl
          }));

          setUploadedFileInfo({
            name: file.name,
            originalSize,
            preview: compressedDataUrl
          });
          setIsProcessingImage(false);
        };

        img.onerror = () => {
          setImageError('Failed to process image. Please try another photo.');
          setIsProcessingImage(false);
        };

        img.src = event.target.result;
      };

      reader.onerror = () => {
        setImageError('Failed to read image file.');
        setIsProcessingImage(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setImageError('Error uploading image. Please try again.');
      setIsProcessingImage(false);
    }
  };

  const handleRemoveUploadedImage = () => {
    setUploadedFileInfo(null);
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFormData((prev) => ({
      ...prev,
      imageUrl: PHOTO_PRESETS[0].url
    }));
  };

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

          {/* Produce Photo Section (Upload Real Photo or Sample Presets) */}
          <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-800">
                  Produce Photo *
                </label>
                <p className="text-[11px] text-slate-500">
                  Upload a real photo of your harvest or pick a sample photo
                </p>
              </div>

              {/* Mode Toggle Switcher */}
              <div className="inline-flex bg-slate-200/80 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setImageSource('upload');
                    if (uploadedFileInfo?.preview) {
                      setFormData((prev) => ({ ...prev, imageUrl: uploadedFileInfo.preview }));
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    imageSource === 'upload'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Camera size={13} className={imageSource === 'upload' ? 'text-emerald-600' : 'text-slate-500'} />
                  <span>Upload Real Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setImageSource('preset');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    imageSource === 'preset'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon size={13} className={imageSource === 'preset' ? 'text-emerald-600' : 'text-slate-500'} />
                  <span>Sample Presets</span>
                </button>
              </div>
            </div>

            {imageError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <ShieldAlert size={14} className="shrink-0" />
                <span>{imageError}</span>
              </div>
            )}

            {/* Hidden native file input for mobile camera / gallery capture */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageFileSelect}
              className="hidden"
              id="produce-photo-input"
            />

            {/* MODE 1: Upload Real Photo */}
            {imageSource === 'upload' && (
              <div>
                {uploadedFileInfo ? (
                  /* Preview Card for Uploaded Image */
                  <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3.5 w-full sm:w-auto">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-inner">
                        <img
                          src={uploadedFileInfo.preview}
                          alt="Crop upload preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full border border-emerald-200">
                            <CheckCircle2 size={11} className="text-emerald-600" />
                            Photo Ready
                          </span>
                          <span className="text-[11px] text-slate-400">({uploadedFileInfo.originalSize})</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[200px] sm:max-w-[260px]">
                          {uploadedFileInfo.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Optimized for fast buyer browsing & marketplace display
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                      >
                        <RefreshCw size={13} />
                        <span>Change</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveUploadedImage}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Drag & Drop / Click Upload Box */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 rounded-2xl p-6 text-center cursor-pointer transition group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition">
                      {isProcessingImage ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-700 border-t-transparent" />
                      ) : (
                        <Camera size={24} />
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-800 mb-0.5">
                      {isProcessingImage ? 'Optimizing produce photo...' : 'Click to take photo or choose from device'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Supports Mobile Camera & Gallery • JPG, PNG, WEBP up to 10MB
                    </p>
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 group-hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      <Upload size={13} />
                      <span>Select Crop Photo</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* MODE 2: Sample Presets */}
            {imageSource === 'preset' && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {PHOTO_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => setFormData((prev) => ({ ...prev, imageUrl: preset.url }))}
                      className={`p-1.5 rounded-xl border text-center transition ${
                        formData.imageUrl === preset.url
                          ? 'border-emerald-600 ring-2 ring-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
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
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            )}
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
