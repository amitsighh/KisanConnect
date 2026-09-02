import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, PhoneCall, Globe2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌾</span>
              <span className="text-lg font-bold text-white tracking-tight">
                Kisan<span className="text-emerald-400">Connect</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering India's farmers by bypassing multi-layered middlemen. Direct farm-gate procurement for retail chains, FPOs, and bulk buyers.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800/40">
              <ShieldCheck size={16} />
              <span>SIH Problem Statement: SIH26033</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Marketplace</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/marketplace?category=Cereals+%26+Grains" className="hover:text-white transition">Cereals & Grains (Wheat, Rice)</Link></li>
              <li><Link to="/marketplace?category=Pulses" className="hover:text-white transition">Pulses & Lentils (Dal, Chana)</Link></li>
              <li><Link to="/marketplace?category=Vegetables" className="hover:text-white transition">Fresh Vegetables (Onion, Tomato)</Link></li>
              <li><Link to="/marketplace?category=Oilseeds" className="hover:text-white transition">Oilseeds (Soybean, Mustard)</Link></li>
              <li><Link to="/marketplace?isOrganic=true" className="hover:text-white transition">Certified Organic Produce</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Empowerment Impact</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span className="text-emerald-400 font-semibold">+35% to 45%</span> Farmer Net Realization</li>
              <li><span className="text-blue-400 font-semibold">-15% to 20%</span> Buyer Procurement Cost</li>
              <li><span className="text-amber-400 font-semibold">0%</span> Traditional Arhatiya Margin Cut</li>
              <li><span className="text-purple-400 font-semibold">100%</span> Direct Settlement Transparency</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Ministry & Support</h4>
            <p className="text-xs text-slate-400 mb-3">
              Supported for Ministry of Consumer Affairs, Food & Public Distribution.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <PhoneCall size={14} className="text-emerald-400" />
                <span>Kisan Helpline: 1800-180-1551</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Globe2 size={14} className="text-emerald-400" />
                <span>All India APMC & Mandi Linkage</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 KisanConnect — National Agricultural Direct Marketplace Initiative.</p>
          <p className="flex items-center gap-1">
            Built with <Heart size={12} className="text-red-400 fill-red-400" /> for Indian Farmers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
