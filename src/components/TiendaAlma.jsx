import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const StoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

// Datos de los módulos según el documento
const modulosData = [
  {
    id: 'almamod36',
    nombre: 'AlmaMod 36',
    superficie: '36 m²',
    dimensiones: '12m × 3m',
    habitaciones: '2 dormitorios',
    incluye: ['Baño completo', 'Cocina', 'Estar-comedor', 'Dos dormitorios'],
    plazo: '30 días',
    imagen: '/modulos/almamod36.jpg',
    descripcion: 'Solución habitacional de 2 habitaciones. Compacta, eficiente y confortable.'
  },
  {
    id: 'almamod27',
    nombre: 'AlmaMod 27',
    superficie: '27 m²',
    dimensiones: '9m × 3m',
    habitaciones: '1 dormitorio',
    incluye: ['Baño completo', 'Cocina', 'Estar-comedor', 'Un dormitorio'],
    plazo: '30 días',
    imagen: '/modulos/almamod27.jpg',
    descripcion: 'Solución habitacional de 1 habitación. Compacta, eficiente y confortable.'
  },
  {
    id: 'almamod18',
    nombre: 'AlmaMod 18',
    superficie: '18 m²',
    dimensiones: '6m × 3m',
    habitaciones: '1 dormitorio',
    incluye: ['Baño completo', 'Cocina-comedor', 'Un dormitorio'],
    plazo: '30 días',
    imagen: '/modulos/almamod18.jpg',
    descripcion: 'Solución habitacional compacta de 1 habitación. Ideal para parejas o personas solas.'
  },
  {
    id: 'almamodloft28',
    nombre: 'AlmaMod Loft 28',
    superficie: '28 m²',
    dimensiones: '7m × 3m (21m² planta baja + 7m² entrepiso)',
    habitaciones: 'Loft con entrepiso',
    incluye: ['Baño completo', 'Cocina', 'Estar-comedor', 'Dormitorio en entrepiso'],
    plazo: '30 días',
    imagen: '/modulos/almamodloft28.jpg',
    descripcion: 'Vivienda modular estilo loft con entrepiso. Diseño funcional y moderno.'
  },
  {
    id: 'micasita',
    nombre: 'MiCasita',
    superficie: '12 m²',
    dimensiones: '4.88m × 2.44m',
    habitaciones: 'Monoambiente',
    incluye: ['Baño completo', 'Cocina-dormitorio'],
    plazo: '30 días',
    imagen: '/modulos/micasita.jpg',
    descripcion: 'Módulo monoambiente compacto y accesible. Ideal para primera vivienda o espacio de trabajo.'
  }
];

