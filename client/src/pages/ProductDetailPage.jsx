import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Heart,
  Star,
  ArrowLeft,
  Check,
  Loader2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Share2,
  PackageCheck,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../api/client';

export default function ProductDetailPage({ productId, onBack }) {
  const { addToCart, isInCart, toggleWishlist, isInWishlist, showToast, setIsCartOpen } = useCart();
  const { lang, t } = useLanguage();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isCartSuccess, setIsCartSuccess] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!productId) return;

    let isMounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const id = typeof productId === 'object' ? productId.id : productId;
        const res = await apiFetch(`/products/${id}`);
        if (!isMounted) return;

        if (res && res.success && res.data) {
          setProduct(res.data);
          if (Array.isArray(res.data.variants) && res.data.variants.length > 0) {
            setSelectedVariant(res.data.variants[0]);
          }
        } else if (res && !res.success) {
          throw new Error(res.message || 'Product not found');
        } else {
          // Direct fallback if response is already the object
          setProduct(res?.data || res);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load product details');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
        <div className="h-6 w-36 bg-gray-200 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-200 rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-12 bg-gray-200 rounded w-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
            <PackageCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {error || 'Product Not Found'}
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            The product you are looking for might have been removed or is temporarily unavailable.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-md shadow-blue-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToProducts}</span>
          </button>
        </div>
      </div>
    );
  }

  const productName = lang === 'bn' && product.nameBn ? product.nameBn : product.name;
  const productDescription = lang === 'bn' && product.descriptionBn ? product.descriptionBn : product.description;
  const inWishlist = isInWishlist(product.id);
  const inCart = isInCart(product.id);

  const additionalPrice = selectedVariant?.additionalPrice || 0;
  const currentPrice = (product.price || 0) + additionalPrice;
  const comparePrice = product.compareAtPrice ? product.compareAtPrice + additionalPrice : null;
  const savings = comparePrice ? comparePrice - currentPrice : 0;
  const isOutOfStock = product.stockQuantity <= 0;

  const handleIncrement = () => {
    if (quantity < product.stockQuantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock || isCartLoading) return;

    setIsCartLoading(true);
    try {
      const productToAdd = {
        ...product,
        price: currentPrice,
        selectedVariant: selectedVariant || null
      };

      await addToCart(productToAdd, quantity);
      setIsCartSuccess(true);
      showToast(
        `${quantity}x ${productName} ${t.addedToCart}`,
        'cart',
        'View Cart',
        () => setIsCartOpen(true)
      );

      setTimeout(() => {
        setIsCartSuccess(false);
      }, 2000);
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (isWishlistLoading) return;

    setIsWishlistLoading(true);
    try {
      const added = await toggleWishlist(product);
      if (added) {
        showToast(`${productName} ${t.addedToWishlist}`, 'wishlist');
      } else {
        showToast(
          `${productName} ${lang === 'bn' ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'removed from wishlist'}`,
          'wishlist'
        );
      }
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      showToast(
        lang === 'bn' ? 'লিংক কপি করা হয়েছে!' : 'Product link copied to clipboard!',
        'info'
      );
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Navigation Breadcrumb & Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition group bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{t.backToProducts}</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-gray-500 font-medium">
          <span className="hover:text-gray-900 cursor-pointer" onClick={onBack}>Home</span>
          <span>/</span>
          <span className="text-blue-600 font-semibold">{product.categoryName}</span>
          <span>/</span>
          <span className="text-gray-800 line-clamp-1 max-w-[200px]">{productName}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-gray-100 shadow-sm">
        {/* Left: Product Image */}
        <div className="lg:col-span-6 flex flex-col justify-start">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group shadow-inner">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={productName}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <PackageCheck className="w-16 h-16" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isFeatured && (
                <span className="bg-rose-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Hot Deal</span>
                </span>
              )}
              {savings > 0 && (
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  Save {t.bdt} {savings.toLocaleString()}
                </span>
              )}
            </div>

            {/* Floating Share Button */}
            <button
              onClick={handleShare}
              title="Share product"
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur hover:bg-white text-gray-600 hover:text-blue-600 shadow-md transition-all hover:scale-110"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category & SKU */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {product.categoryName}
              </span>
              {product.sku && (
                <span className="text-xs text-gray-400 font-mono">
                  SKU: {product.sku}
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">
              {productName}
            </h1>

            {/* Ratings & Reviews */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-amber-50 px-2.5 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-gray-900">{product.rating || 4.8}</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                ({product.reviewCount || 0} customer reviews)
              </span>
              <span className="text-gray-300">•</span>
              <span className={`text-xs font-bold ${isOutOfStock ? 'text-rose-500' : 'text-emerald-600'}`}>
                {isOutOfStock ? t.outOfStock : `${product.stockQuantity} ${t.inStock}`}
              </span>
            </div>

            {/* Pricing Section */}
            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-baseline space-x-3">
              <span className="text-3xl font-black text-gray-900">
                {t.bdt} {currentPrice.toLocaleString()}
              </span>
              {comparePrice && (
                <span className="text-base text-gray-400 line-through">
                  {t.bdt} {comparePrice.toLocaleString()}
                </span>
              )}
              {savings > 0 && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {Math.round((savings / comparePrice) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Variants Selector (if available) */}
            {Array.isArray(product.variants) && product.variants.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Select Variant:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const label = [v.color, v.size, v.type].filter(Boolean).join(' - ') || 'Standard';
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-400'
                        }`}
                      >
                        {label} {v.additionalPrice > 0 && `(+৳${v.additionalPrice})`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                {t.quantity}:
              </label>
              <div className="flex items-center space-x-4">
                <div className="inline-flex items-center border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-2.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantity >= product.stockQuantity || isOutOfStock}
                    className="p-2.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  Total: <strong className="text-gray-800">{t.bdt} {(currentPrice * quantity).toLocaleString()}</strong>
                </span>
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Add to Wishlist */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-4">
              {/* Add To Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isCartLoading}
                className={`sm:col-span-7 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all duration-200 shadow-md ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : isCartSuccess
                    ? 'bg-emerald-600 text-white shadow-emerald-500/30 scale-[1.01]'
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-blue-500/25'
                }`}
              >
                {isCartLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Adding to Cart...</span>
                  </>
                ) : isCartSuccess ? (
                  <>
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    <span>{t.addedToCart}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>{t.addToCart}</span>
                  </>
                )}
              </button>

              {/* Add To Wishlist Button */}
              <button
                onClick={handleToggleWishlist}
                disabled={isWishlistLoading}
                className={`sm:col-span-5 py-3.5 px-5 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all duration-200 border ${
                  inWishlist
                    ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/30'
                } ${isWishlistLoading ? 'opacity-80 cursor-wait' : 'active:scale-[0.98]'}`}
              >
                {isWishlistLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Heart
                      className={`w-5 h-5 transition-transform duration-300 ${
                        inWishlist ? 'text-rose-500 fill-rose-500 scale-110' : ''
                      }`}
                    />
                    <span>{inWishlist ? t.inWishlist : t.addToWishlist}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Delivery & Assurance Perks */}
          <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-100 text-xs">
            <div className="flex items-center space-x-2.5 text-gray-600">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <span className="font-semibold">{t.fastDelivery}</span>
            </div>
            <div className="flex items-center space-x-2.5 text-gray-600">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-semibold">{t.authenticGuarantee}</span>
            </div>
            <div className="flex items-center space-x-2.5 text-gray-600">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 flex-shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <span className="font-semibold">{t.easyReturns}</span>
            </div>
            <div className="flex items-center space-x-2.5 text-gray-600">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-semibold">{t.secureCheckout}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Details Tab */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
          {t.productDetails}
        </h3>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
          {productDescription || 'No description provided for this product.'}
        </p>
      </div>
    </div>
  );
}
