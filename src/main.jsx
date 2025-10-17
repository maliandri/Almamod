import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import './App.css';
import { AuthProvider } from './context/AuthContext.jsx';

const rootElement = document.getElementById('root');

// Componente wrapper con todos los providers
const AppWithProviders = () => (
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

// Soporte para pre-rendering con react-snap
if (rootElement.hasChildNodes()) {
  ReactDOM.hydrateRoot(rootElement, <AppWithProviders />);
} else {
  ReactDOM.createRoot(rootElement).render(<AppWithProviders />);
}