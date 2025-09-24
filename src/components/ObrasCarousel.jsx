// src/components/ObrasCarousel.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Importa los estilos del carrusel

// --- Icono para el Botón ---
const GalleryIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
);

function ObrasCarousel() {
  const [isOpen, setIsOpen] = useState(false);

  // Lista de tus imágenes. Asegúrate que los nombres coincidan con los de tu carpeta /public/obras/
  const images = [
    { src: '/obras/almamod1.jpg', legend: 'Proyecto Residencial A' },
    { src: '/obras/almamod2.jpg', legend: 'Oficina Modular B' },
   ];

  return (
    <>
      {/* --- BOTÓN FLOTANTE --- */}
      <motion.button
        className="floating-button"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <GalleryIcon />
        <span>Nuestras Obras</span>
      </motion.button>

      {/* --- MODAL DEL CARRUSEL --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div className="modal-overlay" onClick={() => setIsOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <div className="modal-header">
                <h2>Galería de Obras Realizadas</h2>
                <button onClick={() => setIsOpen(false)} className="close-button">&times;</button>
              </div>
              <div className="modal-body">
                <Carousel
                  autoPlay
                  infiniteLoop
                  showThumbs={false}
                  showStatus={false}
                  dynamicHeight={true}
                  className="image-carousel"
                >
                  {images.map((image, index) => (
                    <div key={index} className="carousel-image-container">
                      <img src={image.src} alt={image.legend} />
                      <p className="legend">{image.legend}</p>
                    </div>
                  ))}
                </Carousel>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ObrasCarousel;