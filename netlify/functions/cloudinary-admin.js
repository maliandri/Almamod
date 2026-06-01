import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

const CLOUD      = 'dlshym1te';
const API_KEY    = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

const ALLOWED_ROLES   = ['superadmin', 'dueno', 'marketing', 'arquitectura'];
const ALLOWED_FOLDERS = ['Modulos', 'certificaciones', 'ObrasAlmamod', 'reels', 'social-media'];

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });
  const user = await getAuthUser(token);
  if (!user || !ALLOWED_ROLES.includes(user.rol)) return response(403, { error: 'Sin permisos' });

  if (!API_KEY || !API_SECRET) return response(500, { error: 'Cloudinary no configurado en el servidor' });

  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

  // DELETE — eliminar imagen
  if (event.httpMethod === 'DELETE') {
    const { public_id } = JSON.parse(event.body || '{}');
    if (!public_id) return response(400, { error: 'public_id requerido' });

    // Solo permite eliminar de carpetas de AlmaMod
    const folder = public_id.split('/')[0];
    if (!ALLOWED_FOLDERS.includes(folder)) return response(403, { error: 'Carpeta no permitida' });

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/destroy`, {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id, invalidate: true }),
      });
      const data = await res.json();
      if (data.result !== 'ok') return response(500, { error: `Cloudinary respondió: ${data.result}` });
      return response(200, { ok: true });
    } catch (err) {
      return response(502, { error: err.message });
    }
  }

  return response(405, { error: 'Método no permitido' });
}
