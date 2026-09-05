import React from 'react';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const OrderSuccessPage = ({ order, onContinueShopping }) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xl space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">{t.orderSuccess}</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Thank you for shopping with us! We have received your order and are preparing it for shipment.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 text-left space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">{t.orderNumber}:</span>
            <span className="font-mono font-bold text-gray-900">{order?.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Customer:</span>
            <span className="font-semibold text-gray-900">{order?.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Status:</span>
            <span className="font-bold text-emerald-600">
              {order?.paymentStatus === 3 ? 'Paid Successfully' : 'Payment Received / Confirmed'}
            </span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-sm text-gray-900">
            <span>Total Paid:</span>
            <span className="text-blue-600">{t.bdt} {order?.totalAmount?.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={onContinueShopping}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
      </div>
    </div>
  );
};
