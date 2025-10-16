// seo-metadata.js - Metadata SEO para AlmaMod
// Este archivo contiene toda la metadata necesaria para optimizar el SEO

// ============================================
// 1. METADATA GENERAL DEL SITIO (index.html)
// ============================================

export const SITE_METADATA = {
  title: "AlmaMod - Construcción Modular en Neuquén | Paneles SIP PROPANEL",
  description: "Construimos viviendas modulares sustentables en Neuquén con Paneles SIP PROPANEL. Certificación EDGE, CACMI y sismo-resistente. Entrega en 30 días. Eficiencia energética superior.",
  keywords: "construcción modular, paneles SIP, PROPANEL, viviendas modulares Neuquén, construcción sustentable, EDGE certified, sismo resistente, construcción rápida, eficiencia energética, AlmaMod, casas modulares Patagonia",
  author: "AlmaMod - Construcción Modular",
  robots: "index, follow",
  googlebot: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  language: "es-AR",
  geo: {
    region: "AR-Q",
    placename: "Neuquén, Argentina",
    position: "-38.9516;-68.0591"
  }
};

// ============================================
// 2. OPEN GRAPH (Redes Sociales)
// ============================================

export const OPEN_GRAPH = {
  type: "website",
  title: "AlmaMod - Construcción Modular Sustentable en Neuquén",
  description: "Viviendas modulares con Paneles SIP PROPANEL. Certificación EDGE Advanced. Entrega en 30 días. Construido en Neuquén para la Patagonia.",
  url: "https://www.almamod.com.ar",
  siteName: "AlmaMod",
  image: "https://www.almamod.com.ar/og-image.jpg",
  imageWidth: 1200,
  imageHeight: 630,
  locale: "es_AR"
};

// Twitter Card
export const TWITTER_CARD = {
  card: "summary_large_image",
  site: "@almamod",
  title: "AlmaMod - Construcción Modular en Neuquén",
  description: "Viviendas modulares sustentables con Paneles SIP PROPANEL",
  image: "https://www.almamod.com.ar/twitter-card.jpg"
};

// ============================================
// 3. SCHEMA.ORG - ORGANIZACIÓN
// ============================================

export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AlmaMod",
  "alternateName": "AlmaMod Construcción Modular",
  "url": "https://www.almamod.com.ar",
  "logo": "https://www.almamod.com.ar/logo-almamod.png",
  "description": "Empresa de construcción modular especializada en viviendas sustentables con Paneles SIP PROPANEL en Neuquén, Patagonia Argentina.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Dirección de AlmaMod",
    "addressLocality": "Neuquén",
    "addressRegion": "Neuquén",
    "postalCode": "8300",
    "addressCountry": "AR"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+54-299-408-7106",
    "contactType": "Ventas",
    "availableLanguage": ["es"],
    "areaServed": ["AR-Q", "AR-R"]
  },
  "sameAs": [
    "https://www.facebook.com/almamod",
    "https://www.instagram.com/almamod",
    "https://www.linkedin.com/company/almamod"
  ],
  "founder": {
    "@type": "Person",
    "name": "Fundador de AlmaMod"
  },
  "foundingDate": "2020",
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": "-38.9516",
      "longitude": "-68.0591"
    },
    "geoRadius": "500000"
  }
};

// ============================================
// 4. SCHEMA.ORG - PRODUCTOS (TiendaAlma)
// ============================================

