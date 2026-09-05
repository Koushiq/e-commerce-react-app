import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../api/client';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const CheckoutPage = ({ onOrderPlaced }) => {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: user?.fullName || 'Customer User',
    email: user?.email || 'customer@ecommerce.com',
    phone: '01712345678',
    address: 'House 42, Road 11, Banani',
    city: 'Dhaka',
    postalCode: '1213',
    paymentMethod: 2 // 1: CashOnDelivery, 2: Bkash, 3: SslCommerz
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Simulation modal states for bKash & SSLCommerz
  const [gatewayModal, setGatewayModal] = useState(null); // { type: 'bkash' | 'sslcommerz', orderId, paymentId, amount }
  const [otpOrPin, setOtpOrPin] = useState('');

  const shippingFee = 60;
  const grandTotal = subtotal + shippingFee;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const orderPayload = {
        userId: user?.id || null,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        paymentMethod: Number(formData.paymentMethod),
        items: cartItems.map(i => ({
          productId: i.id,
          quantity: i.quantity
        }))
      };

      const orderRes = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });

      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Failed to place order');
      }

      const createdOrder = orderRes.data;

      // Handle Cash On Delivery
      if (Number(formData.paymentMethod) === 1) {
        clearCart();
        onOrderPlaced(createdOrder);
        return;
      }

      // Initiate Payment for bKash or SSLCommerz
      const initRes = await apiFetch('/payments/initiate', {
        method: 'POST',
        body: JSON.stringify({
          orderId: createdOrder.id,
          paymentMethod: Number(formData.paymentMethod),
          callbackUrl: window.location.origin + '/payment/callback'
        })
      });

      if (!initRes.success || !initRes.data) {
        throw new Error(initRes.message || 'Payment initiation failed');
      }

      // Open realistic payment gateway modal
      setGatewayModal({
        type: Number(formData.paymentMethod) === 2 ? 'bkash' : 'sslcommerz',
        orderId: createdOrder.id,
        paymentId: initRes.data.paymentId,
        amount: grandTotal,
        orderData: createdOrder
      });

    } catch (err) {
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleExecutePayment = async () => {
    setLoading(true);
    try {
      const execRes = await apiFetch('/payments/execute', {
        method: 'POST',
        body: JSON.stringify({
          orderId: gatewayModal.orderId,
          paymentId: gatewayModal.paymentId,
          otpOrValId: otpOrPin || '1234'
        })
      });

      if (execRes.success) {
        clearCart();
        const finalOrder = gatewayModal.orderData;
        finalOrder.paymentStatus = 3; // Success
        setGatewayModal(null);
        onOrderPlaced(finalOrder);
      } else {
        setError(execRes.message || 'Payment failed');
      }
    } catch (err) {
      setError(err.message || 'Payment execution failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-black text-gray-900 mb-8">{t.checkout}</h1>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center space-x-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Delivery & Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900">1. {t.shippingAddress}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t.firstName} & {t.lastName}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t.email}</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t.phone}</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t.city}</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t.shippingAddress}</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Selection */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900">2. {t.selectPayment}</h2>

            <div className="space-y-3">
              {/* bKash */}
              <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                Number(formData.paymentMethod) === 2 ? 'border-pink-600 bg-pink-50/40' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={2}
                    checked={Number(formData.paymentMethod) === 2}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-4 h-4 text-pink-600 focus:ring-pink-500"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block text-sm">{t.payWithBkash}</span>
                    <span className="text-xs text-gray-500">Pay directly with your bKash wallet / PIN</span>
                  </div>
                </div>
                <div className="bg-[#E2136E] text-white px-3 py-1 rounded text-xs font-black">
                  bKash
                </div>
              </label>

              {/* SSLCommerz */}
              <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                Number(formData.paymentMethod) === 3 ? 'border-blue-900 bg-blue-50/40' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={3}
                    checked={Number(formData.paymentMethod) === 3}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-4 h-4 text-blue-900 focus:ring-blue-800"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block text-sm">{t.payWithSsl}</span>
                    <span className="text-xs text-gray-500">Visa, Mastercard, Nagad, Rocket, Internet Banking</span>
                  </div>
                </div>
                <div className="bg-[#13294B] text-white px-3 py-1 rounded text-xs font-black">
                  SSLCommerz
                </div>
              </label>

              {/* Cash On Delivery */}
              <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                Number(formData.paymentMethod) === 1 ? 'border-emerald-600 bg-emerald-50/40' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={1}
                    checked={Number(formData.paymentMethod) === 1}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block text-sm">{t.payWithCod}</span>
                    <span className="text-xs text-gray-500">Pay in cash when delivery arrives at your door</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded">COD</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900">Order Summary</h3>

            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
              {cartItems.map(item => (
                <div key={item.id} className="py-2.5 flex justify-between text-xs">
                  <span className="font-medium text-gray-700 truncate max-w-[150px]">
                    {item.name} <span className="text-gray-400">×{item.quantity}</span>
                  </span>
                  <span className="font-bold text-gray-900">{t.bdt} {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>{t.subtotal}</span>
                <span className="font-bold">{t.bdt} {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t.shipping}</span>
                <span className="font-bold text-emerald-600">{t.bdt} {shippingFee}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-gray-900 border-t border-gray-200 pt-2">
                <span>{t.total}</span>
                <span className="text-blue-600 text-base">{t.bdt} {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || cartItems.length === 0}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              {loading ? 'Processing...' : t.placeOrder}
            </button>
          </div>
        </div>
      </form>

      {/* bKash Payment Simulation Modal */}
      {gatewayModal?.type === 'bkash' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#E2136E] text-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-6 text-center space-y-3">
              <div className="w-14 h-14 bg-white rounded-2xl mx-auto flex items-center justify-center font-black text-[#E2136E] text-2xl shadow-inner">
                bk
              </div>
              <h3 className="text-xl font-black">bKash Payment</h3>
              <p className="text-xs text-pink-100">Merchant: NexStore BD Ltd.</p>
              <div className="bg-pink-800/40 py-2 rounded-xl text-lg font-bold">
                Amount: ৳ {gatewayModal.amount.toLocaleString()}
              </div>
            </div>

            <div className="bg-white text-gray-800 p-6 rounded-t-3xl space-y-4">
              <label className="block text-xs font-bold text-gray-600">
                Enter your bKash PIN to confirm payment:
              </label>
              <input
                type="password"
                maxLength={5}
                value={otpOrPin}
                onChange={e => setOtpOrPin(e.target.value)}
                placeholder="••••• (Try 12345)"
                className="w-full text-center text-2xl tracking-widest py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E2136E]"
              />

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setGatewayModal(null)}
                  className="flex-1 py-3 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecutePayment}
                  disabled={loading}
                  className="flex-1 py-3 bg-[#E2136E] text-white text-xs font-bold rounded-xl hover:bg-pink-700 transition shadow-md shadow-pink-500/30"
                >
                  {loading ? 'Verifying...' : 'Confirm & Pay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SSLCommerz Payment Simulation Modal */}
      {gatewayModal?.type === 'sslcommerz' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white text-gray-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#13294B] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-lg font-black tracking-tight">SSLCOMMERZ</span>
                <span className="block text-[10px] text-blue-200">Secured Payment Gateway Simulator</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-blue-200">Payable:</span>
                <span className="block font-bold text-sm">৳ {gatewayModal.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex border-b border-gray-100 pb-3 gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">Visa / Master</span>
                <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold">Nagad</span>
                <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold">Internet Banking</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Simulated Card Number</label>
                  <input
                    type="text"
                    defaultValue="4111 2222 3333 4444"
                    disabled
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Expiry</label>
                    <input
                      type="text"
                      defaultValue="12/28"
                      disabled
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">CVV / OTP</label>
                    <input
                      type="password"
                      value={otpOrPin}
                      onChange={e => setOtpOrPin(e.target.value)}
                      placeholder="123"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setGatewayModal(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecutePayment}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-[#13294B] text-white text-xs font-bold rounded-xl hover:bg-blue-900 transition shadow-md"
                >
                  {loading ? 'Validating...' : 'Complete Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
