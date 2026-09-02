import React from 'react';
import { Search, Filter, RotateCcw, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Cereals & Grains',
  'Pulses',
  'Vegetables',
  'Fruits',
  'Spices',
  'Oilseeds',
  'Other'
];

const STATES = [
  'All',
  'Madhya Pradesh',
  'Punjab',
  'Maharashtra',
  'Uttar Pradesh',
  'Rajasthan',
  'Haryana',
  'Gujarat',
  'Karnataka',
  'Andhra Pradesh',
  'Tamil Nadu',
  'Bihar',
  'West Bengal'
];

const QUALITY_GRADES = [
  'All',
  'Grade A (Premium)',
  'Grade B (Standard)',
  'Grade C (Fair)'
];

export const SearchAndFilterBar = ({ filters, setFilters, onReset }) => {
  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-5">
      {/* Top Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search produce (e.g. Sharbati Wheat, Basmati Rice, Red Onion, Sehore)..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filters.sort}
            onChange={(e) => handleChange('sort', e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="quantity_desc">Quantity: High to Low</option>
          </select>

          <button
            onClick={onReset}
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
            title="Reset Filters"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleChange('category', cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                filters.category === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Multi-Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
        
        {/* State Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">State / Region</label>
          <select
            value={filters.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {STATES.map((st) => (
              <option key={st} value={st}>{st === 'All' ? 'All States' : st}</option>
            ))}
          </select>
        </div>

        {/* Quality Grade Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Quality Grade</label>
          <select
            value={filters.qualityGrade}
            onChange={(e) => handleChange('qualityGrade', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {QUALITY_GRADES.map((qg) => (
              <option key={qg} value={qg}>{qg === 'All' ? 'All Quality Grades' : qg}</option>
            ))}
          </select>
        </div>

        {/* Organic Toggle & Price Limit */}
        <div className="flex items-center justify-between sm:justify-start gap-4 pt-4 sm:pt-0">
          <label className="flex items-center gap-2 cursor-pointer mt-3 sm:mt-5 select-none">
            <input
              type="checkbox"
              checked={filters.isOrganic}
              onChange={(e) => handleChange('isOrganic', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
              <Sparkles size={13} className="text-emerald-600" /> Organic Only
            </span>
          </label>
        </div>

      </div>
    </div>
  );
};

export default SearchAndFilterBar;
