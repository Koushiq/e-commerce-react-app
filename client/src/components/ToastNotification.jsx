import React from 'react';
import { CheckCircle2, Heart, Info, X, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ToastNotification = () => {
  const { toast, hideToast, setIsCartOpen } = useCart();

  if (!toast) return null;

  const isWishlist = toast.type === 'wishlist';
  const isCart = toast.type === 'cart';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-sm">
      <div className={`p-2 rounded-xl flex-shrink-0 ${
        isWishlist
          ? 'bg-rose-50 text-rose-500'
          : isCart
          ? 'bg-emerald-50 text-emerald-600'
          : 'bg-blue-50 text-blue-600'
      }`}>
        {isWishlist ? (
          <Heart className="w-5 h-5 fill-rose-500" />
        ) : isCart ? (
          <ShoppingBag className="w-5 h-5 text-emerald-600" />
        ) : (
          <Info className="w-5 h-5" />
        )}
      </div>

      <div className="flex-1 text-sm font-medium text-gray-800">
        {toast.message}
      </div>

      {toast.actionText && toast.onAction ? (
        <button
          onClick={() => {
            toast.onAction();
            hideToast();
          }}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 underline flex-shrink-0"
        >
          {toast.actionText}
        </button>
      ) : isCart ? (
        <button
          onClick={() => {
            setIsCartOpen(true);
            hideToast();
          }}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 underline flex-shrink-0"
        >
          View Cart
        </button>
      ) : null}

      <button
        onClick={hideToast}
        className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
