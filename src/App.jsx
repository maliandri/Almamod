// src/App.jsx
import React, { useState, useContext } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import { AuthContext } from './context/AuthContext';

// --- Imports ---
import logoAlmamod from './assets/almamod.webp';
import CalculadoraModulo from './components/CalculadoraModulo.jsx';
import ObrasCarousel from './components/ObrasCarousel.jsx';
import Ubicacion from './components/Ubicacion.jsx';
import SocialButton from './components/SocialButton.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import LoginForm from './components/LoginForm.jsx';
import PageLayout from './components/PageLayout.jsx';
import VerifyEmail from './components/VerifyEmail.jsx';
import ServiciosCarousel from './components/ServiciosCarousel.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import TiendaAlma from './components/TiendaAlma.jsx';
import Certificaciones from './components/Certificaciones.jsx';

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
// Componente principal App (controla toda la estructura)
// ====================================================================
function App() {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estados para controlar la visibilidad de los modales de login/registro
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirige al inicio al cerrar sesión
  };

  return (
    <div className="App">
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
          <nav className="header-nav">
            {isAuthenticated ? (
              <>
                <span className="nav-user-greeting">Hola, {user?.fullName}</span>
                <button onClick={handleLogout} className="nav-link-button">
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                {/* 
                <button onClick={() => setShowRegister(true)} className="nav-link-button">
                  Registrarse
                </button>
                <button onClick={() => setShowLogin(true)} className="nav-link-button">
                  Iniciar Sesión
                </button>
                */}
              </>
            )}
          </nav>
        </div>
      </header>

      {/* MODALES DE LOGIN Y REGISTRO (comentados si se desactivan botones) */}
      {showRegister && (
        <div className="form-modal-overlay" onClick={() => setShowRegister(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <RegisterForm closeModal={() => setShowRegister(false)} />
          </div>
        </div>
      )}
      {showLogin && (
        <div className="form-modal-overlay" onClick={() => setShowLogin(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <LoginForm closeModal={() => setShowLogin(false)} />
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/verify-email"
            element={
              <PageLayout>
                <VerifyEmail />
              </PageLayout>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PageLayout>
                <ResetPassword />
              </PageLayout>
            }
          />
        </Routes>
      </main>

      {/* BOTONES FLOTANTES */}
      <div className="floating-buttons-container">
        <TiendaAlma />
        <ObrasCarousel />
        {/* <CalculadoraModulo /> */}
        <Ubicacion />
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
      </div>

      {/* FOOTER */}
      <footer className="main-footer">
        <p>&copy; 2025 Almamod. Todos los derechos reservados.</p>
        <p>Neuquén, Argentina</p>
      </footer>
    </div>
  );
}

export default App;
