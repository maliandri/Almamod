# CLAUDE.md — AlmaMod

Archivo de contexto para Claude Code. Leelo completo antes de tocar cualquier cosa.

---

## ¿Qué es este proyecto?

**AlmaMod** es el sitio web oficial + panel interno de gestión de una empresa de construcción modular
con paneles SIP PROPANEL ubicada en Neuquén, Patagonia Argentina.
Vende viviendas modulares llave en mano (6 modelos) y tiene un chatbot de ventas con IA integrado.

**URL producción:** https://almamod.com.ar
**Deploy:** Netlify (auto-deploy desde `main` en GitHub)
**Repo:** https://github.com/maliandri/Almamod

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | React 19 + Vite 7 |
| Routing | React Router DOM v7 |
| Estilos (sitio) | Tailwind CSS v4 |
| Estilos (admin) | CSS-in-JS inline con sistema de tokens en `src/app/styles.js` |
| Animaciones | Framer Motion (solo en chatbot) |
| SEO | React Helmet Async |
| Mapa | Leaflet + React Leaflet |
| CDN imágenes | Cloudinary (cloud: `dlshym1te`) |
| CDN videos | Cloudinary |
| IA chatbot | Google Gemini 2.5 Flash via Netlify Function |
| Base de datos | Supabase (PostgreSQL + Auth) |
| Email leads | Resend |
| Deploy | Netlify (con Netlify Functions para serverless) |

---

## Estructura de carpetas

```
almamod/
├── public/
│   ├── sitemap.xml
│   ├── robots.txt
│   ├── og-image.jpg
│   └── recursos/              ← 4 páginas HTML estáticas (SEO content hub)
├── src/
│   ├── App.jsx                ← Router raíz: rutas públicas + /app/*
│   ├── components/            ← Componentes del sitio público
│   │   ├── aichatbot.jsx      ← Chatbot "Almita" con Gemini + auto-save a Supabase
│   │   ├── TiendaAlma.jsx     ← Catálogo de productos (~1700 líneas)
│   │   ├── SEO.jsx
│   │   ├── SistemaConstructivo.jsx
│   │   ├── ObrasCarousel.jsx
│   │   └── Ubicacion.jsx
│   ├── seo/                   ← Metadata SEO centralizada
│   ├── config/
│   │   └── cloudinary.js
│   ├── utils/
│   │   └── geminiHelper.js
│   ├── context/
│   │   └── AuthContext.jsx    ← Auth global: token, refresh, permisos, logout
│   └── app/                   ← Panel interno de gestión (SPA protegida)
│       ├── AppRouter.jsx      ← Rutas del panel (/app/*)
│       ├── hooks/
│       │   └── useAuth.js
│       ├── lib/
│       │   ├── api.js         ← Cliente HTTP central con refresh automático de token
│       │   └── modulos.js     ← Definición de módulos y sistema de permisos
│       ├── styles.js          ← Tokens de color y estilos compartidos del panel
│       ├── components/
│       │   ├── AppLayout.jsx  ← Layout con sidebar (filtra ítems por rol y permisos)
│       │   └── ProtectedRoute.jsx ← Guard de rutas por rol + permisos por módulo
│       └── pages/
│           ├── Login.jsx
│           ├── Registro.jsx   ← Registro por invitación (token único)
│           ├── ObrasLista.jsx
│           ├── ObraDetalle.jsx
│           ├── ObraNueva.jsx
│           ├── RemitoCrear.jsx
│           ├── FirmarRemito.jsx ← Ruta pública (sin auth) para firma de remitos
│           ├── RemitoScan.jsx   ← Escáner de remitos con cámara/foto
│           ├── Partes.jsx       ← Catálogo de componentes con filtros y familias
│           ├── Familias.jsx     ← ABM de familias de productos + import Excel
│           ├── BOM.jsx          ← Bill of Materials por modelo de vivienda
│           ├── CmsModelos.jsx
│           ├── CmsObras.jsx
│           ├── MarketingReels.jsx
│           ├── MarketingPublicaciones.jsx
│           ├── MarketingLibre.jsx
│           ├── MakeConfig.jsx
│           ├── Usuarios.jsx     ← ABM usuarios + permisos por módulo + cerrar sesión
│           └── CrmAlmita.jsx   ← CRM con todas las conversaciones de Almita
├── netlify/
│   └── functions/
│       ├── gemini-chat.js        ← IA chatbot (GEMINI_API_KEY_SECRET)
│       ├── saveLead.js           ← Lead explícito → Supabase leads + email Resend
│       ├── save-conversacion.js  ← Auto-guarda conversaciones de Almita (público)
│       ├── crm-almita.js         ← GET/DELETE conversaciones (solo dueno/superadmin)
│       ├── auth-login.js         ← Login → access_token + refresh_token
│       ├── auth-register.js      ← Registro por invitación
│       ├── auth-invite.js        ← Crear/listar/reenviar invitaciones
│       ├── auth-check-invite.js  ← Valida token de invitación
│       ├── auth-refresh.js       ← Refresca access_token con refresh_token
│       ├── obras-list.js
│       ├── obras-create.js
│       ├── etapas-cargar.js
│       ├── etapas-firmar.js
│       ├── remitos-list.js
│       ├── remitos-create.js
│       ├── remitos-firmar.js
│       ├── remito-token.js
│       ├── remito-scan.js
│       ├── checklist-get.js
│       ├── partes-list.js        ← CRUD partes con familia_id y join familias
│       ├── familias.js           ← CRUD familias de productos
│       ├── etapas-produccion.js  ← CRUD etapas de producción por modelo
│       ├── modelo-partes.js      ← CRUD BOM (modelo_partes)
│       ├── modelos-list.js
│       ├── stock-movimiento.js
│       ├── cms-modelos.js
│       ├── cms-obras.js
│       ├── users-list.js         ← CRUD usuarios + permisos + cerrar sesión forzada
│       ├── pdf-export.js
│       └── lib/
│           └── supabase.js       ← Cliente Supabase + getAuthUser + validación de sesión
├── netlify.toml
├── vite.config.js
└── tailwind.config.js
```

