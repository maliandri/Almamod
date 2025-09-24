import React from 'react';
import './App.css';

// Importa todos tus componentes
import logoAlmamod from './assets/almamod.jpg'; 
import LottieAnimation from './components/LottieAnimation.jsx';
import CalculadoraModulo from './components/CalculadoraModulo.jsx';
import ObrasCarousel from './components/ObrasCarousel.jsx';
import Ubicacion from './components/Ubicacion.jsx';
import SocialButton from './components/SocialButton.jsx';

function App() {
  return (
    <div className="App">
      
      {/* HEADER */}
      <header className="hero-section">
        <div className="hero-content-wrapper">
          <div className="hero-logo-container">
            <img src={logoAlmamod} alt="Logo de Almamod" className="hero-logo" />
          </div>
          <div className="hero-text-container">
            <h1>Estamos en Neuquén, Somos de Neuquén</h1>
            <p>Soluciones habitacionales</p>
          </div>
        </div>
      </header>

      {/* SECCIÓN DE ANIMACIÓN con el wrapper correcto */}
      <section className="animation-section">
        <div className="animation-content-wrapper">
          <div className="animation-container">
            <LottieAnimation />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="main-footer">
        <p>&copy; 2025 Almamod. Todos los derechos reservados.</p>
        <p>Neuquén, Argentina</p>
      </footer>

      {/* CONTENEDOR PARA LOS BOTONES FLOTANTES */}
      <div className="floating-buttons-container">
        {/* Herramientas */}
        <ObrasCarousel />
        <CalculadoraModulo />
        <Ubicacion />
        
        <hr className="separator" />
        
        {/* Redes Sociales */}
        <SocialButton 
          platform="whatsapp" 
          label="WhatsApp" 
          url="https://wa.me/542995414422" // URL real
        />
        <SocialButton 
          platform="instagram" 
          label="Instagram" 
          url="https://instagram.com/TUUSUARIO" // Reemplazar
        />
        <SocialButton 
          platform="facebook" 
          label="Facebook" 
          url="https://facebook.com/TUPAGINA" // Reemplazar
        />
      </div>

    </div>
  );
}

export default App;