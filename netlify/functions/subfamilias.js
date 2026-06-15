import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

// ABM de subfamilias (cada una pertenece a una familia). Mismo patrón que familias.js.
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });

  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno', 'deposito', 'fabricacion'].includes(user.rol))
    return response(403, { error: 'Sin permisos' });

  const canWrite = ['superadmin', 'dueno', 'deposito'].includes(user.rol);

  // GET — todas, o filtradas por ?familia_id
  if (event.httpMethod === 'GET') {
    const { familia_id } = event.queryStringParameters || {};
    let q = supabase.from('subfamilias').select('id, familia_id, nombre, color').order('nombre');
    if (familia_id) q = q.eq('familia_id', familia_id);
    const { data, error } = await q;
    if (error) return response(500, { error: error.message });
    return response(200, { subfamilias: data });
  }

  if (event.httpMethod === 'POST') {
    if (!canWrite) return response(403, { error: 'Sin permisos' });
    const { familia_id, nombre, color } = JSON.parse(event.body || '{}');
    if (!familia_id || !nombre) return response(400, { error: 'familia_id y nombre requeridos' });
    const { data, error } = await supabase
      .from('subfamilias')
      .insert({ familia_id, nombre, color: color || null })
      .select().single();
    if (error) return response(500, { error: error.message });
    return response(201, { subfamilia: data });
  }

  if (event.httpMethod === 'PUT') {
    if (!canWrite) return response(403, { error: 'Sin permisos' });
    const { id, nombre, color } = JSON.parse(event.body || '{}');
    if (!id) return response(400, { error: 'id requerido' });
    const update = {};
    if (nombre !== undefined) update.nombre = nombre;
    if (color !== undefined) update.color = color;
    const { data, error } = await supabase
      .from('subfamilias').update(update).eq('id', id).select().single();
    if (error) return response(500, { error: error.message });
    return response(200, { subfamilia: data });
  }

  if (event.httpMethod === 'DELETE') {
    if (!canWrite) return response(403, { error: 'Sin permisos' });
    const { id } = event.queryStringParameters || {};
    if (!id) return response(400, { error: 'id requerido' });
    const { error } = await supabase.from('subfamilias').delete().eq('id', id);
    if (error) return response(500, { error: error.message });
    return response(200, { ok: true });
  }

  return response(405, { error: 'Método no permitido' });
}
