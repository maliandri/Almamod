import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCloudinaryUrl, IMG_CARD, IMG_DETAIL } from '../config/cloudinary';
import SEO from './SEO';
import { PAGES } from '../seo';
import './Certificaciones.css';

// Data centralizada de certificaciones
const certificacionesData = {
  cat: {
    id: 'cat',
    slug: 'cat',
    nombre: 'Certificado de Aptitud Técnica (CAT)',
    icono: 'CAT-CERTIFICADO_APTITUD_TECNICA.WEBP',
    certificado: 'cat_propanelcert.webp',
    color: '#3b82f6',
    descripcion: 'El Certificado de Aptitud Técnica (CAT) es un certificado que extiende el Ministerio de Desarrollo Territorial y Hábitat a todo sistema constructivo considerado "no tradicional". Este certificado regula, clasifica y aprueba aquellos sistemas constructivos no tradicionales que se implementan en planes de vivienda social o en toda construcción financiada con fondos estatales. AlmaMod utiliza exclusivamente Paneles SIP PROPANEL certificados con CAT, garantizando el cumplimiento de todos los estándares técnicos requeridos.',
    beneficios: [
      {
        titulo: 'Eficiencia Térmica Superior',
        detalle: 'Aislación térmica de hasta 10 veces superior a la construcción tradicional. Reducción de hasta 70% en costos de climatización.'
      },
      {
        titulo: 'Resistencia Estructural',
        detalle: 'Capacidad de carga de hasta 20 toneladas por metro cuadrado. Resistencia a vientos de hasta 200 km/h.'
      },
      {
        titulo: 'Construcción Sustentable',
        detalle: 'Materiales reciclables y de bajo impacto ambiental. Reducción de residuos de obra en un 90%.'
      },
      {
        titulo: 'Rapidez de Montaje',
        detalle: 'Construcción hasta 5 veces más rápida que métodos tradicionales. Tu hogar listo en semanas, no meses.'
      },
      {
        titulo: 'Aislación Acústica',
        detalle: 'Reducción de ruido de hasta 55 decibeles. Confort acústico garantizado.'
      },
      {
        titulo: 'Durabilidad Comprobada',
        detalle: 'Vida útil superior a 50 años. Garantía estructural respaldada por fabricante.'
      }
    ],
    specs: [
      'Espesor del panel: 9cm',
      'Transmitancia térmica: K=0.28 W/m²K',
      'Densidad del poliuretano: 40 kg/m³',
      'Placas OSB de 11mm de espesor',
      'Resistencia al fuego: Clase B según normas IRAM',
      'Certificación IRAM para uso estructural'
    ]
  },
  cas: {
    id: 'cas',
    slug: 'cas',
    nombre: 'Certificado de Aptitud Sismorresistente (CAS)',
    icono: 'cat-sismoresistente-icono.webp',
    certificado: 'cas_propanel_1.webp',
    certificado2: 'zona_sismicas_argentina.webp',
    color: '#dc2626',
    descripcion: 'El Sistema Constructivo PROPANEL® posee Certificado de Aptitud Sismorresistente (CAS) otorgado por el Instituto Nacional de Prevención Sísmica (INPRES), dependiente del Ministerio de Obras - Secretaría de Obras Públicas. Los requerimientos reglamentarios varían según la zona de emplazamiento de la obra, siendo más severos para la zona 4 y disminuyendo según la peligrosidad sísmica de cada zona.',
    beneficios: [
      {
        titulo: 'Estructura Monolítica',
        detalle: 'El sistema de panel completo actúa como una sola unidad estructural, distribuyendo las cargas sísmicas de manera uniforme y eficiente.'
      },
      {
        titulo: 'Flexibilidad Controlada',
        detalle: 'Capacidad de absorber y disipar energía sísmica sin comprometer la integridad estructural. Diseño que se mueve con el sismo.'
      },
      {
        titulo: 'Peso Reducido',
        detalle: 'Hasta 10 veces más liviano que construcción tradicional, reduciendo las fuerzas de inercia en caso de sismo.'
      },
      {
        titulo: 'Sin Colapso',
        detalle: 'A diferencia de mampostería tradicional, el sistema PROPANEL no se desmorona ni colapsa ante movimientos sísmicos intensos.'
      },
      {
        titulo: 'Seguridad Comprobada',
        detalle: 'Ensayos y certificaciones en zonas sísmicas de alta actividad. Construcciones aprobadas en Chile y California.'
      },
      {
        titulo: 'Adaptado a Patagonia',
        detalle: 'Diseño específico para resistir las condiciones sísmicas y climáticas extremas de la región patagónica.'
      }
    ],
    specs: [
      'Certificación sismo-resistente IRAM',
      'Zona sísmica: 2-4 (alta resistencia)',
      'Ensayos sísmicos aprobados',
      'Coeficiente sísmico optimizado',
      'Uniones estructurales reforzadas',
      'Fundaciones adaptadas a sismicidad'
    ]
  },
  edge: {
    id: 'edge',
    slug: 'edge',
    nombre: 'EDGE Advanced Certified',
    icono: 'edge-icono.webp',
    certificado: 'edge_advance_propanelCERT.webp',
    color: '#16a34a',
    descripcion: 'Nuestras construcciones con sistema PROPANEL están certificadas EDGE Advanced, el estándar internacional de construcción sustentable del International Finance Corporation (Grupo Banco Mundial). Esto nos posiciona como líderes en construcción verde en Argentina.',
    beneficios: [
      {
        titulo: 'Eficiencia Energética Extrema',
        detalle: 'Reducción mínima del 40% en consumo energético comparado con construcciones tradicionales. Ahorro real en tus facturas mes a mes.'
      },
      {
        titulo: 'Ahorro de Agua',
        detalle: 'Sistemas que reducen el consumo de agua en un 20% mínimo. Compromiso con el recurso más valioso del planeta.'
      },
      {
        titulo: 'Energía Incorporada',
        detalle: 'Reducción del 20% en energía incorporada de materiales. Menor huella de carbono desde la fabricación.'
      },
      {
        titulo: 'Valorización Inmobiliaria',
        detalle: 'Las propiedades certificadas EDGE tienen un valor de reventa hasta 25% superior. Inversión que se revaloriza.'
      },
      {
        titulo: 'Acceso a Financiamiento Verde',
        detalle: 'Elegibilidad para créditos hipotecarios verdes con mejores tasas y condiciones especiales.'
      },
      {
        titulo: 'Confort y Salud',
        detalle: 'Espacios más saludables con mejor calidad de aire interior y temperatura estable todo el año.'
      }
    ],
    specs: [
      'Certificación EDGE Advanced',
      'Reducción energética: 40%+',
      'Reducción consumo agua: 20%+',
      'Reducción energía incorporada: 20%+',
      'Verificado por IFC (Banco Mundial)',
      'Huella de carbono compensada'
    ]
  },
  cacmi: {
    id: 'cacmi',
    slug: 'cacmi',
    nombre: 'Certificación CACMI',
    icono: 'cacmi-icono.webp',
    certificado: 'cacmicert.webp',
    color: '#f59e0b',
    descripcion: 'AlmaMod es miembro certificado de CACMI (Cámara Argentina de la Construcción Modular e Industrializada), la entidad que regula y certifica los más altos estándares de calidad en construcción modular en Argentina.',
    beneficios: [
      {
        titulo: 'Garantía de Calidad',
        detalle: 'Cumplimiento verificado de todas las normativas argentinas de construcción modular y estándares internacionales.'
      },
      {
        titulo: 'Proceso Certificado',
        detalle: 'Nuestros procesos de fabricación están auditados y certificados por CACMI, garantizando excelencia en cada etapa.'
      },
      {
        titulo: 'Respaldo Institucional',
        detalle: 'Contás con el respaldo de la entidad más importante de construcción modular del país.'
      },
      {
        titulo: 'Innovación Constante',
        detalle: 'Acceso a las últimas tecnologías y mejores prácticas de la industria modular.'
      },
      {
        titulo: 'Compromiso Ético',
        detalle: 'Adherimos al código de ética y buenas prácticas de CACMI, garantizando transparencia y profesionalismo.'
      },
      {
        titulo: 'Red de Excelencia',
        detalle: 'Formamos parte de una red de empresas líderes comprometidas con la calidad y la innovación.'
      }
    ],
    specs: [
      'Certificación CACMI vigente',
      'Cumplimiento normas IRAM',
      'Auditorías periódicas de calidad',
      'Procesos de fabricación certificados',
      'Capacitación continua del personal',
      'Trazabilidad completa de materiales'
    ]
  }
};

