import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OrdersPage } from './pages/OrdersPage';
import { useCart } from './context/CartContext';
import { useLanguage } from './context/LanguageContext';

export function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'checkout', 'success', 'login', 'register', 'orders'
  const [searchTerm, setSearchTerm] = useState('');
  const [recentOrder, setRecentOrder] = useState(null);
  const { t } = useLanguage();

  const handleOrderPlaced = (order) => {
    setRecentOrder(order);
    setCurrentView('success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* Cart Drawer */}
      <CartDrawer
        onCheckout={() => setCurrentView('checkout')}
      />

      {/* Main Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {currentView === 'home' && (
          <HomePage
            searchTerm={searchTerm}
            onSelectProduct={() => {}}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onOrderPlaced={handleOrderPlaced}
          />
        )}

        {currentView === 'success' && (
          <OrderSuccessPage
            order={recentOrder}
            onContinueShopping={() => setCurrentView('home')}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onSwitchToRegister={() => setCurrentView('register')}
            onLoginSuccess={() => setCurrentView('home')}
          />
        )}

        {currentView === 'register' && (
          <RegisterPage
            onSwitchToLogin={() => setCurrentView('login')}
            onRegisterSuccess={() => setCurrentView('home')}
          />
        )}

        {currentView === 'orders' && (
          <OrdersPage />
        )}
      </main>

      {/* Modern Footer */}
      <footer className="bg-white border-t border-gray-200 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-bold text-gray-900 text-base tracking-tight">NexStore Bangladesh</span>
            <p className="text-xs text-gray-400 mt-1">Built with ASP.NET Core (.NET 10), CQRS, Identity, bKash & SSLCommerz</p>
          </div>
          <div className="flex items-center space-x-6 text-xs text-gray-500 font-medium">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>API Docs (Swagger)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
