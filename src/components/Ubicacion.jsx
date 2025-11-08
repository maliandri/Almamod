import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Ubicacion.css';
import SEO from './SEO';

// Fix para el icono del marcador de Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

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
      {/* ✅ SEO CON NOINDEX PARA UBICACIÓN (solo contacto, no aporta SEO) */}
      {isOpen && (
        <SEO
          title="Ubicación y Contacto | AlmaMod Neuquén"
          description="Visitá nuestro showroom en Neuquén Capital. C. la Caña de Azúcar 18, Q8300 Neuquén. Atención: Lunes a Viernes 9-18hs. WhatsApp: +54 299 408-7106"
          keywords="ubicacion almamod, showroom casas modulares neuquen, contacto almamod"
          canonical="/ubicacion"
          noindex={true}
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
                  <MapContainer
                    center={[-38.899597, -68.1382433]}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%', borderRadius: '12px' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[-38.899597, -68.1382433]}>
                      <Popup>
                        <strong>ALMAMOD</strong><br />
                        Neuquén, Patagonia Argentina
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>

                <div className="ubicacion-info-container">
                  <h3 className="ubicacion-info-title">📍 Información de Contacto</h3>
                  <p className="ubicacion-info-item">
                    <span>📌</span>
                    <span>ALMAMOD - Neuquén, Patagonia Argentina</span>
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
                    href="https://www.google.com/maps/place/ALMAMOD/@-38.899597,-68.1382433,17z/data=!4m6!3m5!1s0x960a3584b666147d:0x56a482a9b12d0577!8m2!3d-38.899597!4d-68.1382433!16s%2Fg%2F11mkygfl6b?entry=ttu&g_ep=EgoyMDI1MTAyOS4yIKXMDSoASAFQAw%3D%3D"
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