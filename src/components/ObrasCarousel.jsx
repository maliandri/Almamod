import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCloudinaryUrl, IMG_CARD, IMG_DETAIL } from '../config/cloudinary';
import SEO from './SEO';

const GalleryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

// ✅ AHORA RECIBE isOpen y onClose COMO PROPS
function ObrasCarousel({ isOpen: isOpenProp, onClose: onCloseProp }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  // ✅ SI NO SE PASAN PROPS, USAR CONTROL INTERNO (RETROCOMPATIBILIDAD)
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  
  const isOpen = isOpenProp !== undefined ? isOpenProp : isOpenInternal;
  const onClose = onCloseProp || (() => setIsOpenInternal(false));

  const obras = [
    {
      id: 1,
      titulo: 'Módulo Habitacional - Neuquén Capital',
      imagen: 'ALMAMOD_OBRA_1.webp',
      descripcion: 'Construcción modular de 36m² con sistema PROPANEL®'
    },
    {
      id: 2,
      titulo: 'Cabaña Patagónica - Villa La Angostura',
      imagen: 'ALMAMOD_OBRA_2.webp',
      descripcion: 'Diseño custom con revestimiento en madera'
    },
    // Agregar más obras aquí
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % obras.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? obras.length - 1 : prev - 1));
  };

  const openImageModal = (obra) => {
    setSelectedImage(obra);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      {/* ✅ SEO OPTIMIZADO PARA OBRAS */}
      {isOpen && (
        <SEO
          title="Nuestras Obras - Casas Modulares Construidas | AlmaMod Neuquén"
          description="Galería de casas modulares construidas por AlmaMod en Neuquén y Patagonia. Proyectos reales de viviendas con Paneles SIP PROPANEL. Construcción modular certificada, entrega en 30 días."
          keywords="obras casas modulares neuquen, proyectos viviendas modulares patagonia, galeria construccion modular, casas prefabricadas construidas, portfolio almamod"
          canonical="/obras"
          image={obras[0] ? getCloudinaryUrl(obras[0].imagen, IMG_DETAIL) : '/assets/almamod.webp'}
        />
      )}

      {/* ✅ BOTÓN SOLO SI NO VIENE CONTROLADO POR PROPS */}
      {isOpenProp === undefined && (
        <motion.button
          className="floating-button"
          onClick={() => setIsOpenInternal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <GalleryIcon />
          <span>Nuestras Obras</span>
        </motion.button>
      )}

      {isOpen && createPortal(
        <AnimatePresence>
          <motion.div
            className="modal-overlay"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content obras-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="modal-header">
                <h2>Nuestras Obras</h2>
                <button onClick={onClose} className="close-button">×</button>
              </div>

              <div className="modal-body">
                <div className="obras-carousel">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentIndex}
                      className="obra-slide"
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => openImageModal(obras[currentIndex])}
                    >
                      <img
                        src={getCloudinaryUrl(obras[currentIndex].imagen, IMG_CARD)}
                        alt={obras[currentIndex].titulo}
                        loading="lazy"
                      />
                      <div className="obra-info">
                        <h3>{obras[currentIndex].titulo}</h3>
                        <p>{obras[currentIndex].descripcion}</p>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {obras.length > 1 && (
                    <>
                      <button className="carousel-button prev" onClick={prevSlide}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>
                      <button className="carousel-button next" onClick={nextSlide}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>

                      <div className="carousel-indicators">
                        {obras.map((_, index) => (
                          <button
                            key={index}
                            className={`indicator ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(index)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.getElementById('modal-portal')
      )}

      {/* Modal de imagen ampliada */}
      {selectedImage && createPortal(
        <AnimatePresence>
          <motion.div
            className="modal-overlay"
            onClick={closeImageModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 10001 }}
          >
            <motion.div
              className="image-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <button onClick={closeImageModal} className="close-button">×</button>
              <img
                src={getCloudinaryUrl(selectedImage.imagen, IMG_DETAIL)}
                alt={selectedImage.titulo}
              />
              <div className="image-caption">
                <h3>{selectedImage.titulo}</h3>
                <p>{selectedImage.descripcion}</p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.getElementById('modal-portal')
      )}
    </>
  );
}

export default ObrasCarousel;