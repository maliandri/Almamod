import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import AIChatBot from './aichatbot';
import './AlmitaPage.css';

function AlmitaPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Helmet>
        <title>Almita - Tu Asistente Virtual de AlmaMod | Construcción Modular en Neuquén</title>
        <meta name="description" content="Conocé a Almita, tu asesora virtual de AlmaMod. Consultá sobre nuestros modelos, precios, tiempos de entrega y financiación. Disponible 24/7 para ayudarte con tu proyecto de construcción modular." />
        <meta name="keywords" content="almita, chatbot, asistente virtual, almamod, construcción modular, neuquén, consultas, asesoramiento" />
        <link rel="canonical" href="https://almamod.com.ar/almita" />

        {/* Open Graph */}
        <meta property="og:title" content="Almita - Tu Asistente Virtual de AlmaMod" />
        <meta property="og:description" content="Conocé a Almita, tu asesora virtual disponible 24/7 para ayudarte con tu proyecto de construcción modular." />
        <meta property="og:url" content="https://almamod.com.ar/almita" />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Almita - Tu Asistente Virtual de AlmaMod" />
        <meta name="twitter:description" content="Conocé a Almita, tu asesora virtual disponible 24/7 para ayudarte con tu proyecto de construcción modular." />
      </Helmet>

      <div className="almita-page">
        <div className="almita-hero">
          <div className="almita-hero-content">
            <div className="almita-avatar-large">
              <span className="robot-emoji">🤖</span>
            </div>
            <h1 className="almita-title">¡Hola! Soy Almita</h1>
            <p className="almita-subtitle">Tu asesora virtual de AlmaMod</p>
            <p className="almita-description">
              Estoy acá para ayudarte a encontrar el módulo perfecto para tu proyecto.
              Consultame sobre modelos, precios, tiempos de entrega, financiación y todo lo que necesites saber.
            </p>
          </div>
        </div>

        <div className="almita-features">
          <div className="almita-feature">
            <div className="feature-icon">💬</div>
            <h3>Respuestas Instantáneas</h3>
            <p>Obtené información sobre nuestros productos al instante</p>
          </div>

          <div className="almita-feature">
            <div className="feature-icon">🏠</div>
            <h3>Asesoramiento Personalizado</h3>
            <p>Te ayudo a encontrar el modelo ideal según tus necesidades</p>
          </div>

          <div className="almita-feature">
            <div className="feature-icon">⏰</div>
            <h3>Disponible 24/7</h3>
            <p>Consultá cuando quieras, estoy siempre disponible</p>
          </div>

          <div className="almita-feature">
            <div className="feature-icon">📞</div>
            <h3>Contacto Directo</h3>
            <p>Si lo necesitás, te conecto con nuestro equipo humano</p>
          </div>
        </div>

        <div className="almita-cta">
          <h2>¿Listo para empezar?</h2>
          <p>Hacé clic en el botón del chatbot a la derecha para comenzar a conversar conmigo</p>
          <div className="almita-arrow-down">
            →
          </div>
        </div>
      </div>

      {/* El chatbot siempre se renderiza */}
      {mounted && <AIChatBot />}
    </>
  );
}

export default AlmitaPage;
