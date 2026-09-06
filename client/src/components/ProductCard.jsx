import React from 'react';
import { Star, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export const ProductCard = ({ product, onSelect }) => {
  const { addToCart, cartItems } = useCart();
  const { lang, t } = useLanguage();

  const isItemInCart = cartItems.some(i => i.id === product.id);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Image and Badges */}
      <div
        onClick={() => onSelect(product)}
        className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {product.isFeatured && (
          <span className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
            Hot Deal
          </span>
        )}
        {product.compareAtPrice && (
          <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            Save {t.bdt} {(product.compareAtPrice - product.price).toLocaleString()}
          </span>
        )}
      </div>

      {/* Product Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600">
            {product.categoryName}
          </span>
          <h3
            onClick={() => onSelect(product.id)}
            className="text-base font-bold text-gray-900 mt-1 hover:text-blue-600 transition cursor-pointer line-clamp-2"
          >
            {lang === 'bn' && product.nameBn ? product.nameBn : product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1 mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-gray-800">{product.rating}</span>
            <span className="text-xs text-gray-400">({product.reviewCount})</span>
          </div>
        </div>

        {/* Pricing & Add To Cart */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-black text-gray-900">
                {t.bdt} {product.price.toLocaleString()}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {t.bdt} {product.compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className={`text-[11px] font-semibold ${product.stockQuantity > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {product.stockQuantity > 0 ? `${product.stockQuantity} ${t.inStock}` : t.outOfStock}
            </span>
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={product.stockQuantity <= 0}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
              isItemInCart
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
            }`}
          >
            {isItemInCart ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
