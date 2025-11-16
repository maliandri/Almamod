// ============================================
// SCHEMA.JS - Generadores de Schema.org
// ============================================
// Funciones para generar schemas JSON-LD dinámicamente

import { SITE_CONFIG } from './site';
import { GENERAL_FAQ, PRODUCT_FAQ } from './faq';

// ============================================
// SCHEMA: Organization + LocalBusiness fusionados
// ============================================
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_CONFIG.url}/#organization`,
    name: SITE_CONFIG.fullName,
    alternateName: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}${SITE_CONFIG.images.logo}`,
    image: `${SITE_CONFIG.url}${SITE_CONFIG.images.logo}`,
    description: 'Empresa de construcción modular especializada en viviendas sustentables con Paneles SIP PROPANEL en Neuquén, Patagonia Argentina.',

    telephone: SITE_CONFIG.contact.phone,
    email: SITE_CONFIG.contact.email,
    priceRange: '$$$$',

    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONFIG.address.street,
      addressLocality: SITE_CONFIG.address.city,
      addressRegion: SITE_CONFIG.address.region,
      postalCode: SITE_CONFIG.address.postalCode,
      addressCountry: SITE_CONFIG.address.country
    },

    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE_CONFIG.geo.latitude,
      longitude: SITE_CONFIG.geo.longitude
    },

    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: SITE_CONFIG.businessHours.weekdays.opens,
      closes: SITE_CONFIG.businessHours.weekdays.closes
    },

    sameAs: [
      SITE_CONFIG.social.facebook,
      SITE_CONFIG.social.instagram
    ],

    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE_CONFIG.contact.phone,
      contactType: 'Ventas',
      availableLanguage: ['es'],
      areaServed: ['AR-Q', 'AR-R']
    }
  };
}

// ============================================
// SCHEMA: WebSite con SearchAction (REAL)
// ============================================
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_CONFIG.url}/#website`,
    url: SITE_CONFIG.url,
    name: SITE_CONFIG.name,
    publisher: {
      '@id': `${SITE_CONFIG.url}/#organization`
    }
    // SIN SearchAction (no existe funcionalidad de búsqueda)
  };
}

// ============================================
// SCHEMA: FAQPage
// ============================================
export function generateFAQSchema(faqArray = GENERAL_FAQ) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqArray.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

// ============================================
// SCHEMA: Product con Offer
// ============================================
export function generateProductSchema(productData, productSlug) {
  const { name, sku, brand, price, currency, availability, condition, description, image, imageWidth, imageHeight, category } = productData;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_CONFIG.url}/tiendaalma/${productSlug}#product`,
    name: name,
    sku: sku,
    brand: {
      '@type': 'Brand',
      name: brand
    },
    description: description,
    category: category,

    image: {
      '@type': 'ImageObject',
      url: image,
      width: imageWidth,
      height: imageHeight
    },

    offers: {
      '@type': 'Offer',
      url: `${SITE_CONFIG.url}/tiendaalma/${productSlug}`,
      priceCurrency: currency,
      price: price,
      availability: availability,
      itemCondition: condition,
      seller: {
        '@id': `${SITE_CONFIG.url}/#organization`
      }
    }
  };
}

// ============================================
// SCHEMA: BreadcrumbList
// ============================================
export function generateBreadcrumbSchema(items) {
  // items = [{ name: 'Home', url: '/' }, { name: 'Tienda', url: '/tiendaalma' }, ...]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `${SITE_CONFIG.url}${item.url}` : undefined
    }))
  };
}

// ============================================
// HELPERS: Combinar múltiples schemas
// ============================================
export function combineSchemas(...schemas) {
  // Retorna array de schemas para usar con <script type="application/ld+json">
  return schemas.filter(Boolean); // Filtra nulls/undefined
}