export const PRODUCT_SCHEMAS = {
  micasita: {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "MiCasita - Módulo Habitacional 12m²",
    "image": "https://res.cloudinary.com/tu-cloud/image/upload/ALMAMOD_MICASITA_PORTADA.webp",
    "description": "Módulo monoambiente compacto de 12m² con baño completo y cocina-dormitorio. Construcción modular con Paneles SIP PROPANEL. Ideal para primera vivienda o espacio de trabajo.",
    "sku": "ALMA-MICASITA-12",
    "brand": {
      "@type": "Brand",
      "name": "AlmaMod"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://www.almamod.com.ar/tiendaalma/micasita",
      "priceCurrency": "ARS",
      "price": "15300000",
      "priceValidUntil": "2025-12-31",
      "availability": "https://schema.org/PreOrder",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "AlmaMod"
      },
      "deliveryLeadTime": {
        "@type": "QuantitativeValue",
        "value": 30,
        "unitCode": "DAY"
      }
    },
    "category": "Vivienda Modular",
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Superficie",
        "value": "12 m²"
      },
      {
        "@type": "PropertyValue",
        "name": "Dimensiones",
        "value": "4.88m × 2.44m"
      },
      {
        "@type": "PropertyValue",
        "name": "Habitaciones",
        "value": "Monoambiente"
      },
      {
        "@type": "PropertyValue",
        "name": "Certificación",
        "value": "EDGE Advanced"
      }
    ],
    "material": "Panel SIP PROPANEL",
    "isAccessoryOrSparePartFor": {
      "@type": "Product",
      "name": "Sistema Constructivo PROPANEL"
    }
  },
  
  alma18: {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Alma 18 - Módulo Habitacional 18m²",
    "image": "https://res.cloudinary.com/tu-cloud/image/upload/ALMAMOD_18_PORTADA.webp",
    "description": "Vivienda modular compacta de 18m² con 1 dormitorio, baño completo y cocina-comedor. Construcción con Paneles SIP PROPANEL. Ideal para parejas o personas solas.",
    "sku": "ALMA-18",
    "brand": {
      "@type": "Brand",
      "name": "AlmaMod"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://www.almamod.com.ar/tiendaalma/alma-18",
      "priceCurrency": "ARS",
      "price": "32050000",
      "priceValidUntil": "2025-12-31",
      "availability": "https://schema.org/PreOrder",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Superficie",
        "value": "18 m²"
      },
      {
        "@type": "PropertyValue",
        "name": "Habitaciones",
        "value": "1 dormitorio"
      }
    ]
  },
  
  alma27: {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Alma 27 - Módulo Habitacional 27m²",
    "image": "https://res.cloudinary.com/tu-cloud/image/upload/ALMAMOD_27_PORTADA.webp",
    "description": "Vivienda modular de 27m² con 1 dormitorio, baño completo, cocina y estar-comedor separado. Sistema PROPANEL certificado EDGE Advanced.",
    "sku": "ALMA-27",
    "brand": {
      "@type": "Brand",
      "name": "AlmaMod"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://www.almamod.com.ar/tiendaalma/alma-27",
      "priceCurrency": "ARS",
      "price": "42120000",
      "availability": "https://schema.org/PreOrder"
    }
  },
  
  alma36: {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Alma 36 - Módulo Habitacional 36m²",
    "image": "https://res.cloudinary.com/tu-cloud/image/upload/ALMAMOD_36_PORTADA.webp",
    "description": "Vivienda modular completa de 36m² con 2 dormitorios, baño, cocina y estar-comedor. Construcción sustentable certificada.",
    "sku": "ALMA-36",
    "brand": {
      "@type": "Brand",
      "name": "AlmaMod"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://www.almamod.com.ar/tiendaalma/alma-36",
      "priceCurrency": "ARS",
      "price": "50075000",
      "availability": "https://schema.org/PreOrder"
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Superficie",
        "value": "36 m²"
      },
      {
        "@type": "PropertyValue",
        "name": "Habitaciones",
        "value": "2 dormitorios"
      }
    ]
  }
};

// ============================================
// 5. SCHEMA.ORG - SERVICIOS
// ============================================

export const SERVICES_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Construcción Modular con Paneles SIP",
  "provider": {
    "@type": "Organization",
    "name": "AlmaMod"
  },
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": "-38.9516",
      "longitude": "-68.0591"
    },
    "geoRadius": "500000"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Servicios de Construcción Modular",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Estructura con Paneles SIP",
          "description": "Construcción con Paneles SIP PROPANEL, sistema de alta ingeniería con eficiencia térmica superior"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Diseño y Revestimiento Exterior",
          "description": "Revestimientos de última generación adaptados al clima patagónico"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Construcción Modular Inteligente",
          "description": "Sistema modular flexible con fabricación en taller y rápido montaje"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Interiores a Medida",
          "description": "Diseño de interiores completo con amoblamientos y terminaciones de calidad"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Fundaciones y Obras Civiles",
          "description": "Diseño y construcción de fundaciones adaptadas a cada tipo de suelo"
        }
      }
    ]
  }
};

// ============================================
// 6. SCHEMA.ORG - CERTIFICACIONES
// ============================================

