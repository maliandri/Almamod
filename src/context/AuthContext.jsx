import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

function decodeExpiry(token) {
  try {
    return JSON.parse(atob(token.split('.')[1])).exp * 1000;
  } catch { return 0; }
}

async function refreshSession(refreshToken) {
  const res = await fetch('/.netlify/functions/auth-refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) return null;
  return res.json();
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]                   = useState(null);
  const [token, setToken]                 = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading]             = useState(true);

  const applySession = (userData, accessToken, refreshToken) => {
    localStorage.setItem('token',         accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user',          JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const init = async () => {
      const savedToken   = localStorage.getItem('token');
      const savedRefresh = localStorage.getItem('refresh_token');
      const savedUser    = localStorage.getItem('user');

      if (!savedToken || !savedUser) { setLoading(false); return; }

      try {
        const expiry    = decodeExpiry(savedToken);
        const isExpired = Date.now() > expiry - 60_000; // 1 min de margen

        if (!isExpired) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        } else if (savedRefresh) {
          const data = await refreshSession(savedRefresh);
          if (data?.token) {
            applySession(data.user, data.token, data.refresh_token);
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    init();

    const onTokenRefreshed = (e) => {
      const { token: newToken, refresh_token: newRefresh, user: newUser } = e.detail;
      if (newToken) applySession(newUser, newToken, newRefresh);
    };
    window.addEventListener('auth:token-refreshed', onTokenRefreshed);
    return () => window.removeEventListener('auth:token-refreshed', onTokenRefreshed);
  }, []);

  // Renovar el token 5 minutos antes de que expire
  useEffect(() => {
    if (!token) return;
    const expiry = decodeExpiry(token);
    const delay  = expiry - Date.now() - 5 * 60_000; // 5 min antes
    if (delay <= 0) return;
    const timer = setTimeout(async () => {
      const savedRefresh = localStorage.getItem('refresh_token');
      if (!savedRefresh) return;
      const data = await refreshSession(savedRefresh);
      if (data?.token) applySession(data.user, data.token, data.refresh_token);
      else logout();
    }, delay);
    return () => clearTimeout(timer);
  }, [token]);

  const login = (userData, accessToken, refreshToken = '') => {
    applySession(userData, accessToken, refreshToken);
  };

  const updateUser = (newUserData) => {
    const updated = { ...user, ...newUserData };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
