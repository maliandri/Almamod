import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });

  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno', 'deposito', 'fabricacion'].includes(user.rol))
    return response(403, { error: 'Sin permisos' });

  const canWrite = ['superadmin', 'dueno', 'deposito'].includes(user.rol);

  // GET
  if (event.httpMethod === 'GET') {
    const { modelo_id } = event.queryStringParameters || {};

    if (modelo_id) {
      const { data, error } = await supabase
        .from('modelo_partes')
        .select(`
          id, cantidad_necesaria, notas,
          partes(id, codigo, nombre, descripcion, unidad, costo, stock_actual, stock_minimo),
          etapas_produccion(id, nombre, color)
        `)
        .eq('modelo_id', modelo_id)
        .order('id');
      if (error) return response(500, { error: error.message });
      return response(200, { partes: data });
    }

    const { data, error } = await supabase
      .from('partes')
      .select('id, codigo, nombre, descripcion, unidad, costo, stock_actual, stock_minimo, familia_id, familias(id, nombre, color)')
      .order('nombre');
    if (error) return response(500, { error: error.message });
    return response(200, { partes: data });
  }

  // POST — crear parte
  if (event.httpMethod === 'POST') {
    if (!canWrite) return response(403, { error: 'Sin permisos' });
    const { codigo, nombre, descripcion, unidad, costo, stock_actual, stock_minimo, familia_id } = JSON.parse(event.body || '{}');
    if (!codigo || !nombre) return response(400, { error: 'codigo y nombre son requeridos' });
    const { data, error } = await supabase
      .from('partes')
      .insert({ codigo, nombre, descripcion, unidad: unidad || 'unidad', costo: costo || 0, stock_actual: stock_actual || 0, stock_minimo: stock_minimo || 0, familia_id: familia_id || null })
      .select().single();
    if (error) return response(500, { error: error.message });
    return response(201, { parte: data });
  }

  // PUT — actualizar parte
  if (event.httpMethod === 'PUT') {
    if (!canWrite) return response(403, { error: 'Sin permisos' });
    const { id, ...fields } = JSON.parse(event.body || '{}');
    if (!id) return response(400, { error: 'id requerido' });
    const allowed = ['codigo','nombre','descripcion','unidad','costo','stock_actual','stock_minimo','familia_id'];
    const update = Object.fromEntries(Object.entries(fields).filter(([k]) => allowed.includes(k)));
    const { data, error } = await supabase.from('partes').update(update).eq('id', id).select().single();
    if (error) return response(500, { error: error.message });
    return response(200, { parte: data });
  }

  return response(405, { error: 'Método no permitido' });
}
