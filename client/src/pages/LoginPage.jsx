import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldAlert, Sparkles, Sprout, ShoppingCart, ShieldCheck } from 'lucide-react';

export const LoginPage = () => {
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(emailOrPhone, password);
    if (res.success) {
      if (res.user.role === 'farmer') navigate('/farmer/dashboard');
      else if (res.user.role === 'admin') navigate('/admin');
      else navigate('/marketplace');
    } else {
      setError(res.message || 'Invalid login credentials');
    }
    setLoading(false);
  };

  const handleQuickLogin = async (role) => {
    setLoading(true);
    setError('');
    const res = await quickDemoLogin(role);
    if (res.success) {
      if (role === 'farmer' || role === 'farmer3') navigate('/farmer/dashboard');
      else if (role === 'admin') navigate('/admin');
      else navigate('/marketplace');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6">
      
      {/* Demo Evaluation Box */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-5 rounded-3xl text-white border border-emerald-800/40 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={11} /> SIH Evaluation Seed Accounts
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">DEMO MODE</span>
        </div>
        <p className="text-xs text-slate-300">
          Click any seed account below to test Supabase role authentication:
        </p>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleQuickLogin('farmer')}
            className="p-2.5 bg-emerald-700/80 hover:bg-emerald-600 rounded-xl text-center transition flex flex-col items-center gap-1"
          >
            <Sprout size={16} className="text-emerald-300" />
            <span className="text-[11px] font-bold">Farmer (Ramesh)</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('buyer')}
            className="p-2.5 bg-blue-700/80 hover:bg-blue-600 rounded-xl text-center transition flex flex-col items-center gap-1"
          >
            <ShoppingCart size={16} className="text-blue-300" />
            <span className="text-[11px] font-bold">Buyer (FreshMart)</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            className="p-2.5 bg-purple-700/80 hover:bg-purple-600 rounded-xl text-center transition flex flex-col items-center gap-1"
          >
            <ShieldCheck size={16} className="text-purple-300" />
            <span className="text-[11px] font-bold">Admin (Ministry)</span>
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900">Sign in to KisanConnect</h1>
          <p className="text-xs text-slate-500">Access your verified farm listings, bids, orders, and settlements</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address or Phone Number
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                type="text"
                required
                placeholder="Enter your email or phone"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating with Supabase...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-emerald-700 hover:underline">
            Register as Farmer or Buyer
          </Link>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
