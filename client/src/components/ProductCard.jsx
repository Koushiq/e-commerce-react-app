import React, { useState } from 'react';
import { Star, ShoppingCart, Check, Heart, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export const ProductCard = ({ product, onSelect }) => {
  const { addToCart, isInCart, toggleWishlist, isInWishlist, showToast } = useCart();
  const { lang, t } = useLanguage();

  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isCartSuccess, setIsCartSuccess] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const inCart = isInCart(product.id);
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (product.stockQuantity <= 0 || isCartLoading) return;

    setIsCartLoading(true);
    try {
      await addToCart(product, 1);
      setIsCartSuccess(true);
      const productName = lang === 'bn' && product.nameBn ? product.nameBn : product.name;
      showToast(`${productName} ${lang === 'bn' ? 'কার্টে যোগ করা হয়েছে' : 'added to cart!'}`, 'cart');
      setTimeout(() => {
        setIsCartSuccess(false);
      }, 1600);
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
    if (isWishlistLoading) return;

    setIsWishlistLoading(true);
    try {
      const added = await toggleWishlist(product);
      const productName = lang === 'bn' && product.nameBn ? product.nameBn : product.name;
      if (added) {
        showToast(`${productName} ${lang === 'bn' ? 'উইশলিস্টে যোগ করা হয়েছে' : 'added to wishlist!'}`, 'wishlist');
      } else {
        showToast(`${productName} ${lang === 'bn' ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'removed from wishlist'}`, 'wishlist');
      }
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group relative">
      {/* Image and Badges */}
      <div
        onClick={() => onSelect(product.id)}
        className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Hot Deal Badge */}
        {product.isFeatured && (
          <span className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md z-10">
            Hot Deal
          </span>
        )}

        {/* Discount Badge */}
        {product.compareAtPrice && (
          <span className="absolute bottom-3 left-3 bg-emerald-600/95 backdrop-blur text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm z-10">
            Save {t.bdt} {(product.compareAtPrice - product.price).toLocaleString()}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          disabled={isWishlistLoading}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md z-10 ${
            inWishlist
              ? 'bg-rose-50 hover:bg-rose-100 text-rose-500'
              : 'bg-white/90 backdrop-blur hover:bg-white text-gray-400 hover:text-rose-500'
          } ${isWishlistLoading ? 'cursor-wait opacity-80' : 'hover:scale-110 active:scale-95'}`}
        >
          {isWishlistLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
          ) : (
            <Heart
              className={`w-4 h-4 transition-all duration-300 ${
                inWishlist ? 'text-rose-500 fill-rose-500 scale-110' : ''
              }`}
            />
          )}
        </button>
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
            onClick={handleAddToCart}
            disabled={product.stockQuantity <= 0 || isCartLoading}
            aria-label="Add to cart"
            className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center min-w-[42px] min-h-[42px] ${
              product.stockQuantity <= 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isCartSuccess
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                : inCart
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-95'
            }`}
          >
            {isCartLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isCartSuccess ? (
              <Check className="w-5 h-5 stroke-[2.5]" />
            ) : inCart ? (
              <Check className="w-5 h-5" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