export const CERTIFICATIONS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Certificaciones AlmaMod",
  "description": "Certificaciones y estándares de calidad de AlmaMod",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Certification",
        "name": "Sistema PROPANEL",
        "description": "Paneles SIP estructurales aislados certificados para construcción sustentable",
        "issuedBy": {
          "@type": "Organization",
          "name": "PROPANEL Argentina"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@type": "Certification",
        "name": "Certificación CACMI",
        "description": "Miembro certificado de la Cámara Argentina de Construcción Modular e Industrializada",
        "issuedBy": {
          "@type": "Organization",
          "name": "CACMI"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 3,
      "item": {
        "@type": "Certification",
        "name": "EDGE Advanced Certified",
        "description": "Certificación internacional de construcción sustentable del Banco Mundial",
        "issuedBy": {
          "@type": "Organization",
          "name": "IFC - International Finance Corporation"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 4,
      "item": {
        "@type": "Certification",
        "name": "Sismo Resistente",
        "description": "Certificación sismo-resistente para zonas de alta actividad sísmica",
        "issuedBy": {
          "@type": "Organization",
          "name": "IRAM"
        }
      }
    }
  ]
};

// ============================================
// 7. SCHEMA.ORG - PREGUNTAS FRECUENTES (FAQ)
// ============================================

export const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Qué son los Paneles SIP PROPANEL?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Los Paneles SIP (Structural Insulated Panel) PROPANEL son paneles estructurales aislados que combinan placas de OSB de alta densidad con un núcleo de espuma rígida de poliuretano. Ofrecen eficiencia térmica hasta 10 veces superior a la construcción tradicional."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto tiempo tarda la construcción de un módulo AlmaMod?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El plazo de entrega estándar es de 30 días. La construcción modular es hasta 5 veces más rápida que los métodos tradicionales gracias a la fabricación en taller y el rápido montaje en sitio."
      }
    },
    {
      "@type": "Question",
      "name": "¿Las viviendas AlmaMod son resistentes al clima patagónico?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí, todos nuestros módulos están diseñados específicamente para resistir las condiciones extremas de la Patagonia: vientos fuertes, variaciones térmicas, nevadas y actividad sísmica. Cuentan con certificación sismo-resistente."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué certificaciones tiene AlmaMod?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AlmaMod cuenta con certificación EDGE Advanced (Banco Mundial), certificación CACMI, sistema PROPANEL certificado y certificación sismo-resistente IRAM. Esto garantiza los más altos estándares de calidad y sustentabilidad."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuál es el ahorro energético de una vivienda AlmaMod?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Las viviendas AlmaMod con Paneles SIP PROPANEL logran una reducción mínima del 40% en consumo energético comparado con construcciones tradicionales, certificado por EDGE Advanced. La aislación térmica es hasta 10 veces superior."
      }
    },
    {
      "@type": "Question",
      "name": "¿Los módulos son ampliables?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí, el sistema modular de AlmaMod permite ampliaciones futuras. Puedes agregar módulos adicionales según tus necesidades, manteniendo la estética y funcionalidad del conjunto."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué incluye el precio de un módulo AlmaMod?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El precio incluye estructura completa con Paneles SIP, revestimientos interior y exterior, aberturas de aluminio con DVH, instalaciones eléctricas y sanitarias completas, baño equipado, cocina con mesada, pisos vinílicos SPC y cielorraso terminado. Es un proyecto llave en mano."
      }
    }
  ]
};

// ============================================
// 8. BREADCRUMB SCHEMA
// ============================================

export const BREADCRUMB_SCHEMAS = {
  tiendaalma: {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://www.almamod.com.ar"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tienda Alma",
        "item": "https://www.almamod.com.ar/tiendaalma"
      }
    ]
  },
  
  producto: (nombreProducto, slug) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://www.almamod.com.ar"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tienda Alma",
        "item": "https://www.almamod.com.ar/tiendaalma"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": nombreProducto,
        "item": `https://www.almamod.com.ar/tiendaalma/${slug}`
      }
    ]
  })
};

// ============================================
// 9. LOCAL BUSINESS SCHEMA
// ============================================

export const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "AlmaMod - Construcción Modular",
  "image": "https://www.almamod.com.ar/logo-almamod.png",
  "@id": "https://www.almamod.com.ar",
  "url": "https://www.almamod.com.ar",
  "telephone": "+54-299-408-7106",
  "priceRange": "$$$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Dirección",
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
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday"
    ],
    "opens": "09:00",
    "closes": "18:00"
  },
  "sameAs": [
    "https://www.facebook.com/almamod",
    "https://www.instagram.com/almamod"
  ]
};

export default {
  SITE_METADATA,
  OPEN_GRAPH,
  TWITTER_CARD,
  ORGANIZATION_SCHEMA,
  PRODUCT_SCHEMAS,
  SERVICES_SCHEMA,
  CERTIFICATIONS_SCHEMA,
  FAQ_SCHEMA,
  BREADCRUMB_SCHEMAS,
  LOCAL_BUSINESS_SCHEMA
};