---

## Arquitectura de rutas

El proyecto tiene **dos SPAs distintas** bajo el mismo deploy:

### Sitio público (raíz `/`)
| Ruta | Descripción | SEO |
|---|---|---|
| `/` | HomePage | index |
| `/tiendaalma` | Catálogo de módulos | index |
| `/tiendaalma/:slug` | Detalle de producto | index |
| `/sistema-constructivo` | Modal sistema constructivo | index |
| `/obras` | Modal galería de obras | **noindex** |
| `/ubicacion` | Modal con mapa | **noindex** |
| `/almita` | Página chatbot | index |
| `/cat`, `/cas`, `/edge`, `/cacmi` | Certificaciones | index |

### Panel interno (`/app/*`)
| Ruta | Acceso | Descripción |
|---|---|---|
| `/app/login` | público | Login |
| `/app/registro` | público | Registro por invitación |
| `/app/obras` | todos | Lista de obras |
| `/app/obras/nueva` | dueno, deposito | Nueva obra |
| `/app/obras/:id` | todos | Detalle de obra |
| `/app/obras/:id/remito/nuevo` | deposito | Crear remito |
| `/app/firmar/:token` | público | Firma de remito (sin auth) |
| `/app/remito-scan` | deposito | Escanear remito con cámara |
| `/app/partes` | deposito+ | Catálogo de componentes |
| `/app/familias` | deposito+ | Familias de productos |
| `/app/bom` | deposito, fabricacion | BOM por modelo |
| `/app/cms/modelos` | arquitectura+ | Gestión de modelos web |
| `/app/cms/obras` | arquitectura+ | Galería de obras web |
| `/app/marketing/*` | marketing+ | Reels, publicaciones, Make |
| `/app/usuarios` | dueno+ | Gestión de usuarios |
| `/app/crm-almita` | dueno+ | CRM conversaciones Almita |

