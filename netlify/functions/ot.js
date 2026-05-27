import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });
  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno', 'deposito', 'fabricacion'].includes(user.rol))
    return response(403, { error: 'Sin permisos' });

  const canWrite = ['superadmin', 'dueno', 'deposito'].includes(user.rol);

  // GET — lista (con filtros) o detalle
  if (event.httpMethod === 'GET') {
    const { id, estado, tipo } = event.queryStringParameters || {};
    if (id) {
      const { data, error } = await supabase
        .from('ot')
        .select('*, obras(id, numero_obra, nombre_contacto), modelos(id, nombre, superficie)')
        .eq('id', id).single();
      if (error) return response(500, { error: error.message });
      return response(200, { ot: data });
    }
    let q = supabase
      .from('ot')
      .select('*, obras(numero_obra, nombre_contacto), modelos(nombre)');
    if (estado) q = q.eq('estado', estado);
    if (tipo)   q = q.eq('tipo', tipo);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) return response(500, { error: error.message });
    return response(200, { ots: data || [] });
  }

  // POST — crear OT
  if (event.httpMethod === 'POST') {
    if (!canWrite) return response(403, { error: 'Sin permisos' });
    const { tipo, titulo, descripcion, obra_id, modelo_id, asignado_a, fecha_inicio, fecha_entrega } = JSON.parse(event.body || '{}');
    if (!titulo) return response(400, { error: 'titulo requerido' });
    const { data, error } = await supabase
      .from('ot')
      .insert({
        tipo: tipo || 'fabricacion',
        titulo,
        descripcion:    descripcion    || null,
        obra_id:        obra_id        || null,
        modelo_id:      modelo_id      || null,
        asignado_a:     asignado_a     || null,
        fecha_inicio:   fecha_inicio   || null,
        fecha_entrega:  fecha_entrega  || null,
        creado_por: user.id,
      })
      .select().single();
    if (error) return response(500, { error: error.message });
    return response(201, { ot: data });
  }

  // PUT — actualizar campos o estado
  if (event.httpMethod === 'PUT') {
    if (!canWrite) return response(403, { error: 'Sin permisos' });
    const body = JSON.parse(event.body || '{}');
    const { id } = body;
    if (!id) return response(400, { error: 'id requerido' });
    const allowed = ['titulo', 'descripcion', 'tipo', 'estado', 'obra_id', 'modelo_id', 'asignado_a', 'fecha_inicio', 'fecha_entrega'];
    const update = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
    const { data, error } = await supabase.from('ot').update(update).eq('id', id).select().single();
    if (error) return response(500, { error: error.message });
    return response(200, { ot: data });
  }

  // DELETE
  if (event.httpMethod === 'DELETE') {
    if (!canWrite) return response(403, { error: 'Sin permisos' });
    const { id } = event.queryStringParameters || {};
    if (!id) return response(400, { error: 'id requerido' });
    const { error } = await supabase.from('ot').delete().eq('id', id);
    if (error) return response(500, { error: error.message });
    return response(200, { ok: true });
  }

  return response(405, { error: 'Método no permitido' });
}
