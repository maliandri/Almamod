// src/App.jsx - VERSIÓN FINAL REALMENTE CORREGIDA (CONECTADA A METADATA)
import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import './index.css';

// --- IMPORTS CRÍTICOS (Se cargan rápido al inicio) ---
import logoAlmamod from './assets/almamod.webp';
import SEO from './components/SEO.jsx';
import AIChatBot from './components/aichatbot';
import ThemeToggle from './components/ThemeToggle.jsx';
import SocialButton from './components/SocialButton.jsx';
import PageLayout from './components/PageLayout.jsx';

// --- IMPORT DE METADATA (TU CEREBRO SEO) ---
// Asegúrate de que seo-metadata.js esté en src/utils/
import { PAGE_METADATA } from './utils/seo-metadata';

// --- LAZY LOADING (Mejora velocidad inicial) ---
// Estos componentes solo se descargan cuando se necesitan
const TiendaAlma = lazy(() => import('./components/TiendaAlma.jsx'));
const ObrasCarousel = lazy(() => import('./components/ObrasCarousel.jsx'));
const Ubicacion = lazy(() => import('./components/Ubicacion.jsx'));
const SistemaConstructivo = lazy(() => import('./components/SistemaConstructivo.jsx'));
// Si tienes un icono específico para importar, hazlo así:
// import { SistemaConstructivoIcon } from './components/SistemaConstructivo.jsx';
// O si es default export, úsalo como componente normal.

const ServiciosCarousel = lazy(() => import('./components/ServiciosCarousel.jsx'));
const Certificaciones = lazy(() => import('./components/Certificaciones.jsx'));

// Componente de carga mientras llegan las páginas
const LoadingFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="animate-pulse text-brand-gold text-xl font-semibold p-8">
      Cargando experiencia AlmaMod...
    </div>
  </div>
);

// ====================================================================
// PÁGINA DE INICIO (OPTIMIZADA Y CONECTADA A METADATA)
// ====================================================================
function HomePage() {
  // AQUÍ ESTÁ LA MAGIA: Usamos los datos de tu archivo central
  const meta = PAGE_METADATA.home;

  return (
    <PageLayout>
      {/* Inyectamos SEO automáticamente desde el archivo central */}
      <SEO
        title={meta.title}
        description={meta.description}
        keywords={meta.keywords}
        schema={meta.schema}
        canonical="/"
      />
      
      {/* Hero Section (Mantengo tu estructura original de header para no romper estilos) */}
      <header className="hero-section">
        <div className="hero-content-wrapper">
          <div className="hero-branding">
            <Link to="/" aria-label="Ir a inicio de AlmaMod">
              <img src={logoAlmamod} alt="AlmaMod - Construcción Modular en Neuquén" className="hero-logo" width="180" height="60" />
            </Link>
          </div>
          <div className="hero-text-container fade-in-up">
            <h1>El Futuro de la <span className="text-brand-gold">Construcción Modular</span></h1>
            <p>Viviendas sustentables certificadas • Entrega en 60 días • Neuquén, Patagonia</p>
          </div>
        </div>
      </header>

      {/* Secciones principales cargadas bajo demanda */}
      <Suspense fallback={<div className="h-96" />}>
        <section className="py-16 px-4">
          <ServiciosCarousel />
        </section>

        <section className="py-16 bg-gray-50 dark:bg-gray-900/50 transition-colors duration-300">
          <Certificaciones />
        </section>
      </Suspense>
    </PageLayout>
  );
}

