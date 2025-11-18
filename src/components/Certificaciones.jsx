import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCloudinaryUrl, IMG_CARD } from '../config/cloudinary';
import './Certificaciones.css';

function Certificaciones() {
  const certificaciones = [
    {
      id: 'cat',
      slug: 'cat',
      nombre: 'Certificado de Aptitud Técnica (CAT)',
      icono: 'CAT-CERTIFICADO_APTITUD_TECNICA.WEBP',
      color: '#3b82f6',
    },
    {
      id: 'cas',
      slug: 'cas',
      nombre: 'Certificado de Aptitud Sismorresistente (CAS)',
      icono: 'cat-sismoresistente-icono.webp',
      color: '#dc2626',
    },
    {
      id: 'edge',
      slug: 'edge',
      nombre: 'EDGE Advanced Certified',
      icono: 'edge-icono.webp',
      color: '#16a34a',
    },
    {
      id: 'cacmi',
      slug: 'cacmi',
      nombre: 'Certificación CACMI',
      icono: 'cacmi-icono.webp',
      color: '#f59e0b',
    }
  ];

  return (
    <div className="certificaciones-container">
      <div className="certificaciones-barra">
        <div className="certificaciones-titulo">
          <h3>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="M9 12l2 2 4-4"></path>
            </svg>
            Certificaciones y Estándares de Calidad
          </h3>
        </div>

        <div className="certificaciones-botones">
          {certificaciones.map((cert) => (
            <motion.div
              key={cert.id}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={`/${cert.slug}`}
                className="cert-boton"
                style={{ '--cert-color': cert.color }}
              >
                <div className="cert-boton-imagen">
                  <img
                    src={getCloudinaryUrl(cert.icono, IMG_CARD)}
                    alt={cert.nombre}
                    loading="lazy"
                  />
                </div>
                <span>{cert.nombre}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Certificaciones;
