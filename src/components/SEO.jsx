import React from 'react';
import { Helmet } from 'react-helmet-async';

function SEO({ 
  title, 
  description, 
  keywords, 
  canonical, 
  image, 
  type = 'website',
  noindex = false,
  schema = null // NUEVO: Soporte para datos estructurados
}) {
  const siteUrl = 'https://almamod.com.ar';

  // ✅ NORMALIZACIÓN DE URL CANÓNICA (Evita duplicados con/sin trailing slash)
  const fullCanonicalUrl = (() => {
    if (!canonical) return `${siteUrl}/`;
    if (canonical.startsWith('http')) return canonical;

    // Asegurar que canonical comienza con /
    const cleanPath = canonical.startsWith('/') ? canonical : `/${canonical}`;

    // ⚠️ IMPORTANTE: Remover trailing slash excepto para root (/)
    // Esto evita duplicados: /tiendaalma vs /tiendaalma/
    const normalizedPath = cleanPath === '/' ? '/' : cleanPath.replace(/\/$/, '');

    return `${siteUrl}${normalizedPath}`;
  })();

  const fullTitle = title ? `${title} | AlmaMod` : 'AlmaMod - Construcción Modular';
  
  // Si keywords es un array, lo unimos con comas. Si es string, lo dejamos igual.
  const metaKeywords = Array.isArray(keywords) ? keywords.join(', ') : keywords;

  const metaImage = image 
    ? (image.startsWith('http') ? image : `${siteUrl}${image}`)
    : `${siteUrl}/og-image-default.jpg`;

  return (
    <Helmet>
      {/* --- Tags Básicos --- */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {metaKeywords && <meta name="keywords" content={metaKeywords} />}
      <link rel="canonical" href={fullCanonicalUrl} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />

      {/* --- Open Graph --- */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:site_name" content="AlmaMod" />
      <meta property="og:locale" content="es_AR" />

      {/* --- Twitter --- */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={metaImage} />

      {/* --- Geo Tags --- */}
      <meta name="geo.region" content="AR-Q" />
      <meta name="geo.placename" content="Neuquén" />
      <meta name="geo.position" content="-38.9516;-68.0591" />
      <meta name="ICBM" content="-38.9516, -68.0591" />

      {/* --- SCHEMA.ORG (DATOS ESTRUCTURADOS) --- */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

export default SEO;