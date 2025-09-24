// frontend/src/App.jsx
import React, { useContext } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { AuthContext } from './context/AuthContext';

// Importa todos tus componentes y assets
import logoAlmamod from './assets/almamod.jpg';
import CalculadoraModulo from './components/CalculadoraModulo.jsx';
import ObrasCarousel from './components/ObrasCarousel.jsx';
import Ubicacion from './components/Ubicacion.jsx';
import SocialButton from './components/SocialButton.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import LoginForm from './components/LoginForm.jsx';
import PageLayout from './components/PageLayout.jsx';
import VerifyEmail from './components/VerifyEmail.jsx'; // <-- 1. Import que faltaba

// ====================================================================
// Componente para la página de inicio (ahora más simple)
// ====================================================================
function HomePage() {
  // Ahora solo contiene la sección con el fondo animado
  return (
    <section className="animation-section">
      <div className="animation-content-wrapper">
        {/* Puedes poner contenido específico de la home page aquí si quieres */}
      </div>
    </section>
  );
}

// ====================================================================
// Componente principal App (ahora controla toda la estructura)
// ====================================================================
function App() {
  const { isAuthenticated, logout, user } = useContext(AuthContext);

  return (
    <div className="App">
      {/* HEADER (Visible en todas las páginas) */}
      <header className="hero-section">
        <div className="hero-content-wrapper">
          <div className="hero-branding">
            <Link to="/">
              <img src={logoAlmamod} alt="Logo de Almamod" className="hero-logo" />
            </Link>
            <div className="hero-text-container">
              <h1>Estamos en Neuquén, Somos de Neuquén</h1>
              <p>Soluciones habitacionales</p>
            </div>
          </div>
          <nav className="header-nav">
            {isAuthenticated ? (
              <>
                <span className="nav-user-greeting">Hola, {user?.fullName}</span>
                <button onClick={logout} className="nav-link-button">
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/registro" className="nav-link">Registrarse</Link>
                <Link to="/login" className="nav-link">Iniciar Sesión</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL (Cambia según la ruta) */}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} /> {/* <-- 2. Ruta de inicio que faltaba */}
          <Route path="/registro" element={<PageLayout><RegisterForm /></PageLayout>} />
          <Route path="/login" element={<PageLayout><LoginForm /></PageLayout>} />
          <Route path="/verify-email" element={<PageLayout><VerifyEmail /></PageLayout>} />
        </Routes>
      </main>

      {/* BOTONES FLOTANTES (Visibles en todas las páginas) */}
      {/* 3. Movimos los botones aquí para que siempre estén visibles */}
      <div className="floating-buttons-container">
        <ObrasCarousel />
        <CalculadoraModulo />
        <Ubicacion />
        <hr className="separator" />
        <SocialButton 
          platform="whatsapp" 
          label="WhatsApp" 
          url="https://wa.me/542995414422"
        />
        <SocialButton 
          platform="instagram" 
          label="Instagram" 
          url="https://instagram.com/TUUSUARIO"
        />
        <SocialButton 
          platform="facebook" 
          label="Facebook" 
          url="https://facebook.com/TUPAGINA"
        />
      </div>

      {/* FOOTER (Visible en todas las páginas) */}
      {/* 4. Movimos el footer aquí para que siempre esté visible */}
      <footer className="main-footer">
        <p>&copy; 2025 Almamod. Todos los derechos reservados.</p>
        <p>Neuquén, Argentina</p>
      </footer>
    </div>
  );
}

export default App;