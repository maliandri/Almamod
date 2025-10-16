import { useEffect } from 'react';

function SEO({ title, description, keywords, canonical, image, type = 'website', product, breadcrumb, schema }) {
  useEffect(() => {
    const siteUrl = 'https://www.almamod.com.ar';
    const fullUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;
    
    const fullTitle = title 
      ? `${title} | AlmaMod`
      : 'AlmaMod - Construcción Modular en Neuquén | Paneles SIP PROPANEL';
    
    const metaDescription = description || 
      'Construimos viviendas modulares sustentables en Neuquén con Paneles SIP PROPANEL.';

    // Actualizar título
    document.title = fullTitle;

    // Función para actualizar o crear meta tag
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

    // Open Graph
    setMetaTag('og:type', type, true);
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', metaDescription, true);
    setMetaTag('og:url', fullUrl, true);
    if (image) setMetaTag('og:image', image, true);

    // Twitter
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', metaDescription);
    if (image) setMetaTag('twitter:image', image);

    // Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = fullUrl;

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

  }, [title, description, keywords, canonical, image, type, product, breadcrumb, schema]);

  return null;
}

export default SEO;