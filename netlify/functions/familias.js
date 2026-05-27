import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });

  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno', 'deposito', 'fabricacion'].includes(user.rol))
    return response(403, { error: 'Sin permisos' });

  const canWrite = ['superadmin', 'dueno', 'deposito'].includes(user.rol);

  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase
      .from('familias')
      .select('id, nombre, color')
      .order('nombre');
    if (error) return response(500, { error: error.message });
    return response(200, { familias: data });
  }

  if (event.httpMethod === 'POST') {
    if (!canWrite) return response(403, { error: 'Sin permisos' });
    const { nombre, color } = JSON.parse(event.body || '{}');
    if (!nombre) return response(400, { error: 'nombre requerido' });
    const { data, error } = await supabase
      .from('familias')
      .insert({ nombre, color: color || '#667eea' })
      .select().single();
    if (error) return response(500, { error: error.message });
    return response(201, { familia: data });
  }

  if (event.httpMethod === 'PUT') {
    if (!canWrite) return response(403, { error: 'Sin permisos' });
    const { id, nombre, color } = JSON.parse(event.body || '{}');
    if (!id) return response(400, { error: 'id requerido' });
    const { data, error } = await supabase
      .from('familias')
      .update({ nombre, color })
      .eq('id', id).select().single();
    if (error) return response(500, { error: error.message });
    return response(200, { familia: data });
  }

  if (event.httpMethod === 'DELETE') {
    if (!canWrite) return response(403, { error: 'Sin permisos' });
    const { id } = event.queryStringParameters || {};
    if (!id) return response(400, { error: 'id requerido' });
    const { error } = await supabase.from('familias').delete().eq('id', id);
    if (error) return response(500, { error: error.message });
    return response(200, { ok: true });
  }

  return response(405, { error: 'Método no permitido' });
}
