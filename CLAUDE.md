# CLAUDE.md — AlmaMod

Archivo de contexto para Claude Code. Leelo completo antes de tocar cualquier cosa.

---

## ¿Qué es este proyecto?

**AlmaMod** es el sitio web oficial de una empresa de construcción modular con paneles SIP PROPANEL
ubicada en Neuquén, Patagonia Argentina. Vende viviendas modulares llave en mano (6 modelos)
y tiene un chatbot de ventas con IA integrado.

**URL producción:** https://almamod.com.ar
**Deploy:** Netlify (auto-deploy desde `main` en GitHub)
**Repo:** https://github.com/maliandri/Almamod

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | React 19 + Vite 7 |
| Routing | React Router DOM v7 |
| Estilos | Tailwind CSS v4 + CSS modules por componente |
| Animaciones | Framer Motion (solo en chatbot) |
| SEO | React Helmet Async |
| Mapa | Leaflet + React Leaflet |
| CDN imágenes | Cloudinary (cloud: `dlshym1te`) |
| CDN videos | Cloudinary |
| IA chatbot | Google Gemini 2.5 Flash via Netlify Function |
| CRM leads | Supabase (tabla `leads`) |
| Email leads | Resend |
| Deploy | Netlify (con Netlify Functions para serverless) |
| Backend API | Render.com (servicio separado, `VITE_API_URL`) |

---

## Estructura de carpetas

```
almamod/
├── public/
│   ├── sitemap.xml          ← Mantener actualizado al agregar páginas
│   ├── robots.txt
│   ├── og-image.jpg
│   └── recursos/            ← 4 páginas HTML estáticas (SEO content hub)
│       ├── paneles-sip-neuquen.html
│       ├── modulos-habitacionales-neuquen.html
│       ├── contenedores-vs-modulos-neuquen.html
│       └── construccion-sustentable-argentina.html
├── src/
│   ├── App.jsx              ← Router principal + layout general
│   ├── components/          ← 13 componentes React
│   │   ├── aichatbot.jsx    ← Chatbot "Almita" con Gemini
│   │   ├── TiendaAlma.jsx   ← Catálogo de productos (archivo grande, ~1700 líneas)
│   │   ├── SEO.jsx          ← Componente SEO con Helmet
│   │   ├── SistemaConstructivo.jsx ← Modal del sistema constructivo
│   │   ├── ObrasCarousel.jsx       ← Modal galería de obras (noindex)
│   │   └── Ubicacion.jsx           ← Modal con mapa Leaflet (noindex)
│   ├── seo/                 ← Toda la metadata centralizada
│   │   ├── site.js          ← SITE_CONFIG, contacto, dirección, social
│   │   ├── pages.js         ← PAGES: metadata por ruta
│   │   ├── products.js      ← PRODUCTS: metadata + schema de cada módulo
│   │   ├── keywords.js      ← Keywords por página y producto
│   │   ├── schema.js        ← Generadores JSON-LD (Org, WebSite, FAQ, Product)
│   │   ├── faq.js           ← FAQ data para schema
│   │   └── index.js         ← Re-exports
│   ├── config/
│   │   └── cloudinary.js    ← getCloudinaryUrl(), presets IMG_CARD/IMG_DETAIL/etc.
│   └── utils/
│       ├── geminiHelper.js  ← Cliente del chatbot → Netlify Function
│       └── api.js
├── netlify/
│   └── functions/
│       ├── gemini-chat.js   ← IA chatbot serverless (usa GEMINI_API_KEY_SECRET)
│       └── saveLead.js      ← Guarda lead en Supabase + envía email por Resend
├── netlify.toml             ← Redirects (www→non-www, HTTP→HTTPS, SPA fallback)
├── vite.config.js
└── tailwind.config.js
```

---

## Arquitectura de rutas

Es una **SPA React + páginas HTML estáticas híbrida**.

### Rutas React (SPA):
| Ruta | Componente | SEO |
|---|---|---|
| `/` | HomePage | index, canonical `/` |
| `/tiendaalma` | TiendaAlma | index, canonical `/tiendaalma` |
| `/tiendaalma/:slug` | TiendaAlma (detalle) | index, canonical por producto |
| `/sistema-constructivo` | ModalPage + modal | index, canonical propio |
| `/obras` | ModalPage + modal | **noindex** (modal) |
| `/ubicacion` | ModalPage + modal | **noindex** (modal) |
| `/almita` | AlmitaPage | index |
| `/cat`, `/cas`, `/edge`, `/cacmi` | CertificacionDetalle | index |

