import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });
  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno'].includes(user.rol))
    return response(403, { error: 'Sin permisos' });

  // GET — todas las obras
  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase
      .from('obras_galeria')
      .select('*')
      .order('orden');
    if (error) return response(500, { error: error.message });
    return response(200, { obras: data || [] });
  }

  // POST — crear obra
  if (event.httpMethod === 'POST') {
    const { titulo, ubicacion, descripcion, imagen_portada, fotos, orden } = JSON.parse(event.body || '{}');
    if (!titulo) return response(400, { error: 'titulo requerido' });
    const { data, error } = await supabase
      .from('obras_galeria')
      .insert({ titulo, ubicacion, descripcion, imagen_portada, fotos: fotos || [], orden: orden || 0 })
      .select().single();
    if (error) return response(500, { error: error.message });
    return response(201, { obra: data });
  }

  // PUT — actualizar obra
  if (event.httpMethod === 'PUT') {
    const body = JSON.parse(event.body || '{}');
    const { id } = body;
    if (!id) return response(400, { error: 'id requerido' });
    const allowed = ['titulo', 'ubicacion', 'descripcion', 'imagen_portada', 'fotos', 'orden', 'activo'];
    const update = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
    const { data, error } = await supabase.from('obras_galeria').update(update).eq('id', id).select().single();
    if (error) return response(500, { error: error.message });
    return response(200, { obra: data });
  }

  // DELETE
  if (event.httpMethod === 'DELETE') {
    const { id } = event.queryStringParameters || {};
    if (!id) return response(400, { error: 'id requerido' });
    const { error } = await supabase.from('obras_galeria').delete().eq('id', id);
    if (error) return response(500, { error: error.message });
    return response(200, { ok: true });
  }

  return response(405, { error: 'Método no permitido' });
}
