import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'GET') return response(405, { error: 'Método no permitido' });

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });
  const user = await getAuthUser(token);
  if (!user) return response(401, { error: 'No autorizado' });

  // Si hay credenciales Admin API de Cloudinary, usarlas para listar todo
  const API_KEY    = process.env.CLOUDINARY_API_KEY;
  const API_SECRET = process.env.CLOUDINARY_API_SECRET;
  const CLOUD      = 'dlshym1te';

  if (API_KEY && API_SECRET) {
    const { folder, next_cursor } = event.queryStringParameters || {};
    const params = new URLSearchParams({ type: 'upload', max_results: '200' });
    if (folder && folder !== 'todo') params.set('prefix', folder + '/');
    if (next_cursor) params.set('next_cursor', next_cursor);
    const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD}/resources/image?${params}`,
        { headers: { Authorization: `Basic ${auth}` } }
      );
      const data = await res.json();
      if (!res.ok) return response(500, { error: data.error?.message || 'Error Cloudinary' });
      const images = (data.resources || []).map(r => ({
        public_id: r.public_id, secure_url: r.secure_url,
        folder: r.folder || '', width: r.width, height: r.height,
      }));
      return response(200, { images, next_cursor: data.next_cursor || null, source: 'api' });
    } catch (err) {
      return response(500, { error: err.message });
    }
  }

  // Fallback: recolectar URLs de Cloudinary desde las tablas de Supabase
  const images = [];
  const seen   = new Set();

  const addUrl = (url, folder) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    // Obtener public_id desde la URL de Cloudinary
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    const public_id = match ? match[1].replace(/\.[^.]+$/, '') : url;
    images.push({ public_id, secure_url: url, folder });
  };

  // Modelos: imagen_portada + fotos[]
  const { data: modelos } = await supabase
    .from('modelos')
    .select('nombre, imagen_portada, fotos');
  for (const m of modelos || []) {
    if (m.imagen_portada) {
      const url = m.imagen_portada.startsWith('http')
        ? m.imagen_portada
        : `https://res.cloudinary.com/${CLOUD}/image/upload/${m.imagen_portada}`;
      addUrl(url, 'modulos');
    }
    for (const f of (m.fotos || [])) addUrl(f, 'modulos');
  }

  // Obras galería CMS
  const { data: obras } = await supabase
    .from('obras_galeria')
    .select('titulo, imagen_portada, fotos');
  for (const o of obras || []) {
    if (o.imagen_portada) addUrl(o.imagen_portada, 'obras');
    for (const f of (o.fotos || [])) addUrl(f, 'obras');
  }

  const { folder } = event.queryStringParameters || {};
  const filtradas = folder && folder !== 'todo'
    ? images.filter(i => i.folder === folder)
    : images;

  return response(200, { images: filtradas, next_cursor: null, source: 'supabase' });
}
