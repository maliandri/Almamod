import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

const ALLOWED = ['superadmin', 'dueno', 'marketing', 'arquitectura'];

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };

  // GET publico — devuelve slides activos para el sitio
  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('activo', true)
      .order('orden');
    if (error) return response(500, { error: error.message });
    return response(200, { slides: data || [] });
  }

  // Resto requiere auth
  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });
  const user = await getAuthUser(token);
  if (!user || !ALLOWED.includes(user.rol)) return response(403, { error: 'Sin permisos' });

  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const { titulo, pretitulo, subtitulo, align, badge, imagen_public_id, orden } = body;
    if (!titulo) return response(400, { error: 'titulo requerido' });
    const { data, error } = await supabase
      .from('hero_slides')
      .insert({ titulo, pretitulo: pretitulo||null, subtitulo: subtitulo||null, align: align||'left', badge: badge||null, imagen_public_id: imagen_public_id||null, orden: orden||99 })
      .select().single();
    if (error) return response(500, { error: error.message });
    return response(201, { slide: data });
  }

  if (event.httpMethod === 'PUT') {
    const body = JSON.parse(event.body || '{}');
    const { id, ...fields } = body;
    if (!id) return response(400, { error: 'id requerido' });
    const allowed = ['titulo','pretitulo','subtitulo','align','badge','imagen_public_id','orden','activo'];
    const update = Object.fromEntries(Object.entries(fields).filter(([k]) => allowed.includes(k)));
    const { data, error } = await supabase.from('hero_slides').update(update).eq('id', id).select().single();
    if (error) return response(500, { error: error.message });
    return response(200, { slide: data });
  }

  if (event.httpMethod === 'DELETE') {
    const { id } = event.queryStringParameters || {};
    if (!id) return response(400, { error: 'id requerido' });
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    if (error) return response(500, { error: error.message });
    return response(200, { ok: true });
  }

  return response(405, { error: 'Metodo no permitido' });
}
