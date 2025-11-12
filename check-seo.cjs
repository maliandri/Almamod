#!/usr/bin/env node

/**
 * Script para verificar meta tags SEO en todas las rutas de AlmaMod
 * Uso: node check-seo.js
 */

const https = require('https');

const BASE_URL = 'https://almamod.com.ar';
const ROUTES = [
  '/',
  '/tiendaalma',
  '/sistema-constructivo',
  '/obras',
  '/ubicacion'
];

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractMetaTags(html) {
  const tags = {};

  // Canonical
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  tags.canonical = canonical ? canonical[1] : '❌ No encontrado';

  // Description
  const description = html.match(/<meta name="description" content="([^"]+)"/);
  tags.description = description ? description[1].substring(0, 60) + '...' : '❌ No encontrado';

  // OG Title
  const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/);
  tags.ogTitle = ogTitle ? ogTitle[1] : '❌ No encontrado';

  // OG Image
  const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/);
  tags.ogImage = ogImage ? ogImage[1] : '❌ No encontrado';

  return tags;
}

async function checkRoute(route) {
  try {
    const url = BASE_URL + route;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 Verificando: ${url}`);
    console.log('='.repeat(60));

    const html = await fetchHTML(url);
    const tags = extractMetaTags(html);

    console.log(`✅ Canonical:    ${tags.canonical}`);
    console.log(`✅ Description:  ${tags.description}`);
    console.log(`✅ OG Title:     ${tags.ogTitle}`);
    console.log(`✅ OG Image:     ${tags.ogImage}`);

  } catch (error) {
    console.error(`❌ Error en ${route}:`, error.message);
  }
}

async function checkAllRoutes() {
  console.log('\n🔍 VERIFICACIÓN SEO - AlmaMod\n');

  for (const route of ROUTES) {
    await checkRoute(route);
    await new Promise(resolve => setTimeout(resolve, 500)); // Pausa entre requests
  }

  console.log('\n✅ Verificación completa!\n');
}

checkAllRoutes();
