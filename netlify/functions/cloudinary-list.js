import { response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

const CLOUD_NAME  = 'dlshym1te';
const API_KEY     = process.env.CLOUDINARY_API_KEY;
const API_SECRET  = process.env.CLOUDINARY_API_SECRET;

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'GET') return response(405, { error: 'Método no permitido' });

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });
  const user = await getAuthUser(token);
  if (!user) return response(401, { error: 'No autorizado' });

  if (!API_KEY || !API_SECRET) return response(500, { error: 'Cloudinary no configurado (CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET)' });

  const { folder, next_cursor } = event.queryStringParameters || {};

  const params = new URLSearchParams({ type: 'upload', max_results: '200' });
  if (folder && folder !== 'todo') params.set('prefix', folder + '/');
  if (next_cursor) params.set('next_cursor', next_cursor);

  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image?${params}`,
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const data = await res.json();
    if (!res.ok) return response(500, { error: data.error?.message || 'Error Cloudinary' });

    const images = (data.resources || []).map(r => ({
      public_id:  r.public_id,
      secure_url: r.secure_url,
      folder:     r.folder || '',
      width:      r.width,
      height:     r.height,
      created_at: r.created_at,
    }));

    return response(200, { images, next_cursor: data.next_cursor || null });
  } catch (err) {
    return response(500, { error: err.message });
  }
}
