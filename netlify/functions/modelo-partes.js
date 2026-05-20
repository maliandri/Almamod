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
      .from('modelo_partes')
      .select(`
        id, cantidad_necesaria, notas,
        partes(id, codigo, nombre, unidad, costo, stock_actual, stock_minimo),
        etapas_produccion(id, nombre, color, orden)
      `)
      .eq('modelo_id', modelo_id)
      .order('etapas_produccion(orden)');
    if (error) return response(500, { error: error.message });
    return response(200, { partes: data });
  }

  // POST — agregar parte al BOM (o bulk)
  if (event.httpMethod === 'POST') {
    if (!canWrite) return response(403, { error: 'Sin permisos' });
    const body = JSON.parse(event.body || '{}');

    // Bulk import
    if (body.bulk && Array.isArray(body.items)) {
      const rows = body.items.map(i => ({
        modelo_id: body.modelo_id,
        parte_id: i.parte_id,
        cantidad_necesaria: i.cantidad_necesaria || 1,
        etapa_produccion_id: i.etapa_produccion_id || null,
        notas: i.notas || null,
      }));
      const { error } = await supabase.from('modelo_partes').upsert(rows, { onConflict: 'modelo_id,parte_id' });
      if (error) return response(500, { error: error.message });
      return response(200, { ok: true, count: rows.length });
    }

    const { modelo_id, parte_id, cantidad_necesaria, etapa_produccion_id, notas } = body;
    if (!modelo_id || !parte_id) return response(400, { error: 'modelo_id y parte_id requeridos' });
    const { data, error } = await supabase
      .from('modelo_partes')
      .upsert({ modelo_id, parte_id, cantidad_necesaria: cantidad_necesaria || 1, etapa_produccion_id: etapa_produccion_id || null, notas: notas || null }, { onConflict: 'modelo_id,parte_id' })
      .select().single();
    if (error) return response(500, { error: error.message });
    return response(201, { item: data });
  }

  // PUT — actualizar item BOM
  if (event.httpMethod === 'PUT') {
    if (!canWrite) return response(403, { error: 'Sin permisos' });
    const { id, cantidad_necesaria, etapa_produccion_id, notas } = JSON.parse(event.body || '{}');
    if (!id) return response(400, { error: 'id requerido' });
    const { data, error } = await supabase
      .from('modelo_partes')
      .update({ cantidad_necesaria, etapa_produccion_id: etapa_produccion_id || null, notas })
      .eq('id', id).select().single();
    if (error) return response(500, { error: error.message });
    return response(200, { item: data });
  }

  // DELETE ?id=xxx
  if (event.httpMethod === 'DELETE') {
    if (!canWrite) return response(403, { error: 'Sin permisos' });
    const { id } = event.queryStringParameters || {};
    if (!id) return response(400, { error: 'id requerido' });
    const { error } = await supabase.from('modelo_partes').delete().eq('id', id);
    if (error) return response(500, { error: error.message });
    return response(200, { ok: true });
  }

  return response(405, { error: 'Método no permitido' });
}
