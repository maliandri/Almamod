import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });
  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno', 'deposito', 'fabricacion'].includes(user.rol))
    return response(403, { error: 'Sin permisos' });

  const canWrite = ['superadmin', 'dueno', 'deposito'].includes(user.rol);

  // GET ?ot_id=xxx — historial de avances/incidencias de una OT
  if (event.httpMethod === 'GET') {
    const { ot_id } = event.queryStringParameters || {};
    if (!ot_id) return response(400, { error: 'ot_id requerido' });
    const { data, error } = await supabase
      .from('ot_incidencias')
      .select('*, etapas_produccion(id, nombre, color)')
      .eq('ot_id', ot_id)
      .order('created_at', { ascending: false });
    if (error) return response(500, { error: error.message });

    const userIds = [...new Set((data || []).filter(i => i.creado_por).map(i => i.creado_por))];
    let usersMap = {};
    if (userIds.length) {
      const { data: users } = await supabase.from('users').select('id, nombre').in('id', userIds);
      usersMap = Object.fromEntries((users || []).map(u => [u.id, u]));
    }
    const enriched = (data || []).map(i => ({ ...i, usuario: i.creado_por ? usersMap[i.creado_por] || null : null }));
    return response(200, { incidencias: enriched });
  }

  // POST — crear registro de avance/incidencia
  if (event.httpMethod === 'POST') {
    if (!canWrite) return response(403, { error: 'Sin permisos' });
    const { ot_id, etapa_produccion_id, tipo, descripcion, fotos } = JSON.parse(event.body || '{}');
    if (!ot_id || !descripcion) return response(400, { error: 'ot_id y descripcion son requeridos' });
    const { data, error } = await supabase
      .from('ot_incidencias')
      .insert({
        ot_id,
        etapa_produccion_id: etapa_produccion_id || null,
        tipo: tipo === 'incidencia' ? 'incidencia' : 'avance',
        descripcion,
        fotos: fotos || [],
        creado_por: user.id,
      })
      .select('*, etapas_produccion(id, nombre, color)').single();
    if (error) return response(500, { error: error.message });
    return response(201, { incidencia: { ...data, usuario: { id: user.id, nombre: user.nombre } } });
  }

  // DELETE ?id=xxx
  if (event.httpMethod === 'DELETE') {
    if (!canWrite) return response(403, { error: 'Sin permisos' });
    const { id } = event.queryStringParameters || {};
    if (!id) return response(400, { error: 'id requerido' });
    const { error } = await supabase.from('ot_incidencias').delete().eq('id', id);
    if (error) return response(500, { error: error.message });
    return response(200, { ok: true });
  }

  return response(405, { error: 'Método no permitido' });
}
