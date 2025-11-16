// ============================================
// SEO.JSX - Componente SEO optimizado
// ============================================
// Maneja metadata dinámica con React Helmet
// ELIMINADO: keywords, hreflang, geo tags

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG, ROBOTS_CONFIG } from '../seo';

function SEO({
  title,
  description,
  canonical,
  image,
  type = 'website',
  noindex = false,
  schemas = [] // Array de schemas JSON-LD
}) {
  // ============================================
  // NORMALIZACIÓN DE URL CANÓNICA
  // ============================================
  const fullCanonicalUrl = (() => {
    if (!canonical) return `${SITE_CONFIG.url}/`;
    if (canonical.startsWith('http')) return canonical;

    // Asegurar que canonical comienza con /
    const cleanPath = canonical.startsWith('/') ? canonical : `/${canonical}`;

    // Remover trailing slash excepto para root (/)
    const normalizedPath = cleanPath === '/' ? '/' : cleanPath.replace(/\/$/, '');

    return `${SITE_CONFIG.url}${normalizedPath}`;
  })();

  // ============================================
  // TITLE FINAL
  // ============================================
  const fullTitle = title ? `${title} | ${SITE_CONFIG.name}` : `${SITE_CONFIG.name} - Construcción Modular`;

  // ============================================
  // IMAGE OPTIMIZATION
  // ============================================
  const metaImage = image
    ? (image.startsWith('http') ? image : `${SITE_CONFIG.url}${image}`)
    : `${SITE_CONFIG.url}${SITE_CONFIG.images.ogDefault}`;

  // ============================================
  // ROBOTS META
  // ============================================
  const robotsContent = noindex ? ROBOTS_CONFIG.noindex : ROBOTS_CONFIG.index;

  return (
    <Helmet>
      {/* --- BÁSICOS --- */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonicalUrl} />
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />

      {/* --- OPEN GRAPH --- */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_CONFIG.name} />
      <meta property="og:locale" content={SITE_CONFIG.locale} />

      {/* --- TWITTER CARDS --- */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={metaImage} />

      {/* --- SCHEMAS JSON-LD --- */}
      {schemas.length > 0 && schemas.map((schema, index) => (
        <script key={`schema-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

export default SEO;
