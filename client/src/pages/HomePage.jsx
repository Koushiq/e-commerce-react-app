import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, Layers, ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const HomePage = ({ onSelectProduct, searchTerm }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t, lang } = useLanguage();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchTerm]);

  const loadCategories = async () => {
    try {
      const res = await apiFetch('/products/categories');
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      let endpoint = '/products';
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      const qs = params.toString();
      if (qs) endpoint += `?${qs}`;

      const res = await apiFetch(endpoint);
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white px-6 py-12 sm:px-12 sm:py-20 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1 rounded-full text-xs font-semibold text-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Next-Gen Fullstack eCommerce Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {t.heroTag}
          </h1>

          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => {
                const el = document.getElementById('catalog');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-blue-900 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition shadow-lg flex items-center space-x-2"
            >
              <span>{t.shopNow}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-2 text-xs font-medium text-blue-200 px-2 py-3">
              <span>Supports bKash & SSLCommerz Direct</span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 top-12 hidden lg:block opacity-20 hover:opacity-30 transition">
          <div className="text-9xl font-black tracking-tighter">৳ BDT</div>
        </div>
      </section>

      {/* Feature Badges */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center space-x-4 shadow-sm">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Nationwide Delivery</h4>
            <p className="text-xs text-gray-500">Fast delivery across all 64 districts</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center space-x-4 shadow-sm">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Secure Online Payments</h4>
            <p className="text-xs text-gray-500">Instant checkout with bKash & Cards</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center space-x-4 shadow-sm">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">7-Day Hassle-Free Returns</h4>
            <p className="text-xs text-gray-500">100% authentic product guarantee</p>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section id="catalog" className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">{t.categories}</h2>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
              selectedCategory === null
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {t.allCategories}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                selectedCategory === cat.slug
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {lang === 'bn' && cat.nameBn ? cat.nameBn : cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse space-y-4">
                <div className="aspect-square bg-gray-200 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 font-medium">No products found for your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
