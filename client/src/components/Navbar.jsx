import React from 'react';
import { ShoppingBag, User, LogOut, Globe, Shield, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export const Navbar = ({ currentView, setCurrentView, searchTerm, setSearchTerm }) => {
  const { user, isAdmin, logout } = useAuth();
  const { totalCount, setIsCartOpen } = useCart();
  const { lang, switchLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
      {/* Top Notification Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Fast Express Delivery inside Dhaka (24 hrs) & Nationwide (48 hrs)</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => switchLanguage(lang === 'en' ? 'bn' : 'en')}
                className="hover:text-white font-medium transition"
              >
                {lang === 'en' ? 'বাংলা (BN)' : 'English (EN)'}
              </button>
            </div>
            {isAdmin && (
              <span className="flex items-center space-x-1 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-500/30">
                <Shield className="w-3 h-3" />
                <span>Admin</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => setCurrentView('home')}
            className="flex items-center space-x-2 cursor-pointer flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20">
              N
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                Nex<span className="text-blue-600">Store</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 -mt-1">
                Bangladeshi eCommerce
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-gray-100/80 border border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* User Dropdown / Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentView('orders')}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
                >
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="hidden sm:inline font-semibold">{user.fullName}</span>
                </button>
                <button
                  onClick={logout}
                  title={t.logout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentView('login')}
                className="inline-flex items-center space-x-2 text-sm font-semibold text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition"
              >
                <User className="w-4 h-4" />
                <span>{t.login}</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-gray-900 text-white hover:bg-blue-600 transition shadow-sm flex items-center space-x-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-bold tracking-wide uppercase">{t.cart}</span>
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
