import React from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import { motion } from 'framer-motion';
import { getCloudinaryUrl, IMG_CARD, IMG_DETAIL } from '../config/cloudinary';
import './CertificacionesPage.css';

function CertificacionesPage() {
  const certificaciones = [
    {
      id: 'propanel',
      nombre: 'Sistema PROPANEL',
      icono: 'PROPANEL-iicono.webp',
      certificado: 'cat_propanelcert.webp',
      color: '#3b82f6',
      descripcion: 'AlmaMod utiliza exclusivamente Paneles SIP PROPANEL, el sistema constructivo más avanzado de Argentina. Fabricados con tecnología de última generación, estos paneles estructurales aislados combinan placas de OSB de alta densidad con núcleo de espuma rígida de poliuretano.',
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
    {
      id: 'cacmi',
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
    },
    {
      id: 'edge',
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
    {
      id: 'sismo',
      nombre: 'Sismo Resistente',
      icono: 'cat-sismoresistente-icono.webp',
      certificado: 'cat_propaneltermoresistente.webp',
      color: '#dc2626',
      descripcion: 'Los Paneles SIP PROPANEL utilizados por AlmaMod están específicamente diseñados y certificados para zonas sísmicas. Su estructura monolítica y flexibilidad controlada brindan una resistencia superior ante movimientos telúricos, fundamental en la región patagónica.',
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
    }
  ];

  return (
    <>
      <SEO 
        title="Certificaciones - PROPANEL, CACMI, EDGE Advanced"
        description="AlmaMod cuenta con certificaciones PROPANEL, CACMI y EDGE Advanced del Banco Mundial. Construcción modular sustentable certificada con los más altos estándares de calidad."
        keywords="certificaciones almamod, propanel certificado, cacmi construcción modular, edge advanced argentina, construcción sustentable certificada, sismo resistente"
        canonical="/certificaciones"
        schema={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "AlmaMod",
          "url": "https://www.almamod.com.ar",
          "logo": "https://www.almamod.com.ar/logo.png",
          "description": "Construcción modular sustentable certificada",
          "hasCredential": [
            {
              "@type": "EducationalOccupationalCredential",
              "name": "Certificación PROPANEL",
              "credentialCategory": "Construcción Modular"
            },
            {
              "@type": "EducationalOccupationalCredential",
              "name": "Certificación CACMI",
              "credentialCategory": "Construcción Modular Industrializada"
            },
            {
              "@type": "EducationalOccupationalCredential",
              "name": "EDGE Advanced Certification",
              "credentialCategory": "Construcción Sustentable",
              "recognizedBy": {
                "@type": "Organization",
                "name": "International Finance Corporation - World Bank Group"
              }
            }
          ]
        }}
      />

      <div className="certificaciones-page">
        {/* Header con navegación */}
        <header className="cert-page-header">
          <div className="cert-header-content">
            <Link to="/" className="back-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Volver al inicio
            </Link>
            <h1>Nuestras Certificaciones y Estándares de Calidad</h1>
            <p className="cert-subtitle">
              AlmaMod está respaldado por las certificaciones más prestigiosas de la industria de construcción modular y sustentable en Argentina y el mundo.
            </p>
          </div>
        </header>

        {/* Grid de certificaciones */}
        <section className="cert-grid-section">
          <div className="cert-grid">
            {certificaciones.map((cert, index) => (
              <motion.article
                key={cert.id}
                className="cert-card-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Header de la certificación */}
                <div className="cert-card-header" style={{ borderColor: cert.color }}>
                  <div className="cert-icon-large">
                    <img 
                      src={getCloudinaryUrl(cert.icono, IMG_CARD)} 
                      alt={cert.nombre}
                      loading="lazy"
                    />
                  </div>
                  <h2 style={{ color: cert.color }}>{cert.nombre}</h2>
                </div>

                {/* Imagen del certificado */}
                <div className="cert-image-container">
                  <img 
                    src={getCloudinaryUrl(cert.certificado, IMG_DETAIL)} 
                    alt={`Certificado ${cert.nombre}`}
                    loading="lazy"
                  />
                </div>

                {/* Descripción */}
                <div className="cert-description">
                  <p>{cert.descripcion}</p>
                </div>

                {/* Beneficios */}
                <div className="cert-benefits">
                  <h3 style={{ color: cert.color }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Beneficios y Ventajas
                  </h3>
                  <div className="benefits-grid">
                    {cert.beneficios.map((beneficio, idx) => (
                      <div key={idx} className="benefit-item">
                        <div className="benefit-icon" style={{ background: cert.color }}>✓</div>
                        <div className="benefit-content">
                          <h4>{beneficio.titulo}</h4>
                          <p>{beneficio.detalle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Especificaciones técnicas */}
                <div className="cert-specs-section">
                  <h3 style={{ color: cert.color }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    Especificaciones Técnicas
                  </h3>
                  <ul className="specs-list">
                    {cert.specs.map((spec, idx) => (
                      <li key={idx}>
                        <span className="spec-bullet" style={{ color: cert.color }}>→</span>
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="cert-cta">
          <div className="cert-cta-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d4a574" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="M9 12l2 2 4-4"></path>
            </svg>
            <h2>Garantía de Calidad AlmaMod</h2>
            <p>
              Todos nuestros módulos cuentan con certificaciones vigentes y garantía de calidad respaldada por las instituciones más prestigiosas del sector.
            </p>
            <div className="cta-buttons">
              <Link to="/tiendaalma" className="cta-button primary">
                Ver Módulos Certificados
              </Link>
              <a 
                href="https://wa.me/5492994087106?text=Hola! Me gustaría conocer más sobre las certificaciones de AlmaMod"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button secondary"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default CertificacionesPage;