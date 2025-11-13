import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCloudinaryUrl, IMG_DETAIL } from '../config/cloudinary';
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
  const [expandedObra, setExpandedObra] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState({});
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [videoPlayCount, setVideoPlayCount] = useState({});
  const [isAutoPlaying, setIsAutoPlaying] = useState({});

  // ✅ SI NO SE PASAN PROPS, USAR CONTROL INTERNO (RETROCOMPATIBILIDAD)
  const [isOpenInternal, setIsOpenInternal] = useState(false);

  const isOpen = isOpenProp !== undefined ? isOpenProp : isOpenInternal;
  const onClose = onCloseProp || (() => setIsOpenInternal(false));

  const obras = [
    {
      id: 1,
      titulo: 'Módulo Almamod 27 - Junín de los Andes',
      ubicacion: 'Junín de los Andes, Neuquén',
      descripcion: 'Módulo habitacional de 27m² con sistema PROPANEL®',
      imagenPortada: '18_27',
      media: [
        { tipo: 'imagen', nombre: '01_27', alt: 'Vista frontal módulo Almamod 27' },
        { tipo: 'imagen', nombre: '02_27', alt: 'Vista lateral módulo Almamod 27' },
        { tipo: 'imagen', nombre: '03_27', alt: 'Detalle exterior módulo Almamod 27' },
        { tipo: 'imagen', nombre: '04_27', alt: 'Vista interior módulo Almamod 27' },
        { tipo: 'imagen', nombre: '05_27', alt: 'Cocina módulo Almamod 27' },
        { tipo: 'imagen', nombre: '07_27', alt: 'Baño módulo Almamod 27' },
        { tipo: 'imagen', nombre: '08_27', alt: 'Dormitorio módulo Almamod 27' },
        { tipo: 'imagen', nombre: '09_27', alt: 'Vista general módulo Almamod 27' },
        { tipo: 'imagen', nombre: '10_27', alt: 'Detalle terminaciones módulo Almamod 27' },
        { tipo: 'imagen', nombre: '11_27', alt: 'Vista nocturna módulo Almamod 27' },
        { tipo: 'imagen', nombre: '12_27', alt: 'Acceso principal módulo Almamod 27' },
        { tipo: 'imagen', nombre: '13_27', alt: 'Vista panorámica módulo Almamod 27' },
        { tipo: 'imagen', nombre: '14_27', alt: 'Detalle ventanas módulo Almamod 27' },
        { tipo: 'imagen', nombre: '16_27', alt: 'Vista exterior módulo Almamod 27' },
        { tipo: 'imagen', nombre: '17_27', alt: 'Entorno módulo Almamod 27' },
        { tipo: 'imagen', nombre: '18_27', alt: 'Vista final módulo Almamod 27' },
        { tipo: 'video', nombre: '01_27VMP4', alt: 'Video recorrido módulo Almamod 27' }
      ]
    },
    {
      id: 2,
      titulo: 'Mi Casita - Plottier',
      ubicacion: 'Plottier, Neuquén',
      descripcion: 'Módulo habitacional de 18m² con sistema PROPANEL®',
      imagenPortada: '01_18',
      media: [
        { tipo: 'imagen', nombre: '01_18', alt: 'Vista frontal módulo Mi Casita' },
        { tipo: 'video', nombre: '01_18VMP4', alt: 'Video recorrido módulo Mi Casita' }
      ]
    }
  ];

  const toggleObra = (obraId) => {
    const isExpanding = expandedObra !== obraId;
    setExpandedObra(isExpanding ? obraId : null);

    if (isExpanding) {
      // Inicializar índice en 0 al expandir
      setCurrentMediaIndex(prev => ({ ...prev, [obraId]: 0 }));
      // Activar autoplay
      setIsAutoPlaying(prev => ({ ...prev, [obraId]: true }));
      // Resetear contador de reproducciones de video
      setVideoPlayCount(prev => ({ ...prev, [obraId]: 0 }));
    } else {
      // Desactivar autoplay al colapsar
      setIsAutoPlaying(prev => ({ ...prev, [obraId]: false }));
    }
  };

  // Efecto para el autoplay automático
  useEffect(() => {
    if (!expandedObra || !isAutoPlaying[expandedObra]) return;

    const obra = obras.find(o => o.id === expandedObra);
    if (!obra) return;

    const currentIdx = currentMediaIndex[expandedObra] || 0;
    const currentMedia = obra.media[currentIdx];

    // Si es video, no avanzar automáticamente (se controla por evento onEnded)
    if (currentMedia?.tipo === 'video') return;

    // Para imágenes, avanzar cada 4 segundos
    const timer = setTimeout(() => {
      const nextIdx = (currentIdx + 1) % obra.media.length;
      setCurrentMediaIndex(prev => ({ ...prev, [expandedObra]: nextIdx }));
    }, 4000);

    return () => clearTimeout(timer);
  }, [expandedObra, currentMediaIndex, isAutoPlaying, obras]);

  const nextMedia = (obraId, mediaLength) => {
    setCurrentMediaIndex(prev => ({
      ...prev,
      [obraId]: ((prev[obraId] || 0) + 1) % mediaLength
    }));
    // Pausar autoplay al avanzar manualmente
    setIsAutoPlaying(prev => ({ ...prev, [obraId]: false }));
  };

  const prevMedia = (obraId, mediaLength) => {
    setCurrentMediaIndex(prev => ({
      ...prev,
      [obraId]: (prev[obraId] || 0) === 0 ? mediaLength - 1 : (prev[obraId] || 0) - 1
    }));
    // Pausar autoplay al retroceder manualmente
    setIsAutoPlaying(prev => ({ ...prev, [obraId]: false }));
  };

  const toggleAutoPlay = (obraId) => {
    setIsAutoPlaying(prev => ({ ...prev, [obraId]: !prev[obraId] }));
  };

  const handleVideoEnded = (obraId, obra) => {
    const currentCount = videoPlayCount[obraId] || 0;

    if (currentCount < 2) {
      // Reproducir de nuevo (hasta 3 veces total)
      setVideoPlayCount(prev => ({ ...prev, [obraId]: currentCount + 1 }));
    } else {
      // Después de 3 reproducciones, avanzar al siguiente medio
      const currentIdx = currentMediaIndex[obraId] || 0;
      const nextIdx = (currentIdx + 1) % obra.media.length;
      setCurrentMediaIndex(prev => ({ ...prev, [obraId]: nextIdx }));
      // Resetear contador
      setVideoPlayCount(prev => ({ ...prev, [obraId]: 0 }));
    }
  };

  const openMediaModal = (media, obra) => {
    setSelectedMedia({ media, obra });
  };

  const closeMediaModal = () => {
    setSelectedMedia(null);
  };

  const getMediaUrl = (nombreArchivo, esVideo = false) => {
    if (esVideo) {
      // Para videos - estructura: /video/upload/v1763003722/nombreArchivo.mp4
      return `https://res.cloudinary.com/dlshym1te/video/upload/q_auto,f_auto/v1763003722/${nombreArchivo}.mp4`;
    }
    // Para imágenes - estructura: /image/upload/v1763003722/nombreArchivo.webp
    return `https://res.cloudinary.com/dlshym1te/image/upload/q_auto,f_auto/v1763003722/${nombreArchivo}.webp`;
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
                <div className="obras-accordion">
                  {obras.map((obra) => {
                    const isExpanded = expandedObra === obra.id;
                    const currentIdx = currentMediaIndex[obra.id] || 0;
                    const currentMediaItem = obra.media[currentIdx];

                    return (
                      <div key={obra.id} className={`obra-card ${isExpanded ? 'expanded' : ''}`}>
                        {/* Cabecera colapsable */}
                        <div
                          className="obra-header"
                          onClick={() => toggleObra(obra.id)}
                        >
                          <img
                            src={getMediaUrl(obra.imagenPortada)}
                            alt={obra.titulo}
                            className="obra-thumbnail"
                            loading="lazy"
                          />
                          <div className="obra-header-info">
                            <h3>{obra.titulo}</h3>
                            <p className="obra-ubicacion">{obra.ubicacion}</p>
                            <p className="obra-descripcion">{obra.descripcion}</p>
                            <span className="obra-contador">{obra.media.length} fotos y videos</span>
                          </div>
                          <button className="expand-icon">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                            >
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>
                        </div>

                        {/* Galería expandible */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              className="obra-gallery"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="gallery-viewer">
                                <div
                                  className="media-container"
                                  onClick={() => openMediaModal(currentMediaItem, obra)}
                                >
                                  {currentMediaItem.tipo === 'video' ? (
                                    <video
                                      key={`${obra.id}-${currentIdx}-${videoPlayCount[obra.id] || 0}`}
                                      src={getMediaUrl(currentMediaItem.nombre, true)}
                                      controls
                                      autoPlay
                                      className="media-content"
                                      poster={getMediaUrl(obra.imagenPortada)}
                                      onEnded={() => handleVideoEnded(obra.id, obra)}
                                    >
                                      Tu navegador no soporta el elemento de video.
                                    </video>
                                  ) : (
                                    <img
                                      src={getMediaUrl(currentMediaItem.nombre)}
                                      alt={currentMediaItem.alt}
                                      className="media-content"
                                      loading="lazy"
                                    />
                                  )}
                                  <div className="media-zoom-hint">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="11" cy="11" r="8"></circle>
                                      <path d="m21 21-4.35-4.35"></path>
                                      <line x1="11" y1="8" x2="11" y2="14"></line>
                                      <line x1="8" y1="11" x2="14" y2="11"></line>
                                    </svg>
                                    <span>Click para ampliar</span>
                                  </div>
                                </div>

                                {/* Controles de navegación */}
                                {obra.media.length > 1 && (
                                  <>
                                    <button
                                      className="gallery-nav prev"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        prevMedia(obra.id, obra.media.length);
                                      }}
                                    >
                                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                      </svg>
                                    </button>
                                    <button
                                      className="gallery-nav next"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        nextMedia(obra.id, obra.media.length);
                                      }}
                                    >
                                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                      </svg>
                                    </button>

                                    {/* Indicador de posición */}
                                    <div className="gallery-counter">
                                      {currentIdx + 1} / {obra.media.length}
                                    </div>

                                    {/* Control de Play/Pause */}
                                    <button
                                      className="gallery-play-pause"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleAutoPlay(obra.id);
                                      }}
                                      title={isAutoPlaying[obra.id] ? 'Pausar slideshow' : 'Reproducir slideshow'}
                                    >
                                      {isAutoPlaying[obra.id] ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                          <rect x="6" y="4" width="4" height="16"></rect>
                                          <rect x="14" y="4" width="4" height="16"></rect>
                                        </svg>
                                      ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                        </svg>
                                      )}
                                    </button>

                                    {/* Miniaturas */}
                                    <div className="gallery-thumbnails">
                                      {obra.media.map((mediaItem, idx) => (
                                        <button
                                          key={idx}
                                          className={`thumbnail ${idx === currentIdx ? 'active' : ''}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentMediaIndex(prev => ({ ...prev, [obra.id]: idx }));
                                          }}
                                        >
                                          {mediaItem.tipo === 'video' ? (
                                            <div className="thumbnail-video-icon">
                                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                              </svg>
                                            </div>
                                          ) : (
                                            <img
                                              src={getMediaUrl(mediaItem.nombre)}
                                              alt={`Miniatura ${idx + 1}`}
                                              loading="lazy"
                                            />
                                          )}
                                        </button>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.getElementById('modal-portal')
      )}

      {/* Modal de media ampliada */}
      {selectedMedia && createPortal(
        <AnimatePresence>
          <motion.div
            className="modal-overlay"
            onClick={closeMediaModal}
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
              <button onClick={closeMediaModal} className="close-button">×</button>
              {selectedMedia.media.tipo === 'video' ? (
                <video
                  src={getMediaUrl(selectedMedia.media.nombre, true)}
                  controls
                  autoPlay
                  className="media-fullscreen"
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              ) : (
                <img
                  src={getMediaUrl(selectedMedia.media.nombre)}
                  alt={selectedMedia.media.alt}
                  className="media-fullscreen"
                />
              )}
              <div className="image-caption">
                <h3>{selectedMedia.obra.titulo}</h3>
                <p>{selectedMedia.obra.ubicacion}</p>
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