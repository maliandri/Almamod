import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './TiendaAlma.css';

const StoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

// Generar slug para URLs
const generarSlug = (nombre) => {
  return nombre.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

// Datos de los módulos según el documento
const modulosData = [
  {
    id: 'almamod36',
    nombre: 'Alma 36',
    slug: 'alma-36',
    superficie: '36 m²',
    dimensiones: '12m × 3m',
    habitaciones: '2 dormitorios',
    precio: 50075000,
    incluye: ['Baño completo', 'Cocina', 'Estar-comedor', 'Dos dormitorios'],
    plazo: '30 días',
    imagenPortada: '/modulos/AlmaMod_36_portada.webp',
    imagenesDetalle: ['/modulos/Alma36_1.webp', '/modulos/Alma36_2.webp'],
    descripcion: 'Solución habitacional de 2 habitaciones. Compacta, eficiente y confortable.',
    especificacionesTecnicas: {
      construccion: [
        { titulo: 'Patín', detalle: 'Armado con perfil UPN 120mm y caño estructural, pintado con esmalte sintético 3 en 1 color negro.' },
        { titulo: 'Estructura piso', detalle: 'Panel SIP PROPANEL 9cm, pintado en la cara inferior con pintura asfáltica.' },
        { titulo: 'Muros', detalle: 'Panel SIP PROPANEL 9cm.' },
        { titulo: 'Techo', detalle: 'Panel SIP cielorraso PROPANEL 9cm sobre tirantes de pino y terminado en cubierta con chapa trapezoidal negra y zinguerías de cierre de chapa negra.' },
        { titulo: 'Revestimiento de muros exterior', detalle: 'machimbre de 1era calidad protegido contra rayos UV humedad y corrosión o siding horizontal/vertical 6mm, pintado símil madera o látex exterior.' },
        { titulo: 'Revestimiento de muros interior', detalle: 'machimbre de 1era calidad barnizado o placas de yeso con junta tomada y pintura látex lavable.' },
        { titulo: 'Terminación piso interior', detalle: 'Pisos vinílicos SPC de alto tránsito 5.5 mm.' },
        { titulo: 'Terminación interior techo', detalle: 'Panel de cielorraso laqueado color madera o sintético blanco.' },
        { titulo: 'Aberturas', detalle: 'Puerta y ventanas de aluminio negro, con vidrio DVH.' },
        { titulo: 'Revestimientos de baño', detalle: 'placas PVC símil mármol a elección' },
        { titulo: 'Revestimientos de cocina', detalle: 'placas PVC símil mármol a elección' },
        { titulo: 'Instalación eléctrica', detalle: 'Instalación eléctrica con cables normalizados desde 6 mm a 1.5 mm.' },
        { titulo: 'Instalación de agua', detalle: 'Por cañería termofusión.' },
        { titulo: 'Instalación de desagüe', detalle: 'sistema cloacal de cañerías con o-ring.' }
      ],
      equipamiento: [
        { titulo: 'Inodoro con depósito', detalle: 'Ferrúm Bari.' },
        { titulo: 'Bidet', detalle: 'Ferrúm Bari.' },
        { titulo: 'Griferías bidet, vanitory, ducha, bacha cocina', detalle: 'Fv Puelo.' },
        { titulo: 'Vanitory', detalle: 'en MDF.' },
        { titulo: 'Receptáculo de ducha', detalle: '120x70cm con mampara.' },
        { titulo: 'Mesada y Bajo mesada', detalle: 'Mesada en mármol sintético y bajo mesada en MDF.' },
        { titulo: 'Puertas interior', detalle: 'Oblak Practika' }
      ]
    }
  },
  {
    id: 'almamod27',
    nombre: 'Alma 27',
    slug: 'alma-27',
    superficie: '27 m²',
    dimensiones: '9m × 3m',
    habitaciones: '1 dormitorio',
    precio: 42120000,
    incluye: ['Baño completo', 'Cocina', 'Estar-comedor', 'Un dormitorio'],
    plazo: '30 días',
    imagenPortada: '/modulos/AlmaMod_27_portada.webp',
    imagenesDetalle: ['/modulos/almamod_27.webp'],
    descripcion: 'Solución habitacional de 1 habitación. Compacta, eficiente y confortable.',
    especificacionesTecnicas: {
      construccion: [
        { titulo: 'Patín', detalle: 'Armado con perfil UPN 120mm y caño estructural, pintado con esmalte sintético 3 en 1 color negro.' },
        { titulo: 'Estructura piso', detalle: 'Panel SIP PROPANEL 9cm, pintado en la cara inferior con pintura asfáltica.' },
        { titulo: 'Muros', detalle: 'Panel SIP PROPANEL 9cm.' },
        { titulo: 'Techo', detalle: 'Panel SIP cielorraso PROPANEL 9cm sobre tirantes de pino y terminado en cubierta con chapa trapezoidal negra y zinguerías de cierre de chapa negra.' },
        { titulo: 'Revestimiento de muros exterior', detalle: 'machimbre de 1era calidad protegido contra rayos UV humedad y corrosión o siding horizontal/vertical 6mm, pintado símil madera o látex exterior.' },
        { titulo: 'Revestimiento de muros interior', detalle: 'machimbre de 1era calidad barnizado o placas de yeso con junta tomada y pintura látex lavable.' },
        { titulo: 'Terminación piso interior', detalle: 'Pisos vinílicos SPC de alto tránsito 5.5 mm.' },
        { titulo: 'Terminación interior techo', detalle: 'Panel de cielorraso laqueado color madera o sintético blanco.' },
        { titulo: 'Aberturas', detalle: 'Puerta y ventanas de aluminio negro, con vidrio DVH.' },
        { titulo: 'Revestimientos de baño', detalle: 'placas PVC símil mármol a elección' },
        { titulo: 'Revestimientos de cocina', detalle: 'placas PVC símil mármol a elección' },
        { titulo: 'Instalación eléctrica', detalle: 'Instalación eléctrica con cables normalizados desde 6 mm a 1.5 mm.' },
        { titulo: 'Instalación de agua', detalle: 'Por cañería termofusión.' },
        { titulo: 'Instalación de desagüe', detalle: 'sistema cloacal de cañerías con o-ring.' }
      ],
      equipamiento: [
        { titulo: 'Inodoro con depósito', detalle: 'Ferrúm Bari.' },
        { titulo: 'Bidet', detalle: 'Ferrúm Bari.' },
        { titulo: 'Griferías bidet, vanitory, ducha, bacha cocina', detalle: 'Fv Puelo.' },
        { titulo: 'Vanitory', detalle: 'en MDF.' },
        { titulo: 'Receptáculo de ducha', detalle: '120x70cm con mampara.' },
        { titulo: 'Mesada y Bajo mesada', detalle: 'Mesada en mármol sintético y bajo mesada en MDF.' },
        { titulo: 'Puertas interior', detalle: 'Oblak Practika' }
      ]
    }
  },
  {
    id: 'almamod18',
    nombre: 'Alma 18',
    slug: 'alma-18',
    superficie: '18 m²',
    dimensiones: '6m × 3m',
    habitaciones: '1 dormitorio',
    precio: 32050000,
    incluye: ['Baño completo', 'Cocina-comedor', 'Un dormitorio'],
    plazo: '30 días',
    imagenPortada: '/modulos/AlmaMod_18_portada.webp',
    imagenesDetalle: ['/modulos/AlmaMod_18.webp'],
    descripcion: 'Solución habitacional compacta de 1 habitación. Ideal para parejas o personas solas.',
    especificacionesTecnicas: {
      construccion: [
        { titulo: 'Patín', detalle: 'Armado con perfil UPN 120mm y caño estructural, pintado con esmalte sintético 3 en 1 color negro.' },
        { titulo: 'Estructura piso', detalle: 'Panel SIP PROPANEL 9cm, pintado en la cara inferior con pintura asfáltica.' },
        { titulo: 'Muros', detalle: 'Panel SIP PROPANEL 9cm.' },
        { titulo: 'Techo', detalle: 'Panel SIP cielorraso PROPANEL 9cm sobre tirantes de pino y terminado en cubierta con chapa trapezoidal negra y zinguerías de cierre de chapa negra.' },
        { titulo: 'Revestimiento de muros exterior', detalle: 'machimbre de 1era calidad protegido contra rayos UV humedad y corrosión o siding horizontal/vertical 6mm, pintado símil madera o látex exterior.' },
        { titulo: 'Revestimiento de muros interior', detalle: 'machimbre de 1era calidad barnizado o placas de yeso con junta tomada y pintura látex lavable.' },
        { titulo: 'Terminación piso interior', detalle: 'Pisos vinílicos SPC de alto tránsito 5.5 mm.' },
        { titulo: 'Terminación interior techo', detalle: 'Panel de cielorraso laqueado color madera o sintético blanco.' },
        { titulo: 'Aberturas', detalle: 'Puerta y ventanas de aluminio negro, con vidrio DVH.' },
        { titulo: 'Revestimientos de baño', detalle: 'placas PVC símil mármol a elección' },
        { titulo: 'Revestimientos de cocina', detalle: 'placas PVC símil mármol a elección' },
        { titulo: 'Instalación eléctrica', detalle: 'Instalación eléctrica con cables normalizados desde 6 mm a 1.5 mm.' },
        { titulo: 'Instalación de agua', detalle: 'Por cañería termofusión.' },
        { titulo: 'Instalación de desagüe', detalle: 'sistema cloacal de cañerías con o-ring.' }
      ],
      equipamiento: [
        { titulo: 'Inodoro con depósito', detalle: 'Ferrúm Bari.' },
        { titulo: 'Bidet', detalle: 'Ferrúm Bari.' },
        { titulo: 'Griferías bidet, vanitory, ducha, bacha cocina', detalle: 'Fv Puelo.' },
        { titulo: 'Vanitory', detalle: 'en MDF.' },
        { titulo: 'Receptáculo de ducha', detalle: '120x70cm con mampara.' },
        { titulo: 'Mesada y Bajo mesada', detalle: 'Mesada en mármol sintético y bajo mesada en MDF.' },
        { titulo: 'Puertas interior', detalle: 'Oblak Practika' }
      ]
    }
  },
  {
    id: 'almamodloft28',
    nombre: 'Alma Loft 28',
    slug: 'alma-loft-28',
    superficie: '28 m²',
    dimensiones: '7m × 3m (21m² planta baja + 7m² entrepiso)',
    habitaciones: 'Loft con entrepiso',
    precio: 38500000,
    incluye: ['Baño completo', 'Cocina', 'Estar-comedor', 'Dormitorio en entrepiso'],
    plazo: '30 días',
    imagenPortada: '/modulos/Almamod_loft28_portada.webp',
    imagenesDetalle: ['/modulos/Almamod_loft28.webp'],
    descripcion: 'Vivienda modular estilo loft con entrepiso. Diseño funcional y moderno.',
    especificacionesTecnicas: {
      construccion: [
        { titulo: 'Patín', detalle: 'Armado con perfil UPN 120mm y caño estructural, pintado con esmalte sintético 3 en 1 color negro.' },
        { titulo: 'Estructura piso', detalle: 'Panel SIP PROPANEL 9cm, pintado en la cara inferior con pintura asfáltica.' },
        { titulo: 'Muros', detalle: 'Panel SIP PROPANEL 9cm.' },
        { titulo: 'Techo', detalle: 'Panel SIP cielorraso PROPANEL 9cm sobre tirantes de pino y terminado en cubierta con chapa trapezoidal negra y zinguerías de cierre de chapa negra.' },
        { titulo: 'Revestimiento de muros exterior', detalle: 'machimbre de 1era calidad protegido contra rayos UV humedad y corrosión o siding horizontal/vertical 6mm, pintado símil madera o látex exterior.' },
        { titulo: 'Revestimiento de muros interior', detalle: 'machimbre de 1era calidad barnizado o placas de yeso con junta tomada y pintura látex lavable.' },
        { titulo: 'Terminación piso interior', detalle: 'Pisos vinílicos SPC de alto tránsito 5.5 mm.' },
        { titulo: 'Terminación interior techo', detalle: 'Panel de cielorraso laqueado color madera o sintético blanco.' },
        { titulo: 'Aberturas', detalle: 'Puerta y ventanas de aluminio negro, con vidrio DVH.' },
        { titulo: 'Revestimientos de baño', detalle: 'placas PVC símil mármol a elección' },
        { titulo: 'Revestimientos de cocina', detalle: 'placas PVC símil mármol a elección' },
        { titulo: 'Instalación eléctrica', detalle: 'Instalación eléctrica con cables normalizados desde 6 mm a 1.5 mm.' },
        { titulo: 'Instalación de agua', detalle: 'Por cañería termofusión.' },
        { titulo: 'Instalación de desagüe', detalle: 'sistema cloacal de cañerías con o-ring.' }
      ],
      equipamiento: [
        { titulo: 'Inodoro con depósito', detalle: 'Ferrúm Bari.' },
        { titulo: 'Bidet', detalle: 'Ferrúm Bari.' },
        { titulo: 'Griferías bidet, vanitory, ducha, bacha cocina', detalle: 'Fv Puelo.' },
        { titulo: 'Vanitory', detalle: 'en MDF.' },
        { titulo: 'Receptáculo de ducha', detalle: '120x70cm con mampara.' },
        { titulo: 'Mesada y Bajo mesada', detalle: 'Mesada en mármol sintético y bajo mesada en MDF.' },
        { titulo: 'Puertas interior', detalle: 'Oblak Practika' }
      ]
    }
  },
  {
    id: 'micasita',
    nombre: 'MiCasita',
    slug: 'micasita',
    superficie: '12 m²',
    dimensiones: '4.88m × 2.44m',
    habitaciones: 'Monoambiente',
    precio: 15300000,
    incluye: ['Baño completo', 'Cocina-dormitorio'],
    plazo: '30 días',
    imagenPortada: '/modulos/Almamod_micasita_portada.webp',
    imagenesDetalle: ['/modulos/Almamod_micasita.webp'],
    descripcion: 'Módulo monoambiente compacto y accesible. Ideal para primera vivienda o espacio de trabajo.',
    especificacionesTecnicas: {
      construccion: [
        { titulo: 'Patín', detalle: 'Armado con perfil UPN 120mm y caño estructural, pintado con esmalte sintético 3 en 1 color negro.' },
        { titulo: 'Estructura piso', detalle: 'Panel SIP PROPANEL 9cm, pintado en la cara inferior con pintura asfáltica.' },
        { titulo: 'Muros', detalle: 'Panel SIP PROPANEL 9cm.' },
        { titulo: 'Techo', detalle: 'Panel SIP cielorraso PROPANEL 9cm sobre tirantes de pino y terminado en cubierta con chapa trapezoidal negra y zinguerías de cierre de chapa negra.' },
        { titulo: 'Revestimiento de muros exterior', detalle: 'machimbre de 1era calidad protegido contra rayos UV humedad y corrosión o siding horizontal/vertical 6mm, pintado símil madera o látex exterior.' },
        { titulo: 'Revestimiento de muros interior', detalle: 'machimbre de 1era calidad barnizado o placas de yeso con junta tomada y pintura látex lavable.' },
        { titulo: 'Terminación piso interior', detalle: 'Pisos vinílicos SPC de alto tránsito 5.5 mm.' },
        { titulo: 'Terminación interior techo', detalle: 'Panel de cielorraso laqueado color madera o sintético blanco.' },
        { titulo: 'Aberturas', detalle: 'Puerta y ventanas de aluminio negro, con vidrio DVH.' },
        { titulo: 'Revestimientos de baño', detalle: 'placas PVC símil mármol a elección' },
        { titulo: 'Instalación eléctrica', detalle: 'Instalación eléctrica con cables normalizados desde 6 mm a 1.5 mm.' },
        { titulo: 'Instalación de agua', detalle: 'Por cañería termofusión.' },
        { titulo: 'Instalación de desagüe', detalle: 'sistema cloacal de cañerías con o-ring.' }
      ],
      equipamiento: [
        { titulo: 'Inodoro con depósito', detalle: 'Ferrúm Bari.' },
        { titulo: 'Griferías ducha, bacha cocina', detalle: 'Fv Puelo.' },
        { titulo: 'Vanitory', detalle: 'en MDF.' },
        { titulo: 'Receptáculo de ducha', detalle: '120x70cm con mampara.' },
        { titulo: 'Mesada y Bajo mesada', detalle: 'Mesada en mármol sintético y bajo mesada en MDF.' },
        { titulo: 'Puertas interior', detalle: 'Oblak Practika' }
      ]
    }
  }
];

// Función para formatear precio
const formatearPrecio = (precio) => {
  if (precio === 0) return 'Consultar precio';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio);
};

