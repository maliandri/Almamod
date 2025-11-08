// src/utils/seo-metadata.js
// =====================================================================
// METADATA CENTRALIZADO PARA SEO
// Este archivo contiene todos los metadatos SEO de las páginas
// =====================================================================

const SITE_URL = 'https://almamod.com.ar';

export const PAGE_METADATA = {
  // ===================================================================
  // PÁGINA HOME (/)
  // ===================================================================
  home: {
    title: 'Casas Modulares Neuquén | Paneles SIP | AlmaMod',
    description: 'Viviendas modulares certificadas en Neuquén. Entrega en 30 días. Paneles SIP PROPANEL con certificación EDGE Advanced. Desde $15.300.000. Construcción sustentable y sismo-resistente.',
    keywords: [
      'casas modulares neuquen',
      'construccion rapida',
      'paneles sip precio',
      'viviendas prefabricadas',
      'construccion modular patagonia',
      'almamod',
      'propanel neuquen',
      'casas prefabricadas argentina',
      'viviendas sustentables'
    ],
    canonical: '/',
    image: '/og-image.jpg',

    // Schema.org estructurado
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "AlmaMod - Construcción Modular en Neuquén",
      "description": "Viviendas modulares certificadas con Paneles SIP PROPANEL. Entrega en 30 días.",
      "url": `${SITE_URL}/`,
      "publisher": {
        "@type": "Organization",
        "name": "AlmaMod",
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/android-chrome-512x512.png`
        }
      }
    }
  },

  // ===================================================================
  // TIENDA ALMA (/tiendaalma)
  // ===================================================================
  tiendaalma: {
    title: 'Tienda Alma - Catálogo Viviendas Modulares | Precios 2025',
    description: 'Catálogo completo de casas modulares desde $15.300.000. Módulos desde 12m² hasta 36m². MiCasita, Alma 18, Alma 27, Alma 36 y Alma Refugio. Entrega en 30 días.',
    keywords: [
      'tienda casas modulares',
      'catalogo viviendas modulares',
      'precios casas prefabricadas neuquen',
      'modulos habitacionales 2025',
      'micasita precio',
      'alma 36 precio',
      'casas modulares llave en mano'
    ],
    canonical: '/tiendaalma',
    image: '/og-image.jpg',

    schema: {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": "Tienda Alma - AlmaMod",
      "description": "Catálogo de viviendas modulares certificadas",
      "url": `${SITE_URL}/tiendaalma`
    }
  },

  // ===================================================================
  // SISTEMA CONSTRUCTIVO (/sistema-constructivo)
  // ===================================================================
  sistemaConstructivo: {
    title: 'Sistema Constructivo Paneles SIP PROPANEL | Certificación EDGE',
    description: 'Tecnología de construcción modular con Paneles SIP PROPANEL. Certificación EDGE Advanced del Banco Mundial. 40% ahorro energético. Sismo-resistente según normativa INPRES-CIRSOC.',
    keywords: [
      'paneles sip propanel',
      'sistema constructivo sip',
      'certificacion edge advanced',
      'construccion sismo resistente',
      'paneles estructurales aislados',
      'tecnologia construccion modular',
      'eficiencia energetica construccion'
    ],
    canonical: '/sistema-constructivo',
    noindex: true, // Modal sobre la home

    schema: {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": "Sistema Constructivo Paneles SIP PROPANEL",
      "description": "Tecnología de construcción modular certificada con ahorro energético del 40%",
      "url": `${SITE_URL}/sistema-constructivo`
    }
  },

  // ===================================================================
  // OBRAS (/obras)
  // ===================================================================
  obras: {
    title: 'Nuestras Obras - Proyectos Entregados | AlmaMod',
    description: 'Galería de proyectos de construcción modular entregados en Neuquén y Patagonia. Viviendas, cabañas y módulos habitacionales con Paneles SIP PROPANEL.',
    keywords: [
      'obras construccion modular',
      'proyectos casas modulares',
      'viviendas entregadas neuquen',
      'galeria proyectos modular',
      'construcciones patagonia'
    ],
    canonical: '/obras',
    noindex: true, // Modal sobre la home

    schema: {
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      "name": "Galería de Obras AlmaMod",
      "description": "Proyectos de construcción modular entregados",
      "url": `${SITE_URL}/obras`
    }
  },

  // ===================================================================
  // UBICACIÓN (/ubicacion)
  // ===================================================================
  ubicacion: {
    title: 'Ubicación y Contacto | AlmaMod Neuquén',
    description: 'Visitá nuestro showroom en Neuquén Capital. C. la Caña de Azúcar 18, Q8300. WhatsApp: +54 299 408-7106. Email: info@almamod.com.ar. Horario: Lun-Vie 9-18hs.',
    keywords: [
      'almamod ubicacion',
      'showroom neuquen',
      'contacto almamod',
      'direccion almamod',
      'casas modulares neuquen capital'
    ],
    canonical: '/ubicacion',
    noindex: true, // Modal sobre la home

    schema: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "AlmaMod - Construcción Modular",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "C. la Caña de Azúcar 18",
        "addressLocality": "Neuquén",
        "addressRegion": "Neuquén",
        "postalCode": "8300",
        "addressCountry": "AR"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -38.9516,
        "longitude": -68.0591
      },
      "url": `${SITE_URL}/ubicacion`,
      "telephone": "+54-299-408-7106",
      "email": "info@almamod.com.ar"
    }
  }
};

// ===================================================================
// FUNCIONES AUXILIARES
// ===================================================================

/**
 * Obtiene metadata de una página específica
 * @param {string} pageName - Nombre de la página (home, tiendaalma, etc.)
 * @returns {object} Metadata de la página
 */
export const getPageMetadata = (pageName) => {
  return PAGE_METADATA[pageName] || PAGE_METADATA.home;
};

/**
 * Genera URL canónica completa
 * @param {string} path - Path relativo (/tiendaalma, /obras, etc.)
 * @returns {string} URL canónica completa
 */
export const getCanonicalUrl = (path) => {
  // Asegurar que path comienza con /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Remover trailing slash excepto para root
  const finalPath = cleanPath === '/' ? '/' : cleanPath.replace(/\/$/, '');
  return `${SITE_URL}${finalPath}`;
};

/**
 * Genera metadata de producto para TiendaAlma
 * @param {object} producto - Datos del producto
 * @returns {object} Metadata del producto
 */
export const getProductMetadata = (producto) => {
  return {
    title: `${producto.nombre} ${producto.superficie} - ${producto.habitaciones}`,
    description: producto.descripcion,
    keywords: producto.keywordsPrincipales || [],
    canonical: `/tiendaalma/${producto.slug}`,
    image: producto.imagenPortada,
    type: 'product'
  };
};

export default PAGE_METADATA;
