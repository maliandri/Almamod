// ============================================
// PAGES.JS - Metadata optimizada por página
// ============================================
// Títulos: MAX 60 caracteres
// Descriptions: MAX 155 caracteres

import { PAGE_KEYWORDS } from './keywords';

export const PAGES = {
  home: {
    title: 'Casas Modulares Neuquén | Paneles SIP PROPANEL',
    description: 'Viviendas modulares certificadas EDGE. Entrega 30 días. Desde $15.3M. Paneles SIP PROPANEL. Construcción sustentable Neuquén, Patagonia.',
    keywords: PAGE_KEYWORDS.home,
    canonical: '/',
    image: '/og-image.jpg',
    type: 'website'
  },

  tiendaalma: {
    title: 'Catálogo Viviendas Modulares | Precios 2025',
    description: 'Casas modulares desde $15.3M. MiCasita 12m², Alma 18, 27, 36. Llave en mano. Certificación EDGE Advanced. Entrega 30 días Neuquén.',
    keywords: PAGE_KEYWORDS.tiendaalma,
    canonical: '/tiendaalma',
    image: '/og-image.jpg',
    type: 'website'
  },

  sistemaConstructivo: {
    title: 'Sistema Paneles SIP PROPANEL | Certificación EDGE',
    description: 'Paneles SIP PROPANEL: 10x más aislación, sismo-resistente, EDGE Advanced. Construcción 5x más rápida. Tecnología modular Neuquén.',
    keywords: PAGE_KEYWORDS.sistemaConstructivo,
    canonical: '/sistema-constructivo',
    image: '/og-image.jpg',
    type: 'article'
  },

  obras: {
    title: 'Obras y Proyectos Casas Modulares | AlmaMod',
    description: 'Obras terminadas: viviendas modulares en Neuquén, Junín de los Andes, Villa La Angostura. Proyectos Paneles SIP PROPANEL.',
    keywords: PAGE_KEYWORDS.obras,
    canonical: '/obras',
    image: '/og-image.jpg',
    type: 'website',
    noindex: true // Modal sobre home, no indexar
  },

  ubicacion: {
    title: 'Ubicación y Contacto | AlmaMod Neuquén',
    description: 'Showroom AlmaMod Neuquén. C. la Caña de Azúcar 18, Q8300. Lun-Vie 9-18hs. Tel: +54 299 408-7106. WhatsApp disponible.',
    keywords: PAGE_KEYWORDS.ubicacion,
    canonical: '/ubicacion',
    image: '/og-image.jpg',
    type: 'website',
    noindex: true // Modal contacto, no aporta SEO
  },

  // ============================================
  // CERTIFICACIONES
  // ============================================
  cat: {
    title: 'Certificado de Aptitud Técnica CAT | Paneles SIP PROPANEL',
    description: 'Sistema PROPANEL certificado CAT por el Ministerio de Desarrollo Territorial. Aislación 10x superior, resistencia estructural 20 ton/m². Neuquén.',
    keywords: ['CAT', 'Certificado Aptitud Técnica', 'PROPANEL', 'Paneles SIP certificados', 'construcción modular certificada', 'vivienda social Argentina', 'sistemas constructivos no tradicionales', 'IRAM construcción', 'certificación ministerial vivienda'],
    canonical: '/cat',
    image: '/og-image.jpg',
    type: 'article'
  },

  cas: {
    title: 'Certificado Sismorresistente CAS | INPRES PROPANEL',
    description: 'Sistema PROPANEL con CAS otorgado por INPRES. Resistencia sísmica zonas 2-4. Estructura monolítica, 10x más liviano que construcción tradicional.',
    keywords: ['CAS', 'Certificado Sismorresistente', 'INPRES', 'PROPANEL sismo resistente', 'construcción antisísmica', 'zonas sísmicas Argentina', 'Patagonia construcción', 'resistencia sísmica certificada', 'seguridad estructural'],
    canonical: '/cas',
    image: '/og-image.jpg',
    type: 'article'
  },

  edge: {
    title: 'Certificación EDGE Advanced | Construcción Sustentable',
    description: 'AlmaMod certificado EDGE Advanced (Banco Mundial). Reducción 40% consumo energético, 20% agua. Construcción verde Argentina. Financiamiento verde.',
    keywords: ['EDGE Advanced', 'certificación sustentable', 'Banco Mundial construcción', 'IFC certificación', 'construcción verde', 'eficiencia energética vivienda', 'casa sustentable Argentina', 'crédito hipotecario verde', 'ahorro energético'],
    canonical: '/edge',
    image: '/og-image.jpg',
    type: 'article'
  },

  cacmi: {
    title: 'Certificación CACMI | Cámara Construcción Modular',
    description: 'AlmaMod miembro CACMI: Cámara Argentina de Construcción Modular e Industrializada. Calidad certificada, procesos auditados, normativas IRAM.',
    keywords: ['CACMI', 'Cámara Construcción Modular', 'construcción industrializada', 'certificación IRAM', 'calidad construcción modular', 'auditoría construcción', 'normativas IRAM vivienda', 'procesos certificados'],
    canonical: '/cacmi',
    image: '/og-image.jpg',
    type: 'article'
  }
};
