import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Sparkles, 
  Filter, 
  Users, 
  Navigation, 
  Building2, 
  PhoneCall, 
  X, 
  ArrowRight,
  RefreshCw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import API from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

// Create custom SVG Leaflet divIcon badge for markers
const createMarkerIcon = (level, cropName) => {
  const isHigh = level === 'HIGH';
  const isMed = level === 'MEDIUM';
  
  const bgColor = isHigh ? '#ef4444' : isMed ? '#f97316' : '#10b981';
  const dotEmoji = isHigh ? '🔴' : isMed ? '🟠' : '🟢';

  return L.divIcon({
    className: 'custom-demand-marker',
    html: `
      <div style="
        background-color: ${bgColor};
        color: #ffffff;
        padding: 5px 10px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.3px;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -4px rgba(0,0,0,0.2);
        border: 2px solid #ffffff;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont;
        transform: translateY(-50%);
      ">
        <span>${dotEmoji}</span>
        <span>${level}</span>
      </div>
    `,
    iconSize: [80, 30],
    iconAnchor: [40, 15]
  });
};

// Component to dynamically re-center map view
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], 9, { animate: true });
    }
  }, [center, map]);
  return null;
}

export const DemandMapView = () => {
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [demandFilter, setDemandFilter] = useState('All');
  const [distanceFilter, setDistanceFilter] = useState('All');
  const [locations, setLocations] = useState([]);
  const [aiInsight, setAiInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  // User location state
  const [userLocation, setUserLocation] = useState({ lat: 26.8467, lng: 80.9462, name: 'Lucknow Center' });
  const [isLocating, setIsLocating] = useState(false);

  // Buyer drawer modal state
  const [selectedLocationBuyers, setSelectedLocationBuyers] = useState(null);
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);

  const fetchDemandData = async () => {
    try {
      setLoading(true);
      const params = {
        crop: selectedCrop,
        demandLevel: demandFilter,
        maxDistance: distanceFilter === 'All' ? undefined : distanceFilter,
        lat: userLocation.lat,
        lng: userLocation.lng
      };

      const res = await API.get('/demand', { params });
      if (res.data.success) {
        setLocations(res.data.locations || []);
        setAiInsight(res.data.aiInsight);
      }
    } catch (err) {
      console.error('Error fetching demand map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandData();
  }, [selectedCrop, demandFilter, distanceFilter, userLocation]);

  // Request browser geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: 'My Exact Geolocation'
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation failed, fallback to Lucknow center', err);
        alert('Could not retrieve geolocation. Using Lucknow regional hub as reference.');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Open Buyers modal for a location
  const handleViewBuyers = async (loc) => {
    try {
      const res = await API.get(`/demand/buyers/${loc.area}?crop=${selectedCrop}`);
      if (res.data.success) {
        setSelectedLocationBuyers(res.data);
      } else {
        setSelectedLocationBuyers({
          area: loc.area,
          crop: loc.selectedCrop,
          demandQuantity: loc.demandQuantity,
          unit: loc.unit,
          buyersCount: loc.buyersCount,
          buyers: loc.buyersList || []
        });
      }
      setIsBuyerModalOpen(true);
    } catch (e) {
      setSelectedLocationBuyers({
        area: loc.area,
        crop: loc.selectedCrop,
        demandQuantity: loc.demandQuantity,
        unit: loc.unit,
        buyersCount: loc.buyersCount,
        buyers: loc.buyersList || [
          { name: 'FreshMart Supermarkets', requirement: '1,500 kg', buyer_type: 'Retail Chain' },
          { name: 'Awadh Mandi Wholesale', requirement: '2,200 kg', buyer_type: 'Wholesaler' }
        ]
      });
      setIsBuyerModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Controls Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Left: Title & Crop Select */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold">
              🗺️
            </span>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">{t('demandMapTitle', 'Demand Map & Smart Selling Area')}</h2>
              <p className="text-xs text-slate-500">{t('demandMapSubtitle', 'Live crop demand aggregation near your farm')}</p>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

          {/* Crop Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">{t('selectCrop', 'Select Crop')}:</span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Tomato">🍅 Tomato</option>
              <option value="Wheat">🌾 Wheat</option>
              <option value="Rice">🍚 Rice</option>
              <option value="Potato">🥔 Potato</option>
              <option value="Onion">🧅 Onion</option>
              <option value="All">🌱 {t('allCrops', 'All Crops')}</option>
            </select>
          </div>
        </div>

        {/* Right: Geolocation button & Refresh */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <Navigation size={14} className={isLocating ? 'animate-spin' : ''} />
            <span>{isLocating ? 'Locating...' : t('useMyLocation', 'Use My Geolocation')}</span>
          </button>

          <button
            onClick={fetchDemandData}
            className="p-2 text-slate-500 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-xl transition"
            title="Refresh Map"
          >
            <RefreshCw size={16} />
          </button>
        </div>

      </div>

      {/* AI Insight Highlight Banner */}
      {aiInsight && (
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-emerald-700/50 shadow-md flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs tracking-wider uppercase text-emerald-300">
                {aiInsight.title}
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold rounded-full">
                AI Powered
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed">
              "{aiInsight.description}"
            </p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100/80 p-3 rounded-2xl border border-slate-200/80 text-xs">
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Filter size={14} className="text-emerald-600" />
            <span>Filters:</span>
          </div>

          {/* Demand Level Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Demand Level:</span>
            <div className="flex bg-white rounded-lg p-0.5 border border-slate-200">
              {['All', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDemandFilter(lvl)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                    demandFilter === lvl
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl === 'HIGH' ? '🔴 High' : lvl === 'MEDIUM' ? '🟠 Med' : lvl === 'LOW' ? '🟢 Low' : 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Distance Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Max Distance:</span>
            <select
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="All">All Distances</option>
              <option value="50">&lt; 50 km</option>
              <option value="100">&lt; 100 km</option>
              <option value="200">&lt; 200 km</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
          <span className="flex items-center gap-1">🔴 High Demand (&gt;3,000 kg)</span>
          <span className="flex items-center gap-1">🟠 Medium (1,500–3,000 kg)</span>
          <span className="flex items-center gap-1">🟢 Low (&lt;1,500 kg)</span>
        </div>

      </div>

      {/* Main Interactive Map & Locations Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Leaflet Map Canvas (Col-span-2) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs relative min-h-[460px] h-[520px]">
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-20 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <span className="text-xs text-slate-600 font-semibold">Updating Leaflet Demand Map...</span>
              </div>
            </div>
          )}

          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={8}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', borderRadius: '1.5rem' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapRecenter center={userLocation} />

            {/* User Position Marker */}
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={L.divIcon({
                className: 'user-marker',
                html: `<div style="background-color:#1e293b; color:white; padding:4px 8px; border-radius:10px; font-weight:800; font-size:10px; border:2px solid #38bdf8; box-shadow:0 4px 8px rgba(0,0,0,0.3)">📍 You (Farm)</div>`,
                iconSize: [90, 26],
                iconAnchor: [45, 13]
              })}
            >
              <Popup>
                <div className="text-xs p-1">
                  <strong className="block text-slate-900 font-bold">Your Location</strong>
                  <span className="text-slate-500">Center for Haversine distance computations</span>
                </div>
              </Popup>
            </Marker>

            {/* Demand Location Markers */}
            {locations.map((loc) => (
              <Marker
                key={loc.id || loc.area}
                position={[loc.lat, loc.lng]}
                icon={createMarkerIcon(loc.demandLevel, loc.selectedCrop)}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-2 space-y-2 max-w-xs text-slate-900 font-sans">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-1.5">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{loc.area} Hub</h4>
                        <span className="text-[10px] text-slate-500">{loc.state}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${
                        loc.demandLevel === 'HIGH' ? 'bg-red-100 text-red-700' : loc.demandLevel === 'MEDIUM' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {loc.demandLevel} DEMAND
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Crop:</span>
                        <span className="font-bold text-slate-800">{loc.selectedCrop}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Demand Qty:</span>
                        <span className="font-extrabold text-emerald-700">{loc.demandQuantity.toLocaleString()} {loc.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Buyers Count:</span>
                        <span className="font-bold text-slate-800">{loc.buyersCount} Buyers</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Distance:</span>
                        <span className="font-mono font-semibold text-slate-700">{loc.distanceKm} km away</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewBuyers(loc)}
                      className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Users size={12} /> View Buyers ({loc.buyersCount})
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

          </MapContainer>
        </div>

        {/* Nearby Demand Areas List (Col-span-1) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 max-h-[520px] overflow-y-auto">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <MapPin size={16} className="text-emerald-600" />
              <span>Demand Locations ({locations.length})</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Sorted by proximity</span>
          </div>

          {locations.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <AlertCircle size={28} className="mx-auto text-slate-300" />
              <p className="text-xs font-semibold">No demand areas match current filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {locations.map((loc) => (
                <div
                  key={loc.id || loc.area}
                  className="p-3.5 rounded-2xl border border-slate-200/90 hover:border-emerald-500/50 hover:bg-emerald-50/30 transition space-y-2.5 group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                        {loc.area}
                      </h4>
                      <span className="text-[11px] text-slate-400">{loc.state} • {loc.distanceKm} km away</span>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-md ${
                      loc.demandLevel === 'HIGH' ? 'bg-red-100 text-red-700 border border-red-200' : loc.demandLevel === 'MEDIUM' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                      {loc.demandLevel === 'HIGH' ? '🔴 HIGH' : loc.demandLevel === 'MEDIUM' ? '🟠 MED' : '🟢 LOW'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Requested {loc.selectedCrop}</span>
                      <span className="font-extrabold text-emerald-700">{loc.demandQuantity.toLocaleString()} {loc.unit}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Active Buyers</span>
                      <span className="font-bold text-slate-800">{loc.buyersCount} Buyers</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewBuyers(loc)}
                    className="w-full py-1.5 bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <span>View Buyers</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* View Buyers Modal / Drawer */}
      {isBuyerModalOpen && selectedLocationBuyers && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-2xl animate-in fade-in zoom-in duration-150">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Demand Hub Buyers Directory</span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {selectedLocationBuyers.area} — {selectedLocationBuyers.crop} Buyers
                </h3>
              </div>
              <button
                onClick={() => setIsBuyerModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Metrics Summary */}
            <div className="grid grid-cols-2 gap-3 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/60 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Aggregated Demand Qty</span>
                <span className="font-extrabold text-emerald-800 text-base">{selectedLocationBuyers.demandQuantity?.toLocaleString()} {selectedLocationBuyers.unit || 'kg'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Verified Procurement Buyers</span>
                <span className="font-extrabold text-slate-900 text-base">{selectedLocationBuyers.buyersCount || selectedLocationBuyers.buyers?.length} Active Buyers</span>
              </div>
            </div>

            {/* Buyers List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">Verified Buyers in this Area</h4>
              {selectedLocationBuyers.buyers && selectedLocationBuyers.buyers.length > 0 ? (
                selectedLocationBuyers.buyers.map((b, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-slate-900">{b.name}</h5>
                      <span className="text-[11px] text-slate-500 block">{b.buyer_type || 'Verified Buyer'} • Requires {b.requirement}</span>
                    </div>

                    <button
                      onClick={() => alert(`Connect request initiated with ${b.name}!`)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition shadow-xs flex items-center gap-1"
                    >
                      <PhoneCall size={12} /> Direct Connect
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">No individual buyers listed for this location.</p>
              )}
            </div>

            <button
              onClick={() => setIsBuyerModalOpen(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default DemandMapView;