function TiendaAlma() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSpecs, setShowSpecs] = useState(false);

  // Manejar URLs y navegación
  useEffect(() => {
    const path = window.location.pathname;
    
    // Si estamos en /tiendaalma, abrir la tienda
    if (path === '/tiendaalma') {
      setIsOpen(true);
      setSelectedModule(null);
    }
    
    // Si estamos en /tiendaalma/[slug], abrir el detalle del módulo
    if (path.startsWith('/tiendaalma/')) {
      const slug = path.replace('/tiendaalma/', '');
      const modulo = modulosData.find(m => m.slug === slug);
      if (modulo) {
        setIsOpen(true);
        setSelectedModule(modulo);
        setCurrentImageIndex(0);
      }
    }
  }, []);

  // Actualizar URL cuando se abre/cierra la tienda o se selecciona un módulo
  const updateURL = (path) => {
    window.history.pushState({}, '', path);
  };

  const handleOpenStore = () => {
    setIsOpen(true);
    updateURL('/tiendaalma');
  };

  const handleCloseStore = () => {
    setIsOpen(false);
    setSelectedModule(null);
    updateURL('/');
  };

  const openDetails = (modulo) => {
    setSelectedModule(modulo);
    setCurrentImageIndex(0);
    setSearchTerm('');
    setIsSearchFocused(false);
    updateURL(`/tiendaalma/${modulo.slug}`);
  };

  const closeDetails = () => {
    setSelectedModule(null);
    setCurrentImageIndex(0);
    updateURL('/tiendaalma');
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

  const handleWhatsAppClick = (modulo) => {
    const precioTexto = modulo.precio > 0 ? `Precio: ${formatearPrecio(modulo.precio)}` : '';
    const mensaje = `Hola! Estuve mirando productos en su web y me interesa el *${modulo.nombre}* (${modulo.superficie}, ${modulo.habitaciones}). ${precioTexto} ¿Podrían brindarme más información?`;
    const urlWhatsApp = `https://wa.me/5492994087106?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
  };

  const nextImage = () => {
    if (selectedModule && selectedModule.imagenesDetalle) {
      setCurrentImageIndex((prev) => 
        (prev + 1) % selectedModule.imagenesDetalle.length
      );
    }
  };

  const prevImage = () => {
    if (selectedModule && selectedModule.imagenesDetalle) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedModule.imagenesDetalle.length - 1 : prev - 1
      );
    }
  };

  const openSpecs = () => {
    setShowSpecs(true);
  };

  const closeSpecs = () => {
    setShowSpecs(false);
  };

  return (
    <>
      <motion.button 
        className="floating-button tienda-button"
        onClick={handleOpenStore}
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
            onClick={handleCloseStore}
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
                <button onClick={handleCloseStore} className="close-button">&times;</button>
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

                {isSearchFocused && searchTerm && (
                  <div className="search-dropdown">
                    {filteredModules.length > 0 ? (
                      filteredModules.map((modulo) => (
                        <div
                          key={modulo.id}
                          className="search-result-item"
                          onClick={() => handleSearchSelect(modulo)}
                        >
                          <img src={modulo.imagenPortada} alt={modulo.nombre} />
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
                      <img src={modulo.imagenPortada} alt={modulo.nombre} className="modulo-image" />
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
                      <div className="modulo-price">
                        {formatearPrecio(modulo.precio)}
                      </div>
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
                  <div className="image-carousel">
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={currentImageIndex}
                        src={selectedModule.imagenesDetalle[currentImageIndex]} 
                        alt={`${selectedModule.nombre} - Imagen ${currentImageIndex + 1}`}
                        style={{ objectFit: 'contain' }}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                      />
                    </AnimatePresence>
                    
                    {selectedModule.imagenesDetalle.length > 1 && (
                      <>
                        <button className="carousel-button prev" onClick={prevImage}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                          </svg>
                        </button>
                        <button className="carousel-button next" onClick={nextImage}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </button>
                        
                        <div className="carousel-indicators">
                          {selectedModule.imagenesDetalle.map((_, index) => (
                            <button
                              key={index}
                              className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                              onClick={() => setCurrentImageIndex(index)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="detail-info-section">
                  <h2>{selectedModule.nombre}</h2>
                  <p className="detail-description">{selectedModule.descripcion}</p>
                  
                  <div className="detail-specs">
                    <div className="spec-item">
                      <strong>Precio:</strong>
                      <span className="spec-price">{formatearPrecio(selectedModule.precio)}</span>
                    </div>
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
                    <button 
                      className="contact-button"
                      onClick={() => handleWhatsAppClick(selectedModule)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                      </svg>
                      Consultar por WhatsApp
                    </button>
                    <button 
                      className="specs-button"
                      onClick={openSpecs}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      Especificaciones Técnicas
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.getElementById('modal-portal')
      )}

      {showSpecs && selectedModule && createPortal(
        <AnimatePresence>
          <motion.div
            className="modal-overlay tienda-overlay"
            onClick={closeSpecs}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 10001 }}
          >
            <motion.div
              className="modal-content specs-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="specs-header">
                <h2>Especificaciones Técnicas - {selectedModule.nombre}</h2>
                <button onClick={closeSpecs} className="close-button">&times;</button>
              </div>

              <div className="specs-content">
                <div className="specs-section">
                  <h3>ESPECIFICACIONES DE CONSTRUCCIÓN</h3>
                  {selectedModule.especificacionesTecnicas.construccion.map((item, index) => (
                    <div 
                      key={index} 
                      className="spec-detail-item"
                    >
                      <strong>{item.titulo}:</strong> {item.detalle}
                    </div>
                  ))}
                </div>

                <div className="specs-section">
                  <h3>EQUIPAMIENTO INCLUIDO</h3>
                  {selectedModule.especificacionesTecnicas.equipamiento.map((item, index) => (
                    <div 
                      key={index} 
                      className="spec-detail-item"
                    >
                      <strong>{item.titulo}:</strong> {item.detalle}
                    </div>
                  ))}
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

export default TiendaAlma;