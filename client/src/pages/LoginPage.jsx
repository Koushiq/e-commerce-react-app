import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AlertCircle } from 'lucide-react';

export const LoginPage = ({ onSwitchToRegister, onLoginSuccess }) => {
  const { login, loginWithGoogle } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('admin@ecommerce.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setError(result.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const result = await loginWithGoogle('demo');
    setLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setError(result.message);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-gray-900">{t.login}</h2>
          <p className="text-xs text-gray-500">Sign in to manage your orders, cart, and profile</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition text-sm font-semibold text-gray-700 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.14 0 9.97 0 12s.45 3.86 1.24 5.42l4.04-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{t.signInWithGoogle}</span>
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-200" />
          <span className="px-3 text-xs text-gray-400">{t.orContinueWithEmail}</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t.email}</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t.password}</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-500/20 text-sm"
          >
            {loading ? 'Authenticating...' : t.login}
          </button>
        </form>

        {/* Quick Demo Accounts */}
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/80 text-xs space-y-2">
          <div className="font-bold text-gray-700">{t.demoAccounts}</div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@ecommerce.com', 'Admin@123')}
              className="px-2 py-1 bg-white border border-gray-300 rounded text-[11px] font-semibold hover:border-blue-500 transition"
            >
              Admin (admin@ecommerce.com)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('customer@ecommerce.com', 'Customer@123')}
              className="px-2 py-1 bg-white border border-gray-300 rounded text-[11px] font-semibold hover:border-blue-500 transition"
            >
              Customer (customer@ecommerce.com)
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 font-bold hover:underline"
          >
            {t.register}
          </button>
        </div>
      </div>
    </div>
  );
};