### Netlify Functions (serverless)
| Endpoint | Auth | Uso |
|---|---|---|
| `gemini-chat` | no | Chatbot IA |
| `saveLead` | no | Lead explícito → email |
| `save-conversacion` | no | Auto-guarda chat Almita |
| `crm-almita` | sí (dueno) | CRM admin |
| `auth-login/register/invite/refresh` | parcial | Auth |
| `obras-*`, `etapas-*`, `remitos-*` | sí | Gestión de obras |
| `partes-list`, `familias`, `modelo-partes` | sí | Producción |
| `etapas-produccion` | sí | BOM etapas |
| `cms-modelos`, `cms-obras` | sí | CMS web |
| `users-list` | sí (dueno) | Gestión usuarios |
| `pdf-export` | sí | Export PDF obra |

---

## Productos / Módulos (precios mayo 2026)

| Modelo | Superficie | Precio |
|---|---|---|
| MiCasita | 12m² | $17.900.000 |
| Alma 18 | 18m² | $39.850.000 |
| Alma 27 | 27m² | $46.650.000 |
| Alma Loft 28 | 28m² | $42.300.000 |
| Alma 36 | 36m² | $58.720.000 |
| Alma 36 Refugio | 36m² | $61.200.000 |

**IMPORTANTE:** Los precios aparecen en múltiples lugares. Al actualizar, modificar SIEMPRE:
1. `src/components/TiendaAlma.jsx` (campo `precio:`, ventajas, FAQ, slider)
2. `src/seo/products.js` (title, description, `productData.price`)
3. `src/seo/pages.js` (descripciones con "Desde $X")
4. Los 4 archivos HTML en `public/recursos/`
5. El contexto de Almita en `netlify/functions/gemini-chat.js`

---

## Base de datos Supabase — Esquema completo

### `users`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK, viene de `auth.users` |
| `nombre` | TEXT | |
| `email` | TEXT | |
| `telefono` | TEXT | nullable |
| `rol` | TEXT | `superadmin` `dueno` `deposito` `fabricacion` `marketing` `arquitectura` `cliente` |
| `activo` | BOOL | soft-delete |
| `session_invalidated_at` | TIMESTAMPTZ | nullable; si el token fue emitido antes de este valor → rechazado |
| `permisos` | JSONB | `{}` por defecto. Overrides por módulo: `{ "partes": "read", "marketing": "write", "bom": "none" }` |

---

### `invitaciones`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `email` | TEXT | |
| `rol` | TEXT | rol que tendrá el usuario al registrarse |
| `token` | TEXT | UNIQUE, generado con `crypto.randomUUID()` |
| `expires_at` | TIMESTAMPTZ | típicamente 7 días |
| `usado_en` | TIMESTAMPTZ | nullable; si no es null, ya fue usada |
| `obra_id` | UUID | nullable, FK `obras` |
| `created_at` | TIMESTAMPTZ | |

---

### `modelos`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `slug` | TEXT | UNIQUE, usado en URLs |
| `nombre` | TEXT | ej: `Alma 36 Refugio` |
| `superficie` | INT | m² |
| `precio` | NUMERIC | en pesos ARS |
| `descripcion` | TEXT | |
| `plazo` | TEXT | ej: `30 días` |
| `ventajas` | TEXT[] / JSONB | lista de ventajas |
| `fotos` | JSONB | array de URLs Cloudinary |
| `imagen_portada` | TEXT | URL Cloudinary |
| `orden` | INT | orden en el catálogo |
| `activo` | BOOL | |

---

### `obras`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `modelo_id` | UUID | FK `modelos` |
| `cliente_id` | UUID | FK `users`; el cliente que puede verla |
| `numero_obra` | INT | auto-increment |
| `estado` | TEXT | `activa` `finalizada` `cancelada` |
| `nombre_contacto` | TEXT | nullable |
| `fecha_inicio` | DATE | nullable |
| `direccion` | TEXT | nullable |
| `notas` | TEXT | nullable |
| `creado_por` | UUID | FK `users` |
| `created_at` | TIMESTAMPTZ | |

---

### `etapas_obra`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `obra_id` | UUID | FK `obras` |
| `numero` | INT | orden (1, 2, 3…) |
| `nombre` | TEXT | ej: `Cimientos` |
| `estado` | TEXT | `pendiente` `cargada` `firmada` |
| `fecha_carga` | TIMESTAMPTZ | nullable |

