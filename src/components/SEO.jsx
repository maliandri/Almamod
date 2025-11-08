import { useEffect } from 'react';

function SEO({ title, description, keywords, canonical, image, type = 'website', product, breadcrumb, schema, noindex = false }) {
  useEffect(() => {
    // ✅ URL base del sitio (sin www)
    const siteUrl = 'https://almamod.com.ar';
    
    // ✅ IMPORTANTE: Si canonical viene como path (/tiendaalma), construir URL completa
    // Si viene como URL completa (http...), usarla directamente
    const fullUrl = (() => {
      if (!canonical) return siteUrl;
      if (canonical.startsWith('http')) return canonical;
      // Si canonical es un path relativo, agregar el siteUrl
      return `${siteUrl}${canonical.startsWith('/') ? canonical : '/' + canonical}`;
    })();
    
    const fullTitle = title 
      ? `${title} | AlmaMod`
      : 'AlmaMod - Construcción Modular en Neuquén | Paneles SIP PROPANEL';
    
    const metaDescription = description || 
      'Construimos viviendas modulares sustentables en Neuquén con Paneles SIP PROPANEL. Certificación EDGE Advanced y CACMI. Entrega en 30 días.';

    // Actualizar título
    document.title = fullTitle;

    // Función para crear/actualizar meta tags
    const setMetaTag = (name, content, isProperty = false) => {
      if (!content) return;
      
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Meta tags básicos
    setMetaTag('description', metaDescription);
    if (keywords) setMetaTag('keywords', keywords);

    // Robots meta tag
    const robotsContent = noindex ? 'noindex, follow' : 'index, follow';
    setMetaTag('robots', robotsContent);

    // Open Graph
    setMetaTag('og:type', type, true);
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', metaDescription, true);
    setMetaTag('og:url', fullUrl, true);
    setMetaTag('og:site_name', 'AlmaMod', true);
    setMetaTag('og:locale', 'es_AR', true);
    
    if (image) {
      const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
      setMetaTag('og:image', fullImageUrl, true);
      setMetaTag('og:image:width', '1200', true);
      setMetaTag('og:image:height', '630', true);
    }

    // Twitter
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', metaDescription);
    if (image) {
      const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
      setMetaTag('twitter:image', fullImageUrl);
    }

    // ✅ CANONICAL TAG - CRÍTICO
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = fullUrl;

    // Alternate
    let linkAlternate = document.querySelector('link[rel="alternate"][hreflang="es-ar"]');
    if (!linkAlternate) {
      linkAlternate = document.createElement('link');
      linkAlternate.rel = 'alternate';
      linkAlternate.setAttribute('hreflang', 'es-ar');
      document.head.appendChild(linkAlternate);
    }
    linkAlternate.href = fullUrl;

    // Schema.org
    if (product || breadcrumb || schema) {
      const schemaData = product || breadcrumb || schema;
      let scriptElement = document.getElementById('schema-org-json');
      
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = 'schema-org-json';
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(schemaData);
    }

  }, [title, description, keywords, canonical, image, type, product, breadcrumb, schema, noindex]);

  return null;
}

export default SEO;