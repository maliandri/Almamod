import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });

  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno', 'deposito', 'fabricacion'].includes(user.rol))
    return response(403, { error: 'Sin permisos' });

  const canWrite = ['superadmin', 'dueno', 'deposito'].includes(user.rol);

  // GET ?modelo_id=xxx
  if (event.httpMethod === 'GET') {
    const { modelo_id } = event.queryStringParameters || {};
    if (!modelo_id) return response(400, { error: 'modelo_id requerido' });
    const { data, error } = await supabase
      .from('etapas_produccion')
      .select('*')
      .eq('modelo_id', modelo_id)
      .order('orden');
    if (error) return response(500, { error: error.message });
    return response(200, { etapas: data });
  }

  // POST — crear etapa
  if (event.httpMethod === 'POST') {
    if (!canWrite) return response(403, { error: 'Sin permisos' });
    const { modelo_id, nombre, orden, color } = JSON.parse(event.body || '{}');
    if (!modelo_id || !nombre) return response(400, { error: 'modelo_id y nombre requeridos' });
    const { data, error } = await supabase
      .from('etapas_produccion')
      .insert({ modelo_id, nombre, orden: orden || 1, color: color || '#667eea' })
      .select().single();
    if (error) return response(500, { error: error.message });
    return response(201, { etapa: data });
  }

  // PUT — actualizar etapa
  if (event.httpMethod === 'PUT') {
    if (!canWrite) return response(403, { error: 'Sin permisos' });
    const { id, nombre, orden, color } = JSON.parse(event.body || '{}');
    if (!id) return response(400, { error: 'id requerido' });
    const { data, error } = await supabase
      .from('etapas_produccion')
      .update({ nombre, orden, color })
      .eq('id', id).select().single();
    if (error) return response(500, { error: error.message });
    return response(200, { etapa: data });
  }

  // DELETE ?id=xxx
  if (event.httpMethod === 'DELETE') {
    if (!canWrite) return response(403, { error: 'Sin permisos' });
    const { id } = event.queryStringParameters || {};
    if (!id) return response(400, { error: 'id requerido' });
    const { error } = await supabase.from('etapas_produccion').delete().eq('id', id);
    if (error) return response(500, { error: error.message });
    return response(200, { ok: true });
  }

  return response(405, { error: 'Método no permitido' });
}