### `etapa_registros`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `etapa_obra_id` | UUID | FK `etapas_obra` |
| `cargada_por` | UUID | FK `users` |
| `descripcion` | TEXT | |
| `created_at` | TIMESTAMPTZ | |

### `etapa_fotos`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `etapa_registro_id` | UUID | FK `etapa_registros` |
| `url` | TEXT | URL de la foto |

---

### `remitos`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `obra_id` | UUID | FK `obras` |
| `numero` | INT | auto-increment por obra |
| `estado` | TEXT | `pendiente` `firmado` |
| `notas` | TEXT | nullable |
| `token_firma` | UUID | para el link público de firma |
| `fecha_firma` | TIMESTAMPTZ | nullable |
| `creado_por` | UUID | FK `users` |
| `firmado_por` | UUID | FK `users`, nullable |
| `created_at` | TIMESTAMPTZ | |

### `remito_items`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `remito_id` | UUID | FK `remitos` |
| `parte_id` | UUID | FK `partes`, nullable (si es ítem libre) |
| `cantidad` | NUMERIC | |

---

### `partes`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `codigo` | TEXT | código interno |
| `nombre` | TEXT | |
| `descripcion` | TEXT | nullable |
| `unidad` | TEXT | ej: `m²`, `unidad`, `ml` |
| `costo` | NUMERIC | costo unitario ARS |
| `stock_actual` | INT | |
| `stock_minimo` | INT | alerta si stock_actual < stock_minimo |
| `familia_id` | UUID | FK `familias`, nullable |

### `familias`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `nombre` | TEXT | ej: `Paneles`, `Tornillería` |
| `color` | TEXT | hex, ej: `#10b981` |

---

### `etapas_produccion`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `modelo_id` | UUID | FK `modelos` |
| `nombre` | TEXT | ej: `Estructura`, `Aislación` |
| `orden` | INT | posición en el proceso |
| `color` | TEXT | hex para visualización |

### `modelo_partes` (BOM)
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `modelo_id` | UUID | FK `modelos` |
| `parte_id` | UUID | FK `partes` |
| `cantidad_necesaria` | NUMERIC | |
| `etapa_produccion_id` | UUID | FK `etapas_produccion`, nullable |
| `notas` | TEXT | nullable |
| | | UNIQUE(`modelo_id`, `parte_id`) |

---

### `obras_galeria` (CMS público)
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `titulo` | TEXT | |
| `ubicacion` | TEXT | nullable |
| `descripcion` | TEXT | nullable |
| `imagen_portada` | TEXT | URL Cloudinary |
| `fotos` | JSONB | array de URLs |
| `orden` | INT | |

---

### `leads` (contactos explícitos del chatbot)
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `nombre` | TEXT | |
| `email` | TEXT | |
| `telefono` | TEXT | |
| `producto_interes` | TEXT | nombre del modelo |
| `created_at` | TIMESTAMPTZ | |

---

### `conversaciones` (todas las sesiones de Almita)
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `session_id` | TEXT | UNIQUE; UUID generado en el browser del visitante |
| `nombre` | TEXT | nullable; extraído de la conversación |
| `email` | TEXT | nullable |
| `telefono` | TEXT | nullable |
| `producto_interes` | TEXT | nullable; nombre del modelo mencionado |
| `mensajes` | JSONB | array `[{ role: "user"/"bot", text, ts }]` |
| `created_at` | TIMESTAMPTZ | primera vez que se guardó |
| `updated_at` | TIMESTAMPTZ | última actualización |

---

### Migraciones SQL aplicadas
```sql
-- Permisos por módulo en usuarios
ALTER TABLE users ADD COLUMN IF NOT EXISTS permisos JSONB DEFAULT '{}'::jsonb;

-- Cierre de sesión forzado
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_invalidated_at TIMESTAMPTZ;

-- Tabla conversaciones del chatbot
CREATE TABLE IF NOT EXISTS conversaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  nombre TEXT, email TEXT, telefono TEXT, producto_interes TEXT,
  mensajes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conv_updated ON conversaciones(updated_at DESC);
```

