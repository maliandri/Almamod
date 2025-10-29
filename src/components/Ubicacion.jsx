import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Ubicacion.css';

const LocationIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

// ✅ AHORA RECIBE isOpen y onClose COMO PROPS
function Ubicacion({ isOpen: isOpenProp, onClose: onCloseProp }) {
  // ✅ SI NO SE PASAN PROPS, USAR CONTROL INTERNO (RETROCOMPATIBILIDAD)
  const [isOpenInternal, setIsOpenInternal] = React.useState(false);
  
  const isOpen = isOpenProp !== undefined ? isOpenProp : isOpenInternal;
  const onClose = onCloseProp || (() => setIsOpenInternal(false));

  return (
    <>
      {/* ✅ BOTÓN SOLO SI NO VIENE CONTROLADO POR PROPS */}
      {isOpenProp === undefined && (
        <motion.button
          className="floating-button"
          onClick={() => setIsOpenInternal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LocationIcon />
          <span>Ubicación</span>
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
              className="modal-content modal-lg" 
              onClick={(e) => e.stopPropagation()} 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="modal-header">
                <h2 className="ubicacion-modal-title">Dónde Estamos</h2>
                <button onClick={onClose} className="close-button">×</button>
              </div>
              <div className="modal-body">
                <p className="ubicacion-description">
                  Nuestra base de operaciones se encuentra en Neuquén, Argentina. Fabricamos localmente para garantizar la mejor calidad y adaptación al clima patagónico.
                </p>

                <div className="ubicacion-map-container">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3299.5348467891234!2d-68.14046788476562!3d-38.89956677957234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x960a35be6bd19e6d%3A0xdf42edf7c7d390a1!2sConacsas!5e0!3m2!1ses!2sar!4v1234567890123!5m2!1ses!2sar"
                    width="100%"
                    height="100%"
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mapa de Ubicación de Almamod"
                  ></iframe>
                </div>

                <div className="ubicacion-info-container">
                  <h3 className="ubicacion-info-title">📍 Información de Contacto</h3>
                  <p className="ubicacion-info-item">
                    <span>📌</span>
                    <span>Neuquén, Patagonia Argentina</span>
                  </p>
                  <p className="ubicacion-info-item">
                    <span>📱</span>
                    <span>WhatsApp: +54 9 299 408 7106</span>
                  </p>
                  <p className="ubicacion-info-item">
                    <span>📧</span>
                    <span>Email: info@almamod.com.ar</span>
                  </p>
                  <a
                    href="https://www.google.com/maps/place/Conacsas/@-38.8995667,-68.1382786,17z/data=!3m1!4b1!4m6!3m5!1s0x960a35be6bd19e6d:0xdf42edf7c7d390a1!8m2!3d-38.8995667!4d-68.1382786!16s%2Fg%2F11qp2jkf47?entry=ttu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ubicacion-maps-button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Abrir en Google Maps
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.getElementById('modal-portal')
      )}
    </>
  );
}

export default Ubicacion;