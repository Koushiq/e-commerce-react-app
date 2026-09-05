import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, getStoredTokens, setStoredTokens, clearStoredTokens } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { token, user: storedUser } = getStoredTokens();
    if (token && storedUser) {
      setUser(storedUser);
    }
    setLoading(false);

    const handleLogoutEvent = () => {
      setUser(null);
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => window.removeEventListener('auth-logout', handleLogoutEvent);
  }, []);

  const login = async (email, password) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (res.success && res.data) {
      setStoredTokens(res.data);
      const userData = {
        id: res.data.userId,
        email: res.data.email,
        fullName: res.data.fullName,
        roles: res.data.roles
      };
      setUser(userData);
      return { success: true };
    }

    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (firstName, lastName, email, password, phoneNumber) => {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, password, phoneNumber })
    });

    if (res.success && res.data) {
      setStoredTokens(res.data);
      const userData = {
        id: res.data.userId,
        email: res.data.email,
        fullName: res.data.fullName,
        roles: res.data.roles
      };
      setUser(userData);
      return { success: true };
    }

    return { success: false, message: res.message || 'Registration failed' };
  };

  const loginWithGoogle = async (demoSuffix = 'customer') => {
    // Uses Google Token flow / local simulator token
    const simulatedToken = `demo-google-token-${demoSuffix}`;
    const res = await apiFetch('/auth/google-login', {
      method: 'POST',
      body: JSON.stringify({ idToken: simulatedToken })
    });

    if (res.success && res.data) {
      setStoredTokens(res.data);
      const userData = {
        id: res.data.userId,
        email: res.data.email,
        fullName: res.data.fullName,
        roles: res.data.roles
      };
      setUser(userData);
      return { success: true };
    }

    return { success: false, message: res.message || 'Google authentication failed' };
  };

  const logout = () => {
    clearStoredTokens();
    setUser(null);
  };

  const isAdmin = user?.roles?.includes('Admin');

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
