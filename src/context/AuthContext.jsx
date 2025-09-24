// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

// 1. Creamos el contexto
export const AuthContext = createContext(null);

// 2. Creamos el proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token')); // Leemos el token del localStorage
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si hay un token, podríamos verificarlo con el backend para obtener los datos del usuario.
    // Por ahora, si hay token, asumimos que el usuario está logueado.
    // Una implementación más robusta validaría el token aquí.
    if (token) {
      // Aquí podrías decodificar el token o hacer una llamada a /api/profile/me
      // Para simplificar, lo dejamos así por ahora.
    }
    setLoading(false);
  }, [token]);

  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const authContextValue = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token, // Es true si hay un token, si no, es false
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};