function CertificacionDetalle() {
  const { slug } = useParams();

  const cert = certificacionesData[slug];

  // Si no existe la certificación, redirigir a home
  if (!cert) {
    return <Navigate to="/" replace />;
  }

  // Obtener metadata SEO centralizada
  const seoData = PAGES[slug] || {
    title: `${cert.nombre} | AlmaMod`,
    description: cert.descripcion.substring(0, 155),
    canonical: `/${cert.slug}`,
    image: '/og-image.jpg',
    type: 'article'
  };

  return (
    <>
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonical={seoData.canonical}
        image={seoData.image}
        type={seoData.type}
      />

      <div className="cert-detalle-page">
        {/* Contenido principal */}
        <motion.div
          className="cert-modal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Botón volver dentro del modal */}
          <div className="cert-detalle-header-interno">
            <Link to="/" className="cert-volver-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Volver al Inicio
            </Link>
          </div>

          <div className="cert-modal-header" style={{ borderColor: cert.color }}>
            <div className="cert-modal-icon">
              <img
                src={getCloudinaryUrl(cert.icono, IMG_CARD)}
                alt={cert.nombre}
                loading="eager"
              />
            </div>
            <h1 style={{ color: cert.color }}>{cert.nombre}</h1>
          </div>

          <div className="cert-modal-body">
            <div className="cert-modal-certificado">
              <img
                src={getCloudinaryUrl(cert.certificado, IMG_DETAIL)}
                alt={`Certificado ${cert.nombre}`}
                loading="eager"
              />
            </div>

            <div className="cert-modal-content">
              <div className="cert-descripcion">
                <p>{cert.descripcion}</p>
              </div>

              <div className="cert-beneficios">
                <h2>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Beneficios y Ventajas
                </h2>
                <div className="beneficios-grid">
                  {cert.beneficios.map((beneficio, idx) => (
                    <motion.div
                      key={idx}
                      className="beneficio-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="beneficio-header">
                        <span className="beneficio-icon" style={{ background: cert.color }}>✓</span>
                        <h3>{beneficio.titulo}</h3>
                      </div>
                      <p>{beneficio.detalle}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="cert-specs">
                <h2>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                  Especificaciones Técnicas
                </h2>
                <ul className="specs-list">
                  {cert.specs.map((spec, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.05 }}
                    >
                      <span className="spec-bullet" style={{ background: cert.color }}>→</span>
                      {spec}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="cert-footer">
                <div className="cert-garantia" style={{ borderColor: cert.color }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={cert.color} strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <path d="M9 12l2 2 4-4"></path>
                  </svg>
                  <div>
                    <strong>Garantía AlmaMod</strong>
                    <p>Todos nuestros módulos cuentan con certificaciones vigentes y garantía de calidad respaldada</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// Exportar también la data para usarla en Certificaciones.jsx
export { certificacionesData };
export default CertificacionDetalle;
