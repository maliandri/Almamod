// src/components/ServiciosCarousel.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ServiciosCarousel.css';
import panelSipIcon from '../assets/panel_sip_icon_64.png';

function ServiciosCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const servicios = [
    {
      id: 1,
      titulo: "Estructura con Paneles SIP",
      descripcion: "Construimos con Paneles SIP (Panel Estructural Aislado), un sistema de alta ingeniería que une placas de OSB a un núcleo de espuma rígida. El resultado es una estructura monolítica de resistencia superior y una eficiencia térmica inigualable.",
      icon: panelSipIcon,
      gradient: "linear-gradient(135deg, #6b7280, #4b5563)",
      features: ["Eficiencia Energética Superior", "Aislación Acústica", "Resistencia Estructural", "Construcción Eco-Sustentable"],
    },
    {
      id: 2,
      titulo: "Diseño y Revestimiento Exterior",
      descripcion: "Protegemos tu inversión con revestimientos exteriores de última generación que garantizan durabilidad frente al clima patagónico. Elige entre una amplia gama de acabados como chapa, siding o EIFS para lograr una estética moderna.",
      icon: "🏡",
      gradient: "linear-gradient(135deg, #f59e0b, #ea580c)",
      features: ["Alta Durabilidad", "Mínimo Mantenimiento", "Estética Personalizable", "Protección Climática"],
    },
    {
      id: 3,
      titulo: "Construcción Modular Inteligente",
      descripcion: "Nuestro sistema modular permite una flexibilidad de diseño total. Adaptamos los espacios a tus necesidades, ya sea una vivienda, oficina o local. La fabricación en taller y el rápido montaje en sitio reducen drásticamente los tiempos de obra.",
      icon: "⚙️",
      gradient: "linear-gradient(135deg, #3b82f6, #4f46e5)",
      features: ["Rapidez de Montaje", "Diseño 100% Flexible", "Control de Calidad Superior", "Potencial de Ampliación"],
    },
    {
      id: 4,
      titulo: "Hecho en Neuquén: Adaptación Regional",
      descripcion: "Conocemos el clima y la geografía de la Patagonia. Cada proyecto está pensado y fabricado en Neuquén para resistir vientos fuertes, variaciones térmicas y nevadas. Al elegirnos, apoyas la industria local y garantizas una logística más rápida.",
      icon: "🏔️",
      gradient: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
      features: ["Adaptado al Clima Patagónico", "Apoyo a la Economía Local", "Logística Eficiente", "Materiales Regionales"],
    },
    {
      id: 5,
      titulo: "Interiores a Medida",
      descripcion: "Creamos espacios interiores que reflejan tu estilo de vida o identidad de marca. Nos encargamos de todo: desde la distribución de ambientes hasta la selección de pisos, griferías, amoblamientos de cocina y placares, entregando un producto final listo para habitar.",
      icon: "🛋️",
      gradient: "linear-gradient(135deg, #84cc16, #16a34a)",
      features: ["Diseño de Interiores", "Amoblamientos Incluidos", "Terminaciones de Calidad", "Proyectos 'Llave en Mano'"],
    },
    {
      id: 6,
      titulo: "Fundaciones y Obras Civiles",
      descripcion: "Ofrecemos una solución integral que incluye el diseño y construcción de las fundaciones. Realizamos plateas de hormigón armado y sistemas de pilotes adaptados a cada tipo de suelo, garantizando una base sólida y duradera para tu proyecto modular.",
      icon: "🏗️",
      gradient: "linear-gradient(135deg, #78716c, #57534e)",
      features: ["Estudio de Suelos", "Plateas de Hormigón", "Sistemas de Pilotes", "Solución Integral"],
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === servicios.length - 1 ? 0 : prevIndex + 1
      );
    }, 12000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, servicios.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };
  
  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? servicios.length - 1 : currentIndex - 1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === servicios.length - 1 ? 0 : currentIndex + 1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentService = servicios[currentIndex];

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
    if (newDirection === 1) {
      goToNext();
    } else {
      goToPrevious();
    }
  };

  // Función helper para detectar si el icono es una imagen o emoji
  const isImageIcon = (icon) => icon.includes('.png') || icon.includes('.jpg') || icon.includes('.svg');

  return (
    <div className="servicios-carousel-container">
      <div className="servicios-header">
        <h2>Construccion Sin Limites</h2>

      </div>
      
      <div className="carousel-main">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="slide-wrapper"
          >
            <div
              className="service-slide"
              data-index={currentIndex}
            >
              <div className="slide-header">
                {isImageIcon(currentService.icon) ? (
                  <img 
                    src={currentService.icon} 
                    alt={currentService.titulo}
                    className="slide-icon"
                    style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                  />
                ) : (
                  <span className="slide-icon">{currentService.icon}</span>
                )}
                <h3 className="slide-title">{currentService.titulo}</h3>
              </div>
              <p className="slide-description">{currentService.descripcion}</p>
              <div className="slide-features">
                {currentService.features.map((feature, idx) => (
                  <div key={idx} className="feature-tag">
                    <span>✓ {feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        <button onClick={() => paginate(-1)} className="carousel-nav prev-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>
        
        <button onClick={() => paginate(1)} className="carousel-nav next-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>

        <div className="carousel-dots">
          {servicios.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`dot ${idx === currentIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
      
      <div className="service-thumbnails-grid">
        {servicios.map((servicio, idx) => (
          <motion.button
            key={servicio.id}
            onClick={() => goToSlide(idx)}
            className={`service-thumbnail ${idx === currentIndex ? 'active' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isImageIcon(servicio.icon) ? (
              <img 
                src={servicio.icon} 
                alt={servicio.titulo}
                className="thumb-icon"
                style={{ width: '32px', height: '32px', objectFit: 'contain' }}
              />
            ) : (
              <div className="thumb-icon">{servicio.icon}</div>
            )}
            <div className="thumb-title">{servicio.titulo}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default ServiciosCarousel;