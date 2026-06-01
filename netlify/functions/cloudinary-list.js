import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

const CLOUD = 'dlshym1te';
const ALMAMOD_FOLDERS = ['Modulos', 'certificaciones', 'ObrasAlmamod', 'socialmedialma'];

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'GET') return response(405, { error: 'Metodo no permitido' });

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });
  const user = await getAuthUser(token);
  if (!user) return response(401, { error: 'No autorizado' });

  const { folder = 'todo', next_cursor } = event.queryStringParameters || {};
  if (folder !== 'todo' && !ALMAMOD_FOLDERS.includes(folder))
    return response(400, { error: 'Carpeta no permitida' });

  const API_KEY = process.env.CLOUDINARY_API_KEY;
  const API_SECRET = process.env.CLOUDINARY_API_SECRET;

  if (!API_KEY || !API_SECRET) return response(500, { error: 'Cloudinary no configurado' });

  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

  const folders = folder === 'todo' ? ALMAMOD_FOLDERS : [folder];
  const expression = folders.map(f => `asset_folder="${f}"`).join(' OR ');

  const body = { expression, max_results: 200, sort_by: [{ created_at: 'desc' }] };
  if (next_cursor) body.next_cursor = next_cursor;

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/resources/search`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return response(500, { error: data.error?.message || 'Error Cloudinary' });

    const images = (data.resources || []).map(r => ({
      public_id: r.public_id,
      secure_url: r.secure_url,
      folder: r.asset_folder || r.folder || '',
      width: r.width,
      height: r.height,
    }));
    return response(200, { images, next_cursor: data.next_cursor || null });
  } catch (err) {
    return response(500, { error: err.message });
  }
}
