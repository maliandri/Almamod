import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { getCloudinaryUrl, IMG_CARD } from '../config/cloudinary';
import './SistemaConstructivo.css';

// Ícono del botón con imagen de PROPANEL - EXPORTADO
export const SistemaConstructivoIcon = () => (
  <div 
    style={{
      width: '24px',
      height: '24px',
      borderRadius: '4px',
      backgroundImage: `url(${getCloudinaryUrl('PROPANEL-iicono.webp', IMG_CARD)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      flexShrink: 0
    }}
  />
);

function SistemaConstructivo({ isOpen, onClose }) {
  const [expandedCard, setExpandedCard] = useState(null);
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true });

  const stats = [
    {
      valor: '50%',
      label: 'Ahorro en energía de climatización',
      icon: '⚡',
      color: '#16a34a'
    },
    {
      valor: '70%',
      label: 'Reducción en tiempos de construcción',
      icon: '🚀',
      color: '#3b82f6'
    },
    {
      valor: '90%',
      label: 'Menos residuos de obra',
      icon: '♻️',
      color: '#16a34a'
    },
    {
      valor: '50+',
      label: 'Años de vida útil garantizada',
      icon: '🏆',
      color: '#d4a574'
    }
  ];

  const technicalData = [
    { id: 1, icon: '📋', title: 'Composición', value: 'Panel SIP', detail: 'OSB 9.5mm + EPS 15 kg/m³ + OSB 9.5mm', color: '#1e3a8a' },
    { id: 2, icon: '📏', title: 'Dimensiones', value: '1.22 x 2.44m', detail: 'Espesor: 75-150mm según proyecto', color: '#1e40af' },
    { id: 3, icon: '⚖️', title: 'Peso Panel', value: '63-66 kg', detail: 'Panel de 100mm de espesor', color: '#1e3a8a' },
    { id: 4, icon: '🔥', title: 'Resistencia Fuego', value: 'Clase B', detail: 'Autoextinguible IRAM/ASTM', color: '#dc2626' },
    { id: 5, icon: '💪', title: 'Carga Compresión', value: '87.84 kN', detail: 'Carga característica certificada', color: '#1e40af' },
    { id: 6, icon: '🎯', title: 'Impacto Blando', value: '360 Joules', detail: 'Sin daño estructural (IRAM 11596)', color: '#16a34a' },
    { id: 7, icon: '⚡', title: 'Impacto Acero', value: '2 metros', detail: 'Sin perforación (IRAM 11595)', color: '#1e3a8a' },
    { id: 8, icon: '🌡️', title: 'Transmitancia', value: 'K=0.28', detail: 'W/m²K - Aislación térmica superior', color: '#1e40af' },
    { id: 9, icon: '🔬', title: 'Laboratorio', value: 'UNCo GEPSyN', detail: 'Ensayos certificados 2016', color: '#1e3a8a' },
    { id: 10, icon: '✅', title: 'Normativas', value: 'IRAM 11588', detail: 'IRAM 11595/96 - ASTM D4986', color: '#16a34a' },
    { id: 11, icon: '🏗️', title: 'Resistencia', value: '121-147 kN', detail: 'Carga máxima alcanzada en tests', color: '#1e40af' },
    { id: 12, icon: '📐', title: 'Deformación', value: '< 3mm', detail: 'Deformación axial bajo carga', color: '#1e3a8a' }
  ];

  const razones = [
    {
      id: 1,
      titulo: 'Eficiencia Energética Superior',
      icon: '⚡',
      color: '#16a34a',
      resumen: 'Una casa construida con PROPANEL® es un sobre hermético con 50% de ahorro en climatización.',
      detalles: [
        'Sistema de construcción hermético que elimina puentes térmicos',
        'Reducción del 50% en costos de calefacción y aire acondicionado',
        'Menor huella de carbono y consumo de combustibles',
        'Confort térmico constante durante todo el año',
        'Certificación EDGE Advanced por eficiencia energética'
      ]
    },
    {
      id: 2,
      titulo: 'Calidad de Aire Interior',
      icon: '🌬️',
      color: '#3b82f6',
      resumen: 'Control total del ambiente interior para un hogar más saludable y limpio.',
      detalles: [
        'Reducción significativa de infiltración de aire no controlada',
        'Menor ingreso de polvo, alérgenos y contaminantes externos',
        'Control de humedad optimizado previene moho y hongos',
        'Ambiente interior más saludable para toda la familia',
        'Ideal para personas con alergias o problemas respiratorios'
      ]
    },
    {
      id: 3,
      titulo: 'Durabilidad y Resistencia',
      icon: '🛡️',
      color: '#dc2626',
      resumen: 'Resistencia comprobada a vientos extremos y fuerzas sísmicas.',
      detalles: [
        'Estructura monolítica que distribuye cargas uniformemente',
        'Resistencia a vientos de hasta 200 km/h',
        'Certificado de Aptitud Sismorresistente (CAS) por INPRES',
        'Vida útil superior a 50 años con mantenimiento mínimo',
        'Mayor durabilidad que construcción tradicional'
      ]
    },
    {
      id: 4,
      titulo: 'Construcción Rápida',
      icon: '🚀',
      color: '#f59e0b',
      resumen: 'Reducción significativa en tiempos de obra y costos de mano de obra.',
      detalles: [
        'Hasta 70% más rápido que construcción tradicional',
        'Paneles prefabricados listos para montar',
        'Menos mano de obra especializada requerida',
        'Tu hogar listo en semanas, no en meses',
        'Menor impacto en tu vida durante la construcción'
      ]
    },
    {
      id: 5,
      titulo: 'Sustentabilidad Ambiental',
      icon: '♻️',
      color: '#16a34a',
      resumen: 'Construcción ecológica con mínimo impacto ambiental.',
      detalles: [
        'Reducción del 90% en residuos de obra vs construcción tradicional',
        'Materiales reciclables y de bajo impacto ambiental',
        'Certificación EDGE Advanced en construcción sustentable',
        'Menor consumo de agua durante la construcción',
        'Contribución activa al cuidado del medio ambiente'
      ]
    }
  ];

  const especificaciones = [
    { label: 'Tipo de Panel', valor: 'SIP (Structural Insulated Panel)' },
    { label: 'Núcleo Aislante', valor: 'Poliestireno Expandido de alta densidad' },
    { label: 'Revestimiento', valor: 'OSB (Oriented Strand Board) en ambas caras' },
    { label: 'Espesor Standard', valor: '9 cm (personalizable)' },
    { label: 'Transmitancia Térmica', valor: 'K=0.28 W/m²K' },
    { label: 'Resistencia al Fuego', valor: 'Clase B según normas IRAM' }
  ];

  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="modal-content sistema-constructivo-modal"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <div className="modal-header">
            <h2>Sistema Constructivo PROPANEL®</h2>
            <button onClick={onClose} className="close-button">×</button>
          </div>
          
          <div className="modal-body sistema-constructivo-body">
            {/* Contenido del sistema constructivo */}
            <div className="sistema-constructivo">
              {/* Hero Section con Grid Layout */}
              <section className="hero-section">
                <div className="hero-content-grid">
                  <motion.div
                    className="hero-text"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <motion.div 
                      className="hero-badge"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      🏗️ Tecnología de Construcción Avanzada
                    </motion.div>
                    
                    <h1>Sistema Constructivo PROPANEL®</h1>
                    
                    <p className="hero-description">
                      Paneles SIP (Structural Insulated Panel) térmicos estructurales prefabricados con núcleo 
                      aislante de poliestireno expandido, revestido en ambas caras por tableros de virutas 
                      orientadas (OSB). La tecnología más avanzada de construcción sustentable.
                    </p>

                    <div className="hero-origin">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                      <span>Ampliamente usado en Estados Unidos, Canadá y Europa</span>
                    </div>

                    <motion.a
                      href={getCloudinaryUrl('informe_propanel_unco.pdf', IMG_CARD)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hero-pdf-button"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      <span>Descargar Dossier Técnico Completo</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </motion.a>
                  </motion.div>

                  {/* Technical Cards Grid - A la derecha del título */}
                  <div className="technical-cards-container">
                    <div className="technical-cards-header">
                      <h3>Datos Técnicos Certificados</h3>
                    </div>
                    <div className="technical-cards-grid">
                      {technicalData && technicalData.length > 0 ? (
                        technicalData.map((tech, idx) => (
                          <motion.div
                            key={tech.id}
                            className="technical-card"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.03 }}
                            whileHover={{ x: 4 }}
                            style={{ '--tech-color': tech.color }}
                          >
                            <div className="tech-icon" style={{ color: tech.color }}>
                              {tech.icon}
                            </div>
                            <div className="tech-content">
                              <div className="tech-title">{tech.title}</div>
                              <div className="tech-value" style={{ color: tech.color }}>
                                {tech.value}
                              </div>
                              <div className="tech-detail">{tech.detail}</div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div style={{ color: '#d4a574', padding: '2rem', textAlign: 'center' }}>
                          Cargando datos técnicos...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Stats Section */}
              <section className="stats-section" ref={statsRef}>
                <div className="stats-grid">
                  {stats.map((stat, idx) => (
                    <motion.div
                      key={idx}
                      className="stat-card"
                      initial={{ opacity: 0, y: 30 }}
                      animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                    >
                      <div className="stat-icon" style={{ color: stat.color }}>
                        {stat.icon}
                      </div>
                      <motion.div 
                        className="stat-valor"
                        initial={{ scale: 0 }}
                        animate={isStatsInView ? { scale: 1 } : {}}
                        transition={{ duration: 0.5, delay: idx * 0.1 + 0.3, type: "spring" }}
                        style={{ color: stat.color }}
                      >
                        {stat.valor}
                      </motion.div>
                      <div className="stat-label">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* 5 Razones Section */}
              <section className="razones-section">
                <motion.div
                  className="razones-header"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2>5 Razones para Construir con PROPANEL®</h2>
                  <p>Beneficios comprobados que hacen la diferencia en tu proyecto</p>
                </motion.div>

                <div className="razones-grid">
                  {razones.map((razon, idx) => (
                    <motion.div
                      key={razon.id}
                      className={`razon-card ${expandedCard === razon.id ? 'expanded' : ''}`}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      whileHover={{ y: -8 }}
                      onClick={() => setExpandedCard(expandedCard === razon.id ? null : razon.id)}
                      style={{ '--razon-color': razon.color }}
                    >
                      <div className="razon-header">
                        <div className="razon-icon" style={{ background: razon.color }}>
                          {razon.icon}
                        </div>
                        <div className="razon-numero" style={{ color: razon.color }}>
                          {String(razon.id).padStart(2, '0')}
                        </div>
                      </div>

                      <h3>{razon.titulo}</h3>
                      <p className="razon-resumen">{razon.resumen}</p>

                      <motion.div
                        className="razon-detalles"
                        initial={false}
                        animate={{
                          height: expandedCard === razon.id ? 'auto' : 0,
                          opacity: expandedCard === razon.id ? 1 : 0
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <ul>
                          {razon.detalles.map((detalle, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={expandedCard === razon.id ? { opacity: 1, x: 0 } : {}}
                              transition={{ delay: i * 0.05 }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={razon.color} strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              {detalle}
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>

                      <div className="razon-expand-btn">
                        <motion.span
                          animate={{ rotate: expandedCard === razon.id ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          ▼
                        </motion.span>
                        {expandedCard === razon.id ? 'Ver menos' : 'Ver más detalles'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Especificaciones Técnicas */}
              <section className="especificaciones-section">
                <motion.div
                  className="especificaciones-header"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    Especificaciones Técnicas
                  </h2>
                </motion.div>

                <div className="especificaciones-grid">
                  {especificaciones.map((spec, idx) => (
                    <motion.div
                      key={idx}
                      className="spec-item"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      whileHover={{ x: 8 }}
                    >
                      <div className="spec-label">{spec.label}</div>
                      <div className="spec-valor">{spec.valor}</div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="especificaciones-footer"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  <div className="footer-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d4a574" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      <path d="M9 12l2 2 4-4"></path>
                    </svg>
                  </div>
                  <div>
                    <strong>Certificaciones Oficiales</strong>
                    <p>Sistema avalado por CAT, CAS, EDGE Advanced y CACMI</p>
                  </div>
                </motion.div>
              </section>
            </div>
            {/* Fin del contenido del sistema constructivo */}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.getElementById('modal-portal')
  );
}

export default SistemaConstructivo;