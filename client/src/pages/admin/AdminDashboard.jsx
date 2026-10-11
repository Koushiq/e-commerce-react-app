import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  Heart,
  Banknote,
  Layers,
  Clock,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';

const STATUS_STYLES = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  Processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200'
};

const PlaceholderSection = ({ title, icon: Icon, subtitle }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-4">
    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
      <Icon className="w-8 h-8" />
    </div>
    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    <p className="text-sm text-gray-500 max-w-sm mx-auto">{subtitle}</p>
  </div>
);

export const AdminDashboard = ({ onBackToStore }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [section, setSection] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await apiFetch('/admin/stats');
      if (res.success) {
        setStats(res.data);
      } else {
        setError(res.message || 'Failed to load stats');
      }
    } catch (err) {
      setError('Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'users', label: t.manageUsers, icon: Users },
    { id: 'products', label: t.manageProducts, icon: Package },
    { id: 'orders', label: t.manageOrders, icon: ShoppingBag },
    { id: 'wishlist', label: t.manageWishlist, icon: Heart }
  ];

  const statCards = stats
    ? [
        { label: t.totalProducts, value: stats.totalProducts.toLocaleString(), icon: Package, bg: 'bg-blue-50 text-blue-600' },
        { label: t.totalOrders, value: stats.totalOrders.toLocaleString(), icon: ShoppingBag, bg: 'bg-indigo-50 text-indigo-600' },
        { label: t.totalUsers, value: stats.totalUsers.toLocaleString(), icon: Users, bg: 'bg-emerald-50 text-emerald-600' },
        { label: t.totalRevenue, value: `${t.bdt}${stats.totalRevenue.toLocaleString()}`, icon: Banknote, bg: 'bg-amber-50 text-amber-600' }
      ]
    : [];

  const secondaryStats = stats
    ? [
        { label: t.pendingOrders, value: stats.pendingOrders.toLocaleString(), icon: Clock, bg: 'bg-amber-50 text-amber-600' },
        { label: t.totalCategories, value: stats.totalCategories.toLocaleString(), icon: Layers, bg: 'bg-violet-50 text-violet-600' },
        { label: t.wishlistItems, value: stats.totalWishlistItems.toLocaleString(), icon: Heart, bg: 'bg-rose-50 text-rose-600' }
      ]
    : [];

  return (
    <div className="flex-1 flex min-h-0">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-white border-r border-gray-200 flex-col py-6 px-4 space-y-1">
        <div className="flex items-center space-x-2 px-3 pb-5 mb-2 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">{t.adminBadge}</p>
            <p className="text-[10px] text-gray-400 font-medium">{user?.fullName || user?.email}</p>
          </div>
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const active = section === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <button
          onClick={onBackToStore}
          className="mt-auto flex items-center space-x-2 px-3 py-2 text-xs text-gray-400 hover:text-gray-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.backToProducts}</span>
        </button>
      </aside>

      {/* Mobile nav (horizontal scroll) */}
      <div className="md:hidden flex overflow-x-auto gap-2 bg-white border-b border-gray-200 px-4 py-3">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = section === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                active ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {section === 'dashboard' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-gray-900">{t.dashboard}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{t.overview}</p>
              </div>
              {stats && (
                <button
                  onClick={fetchStats}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition"
                >
                  {t.refresh}
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 animate-pulse">
                    <div className="h-3 bg-gray-200 rounded w-20" />
                    <div className="h-8 bg-gray-200 rounded w-24" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl border border-red-100 p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <p className="text-sm text-gray-600">{error}</p>
                <button
                  onClick={fetchStats}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  {t.retry}
                </button>
              </div>
            ) : (
              <>
                {/* Primary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {statCards.map(card => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.label}
                        className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{card.label}</span>
                          <div className={`p-2 rounded-xl ${card.bg}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{card.value}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {secondaryStats.map(card => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.label}
                        className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center space-x-3"
                      >
                        <div className={`p-2.5 rounded-xl ${card.bg}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-lg font-black text-gray-900 leading-none">{card.value}</p>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mt-1">{card.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-900">{t.recentOrders}</h2>
                    <button
                      onClick={() => setSection('orders')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                    >
                      {t.viewAll}
                    </button>
                  </div>
                  {stats.recentOrders && stats.recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-gray-50/80 text-gray-400 uppercase tracking-wider">
                            <th className="px-5 py-3 font-bold">{t.orderNumber}</th>
                            <th className="px-5 py-3 font-bold">{t.customer}</th>
                            <th className="px-5 py-3 font-bold">{t.date}</th>
                            <th className="px-5 py-3 font-bold">{t.payment}</th>
                            <th className="px-5 py-3 font-bold text-right">{t.total}</th>
                            <th className="px-5 py-3 font-bold">{t.status}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {stats.recentOrders.map(o => (
                            <tr key={o.id} className="hover:bg-gray-50/60 transition">
                              <td className="px-5 py-3.5 font-mono font-bold text-gray-900">{o.orderNumber}</td>
                              <td className="px-5 py-3.5">
                                <p className="font-semibold text-gray-800">{o.customerName}</p>
                                <p className="text-gray-400">{o.customerEmail}</p>
                              </td>
                              <td className="px-5 py-3.5 text-gray-500">
                                {new Date(o.createdAtUtc).toLocaleDateString()}
                              </td>
                              <td className="px-5 py-3.5 text-gray-500">{o.paymentMethod}</td>
                              <td className="px-5 py-3.5 text-right font-bold text-gray-900">
                                {t.bdt}{o.totalAmount.toLocaleString()}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`px-2 py-1 rounded-full font-bold border ${STATUS_STYLES[o.status] || STATUS_STYLES.Pending}`}>
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-10 text-center text-sm text-gray-400">{t.noRecentOrders}</div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {section === 'users' && (
          <PlaceholderSection title={t.manageUsers} icon={Users} subtitle={t.comingSoon} />
        )}
        {section === 'products' && (
          <PlaceholderSection title={t.manageProducts} icon={Package} subtitle={t.comingSoon} />
        )}
        {section === 'orders' && (
          <PlaceholderSection title={t.manageOrders} icon={ShoppingBag} subtitle={t.comingSoon} />
        )}
        {section === 'wishlist' && (
          <PlaceholderSection title={t.manageWishlist} icon={Heart} subtitle={t.comingSoon} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
