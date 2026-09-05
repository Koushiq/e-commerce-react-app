import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    siteTitle: 'NexStore',
    heroTag: 'Premium Quality & Authentic Products',
    heroSubtitle: 'Explore our hand-picked gadgets, authentic apparel, organic delights, and modern home essentials with fast nationwide delivery.',
    shopNow: 'Explore Deals',
    categories: 'Categories',
    allCategories: 'All Categories',
    featuredProducts: 'Featured Items',
    allProducts: 'All Products',
    searchPlaceholder: 'Search products by name or description...',
    addToCart: 'Add to Cart',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    bdt: '৳',
    cart: 'Cart',
    emptyCart: 'Your cart is empty',
    subtotal: 'Subtotal',
    shipping: 'Standard Shipping',
    total: 'Total',
    checkout: 'Proceed to Checkout',
    login: 'Login',
    register: 'Sign Up',
    logout: 'Logout',
    signInWithGoogle: 'Continue with Google',
    orContinueWithEmail: 'Or continue with email',
    email: 'Email address',
    password: 'Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone Number',
    shippingAddress: 'Shipping Address',
    city: 'City (e.g. Dhaka, Chittagong)',
    postalCode: 'Postal Code',
    selectPayment: 'Select Payment Method',
    payWithBkash: 'bKash Online Payment',
    payWithSsl: 'SSLCommerz (Card / Net Banking)',
    payWithCod: 'Cash On Delivery',
    placeOrder: 'Place & Pay',
    orderSuccess: 'Order Placed Successfully!',
    orderNumber: 'Order Number',
    adminBadge: 'Admin Area',
    demoAccounts: 'Quick Demo Logins:',
  },
  bn: {
    siteTitle: 'নেক্সস্টোর',
    heroTag: 'প্রিমিয়াম কোয়ালিটি এবং অথেনটিক পণ্য',
    heroSubtitle: 'আমাদের আধুনিক গ্যাজেট, ঐতিহ্যবাহী পোশাক, খাঁটি সুন্দরবনের মধু ও হোম ডেকর সহজে অর্ডার করুন দেশব্যাপী ডেলিভারিতে।',
    shopNow: 'অফারগুলো দেখুন',
    categories: 'ক্যাটাগরি সমূহ',
    allCategories: 'সকল ক্যাটাগরি',
    featuredProducts: 'জনপ্রিয় পণ্য',
    allProducts: 'সকল পণ্য',
    searchPlaceholder: 'পণ্যের নাম বা বিবরণ দিয়ে খুঁজুন...',
    addToCart: 'কার্টে যোগ করুন',
    inStock: 'স্টকে আছে',
    outOfStock: 'স্টক শেষ',
    bdt: '৳',
    cart: 'শপিং ব্যাগ',
    emptyCart: 'আপনার কার্ট এখন খালি',
    subtotal: 'সাবটোটাল',
    shipping: 'ডেলিভারি চার্জ',
    total: 'সর্বমোট',
    checkout: 'চেকআউট করুন',
    login: 'লগইন',
    register: 'রেজিস্ট্রেশন',
    logout: 'লগআউট',
    signInWithGoogle: 'গুগল দিয়ে প্রবেশ করুন',
    orContinueWithEmail: 'অথবা ইমেইল দিয়ে চালিয়ে যান',
    email: 'ইমেইল অ্যাড্রেস',
    password: 'পাসওয়ার্ড',
    firstName: 'নামের প্রথম অংশ',
    lastName: 'নামের শেষ অংশ',
    phone: 'মোবাইল নম্বর',
    shippingAddress: 'ডেলিভারি ঠিকানা',
    city: 'শহর (যেমন: ঢাকা, চট্টগ্রাম)',
    postalCode: 'পোস্টাল কোড',
    selectPayment: 'পেমেন্ট পদ্ধতি নির্বাচন করুন',
    payWithBkash: 'বিকাশ অনলাইন পেমেন্ট',
    payWithSsl: 'এসএসএলকমার্স (কার্ড / ইন্টারনেট ব্যাংকিং)',
    payWithCod: 'ক্যাশ অন ডেলিভারি',
    placeOrder: 'অর্ডার নিশ্চিত করুন',
    orderSuccess: 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!',
    orderNumber: 'অর্ডার নম্বর',
    adminBadge: 'অ্যাডমিন ড্যাশবোর্ড',
    demoAccounts: 'ডিমো টেস্ট একাউন্ট:',
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('preferred_lang') || 'en');

  const switchLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('preferred_lang', newLang);
  };

  const t = translations[lang] || translations.en;

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
