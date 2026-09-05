const API_BASE_URL = 'http://localhost:5000/api';

export const getStoredTokens = () => {
  const token = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  return { token, refreshToken, user };
};

export const setStoredTokens = (data) => {
  if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
  if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
  if (data.userId) {
    localStorage.setItem('user', JSON.stringify({
      id: data.userId,
      email: data.email,
      fullName: data.fullName,
      roles: data.roles || []
    }));
  }
};

export const clearStoredTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export const apiFetch = async (endpoint, options = {}) => {
  const { token, refreshToken } = getStoredTokens();
  const language = localStorage.getItem('preferred_lang') || 'en-US';

  const headers = {
    'Content-Type': 'application/json',
    'Accept-Language': language === 'bn' ? 'bn-BD' : 'en-US',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle Token Refresh on 401 Unauthorized
  if (response.status === 401 && refreshToken) {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.success && refreshData.data) {
          setStoredTokens(refreshData.data);
          headers['Authorization'] = `Bearer ${refreshData.data.accessToken}`;
          // Retry original request
          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
          });
        }
      } else {
        clearStoredTokens();
        window.dispatchEvent(new Event('auth-logout'));
      }
    } catch {
      clearStoredTokens();
      window.dispatchEvent(new Event('auth-logout'));
    }
  }

  return response.json();
};
