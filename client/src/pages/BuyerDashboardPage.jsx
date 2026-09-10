import React, { useState } from 'react';
import { ShoppingCart, Package, Handshake, ShieldCheck, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import BuyerOrdersView from '../components/buyer/BuyerOrdersView';
import BuyerOffersView from '../components/buyer/BuyerOffersView';
import BuyerPoolsView from '../components/buyer/BuyerPoolsView';

export const BuyerDashboardPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('pools'); // 'pools' | 'orders' | 'offers'

  return (
    <div className="space-y-8">
      
      {/* Buyer Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-blue-800/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-700/80 border border-blue-500/30 flex items-center justify-center text-2xl font-black shadow-inner">
            🛒
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold">{user?.name}</h1>
              {user?.isVerified && (
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold rounded-full flex items-center gap-1">
                  <ShieldCheck size={12} /> {t('verifiedBuyer')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {user?.buyerDetails?.businessName || 'FreshMart Supermarkets'} • {user?.location?.district}, {user?.location?.state}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('pools')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm transition relative flex items-center gap-1.5 ${
            activeTab === 'pools'
              ? 'text-blue-700 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers size={16} />
          <span>{t('tabBulkProcurement')}</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm transition relative flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'text-blue-700 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package size={16} />
          <span>{t('tabDirectOrders')}</span>
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm transition relative flex items-center gap-1.5 ${
            activeTab === 'offers'
              ? 'text-blue-700 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Handshake size={16} />
          <span>{t('tabNegotiations')}</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'pools' && <BuyerPoolsView />}
      {activeTab === 'orders' && <BuyerOrdersView />}
      {activeTab === 'offers' && <BuyerOffersView />}

    </div>
  );
};

export default BuyerDashboardPage;

