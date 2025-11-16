// ============================================
// INDEX.JS - Exportaciones centralizadas
// ============================================
// Punto de entrada único para importar metadata SEO

export { SITE_CONFIG, ROBOTS_CONFIG } from './site';
export { PAGE_KEYWORDS, PRODUCT_KEYWORDS } from './keywords';
export { PAGES } from './pages';
export { PRODUCTS } from './products';
export { GENERAL_FAQ, PRODUCT_FAQ } from './faq';
export {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateFAQSchema,
  generateProductSchema,
  generateBreadcrumbSchema,
  combineSchemas
} from './schema';

// ============================================
// HELPER: Obtener metadata completa por ruta
// ============================================
export function getPageMetadata(path) {
  // Normalizar path
  const normalizedPath = path === '/' ? 'home' : path.replace(/^\//, '').replace(/\/$/, '');

  // Buscar en PAGES
  const pageKey = Object.keys(PAGES).find(key => {
    const page = PAGES[key];
    return page.canonical === `/${normalizedPath}` || page.canonical === '/';
  });

  if (pageKey) {
    return PAGES[pageKey];
  }

  // Buscar en PRODUCTS
  const productKey = Object.keys(PRODUCTS).find(key => {
    const product = PRODUCTS[key];
    return product.canonical === `/${normalizedPath}`;
  });

  if (productKey) {
    return PRODUCTS[productKey];
  }

  // Fallback a home
  return PAGES.home;
}
