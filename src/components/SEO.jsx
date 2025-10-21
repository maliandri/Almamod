import { useEffect } from 'react';

function SEO({ title, description, keywords, canonical, image, type = 'website', product, breadcrumb, schema }) {
  useEffect(() => {
    // ✅ CRÍTICO: SIEMPRE usar www y https - Esta es la URL canónica de tu sitio
    const siteUrl = 'https://www.almamod.com.ar';
    const fullUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;
    
    const fullTitle = title 
      ? `${title} | AlmaMod`
      : 'AlmaMod - Construcción Modular en Neuquén | Paneles SIP PROPANEL';
    
    const metaDescription = description || 
      'Construimos viviendas modulares sustentables en Neuquén con Paneles SIP PROPANEL. Certificación EDGE Advanced y CACMI. Entrega en 30 días.';

    // Actualizar título de la página
    document.title = fullTitle;

    // Función helper para actualizar o crear meta tags
    const setMetaTag = (name, content, isProperty = false) => {
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

    // Open Graph (Facebook, LinkedIn, WhatsApp)
    setMetaTag('og:type', type, true);
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', metaDescription, true);
    setMetaTag('og:url', fullUrl, true);
    setMetaTag('og:site_name', 'AlmaMod', true);
    setMetaTag('og:locale', 'es_AR', true);
    
    if (image) {
      // ✅ Asegurar que la imagen use URL completa
      const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
      setMetaTag('og:image', fullImageUrl, true);
      setMetaTag('og:image:width', '1200', true);
      setMetaTag('og:image:height', '630', true);
      setMetaTag('og:image:alt', fullTitle, true);
    }

    // Twitter Cards
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', metaDescription);
    if (image) {
      const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
      setMetaTag('twitter:image', fullImageUrl);
    }

    // ✅ CANONICAL TAG - CRÍTICO PARA SEO
    // Este es el tag MÁS IMPORTANTE para evitar contenido duplicado
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    // SIEMPRE usar la URL completa con https://www
    linkCanonical.href = fullUrl;

    // Alternate para idioma (útil para SEO internacional)
    let linkAlternate = document.querySelector('link[rel="alternate"][hreflang="es-ar"]');
    if (!linkAlternate) {
      linkAlternate = document.createElement('link');
      linkAlternate.rel = 'alternate';
      linkAlternate.setAttribute('hreflang', 'es-ar');
      document.head.appendChild(linkAlternate);
    }
    linkAlternate.href = fullUrl;

    // Schema.org - Structured Data
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

    // Cleanup function para cuando el componente se desmonta
    return () => {
      // No removemos los tags porque causaría flickering entre páginas
      // React se encarga de actualizarlos en el próximo render
    };

  }, [title, description, keywords, canonical, image, type, product, breadcrumb, schema]);

  // Este componente no renderiza nada visible
  return null;
}

export default SEO;