---

## Sistema de autenticación

- **JWT Supabase:** `access_token` (1 hora) + `refresh_token`
- **`auth-login.js`:** devuelve `token`, `refresh_token`, `expires_at`, `user` (con `permisos`)
- **`auth-refresh.js`:** POST `{ refresh_token }` → nuevos tokens
- **`AuthContext.jsx`:** maneja sesión global, refresca token al init y 5 min antes de expirar
- **`api.js`:** intercepta 401, intenta refresh automático, reintenta el request original; si falla → logout
- **`session_invalidated_at`:** campo en `users` para invalidar sesión desde el admin (compara con `iat` del JWT)
- **`getAuthUser(token)`** en `supabase.js`: valida token + lee perfil + verifica `session_invalidated_at`

---

## Sistema de permisos por módulo

Archivo central: `src/app/lib/modulos.js`

Módulos definidos:
- `obras` — Gestión de obras
- `partes` — Componentes
- `familias` — Familias de productos
- `bom` — Lista de materiales
- `remito_scan` — Escanear remitos
- `cms` — CMS web
- `marketing` — Marketing
- `usuarios` — Administración de usuarios

Niveles de permiso por módulo (campo `permisos` JSONB en `users`):
- **ausente** → usa acceso por defecto del rol
- **`"none"`** → sin acceso (bloquea incluso si el rol lo permitiría)
- **`"read"`** → solo lectura
- **`"write"`** → lectura y escritura

`ProtectedRoute` acepta `module` y `mode` props. Si el usuario tiene un permiso explícito para ese módulo, lo usa en lugar del check por rol.

El sidebar en `AppLayout` también filtra ítems según los permisos del usuario.

---

## Variables de entorno

### En Netlify (producción):
| Variable | Uso |
|---|---|
| `GEMINI_API_KEY_SECRET` | Google Gemini API (chatbot Almita) |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | Key anónima (saveLead) |
| `SUPABASE_SERVICE_ROLE_KEY` | Key de servicio (todas las funciones admin) |
| `RESEND_API_KEY` | Envío de emails |
| `RESEND_FROM` | Email remitente |
| `RESEND_TO` | Email destino de leads |

---

## Chatbot "Almita" + CRM

### Flujo completo:
1. Visitante abre el chat → se genera un `session_id` UUID (localStorage `almamod_session_id`)
2. Cada respuesta del bot dispara un auto-save (debounce 2s) a `save-conversacion`
3. `save-conversacion` hace upsert por `session_id` en tabla `conversaciones`
4. También extrae regex de nombre/email/teléfono del texto si el cliente no los capturó
5. Si el usuario pide ser contactado → también llama a `saveLead` → email por Resend
6. Al limpiar el chat → guarda la sesión actual + genera nuevo `session_id`

### CRM en el panel:
- Ruta: `/app/crm-almita` (solo `dueno`/`superadmin`)
- Stats: total conversaciones, con contacto, hoy, sin datos
- Filtros: texto libre (nombre/email/tel), "con contacto / sin datos", modelo de interés, período
- Cards expandibles con el chat completo en formato burbuja

### Archivos clave:
- `src/components/aichatbot.jsx` — Frontend con auto-save
- `netlify/functions/gemini-chat.js` — Backend IA (Gemini 2.5 Flash)
- `netlify/functions/save-conversacion.js` — Guarda conversación (público)
- `netlify/functions/crm-almita.js` — API del CRM (protegida)
- `src/app/pages/CrmAlmita.jsx` — Vista admin del CRM

---

## Módulo de Producción

### Partes / Componentes (`/app/partes`)
- Tabla con scroll horizontal en mobile
- Columnas: Código, Nombre, Familia (badge coloreado con dropdown inline), Unidad, Costo, Stock, Stock Mín, Acciones
- Ordenamiento asc/desc por cualquier columna (click en header)
- Filtros por columna: texto, familia, stock (todos / sin stock / bajo mínimo / OK)
- Actualización de familia con dropdown inline (optimistic update)

