// src/components/Ubicacion.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icono para el Botón de Ubicación ---
const LocationIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);

function Ubicacion() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* --- BOTÓN FLOTANTE --- */}
      <motion.button
        className="floating-button"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <LocationIcon />
        <span>Ubicación</span>
      </motion.button>

      {/* --- MODAL CON EL MAPA --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div className="modal-overlay" onClick={() => setIsOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <div className="modal-header">
                <h2>Dónde Estamos</h2>
                <button onClick={() => setIsOpen(false)} className="close-button">&times;</button>
              </div>
              <div className="modal-body">
                <p className="address-text">Nuestra base de operaciones se encuentra en Neuquén, Argentina.</p>
                <div className="map-container">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d198863.31023223533!2d-68.20452309191024!3d-38.92211470471283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x960a33ba35996b79%3A0x92b15694a453f0a!2sNeuqu%C3%A9n!5e0!3m2!1ses-419!2sar!4v1695488435528!5m2!1ses-419!2sar"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mapa de Ubicación de Almamod"
                  ></iframe>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Ubicacion;