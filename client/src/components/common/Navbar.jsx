import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import NotificationBell from './NotificationBell';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  PlusCircle, 
  LayoutDashboard, 
  ShieldCheck, 
  LogOut
} from 'lucide-react';

export const Navbar = ({ onOpenCreateModal }) => {
  const { user, isFarmer, isBuyer, isAdmin, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-5">
            <Link to="/" className="flex items-center gap-2 group" title="Agro Connective Intelligence and Resource Exchange">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
                <span className="text-xl">🌾</span>
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1">
                  ACIRE<span className="text-emerald-600">.AGRO</span>
                </span>
                <span className="block text-[9px] text-slate-500 -mt-1 font-bold tracking-wider uppercase">
                  Agro Connective Intelligence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-700">
              <Link 
                to="/marketplace" 
                className={`px-3 py-2 rounded-xl transition ${
                  isActive('/marketplace') 
                    ? 'bg-emerald-50 text-emerald-700 font-extrabold' 
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {t('navMarketplace', 'Marketplace')}
              </Link>

              {isFarmer && (
                <>
                  <Link 
                    to="/farmer/dashboard" 
                    className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                      isActive('/farmer/dashboard') 
                        ? 'bg-emerald-50 text-emerald-700 font-extrabold' 
                        : 'hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <LayoutDashboard size={15} />
                    <span>{t('navFarmerHub', 'Farmer Hub')}</span>
                  </Link>

                  <button
                    onClick={onOpenCreateModal}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 ml-1"
                  >
                    <PlusCircle size={15} />
                    <span>{t('listProduce', '+ List Produce')}</span>
                  </button>
                </>
              )}

              {isBuyer && (
                <Link 
                  to="/buyer/dashboard" 
                  className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                    isActive('/buyer/dashboard') 
                      ? 'bg-emerald-50 text-emerald-700 font-extrabold' 
                      : 'hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard size={15} />
                  <span>{t('navBuyerHub', 'Buyer Hub')}</span>
                </Link>
              )}

              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                    isActive('/admin') 
                      ? 'bg-purple-50 text-purple-700 font-extrabold' 
                      : 'hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck size={15} />
                  <span>{t('navAdmin', 'Ministry Admin')}</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Language Selector Component */}
            <LanguageSelector />

            {/* Notifications Bell Component */}
            <NotificationBell />

            {/* Cart Button */}
            <Link
              to="/checkout"
              className="relative p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
              title="Cart / Checkout"
            >
              <ShoppingCart size={20} />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-extrabold text-slate-900 leading-tight">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    {user.role === 'farmer' ? `👨‍🌾 ${t('farmer', 'Farmer')}` : user.role === 'buyer' ? `🛒 ${t('buyer', 'Buyer')}` : `🏛️ ${t('admin', 'Admin')}`}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                  title={t('navLogout', 'Log out')}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                >
                  {t('navSignIn', 'Sign In')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition"
                >
                  {t('navRegister', 'Register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger & Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSelector />

            <Link
              to="/checkout"
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <ShoppingCart size={20} />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg text-xs font-bold">
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-slate-800 hover:bg-slate-100"
          >
            {t('navMarketplace', 'Marketplace')}
          </Link>

          {isFarmer && (
            <>
              <Link
                to="/farmer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-emerald-700 bg-emerald-50"
              >
                {t('navFarmerHub', 'Farmer Hub')}
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCreateModal();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-white bg-emerald-600 font-bold"
              >
                {t('listProduce', '+ List Produce')}
              </button>
            </>
          )}

          {isBuyer && (
            <Link
              to="/buyer/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-blue-700 bg-blue-50"
            >
              {t('navBuyerHub', 'Buyer Hub')}
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-purple-700 bg-purple-50"
            >
              {t('navAdmin', 'Ministry Admin')}
            </Link>
          )}

          <div className="pt-3 border-t border-slate-200">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-slate-900">{user.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded-xl font-bold"
                >
                  {t('navLogout', 'Log out')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
                >
                  {t('navSignIn', 'Sign In')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 bg-emerald-600 text-white rounded-xl text-xs font-extrabold"
                >
                  {t('navRegister', 'Register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
