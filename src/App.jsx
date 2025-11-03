// src/App.jsx - VERSIÓN FINAL CORREGIDA
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import './index.css';

// --- Imports ---
import logoAlmamod from './assets/almamod.webp';
import ObrasCarousel from './components/ObrasCarousel.jsx';
import Ubicacion from './components/Ubicacion.jsx';
import SocialButton from './components/SocialButton.jsx';
import ServiciosCarousel from './components/ServiciosCarousel.jsx';
import TiendaAlma from './components/TiendaAlma.jsx';
import Certificaciones from './components/Certificaciones.jsx';
import SistemaConstructivo, { SistemaConstructivoIcon } from './components/SistemaConstructivo.jsx';
import AIChatBot from './components/aichatbot';
import ThemeToggle from './components/ThemeToggle.jsx';

// ====================================================================
// Componente para la página de inicio
// ====================================================================
function HomePage() {
  return (
    <section className="animation-section">
      <div className="animation-content-wrapper">
        <ServiciosCarousel />
        <Certificaciones />
      </div>
    </section>
  );
}

// ====================================================================
// Componente principal App
// ====================================================================
function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ INICIALIZAR TEMA AL CARGAR LA APLICACIÓN
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // ✅ FUNCIONES PARA ABRIR MODALES CON NAVEGACIÓN
  const openSistemaConstructivo = () => {
    navigate('/sistema-constructivo');
  };

  const openTiendaAlma = () => {
    navigate('/tiendaalma');
  };

  const openObras = () => {
    navigate('/obras');
  };

  const openUbicacion = () => {
    navigate('/ubicacion');
  };

  // ✅ Verificar si estamos en una ruta de TiendaAlma
  const isTiendaAlmaRoute = location.pathname.startsWith('/tiendaalma');

  return (
    <div className="App">
      {/* ✅ TOGGLE DE TEMA - Posición fija superior derecha */}
      <ThemeToggle />

      {/* HEADER */}
      <header className="hero-section">
  <div className="hero-content-wrapper">
    <div className="hero-branding">
      <Link to="/">
        <img src={logoAlmamod} alt="Logo de Almamod" className="hero-logo" />
      </Link>
    </div>
    <div className="hero-text-container">
      <h1>CONSTRUCCIÓN SIN LÍMITES</h1>
      <p>Estamos en Neuquén, Somos de Neuquén</p>
    </div>
  </div>
</header>

      {/* ✅ MODALES CONTROLADOS POR RUTAS */}
      
      {/* Sistema Constructivo */}
      <SistemaConstructivo 
        isOpen={location.pathname === '/sistema-constructivo'}
        onClose={() => navigate('/')}
      />

      {/* ✅ TiendaAlma - SOLO se renderiza si estamos en su ruta */}
      {isTiendaAlmaRoute && <TiendaAlma />}

      {/* ObrasCarousel */}
      <ObrasCarousel 
        isOpen={location.pathname === '/obras'}
        onClose={() => navigate('/')}
      />

      {/* Ubicacion */}
      <Ubicacion 
        isOpen={location.pathname === '/ubicacion'}
        onClose={() => navigate('/')}
      />

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* ✅ RUTAS PARA LOS MODALES */}
          <Route path="/sistema-constructivo" element={<HomePage />} />
          <Route path="/tiendaalma" element={null} />
          <Route path="/tiendaalma/:slug" element={null} />
          <Route path="/obras" element={<HomePage />} />
          <Route path="/ubicacion" element={<HomePage />} />
        </Routes>
      </main>

      {/* BOTONES FLOTANTES */}
      <div className="floating-buttons-container">
        {/* Botón TiendaAlma */}
        <button 
          className="floating-button tienda-button"
          onClick={openTiendaAlma}
          title="Tienda Alma"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span className="button-label">Tienda Alma</span>
        </button>

        {/* Botón Obras */}
        <button 
          className="floating-button"
          onClick={openObras}
          title="Nuestras Obras"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span className="button-label">Nuestras Obras</span>
        </button>

        {/* Botón Ubicación */}
        <button 
          className="floating-button"
          onClick={openUbicacion}
          title="Ubicación"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span className="button-label">Ubicación</span>
        </button>
        
        <hr className="separator" />
        
        <SocialButton
          platform="whatsapp"
          label="WhatsApp"
          url="https://wa.me/542994087106"
        />
        <SocialButton
          platform="instagram"
          label="Instagram"
          url="https://instagram.com/_almamod_"
        />
        <SocialButton
          platform="facebook"
          label="Facebook"
          url="https://facebook.com/61578686948419"
        />
        
        <hr className="separator" />
        
        {/* Botón Sistema Constructivo */}
        <button 
          className="floating-button sistema-constructivo-button"
          onClick={openSistemaConstructivo}
          title="Sistema Constructivo"
        >
          <SistemaConstructivoIcon />
          <span className="button-label">Sistema Constructivo</span>
        </button>
        
        <div className="separator-line"></div>
        
        <div className="mini-buttons-row">
          <AIChatBot/>
        </div>
      </div>

      {/* FOOTER */}
      <footer
        className="main-footer"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          info@almamod.com.ar
        </p>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          C. la Caña de Azúcar 18, Q8300, Neuquén, Argentina
        </p>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
          &copy; 2025 Almamod. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}

export default App;