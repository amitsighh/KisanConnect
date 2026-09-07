import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Sprout, ShoppingCart, ShieldAlert } from 'lucide-react';

export const QuickDemoLogin = () => {
  const { user, quickDemoLogin, logout } = useAuth();

  return (
    <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white text-xs px-4 py-2 border-b border-emerald-800/40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-300 font-medium">
            Direct Farmer-to-Buyer Marketplace (SIH26033)
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-semibold">[DEMO ACCOUNTS]:</span>
          
          <button
            onClick={() => quickDemoLogin('farmer')}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 font-medium ${
              user?.role === 'farmer'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Log in as Ramesh Patel (Farmer, Madhya Pradesh)"
          >
            <Sprout size={13} className="text-emerald-300" />
            <span>Farmer (Ramesh)</span>
          </button>

          <button
            onClick={() => quickDemoLogin('buyer')}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 font-medium ${
              user?.role === 'buyer'
                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Log in as FreshMart Supermarket (Buyer, Mumbai)"
          >
            <ShoppingCart size={13} className="text-blue-300" />
            <span>Buyer (FreshMart)</span>
          </button>

          <button
            onClick={() => quickDemoLogin('admin')}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 font-medium ${
              user?.role === 'admin'
                ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Log in as Ministry Admin (MoCA & FPD)"
          >
            <ShieldAlert size={13} className="text-purple-300" />
            <span>Admin (Ministry)</span>
          </button>

          {user && (
            <button
              onClick={logout}
              className="px-2 py-1 bg-red-900/50 hover:bg-red-800/80 text-red-200 rounded transition ml-1"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickDemoLogin;