### Familias (`/app/familias`)
- ABM completo (crear, editar, eliminar)
- Paleta de 10 colores predefinidos
- Import desde Excel (detecta automáticamente la columna "FAMILIA" o similar)
- Badge de preview en tiempo real al escribir

### BOM — Lista de Materiales (`/app/bom`)
- Selector de modelo de vivienda
- Etapas de producción colapsables con botones ↑↓ para reordenar
- Agregar partes a cada etapa con buscador (dropdown cierra correctamente con onMouseDown)
- Editar cantidad, cambiar etapa, eliminar parte del BOM
- Sección "Sin etapa asignada" para partes sin clasificar

### Escanear Remito (`/app/remito-scan`)
- Captura de foto directa o upload de imagen
- Selección de obra y remito
- Items con filtro por familia y selector de parte del catálogo
- Cantidad por teclado (input numérico, sin spinner)

---

## Módulo de Obras

### Etapas de obra
- Cada obra tiene etapas pre-definidas (Cimientos, Estructura, etc.)
- Acción "Cargar" → estado `cargada`, "Firmar" → estado `firmada`
- PDF exportable por obra

### Remitos
- Creación de remito con ítems y cantidades
- Firma digital via link público (`/app/firmar/:token`)
- Scan posterior para vincular ítems a partes del catálogo

---

## Gestión de Usuarios (`/app/usuarios`)

- Invitar por email (genera link de registro único con expiración)
- Roles disponibles: `cliente`, `fabricacion`, `deposito`, `marketing`, `arquitectura`, `dueno`
- Rol `superadmin`: acceso completo, no editable desde el panel
- Editar: nombre, teléfono, rol
- **Permisos por módulo:** modal con 8 módulos × 4 opciones (Rol / Sin acceso / Lectura / Escritura)
- **Cerrar sesión forzada:** invalida el token actual del usuario (via `session_invalidated_at`)
- Desactivar usuario (soft delete, `activo = false`)
- Badge violeta muestra cuántos permisos personalizados tiene cada usuario

---

## Cloudinary

- **Cloud name:** `dlshym1te`
- **Base URL:** `https://res.cloudinary.com/dlshym1te/image/upload/`
- **Función helper:** `src/config/cloudinary.js` → `getCloudinaryUrl(fileName, preset)`
- **Convención de nombres:** `ALMAMOD_[MODELO]_[TIPO].webp`
- **Videos:** `VIDEO_MI_CASITA_VERTICAL.mp4`, `VIDEO_CABAÑERO_HORIZONTAL.mp4`

---

## SEO — Decisiones importantes

- **Canónicas:** Todas las rutas SPA tienen canonical propio via `SEO.jsx` + Helmet
- **`/obras` y `/ubicacion`:** Son modales → `noindex: true`
- **`/sistema-constructivo`:** En sitemap, indexable
- **Sitemap:** `public/sitemap.xml` — actualizar `lastmod` al hacer cambios de contenido
- **www → non-www:** 301 forzado en Netlify

---

## QUÉ NO TOCAR / ROMPER

- **`ServiciosCarousel.jsx`** — no modificar sin pedido explícito
- **El orden de redirects en `netlify.toml`** — el SPA fallback `/* → /index.html` debe ir SIEMPRE al final
- **Las canónicas de los HTML estáticos** — apuntan a URLs absolutas con https
- **El contexto de Almita en `gemini-chat.js`** — es la estrategia comercial, cambiar con cuidado
- **Los schemas JSON-LD en `src/seo/schema.js`** — están validados por Google
- **`src/app/lib/api.js`** — el interceptor de 401 con refresh es crítico para la sesión. No simplificar
- **`getAuthUser` en `supabase.js`** — valida `session_invalidated_at`. No omitir
- **La columna `permisos` en `users`** — debe existir en Supabase o los queries de users-list fallan

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

### Antes de un deploy que incluya cambios de DB:
Siempre correr primero las migraciones SQL en Supabase, **luego** hacer push.
Si se hace al revés, la función falla hasta que se corra el SQL.
