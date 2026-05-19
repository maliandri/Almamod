import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });

  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno', 'deposito', 'fabricacion'].includes(user.rol)) {
    return response(403, { error: 'Sin permisos' });
  }

  // GET - listar partes (con filtro opcional por modelo)
  if (event.httpMethod === 'GET') {
    const modelo_id = event.queryStringParameters?.modelo_id;

    if (modelo_id) {
      const { data, error } = await supabase
        .from('modelo_partes')
        .select(`
          id, cantidad, especificacion, notas,
          partes(id, codigo, nombre, descripcion, unidad)
        `)
        .eq('modelo_id', modelo_id)
        .order('partes(nombre)');

      if (error) return response(500, { error: error.message });
      return response(200, { partes: data });
    }

    const { data, error } = await supabase
      .from('partes')
      .select('*')
      .order('nombre');

    if (error) return response(500, { error: error.message });
    return response(200, { partes: data });
  }

  // POST - crear nueva parte (solo superadmin/dueno/deposito)
  if (event.httpMethod === 'POST') {
    if (!['superadmin', 'dueno', 'deposito'].includes(user.rol)) {
      return response(403, { error: 'Sin permisos para crear partes' });
    }

    const { codigo, nombre, descripcion, unidad } = JSON.parse(event.body || '{}');
    if (!codigo || !nombre) return response(400, { error: 'codigo y nombre son requeridos' });

    const { data, error } = await supabase
      .from('partes')
      .insert({ codigo, nombre, descripcion, unidad: unidad || 'unidad' })
      .select()
      .single();

    if (error) return response(500, { error: error.message });
    return response(201, { parte: data });
  }

  return response(405, { error: 'Método no permitido' });
}