### Páginas HTML estáticas (SEO content hub):
- `/recursos/paneles-sip-neuquen.html`
- `/recursos/modulos-habitacionales-neuquen.html`
- `/recursos/contenedores-vs-modulos-neuquen.html`
- `/recursos/construccion-sustentable-argentina.html`

### Netlify Functions (serverless):
- `/.netlify/functions/gemini-chat` → chatbot IA
- `/.netlify/functions/saveLead` → captura de leads

---

## Productos / Módulos (precios marzo 2026)

| Modelo | Superficie | Precio |
|---|---|---|
| MiCasita | 12m² | $16.800.000 |
| Alma 18 | 18m² | $35.150.000 |
| Alma 27 | 27m² | $46.650.000 |
| Alma Loft 28 | 28m² | $42.300.000 |
| Alma 36 | 36m² | $58.720.000 |
| Alma 36 Refugio | 36m² | $61.200.000 |

**IMPORTANTE:** Los precios aparecen en 3 lugares. Al actualizar, modificar SIEMPRE:
1. `src/components/TiendaAlma.jsx` (campo `precio:`, ventajas, FAQ, slider)
2. `src/seo/products.js` (title, description, `productData.price`)
3. `src/seo/pages.js` (descripciones con "Desde $X")
4. Los 4 archivos HTML en `public/recursos/`
5. El contexto de Almita en `netlify/functions/gemini-chat.js`

---

## Variables de entorno

### En Netlify (producción, panel web):
| Variable | Uso |
|---|---|
| `GEMINI_API_KEY_SECRET` | Google Gemini API (chatbot Almita) |
| `SUPABASE_URL` | Base de datos leads |
| `SUPABASE_ANON_KEY` | Auth Supabase |
| `RESEND_API_KEY` | Envío de emails |
| `RESEND_FROM` | Email remitente |
| `RESEND_TO` | Email destino de leads |

### En `.env` local:
| Variable | Uso |
|---|---|
| `VITE_API_URL` | Backend en Render (si se usa) |

**La API key de Gemini NUNCA va en el frontend** — solo en la Netlify Function.

---

## Cloudinary

- **Cloud name:** `dlshym1te`
- **Base URL:** `https://res.cloudinary.com/dlshym1te/image/upload/`
- **Función helper:** `src/config/cloudinary.js` → `getCloudinaryUrl(fileName, preset)`
- **Convención de nombres:** `ALMAMOD_[MODELO]_[TIPO].webp`
  - Ej: `ALMAMOD_36_PORTADA.webp`, `ALMAMOD_MICASITA_1.webp`
- **Videos:** `VIDEO_MI_CASITA_VERTICAL.mp4`, `VIDEO_CABAÑERO_HORIZONTAL.mp4`

---

## SEO — Decisiones importantes

- **Canónicas:** Todas las rutas SPA tienen canonical propio via `SEO.jsx` + Helmet
- **`/obras` y `/ubicacion`:** Son modales sobre home → `noindex: true`
- **`/sistema-constructivo`:** Está en sitemap → indexable, canonical propio
- **Sitemap:** `public/sitemap.xml` — actualizar `lastmod` al hacer cambios de contenido
- **Redirect `/index.html` → `/`** configurado en Netlify para evitar duplicado
- **www → non-www:** 301 forzado en Netlify

---

## Chatbot "Almita"

- Componente: `src/components/aichatbot.jsx`
- Helper: `src/utils/geminiHelper.js`
- Backend: `netlify/functions/gemini-chat.js`
- Modelo: Gemini 2.5 Flash
- Guarda datos del usuario en `localStorage` (`almamod_user_data`)
- Al capturar datos de contacto → llama a `saveLead.js` → Supabase + email

---

## QUÉ NO TOCAR / ROMPER

- **El carrusel de servicios (`ServiciosCarousel.jsx`)** — no modificar sin pedido explícito
- **El orden de redirects en `netlify.toml`** — el SPA fallback `/* → /index.html` debe ir SIEMPRE al final
- **Las canónicas de los HTML estáticos** — apuntan a URLs absolutas con https
- **El contexto de Almita en `gemini-chat.js`** — es la estrategia comercial, cambiar con cuidado
- **Los schemas JSON-LD en `src/seo/schema.js`** — están validados por Google

---

## Flujo de deploy

```
git push origin main
    ↓
Netlify detecta cambio
    ↓
npm run build (Vite)
    ↓
dist/ publicado automáticamente
```

Build tarda ~6-7 segundos. Si falla, revisar la consola de Netlify.
