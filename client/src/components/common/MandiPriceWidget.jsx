import React from 'react';
import { 
  Scale, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Info, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  AlertCircle,
  Building2,
  RefreshCw
} from 'lucide-react';

export const MandiPriceWidget = ({
  mandiData,
  farmerPrice,
  unit = 'quintal',
  loading = false,
  compact = false,
  onRefresh = null
}) => {
  // Loading Skeleton State
  if (loading) {
    return (
      <div className={`rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 animate-pulse space-y-3 ${compact ? 'text-xs' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-200 rounded-full"></div>
            <div className="h-4 bg-amber-200 rounded w-44"></div>
          </div>
          <div className="h-4 bg-amber-200 rounded w-24"></div>
        </div>
        <div className="h-9 bg-amber-200/60 rounded-xl w-3/5"></div>
        <div className="h-3 bg-amber-200/40 rounded w-4/5"></div>
        <p className="text-[11px] font-medium text-amber-700/80 italic">
          Loading live mandi reference from Agmarknet...
        </p>
      </div>
    );
  }

  // Unavailable State
  if (!mandiData || !mandiData.available) {
    return (
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <Info size={16} className="text-slate-500 shrink-0" />
            <span>Mandi Reference Price</span>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="text-slate-500 hover:text-emerald-700 text-[11px] flex items-center gap-1 font-medium transition"
              title="Retry price lookup"
            >
              <RefreshCw size={12} />
              <span>Retry</span>
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          {mandiData?.message || 'Live Mandi reference price currently unavailable for this commodity in the selected region. Farmers maintain full discretion over their final listing price.'}
        </p>
        <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100 flex items-center justify-between">
          <span>Source: Agmarknet / eNAM Open Data</span>
          <span className="text-slate-500 font-semibold">Direct Farm Pricing Active</span>
        </div>
      </div>
    );
  }

  // Data Available
  const {
    commodity,
    market,
    district,
    state,
    minPrice,
    maxPrice,
    modalPrice,
    arrivalDate,
    referenceLevel = 'district',
    referenceLabel,
    variety,
    source
  } = mandiData;

  // Reference Level Badge Styling & Label
  const getReferenceLevelBadge = () => {
    switch (referenceLevel) {
      case 'exact_market':
        return {
          title: 'Exact Market Reference',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          dot: 'bg-emerald-500'
        };
      case 'district':
        return {
          title: 'District Reference',
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-500'
        };
      case 'state':
        return {
          title: 'State Benchmark',
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
          dot: 'bg-blue-500'
        };
      case 'national':
      default:
        return {
          title: 'National Benchmark',
          bg: 'bg-slate-100 text-slate-900 border-slate-300',
          dot: 'bg-slate-500'
        };
    }
  };

  const badgeConfig = getReferenceLevelBadge();

  // Unit normalization for comparison
  // Mandi prices are standard in ₹/Quintal (100 kg)
  let normalizedFarmerPrice = Number(farmerPrice) || 0;
  if (unit === 'kg') {
    normalizedFarmerPrice = normalizedFarmerPrice * 100; // convert kg to quintal
  } else if (unit === 'ton') {
    normalizedFarmerPrice = normalizedFarmerPrice / 10; // convert ton to quintal
  }

  // Price comparison calculation
  const hasFarmerPrice = normalizedFarmerPrice > 0 && modalPrice > 0;
  const diffAmount = hasFarmerPrice ? Math.abs(normalizedFarmerPrice - modalPrice) : 0;
  const diffPercent = hasFarmerPrice 
    ? Math.round(((normalizedFarmerPrice - modalPrice) / modalPrice) * 100) 
    : 0;
  const isAbove = normalizedFarmerPrice > modalPrice;
  const isBelow = normalizedFarmerPrice < modalPrice;
  const isAligned = Math.abs(diffPercent) <= 3;

  return (
    <div className={`rounded-2xl border transition ${
      compact 
        ? 'bg-amber-50/70 border-amber-200/90 p-3.5 sm:p-4 text-xs shadow-2xs' 
        : 'bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 border-amber-200/90 p-4 sm:p-5 shadow-xs'
    } space-y-3`}>
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-amber-950 font-extrabold text-xs sm:text-sm">
          <Scale size={16} className="text-amber-700 shrink-0" />
          <span>Live Mandi Reference Price</span>
        </div>

        {/* Dynamic Fallback / Hierarchy Level Badge */}
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeConfig.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badgeConfig.dot}`}></span>
            <span>{referenceLabel || badgeConfig.title}</span>
          </span>
        </div>
      </div>

      {/* Main Prices Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center pt-2 border-t border-amber-200/60">
        
        {/* Modal / APMC Reference Rate */}
        <div className="sm:col-span-1">
          <span className="text-[11px] text-slate-500 font-semibold block">APMC Modal Rate</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-950 leading-tight tracking-tight">
            ₹{modalPrice.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-bold text-slate-500">/ Quintal</span>
          </div>
          {variety && variety !== 'Standard / Local' && (
            <span className="text-[10px] text-amber-800 font-medium truncate block mt-0.5">
              Variety: {variety}
            </span>
          )}
        </div>

        {/* Range & APMC details */}
        <div className="sm:col-span-2 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-700 bg-white/70 px-2.5 py-1.5 rounded-lg border border-amber-100">
            <span className="text-slate-500 font-medium">Market Range:</span>
            <span className="font-extrabold text-slate-900">
              ₹{minPrice.toLocaleString('en-IN')} – ₹{maxPrice.toLocaleString('en-IN')} / Qtl
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span className="flex items-center gap-1 truncate max-w-[210px]" title={`${market}, ${district}, ${state}`}>
              <MapPin size={12} className="text-amber-700 shrink-0" />
              <span className="font-medium text-slate-700 truncate">{market}, {district || state}</span>
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Calendar size={12} className="text-slate-400" />
              <span>{arrivalDate}</span>
            </span>
          </div>
        </div>

      </div>

      {/* Structured Comparison: Direct Farm Price vs Mandi Modal Price */}
      {hasFarmerPrice && (
        <div className="pt-2 border-t border-amber-200/60 space-y-2">
          
          <div className="bg-white/90 p-2.5 rounded-xl border border-amber-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-emerald-700" />
              <span className="font-bold text-slate-800">Farm Price vs APMC Mandi:</span>
            </div>

            {isAligned ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md text-[11px]">
                <Minus size={13} className="text-emerald-700" />
                <span>Fair Market Parity (₹{normalizedFarmerPrice.toLocaleString('en-IN')} / Qtl)</span>
              </span>
            ) : isAbove ? (
              <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md text-[11px]">
                <TrendingUp size={13} className="text-amber-700" />
                <span>+₹{diffAmount.toLocaleString('en-IN')}/Qtl Above APMC (+{diffPercent}%)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-md text-[11px]">
                <TrendingDown size={13} className="text-blue-700" />
                <span>-₹{diffAmount.toLocaleString('en-IN')}/Qtl Below APMC (-{Math.abs(diffPercent)}%)</span>
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-600 leading-normal px-1">
            {isAligned
              ? "Your direct farm price aligns closely with current terminal APMC rates, giving buyers high confidence and faster order commitments."
              : isAbove
              ? "Your expected farm-gate price reflects premium quality or organic standards. Buyers save on middleman commissions and terminal mandi handling fees."
              : "Your price is below current terminal mandi averages, making this lot highly competitive for volume institutional buyers."}
          </p>
        </div>
      )}

      {/* Mandatory Transparency Disclaimer */}
      <div className="text-[10px] text-slate-500 pt-1.5 border-t border-amber-200/50 flex items-start gap-1.5">
        <Info size={13} className="text-amber-700 shrink-0 mt-0.5" />
        <span className="leading-tight">
          Mandi reference price is provided for transparency and price discovery. Farmers maintain full discretion over their final listing price.
        </span>
      </div>

    </div>
  );
};

export default MandiPriceWidget;
