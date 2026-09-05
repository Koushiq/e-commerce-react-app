import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { Package, Clock, CheckCircle } from 'lucide-react';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await apiFetch('/orders/my-orders');
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center space-x-3">
        <Package className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-black text-gray-900">My Order History</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100">
          <p className="text-gray-500 text-sm">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-gray-100 pb-3 text-xs">
                <div>
                  <span className="text-gray-500">Order:</span>{' '}
                  <span className="font-mono font-bold text-gray-900">{o.orderNumber}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700">
                    Paid
                  </span>
                  <span className="text-gray-400">
                    {new Date(o.createdAtUtc).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {o.items?.map(i => (
                  <div key={i.id} className="flex justify-between text-xs text-gray-700">
                    <span>{i.productName} × {i.quantity}</span>
                    <span className="font-semibold">{t.bdt} {i.totalPrice.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between border-t border-gray-100 pt-3 text-xs font-bold text-gray-900">
                <span>Total Amount:</span>
                <span className="text-blue-600 text-sm">{t.bdt} {o.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
