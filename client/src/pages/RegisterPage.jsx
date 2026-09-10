import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, ShoppingCart, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('farmer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    district: '',
    state: 'Madhya Pradesh',
    pincode: '',
    farmName: '',
    farmSizeAcres: '',
    businessName: '',
    buyerType: 'retailer'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role,
      location: {
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode
      },
      farmDetails: role === 'farmer' ? {
        farmName: formData.farmName,
        farmSizeAcres: Number(formData.farmSizeAcres) || 0
      } : undefined,
      buyerDetails: role === 'buyer' ? {
        businessName: formData.businessName,
        buyerType: formData.buyerType
      } : undefined
    };

    const res = await register(payload);
    if (res.success) {
      if (role === 'farmer') navigate('/farmer/dashboard');
      else navigate('/marketplace');
    } else {
      setError(res.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto my-8 space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900">Create KisanConnect Account</h1>
          <p className="text-xs text-slate-500">Direct Farmer-to-Buyer Marketplace Network</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('farmer')}
            className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              role === 'farmer'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sprout size={16} />
            <span>I am a Farmer / FPO</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('buyer')}
            className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              role === 'buyer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingCart size={16} />
            <span>I am a Buyer / Retailer</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Ramesh Patel"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number *</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                placeholder="e.g. ramesh@farm.in"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                name="password"
                required
                minLength="6"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Location Fields */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">District *</label>
              <input
                type="text"
                name="district"
                required
                placeholder="e.g. Sehore"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                name="state"
                required
                placeholder="e.g. Madhya Pradesh"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Pincode *</label>
              <input
                type="text"
                name="pincode"
                required
                placeholder="e.g. 466001"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Role-Specific Fields */}
          {role === 'farmer' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Farm / Enterprise Name</label>
                <input
                  type="text"
                  name="farmName"
                  placeholder="e.g. Patel Organic Farm"
                  value={formData.farmName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Land Size (Acres)</label>
                <input
                  type="number"
                  name="farmSizeAcres"
                  placeholder="e.g. 12"
                  value={formData.farmSizeAcres}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business / Store Name</label>
                <input
                  type="text"
                  name="businessName"
                  placeholder="e.g. FreshMart Supermarket"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Buyer Type</label>
                <select
                  name="buyerType"
                  value={formData.buyerType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="retailer">Retail Kirana / Supermarket</option>
                  <option value="wholesaler">Wholesaler / Trader</option>
                  <option value="restaurant">Restaurant / HORECA</option>
                  <option value="consumer">Direct Consumer</option>
                  <option value="fpo">FPO Aggregator</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-sm disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-emerald-700 hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
