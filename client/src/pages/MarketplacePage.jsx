import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import SearchAndFilterBar from '../components/marketplace/SearchAndFilterBar';
import ProduceCard from '../components/marketplace/ProduceCard';
import OfferModal from '../components/marketplace/OfferModal';
import { Sprout, FilterX } from 'lucide-react';

export const MarketplacePage = () => {
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    state: searchParams.get('state') || 'All',
    qualityGrade: searchParams.get('qualityGrade') || 'All',
    isOrganic: searchParams.get('isOrganic') === 'true',
    sort: 'newest',
    page: 1,
    limit: 24
  });

  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedListingForOffer, setSelectedListingForOffer] = useState(null);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filters.search) queryParams.append('search', filters.search);
      if (filters.category && filters.category !== 'All') queryParams.append('category', filters.category);
      if (filters.state && filters.state !== 'All') queryParams.append('state', filters.state);
      if (filters.qualityGrade && filters.qualityGrade !== 'All') queryParams.append('qualityGrade', filters.qualityGrade);
      if (filters.isOrganic) queryParams.append('isOrganic', 'true');
      if (filters.sort) queryParams.append('sort', filters.sort);
      queryParams.append('page', filters.page);
      queryParams.append('limit', filters.limit);

      const res = await API.get(`/listings?${queryParams.toString()}`);
      if (res.data.success) {
        setListings(res.data.listings);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error('Failed to fetch marketplace listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const handleReset = () => {
    setFilters({
      search: '',
      category: 'All',
      state: 'All',
      qualityGrade: 'All',
      isOrganic: false,
      sort: 'newest',
      page: 1,
      limit: 24
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title & Breadcrumb */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Direct Agricultural Produce Marketplace
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Source directly from verified farmers across India with transparent farm-gate pricing and zero intermediary commissions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <SearchAndFilterBar
        filters={filters}
        setFilters={setFilters}
        onReset={handleReset}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <span className="font-semibold">
          Showing <span className="text-emerald-700 font-bold">{listings.length}</span> of {total} verified farm lots
        </span>
      </div>

      {/* Produce Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-xs text-slate-500 mt-3 font-medium">Loading verified farm lots...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FilterX size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Produce Matches Your Filters</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search terms, removing state/category filters, or clearing the organic toggle.
          </p>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ProduceCard
              key={listing._id}
              listing={listing}
              onOpenOfferModal={(item) => setSelectedListingForOffer(item)}
            />
          ))}
        </div>
      )}

      {/* Offer Modal */}
      <OfferModal
        listing={selectedListingForOffer}
        isOpen={!!selectedListingForOffer}
        onClose={() => setSelectedListingForOffer(null)}
      />

    </div>
  );
};

export default MarketplacePage;