// ====================================================================
// COMPONENTE PRINCIPAL APP
// ====================================================================
function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll automático hacia arriba al cambiar de ruta
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Inicializar tema (mantengo tu lógica que ya funcionaba bien)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Funciones de navegación (igual que antes)
  const openSistemaConstructivo = () => navigate('/sistema-constructivo');
  const openTiendaAlma = () => navigate('/tiendaalma');
  const openObras = () => navigate('/obras');
  const openUbicacion = () => navigate('/ubicacion');

  // Helpers para modales
  const isHome = location.pathname === '/';
  const isSistemaOpen = location.pathname === '/sistema-constructivo';
  const isObrasOpen = location.pathname === '/obras';
  const isUbicacionOpen = location.pathname === '/ubicacion';
  const isTiendaRoute = location.pathname.startsWith('/tiendaalma');

  return (
    <div className="App min-h-screen flex flex-col bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary transition-colors duration-300">
      
      {/* --- ELEMENTOS FLOTANTES GLOBAL --- */}
      <ThemeToggle />

      {/* --- CONTENIDO PRINCIPAL (RUTAS) --- */}
      <main className="flex-grow">
        {/* Siempre mostramos HomePage de fondo si estamos en rutas "modal" */}
        {(isHome || isSistemaOpen || isObrasOpen || isUbicacionOpen) && <HomePage />}

        {/* Suspense para cargar los componentes pesados solo cuando hacen falta */}
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Rutas principales */}
            <Route path="/" element={null} /* Ya renderizado arriba */ />
            <Route path="/tiendaalma/*" element={<TiendaAlma />} />
            
            {/* Rutas que actúan como modales sobre la home */}
            <Route path="/sistema-constructivo" element={
              <SistemaConstructivo isOpen={true} onClose={() => navigate('/')} />
            } />
            <Route path="/obras" element={
              <ObrasCarousel isOpen={true} onClose={() => navigate('/')} />
            } />
            <Route path="/ubicacion" element={
              <Ubicacion isOpen={true} onClose={() => navigate('/')} />
            } />
            
            {/* 404 */}
            <Route path="*" element={
              !isHome && !isSistemaOpen && !isObrasOpen && !isUbicacionOpen && !isTiendaRoute ? (
                <div className="text-center py-20">
                  <h2>Página no encontrada</h2>
                  <Link to="/" className="btn-primary mt-4 inline-block">Volver al Inicio</Link>
                </div>
              ) : null
            } />
          </Routes>
        </Suspense>
      </main>

      {/* --- BARRA LATERAL DE NAVEGACIÓN (Tus botones flotantes) --- */}
      <div className="floating-buttons-container">
        <button className="floating-button tienda-button" onClick={openTiendaAlma} title="Ver Modelos">
          <span className="text-xl">🏠</span>
          <span className="button-label">Modelos</span>
        </button>
        <button className="floating-button" onClick={openObras} title="Nuestras Obras">
           <span className="text-xl">🔨</span>
           <span className="button-label">Obras</span>
        </button>
        <button className="floating-button" onClick={openUbicacion} title="Ubicación">
           <span className="text-xl">📍</span>
           <span className="button-label">Ubicación</span>
        </button>
        
        <hr className="separator opacity-20 my-2" />
        
        {/* Redes Sociales */}
        <div className="flex flex-col gap-2 items-center">
          <SocialButton platform="whatsapp" url="https://wa.me/542994087106" label="WhatsApp" />
          <SocialButton platform="instagram" url="https://instagram.com/_almamod_" label="Instagram" />
        </div>

        <hr className="separator opacity-20 my-2" />

        <button className="floating-button sistema-constructivo-button" onClick={openSistemaConstructivo} title="Sistema Constructivo">
           <span className="text-xl">🏗️</span>
           <span className="button-label">Sistema</span>
        </button>

        <div className="mt-auto pt-4">
           <AIChatBot />
        </div>
      </div>

      {/* --- FOOTER OPTIMIZADO (Sin JS innecesario) --- */}
      <footer className="main-footer bg-gray-100 dark:bg-gray-950 py-8 mt-auto border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center md:text-left grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna 1: Logo y copy */}
          <div className="flex flex-col items-center md:items-start">
            <img src={logoAlmamod} alt="AlmaMod Logo" className="h-12 w-auto mb-4 opacity-90" />
            <p className="text-sm opacity-75 max-w-xs">
              Construcción modular inteligente en la Patagonia Argentina. Calidad, rapidez y eficiencia energética.
            </p>
          </div>
          
          {/* Columna 2: Enlaces Rápidos (Usando clases CSS para hover, NO JS) */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-semibold mb-4 text-brand-gold">Enlaces Rápidos</h4>
            <nav className="flex flex-col gap-2">
               <Link to="/" className="hover:text-brand-gold transition-colors duration-200">Inicio</Link>
               <Link to="/tiendaalma" className="hover:text-brand-gold transition-colors duration-200">Modelos Disponibles</Link>
               <Link to="/sistema-constructivo" className="hover:text-brand-gold transition-colors duration-200">Tecnología SIP</Link>
               <Link to="/obras" className="hover:text-brand-gold transition-colors duration-200">Proyectos Entregados</Link>
            </nav>
          </div>

          {/* Columna 3: Contacto */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-semibold mb-4 text-brand-gold">Contacto</h4>
            <address className="not-italic flex flex-col gap-2 opacity-80">
              <a href="mailto:info@almamod.com.ar" className="hover:text-brand-gold transition-colors duration-200 flex items-center gap-2">
                <span>📧</span> info@almamod.com.ar
              </a>
              <a href="tel:+5492994087106" className="hover:text-brand-gold transition-colors duration-200 flex items-center gap-2">
                <span>📞</span> +54 9 299 408-7106
              </a>
              <p className="flex items-center gap-2">
                <span>📍</span> Neuquén Capital, Argentina
              </p>
            </address>
          </div>
        </div>
        
        {/* Copyright Bar */}
        <div className="text-center mt-8 pt-8 border-t border-gray-300 dark:border-gray-800 opacity-60 text-sm">
          © {new Date().getFullYear()} AlmaMod. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

export default App;