function TiendaAlma() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const openDetails = (modulo) => {
    setSelectedModule(modulo);
    setSearchTerm('');
    setIsSearchFocused(false);
  };

  const closeDetails = () => {
    setSelectedModule(null);
  };

  // Filtrar módulos según búsqueda
  const filteredModules = modulosData.filter(modulo =>
    modulo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    modulo.superficie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    modulo.habitaciones.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchSelect = (modulo) => {
    openDetails(modulo);
  };

  return (
    <>
      <motion.button 
        className="floating-button tienda-button"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <StoreIcon />
        <span>Tienda Alma</span>
      </motion.button>

      {isOpen && createPortal(
        <AnimatePresence>
          <motion.div 
            className="modal-overlay tienda-overlay"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content tienda-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="tienda-header">
                <h2>Tienda Alma - Nuestros Módulos</h2>
                <button onClick={() => setIsOpen(false)} className="close-button">&times;</button>
              </div>

              <div className="search-container">
                <div className="search-wrapper">
                  <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar por nombre, tamaño o habitaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  />
                  {searchTerm && (
                    <button 
                      className="clear-search"
                      onClick={() => setSearchTerm('')}
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Dropdown de resultados */}
                {isSearchFocused && searchTerm && (
                  <div className="search-dropdown">
                    {filteredModules.length > 0 ? (
                      filteredModules.map((modulo) => (
                        <div
                          key={modulo.id}
                          className="search-result-item"
                          onClick={() => handleSearchSelect(modulo)}
                        >
                          <img src={modulo.imagen} alt={modulo.nombre} />
                          <div className="search-result-info">
                            <strong>{modulo.nombre}</strong>
                            <span>{modulo.superficie} • {modulo.habitaciones}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-results">
                        No se encontraron módulos
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="tienda-grid">
                {filteredModules.map((modulo) => (
                  <motion.div
                    key={modulo.id}
                    className="modulo-card"
                    whileHover={{ y: -5 }}
                    onClick={() => openDetails(modulo)}
                  >
                    <div className="modulo-image-container">
                      <img src={modulo.imagen} alt={modulo.nombre} className="modulo-image" />
                      <div className="modulo-overlay">
                        <span className="ver-detalles">Ver Detalles →</span>
                      </div>
                    </div>
                    <div className="modulo-info">
                      <h3>{modulo.nombre}</h3>
                      <div className="modulo-specs">
                        <span className="spec-badge">{modulo.superficie}</span>
                        <span className="spec-badge">{modulo.habitaciones}</span>
                      </div>
                      <p className="modulo-description">{modulo.descripcion}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.getElementById('modal-portal')
      )}

      {selectedModule && createPortal(
        <AnimatePresence>
          <motion.div
            className="modal-overlay tienda-overlay"
            onClick={closeDetails}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content tienda-detail-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <button onClick={closeDetails} className="close-button">&times;</button>
              
              <div className="detail-content">
                <div className="detail-image-section">
                  <img src={selectedModule.imagen} alt={selectedModule.nombre} />
                </div>
                
                <div className="detail-info-section">
                  <h2>{selectedModule.nombre}</h2>
                  <p className="detail-description">{selectedModule.descripcion}</p>
                  
                  <div className="detail-specs">
                    <div className="spec-item">
                      <strong>Superficie:</strong>
                      <span>{selectedModule.superficie}</span>
                    </div>
                    <div className="spec-item">
                      <strong>Dimensiones:</strong>
                      <span>{selectedModule.dimensiones}</span>
                    </div>
                    <div className="spec-item">
                      <strong>Distribución:</strong>
                      <span>{selectedModule.habitaciones}</span>
                    </div>
                    <div className="spec-item">
                      <strong>Plazo de entrega:</strong>
                      <span>{selectedModule.plazo}</span>
                    </div>
                  </div>

                  <div className="detail-includes">
                    <h3>Incluye:</h3>
                    <ul>
                      {selectedModule.incluye.map((item, index) => (
                        <li key={index}>✓ {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-features">
                    <h3>Características:</h3>
                    <ul>
                      <li>Estructura de acero de gran espesor</li>
                      <li>Paneles térmicos de alto rendimiento</li>
                      <li>Ahorro energético y confort térmico</li>
                      <li>Ampliable con módulos adicionales</li>
                      <li>Transportable y fácil instalación</li>
                    </ul>
                  </div>

                  <div className="detail-actions">
                    <button className="contact-button">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                      </svg>
                      Consultar por WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.getElementById('modal-portal')
      )}

      <style>{`
        .tienda-button {
          background: linear-gradient(135deg, #d4a574 0%, #8b6f47 100%);
        }

        .tienda-overlay {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(8px);
        }

        .tienda-modal {
          max-width: 1200px;
          width: 95%;
          max-height: 90vh;
          overflow-y: auto;
          background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%);
        }

        .tienda-header {
          background: linear-gradient(135deg, #d4a574 0%, #8b6f47 100%);
          padding: 24px;
          border-radius: 12px 12px 0 0;
          margin: -20px -20px 24px -20px;
        }

        .tienda-header h2 {
          color: #1a1a2e;
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0;
        }

        .search-container {
          position: relative;
          margin-bottom: 32px;
          padding: 0 8px;
        }

        .search-wrapper {
          position: relative;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #d4a574;
          pointer-events: none;
          z-index: 1;
        }

        .search-input {
          width: 100%;
          padding: 16px 48px 16px 48px;
          background: rgba(255, 255, 255, 0.08);
          border: 2px solid rgba(212, 165, 116, 0.3);
          border-radius: 12px;
          color: #e2e8f0;
          font-size: 1rem;
          transition: all 0.3s ease;
          outline: none;
        }

        .search-input::placeholder {
          color: rgba(226, 232, 240, 0.5);
        }

        .search-input:focus {
          background: rgba(255, 255, 255, 0.12);
          border-color: #d4a574;
          box-shadow: 0 0 0 4px rgba(212, 165, 116, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(212, 165, 116, 0.2);
          border: none;
          color: #d4a574;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          padding: 0;
          line-height: 1;
        }

        .clear-search:hover {
          background: rgba(212, 165, 116, 0.3);
          transform: translateY(-50%) scale(1.1);
        }

        .search-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #16213e;
          border: 2px solid #d4a574;
          border-radius: 12px;
          max-height: 400px;
          overflow-y: auto;
          z-index: 1000;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
        }

        .search-result-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid rgba(212, 165, 116, 0.15);
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .search-result-item:hover {
          background: rgba(212, 165, 116, 0.15);
        }

        .search-result-item img {
          width: 80px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid rgba(212, 165, 116, 0.3);
        }

        .search-result-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .search-result-info strong {
          color: #d4a574;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .search-result-info span {
          color: #cbd5e1;
          font-size: 0.9rem;
        }

        .no-results {
          padding: 32px;
          text-align: center;
          color: #cbd5e1;
          font-size: 1rem;
        }

        .tienda-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
          padding: 0 8px;
        }

        .modulo-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(212, 165, 116, 0.2);
        }

        .modulo-card:hover {
          border-color: #d4a574;
          box-shadow: 0 8px 24px rgba(212, 165, 116, 0.3);
        }

        .modulo-image-container {
          position: relative;
          width: 100%;
          height: 240px;
          overflow: hidden;
        }

        .modulo-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .modulo-card:hover .modulo-image {
          transform: scale(1.1);
        }

        .modulo-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(26, 26, 46, 0.9) 0%, transparent 50%);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 20px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .modulo-card:hover .modulo-overlay {
          opacity: 1;
        }

        .ver-detalles {
          color: #d4a574;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .modulo-info {
          padding: 20px;
        }

        .modulo-info h3 {
          color: #d4a574;
          font-size: 1.4rem;
          margin: 0 0 12px 0;
          font-weight: 700;
        }

        .modulo-specs {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .spec-badge {
          background: rgba(212, 165, 116, 0.15);
          color: #d4a574;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          border: 1px solid rgba(212, 165, 116, 0.3);
        }

        .modulo-description {
          color: #e2e8f0;
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0;
        }

        .tienda-detail-modal {
          max-width: 1000px;
          width: 95%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 0;
          background: #1a1a2e;
        }

        .detail-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }

        .detail-image-section {
          background: #0f172a;
          padding: 0;
        }

        .detail-image-section img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .detail-info-section {
          padding: 40px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        }

        .detail-info-section h2 {
          color: #d4a574;
          font-size: 2rem;
          margin: 0 0 16px 0;
          font-weight: 700;
        }

        .detail-description {
          color: #cbd5e1;
          font-size: 1.1rem;
          line-height: 1.7;
          margin-bottom: 32px;
        }

        .detail-specs {
          background: rgba(212, 165, 116, 0.08);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 28px;
          border: 1px solid rgba(212, 165, 116, 0.2);
        }

        .spec-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid rgba(212, 165, 116, 0.15);
        }

        .spec-item:last-child {
          border-bottom: none;
        }

        .spec-item strong {
          color: #d4a574;
          font-weight: 600;
        }

        .spec-item span {
          color: #e2e8f0;
        }

        .detail-includes, .detail-features {
          margin-bottom: 28px;
        }

        .detail-includes h3, .detail-features h3 {
          color: #d4a574;
          font-size: 1.3rem;
          margin-bottom: 12px;
          font-weight: 700;
        }

        .detail-includes ul, .detail-features ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .detail-includes li, .detail-features li {
          color: #e2e8f0;
          padding: 8px 0;
          font-size: 1rem;
          line-height: 1.6;
        }

        .detail-actions {
          margin-top: 32px;
        }

        .contact-button {
          width: 100%;
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .contact-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37, 211, 102, 0.4);
        }

        @media (max-width: 768px) {
          .tienda-grid {
            grid-template-columns: 1fr;
          }

          .search-input {
            font-size: 0.9rem;
            padding: 14px 44px 14px 44px;
          }

          .search-result-item img {
            width: 60px;
            height: 45px;
          }

          .search-result-info strong {
            font-size: 1rem;
          }

          .search-result-info span {
            font-size: 0.85rem;
          }

          .detail-content {
            grid-template-columns: 1fr;
          }

          .detail-image-section {
            height: 300px;
          }

          .detail-info-section {
            padding: 24px;
          }

          .tienda-header h2 {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </>
  );
}

export default TiendaAlma;