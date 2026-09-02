import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { 
  Sprout, 
  ShoppingCart, 
  Menu, 
  X, 
  PlusCircle, 
  LayoutDashboard, 
  Handshake, 
  Package, 
  ShieldCheck, 
  LogOut,
  User,
  Search
} from 'lucide-react';

export const Navbar = ({ onOpenCreateModal }) => {
  const { user, isFarmer, isBuyer, isAdmin, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
                <span className="text-xl">🌾</span>
              </div>
              <div>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
                  Kisan<span className="text-emerald-600">Connect</span>
                </span>
                <span className="block text-[10px] text-slate-500 -mt-1 font-medium tracking-wide">
                  DIRECT FARMER-TO-BUYER
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-700">
              <Link 
                to="/marketplace" 
                className={`px-3 py-2 rounded-lg transition ${
                  isActive('/marketplace') 
                    ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Marketplace
              </Link>

              {isFarmer && (
                <>
                  <Link 
                    to="/farmer/dashboard" 
                    className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                      isActive('/farmer/dashboard') 
                        ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                        : 'hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <LayoutDashboard size={16} />
                    <span>Farmer Hub</span>
                  </Link>

                  <button
                    onClick={onOpenCreateModal}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-1.5 ml-1"
                  >
                    <PlusCircle size={16} />
                    <span>List Produce</span>
                  </button>
                </>
              )}

              {isBuyer && (
                <Link 
                  to="/buyer/dashboard" 
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    isActive('/buyer/dashboard') 
                      ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                      : 'hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard size={16} />
                  <span>Buyer Hub</span>
                </Link>
              )}

              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    isActive('/admin') 
                      ? 'bg-purple-50 text-purple-700 font-semibold' 
                      : 'hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck size={16} />
                  <span>Ministry Admin</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center gap-3">
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
                  <span className="text-sm font-semibold text-slate-800 leading-tight">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-600">
                    {user.role === 'farmer' ? '👨‍🌾 Farmer' : user.role === 'buyer' ? '🛒 Buyer' : '🏛️ Admin'}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Log out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
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
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-100"
          >
            Marketplace
          </Link>

          {isFarmer && (
            <>
              <Link
                to="/farmer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-emerald-700 bg-emerald-50"
              >
                Farmer Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCreateModal();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-white bg-emerald-600"
              >
                + List Produce
              </button>
            </>
          )}

          {isBuyer && (
            <Link
              to="/buyer/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-blue-700 bg-blue-50"
            >
              Buyer Dashboard & Orders
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-purple-700 bg-purple-50"
            >
              Ministry Admin Dashboard
            </Link>
          )}

          <div className="pt-3 border-t border-slate-200">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded-lg font-medium"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium"
                >
                  Register
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
