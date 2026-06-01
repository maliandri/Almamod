import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

const CLOUD      = 'dlshym1te';
const API_KEY    = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Carpetas exclusivas de AlmaMod (nombres exactos en Cloudinary)
const ALMAMOD_FOLDERS = ['Modulos', 'certificaciones', 'ObrasAlmamod', 'reels', 'social-media'];

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'GET') return response(405, { error: 'Método no permitido' });

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });
  const user = await getAuthUser(token);
  if (!user) return response(401, { error: 'No autorizado' });

  const { folder = 'todo', next_cursor } = event.queryStringParameters || {};

  // Validar carpeta solicitada
  if (folder !== 'todo' && !ALMAMOD_FOLDERS.includes(folder)) {
    return response(400, { error: 'Carpeta no permitida' });
  }

  // --- Con credenciales Cloudinary Admin API ---
  if (API_KEY && API_SECRET) {
    const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

    // Listar una carpeta específica por prefix
    const fetchByPrefix = async (prefix, cursor) => {
      const params = new URLSearchParams({
        type:        'upload',
        max_results: '200',
        prefix:      `${prefix}/`,
      });
      if (cursor) params.set('next_cursor', cursor);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD}/resources/image?${params}`,
        { headers: { Authorization: `Basic ${auth}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Error Cloudinary');
      return data;
    };

    try {
      if (folder !== 'todo') {
        // Una sola carpeta con paginación
        const data = await fetchByPrefix(folder, next_cursor || null);
        return response(200, {
          images:      mapResources(data.resources),
          next_cursor: data.next_cursor || null,
          source:      'api',
        });
      }

      // Todo: todas las carpetas AlmaMod en paralelo (sin paginación cruzada)
      const results = await Promise.all(ALMAMOD_FOLDERS.map(f => fetchByPrefix(f, null)));
      const images  = results.flatMap(d => mapResources(d.resources));
      return response(200, { images, next_cursor: null, source: 'api' });

    } catch (err) {
      return response(500, { error: err.message });
    }
  }

  // --- Fallback sin API keys: leer desde Supabase ---
  const images = [];
  const seen   = new Set();

  const addUrl = (url, fld) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    const match    = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    const public_id = match ? match[1].replace(/\.[^.]+$/, '') : url;
    images.push({ public_id, secure_url: url, folder: fld });
  };

  const { data: modelos } = await supabase.from('modelos').select('imagen_portada, fotos');
  for (const m of modelos || []) {
    if (m.imagen_portada) {
      addUrl(
        m.imagen_portada.startsWith('http')
          ? m.imagen_portada
          : `https://res.cloudinary.com/${CLOUD}/image/upload/${m.imagen_portada}`,
        'Modulos'
      );
    }
    for (const f of (m.fotos || [])) addUrl(f, 'Modulos');
  }

  const { data: obras } = await supabase.from('obras_galeria').select('imagen_portada, fotos');
  for (const o of obras || []) {
    if (o.imagen_portada) addUrl(o.imagen_portada, 'ObrasAlmamod');
    for (const f of (o.fotos || [])) addUrl(f, 'ObrasAlmamod');
  }

  const filtradas = folder !== 'todo' ? images.filter(i => i.folder === folder) : images;
  return response(200, { images: filtradas, next_cursor: null, source: 'supabase' });
}

function mapResources(resources = []) {
  return resources.map(r => ({
    public_id:  r.public_id,
    secure_url: r.secure_url,
    folder:     r.folder || '',
    width:      r.width,
    height:     r.height,
  }));
}
