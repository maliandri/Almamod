// ============================================
// SITE.JS - Configuración global del sitio
// ============================================
// Información básica del sitio, URLs, empresa, contacto

export const SITE_CONFIG = {
  // URL base del sitio (sin trailing slash)
  url: 'https://almamod.com.ar',

  // Nombre del sitio
  name: 'AlmaMod',

  // Nombre completo para contextos formales
  fullName: 'AlmaMod - Construcción Modular',

  // Idioma y región
  locale: 'es_AR',
  language: 'es-AR',

  // Información de contacto
  contact: {
    phone: '+54-299-408-7106',
    phoneDisplay: '+54 299 408-7106',
    email: 'info@almamod.com.ar',
    whatsapp: '542994087106'
  },

  // Dirección física
  address: {
    street: 'C. la Caña de Azúcar 18',
    city: 'Neuquén',
    region: 'Neuquén',
    postalCode: '8300',
    country: 'AR',
    countryName: 'Argentina'
  },

  // Coordenadas geográficas
  geo: {
    latitude: -38.9516,
    longitude: -68.0591
  },

  // Redes sociales (URLs verificadas)
  social: {
    facebook: 'https://www.facebook.com/61578686948419',
    instagram: 'https://instagram.com/_almamod_',
    whatsapp: 'https://wa.me/542994087106'
  },

  // Imágenes por defecto
  images: {
    logo: '/android-chrome-512x512.png',
    ogDefault: '/og-image.jpg',
    favicon: '/favicon.ico'
  },

  // Horarios de atención
  businessHours: {
    weekdays: {
      opens: '09:00',
      closes: '18:00'
    }
  }
};

// Robots meta content por tipo de página
export const ROBOTS_CONFIG = {
  index: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  noindex: 'noindex, nofollow'
};
