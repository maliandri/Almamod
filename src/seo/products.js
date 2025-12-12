// ============================================
// PRODUCTS.JS - Metadata de productos
// ============================================
// Títulos: MAX 60 caracteres
// Descriptions: MAX 155 caracteres

import { PRODUCT_KEYWORDS } from './keywords';

export const PRODUCTS = {
  micasita: {
    title: 'MiCasita 12m² | Módulo desde $16.5M',
    description: 'Módulo 12m² con baño y cocina. Primera vivienda, oficina u inversión. $16.500.000 llave en mano. Entrega 30 días Neuquén.',
    keywords: PRODUCT_KEYWORDS.micasita,
    canonical: '/tiendaalma/micasita',
    slug: 'micasita',

    // Datos del producto para Schema
    productData: {
      name: 'MiCasita 12m²',
      sku: 'ALMAMOD-MICASITA-12',
      brand: 'AlmaMod',
      price: '16500000',
      currency: 'ARS',
      availability: 'https://schema.org/InStock',
      condition: 'https://schema.org/NewCondition',
      description: 'Módulo monoambiente de 12m² con baño completo y cocina. Ideal para primera vivienda, oficina home office, habitación adicional o inversión.',
      image: 'https://res.cloudinary.com/dlshym1te/image/upload/ALMAMOD_MICASITA_PORTADA.webp',
      imageWidth: 1200,
      imageHeight: 800,
      category: 'Vivienda Modular'
    }
  },

  alma18: {
    title: 'Alma 18 - 18m² con Dormitorio | $34.2M',
    description: 'Casa modular 18m² con 1 dormitorio, baño y cocina. Ideal parejas. $34.200.000 llave en mano. Certificación EDGE. Neuquén.',
    keywords: PRODUCT_KEYWORDS.alma18,
    canonical: '/tiendaalma/alma-18',
    slug: 'alma-18',

    productData: {
      name: 'Alma 18',
      sku: 'ALMAMOD-ALMA18',
      brand: 'AlmaMod',
      price: '34200000',
      currency: 'ARS',
      availability: 'https://schema.org/InStock',
      condition: 'https://schema.org/NewCondition',
      description: 'Vivienda modular de 18m² con dormitorio separado, baño completo y cocina-comedor. Perfecta para parejas o personas solas.',
      image: 'https://res.cloudinary.com/dlshym1te/image/upload/ALMAMOD_18_PORTADA.webp',
      imageWidth: 1200,
      imageHeight: 800,
      category: 'Vivienda Modular'
    }
  },

  alma27: {
    title: 'Alma 27 - 27m² Ambientes Separados | $45.3M',
    description: 'Vivienda 27m² con dormitorio, estar-comedor, baño y cocina. Familias pequeñas. $45.300.000 llave en mano. EDGE Advanced.',
    keywords: PRODUCT_KEYWORDS.alma27,
    canonical: '/tiendaalma/alma-27',
    slug: 'alma-27',

    productData: {
      name: 'Alma 27',
      sku: 'ALMAMOD-ALMA27',
      brand: 'AlmaMod',
      price: '45300000',
      currency: 'ARS',
      availability: 'https://schema.org/InStock',
      condition: 'https://schema.org/NewCondition',
      description: 'Vivienda de 27m² con dormitorio independiente, estar-comedor amplio, baño y cocina completa. Diseño optimizado para confort diario.',
      image: 'https://res.cloudinary.com/dlshym1te/image/upload/ALMAMOD_27_PORTADA.webp',
      imageWidth: 1200,
      imageHeight: 800,
      category: 'Vivienda Modular'
    }
  },

  almaLoft28: {
    title: 'Alma Loft 28 - Diseño Loft Entrepiso | $40.6M',
    description: 'Vivienda tipo loft 28m² con entrepiso. Diseño moderno juvenil. $40.600.000 llave en mano. Doble altura. Neuquén Patagonia.',
    keywords: PRODUCT_KEYWORDS.almaLoft28,
    canonical: '/tiendaalma/alma-loft-28',
    slug: 'alma-loft-28',

    productData: {
      name: 'Alma Loft 28',
      sku: 'ALMAMOD-LOFT28',
      brand: 'AlmaMod',
      price: '40600000',
      currency: 'ARS',
      availability: 'https://schema.org/InStock',
      condition: 'https://schema.org/NewCondition',
      description: 'Vivienda estilo loft de 28m² con entrepiso para dormitorio. Diseño moderno y juvenil con doble altura.',
      image: 'https://res.cloudinary.com/dlshym1te/image/upload/ALMAMOD_28_LOFT_PORTADA.webp',
      imageWidth: 1200,
      imageHeight: 800,
      category: 'Vivienda Modular'
    }
  },

  alma36: {
    title: 'Alma 36 - 2 Dormitorios 36m² | $53.5M',
    description: 'Casa modular 36m² con 2 dormitorios, living-comedor, cocina y baño. Familias 3-4 personas. $53.500.000 llave en mano. EDGE.',
    keywords: PRODUCT_KEYWORDS.alma36,
    canonical: '/tiendaalma/alma-36',
    slug: 'alma-36',

    productData: {
      name: 'Alma 36',
      sku: 'ALMAMOD-ALMA36',
      brand: 'AlmaMod',
      price: '53500000',
      currency: 'ARS',
      availability: 'https://schema.org/InStock',
      condition: 'https://schema.org/NewCondition',
      description: 'Casa modular familiar de 36m² con 2 dormitorios, living-comedor, cocina completa y baño. La vivienda más elegida.',
      image: 'https://res.cloudinary.com/dlshym1te/image/upload/ALMAMOD_36_PORTADA.webp',
      imageWidth: 1200,
      imageHeight: 800,
      category: 'Vivienda Modular'
    }
  },

  alma36Refugio: {
    title: 'Alma 36 Refugio - Cabaña Patagónica | $58.4M',
    description: 'Cabaña estilo refugio 36m² con 2 dormitorios. Diseño patagónico rústico-moderno. $58.400.000. Ideal cordillera y bosque.',
    keywords: PRODUCT_KEYWORDS.alma36Refugio,
    canonical: '/tiendaalma/alma-36-refugio',
    slug: 'alma-36-refugio',

    productData: {
      name: 'Alma 36 Refugio',
      sku: 'ALMAMOD-REFUGIO36',
      brand: 'AlmaMod',
      price: '58400000',
      currency: 'ARS',
      availability: 'https://schema.org/InStock',
      condition: 'https://schema.org/NewCondition',
      description: 'Cabaña estilo patagónico de 36m² con 2 dormitorios y diseño tipo refugio de montaña. Máxima integración con naturaleza.',
      image: 'https://res.cloudinary.com/dlshym1te/image/upload/ALMAMOD_36_REFUGIO_PORTADA.webp',
      imageWidth: 1200,
      imageHeight: 800,
      category: 'Vivienda Modular'
    }
  }
};
