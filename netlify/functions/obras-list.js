import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return response(405, { error: 'Método no permitido' });
  }

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });

  const user = await getAuthUser(token);
  if (!user) return response(401, { error: 'Usuario no encontrado' });

  let query = supabase
    .from('obras')
    .select(`
      id,
      numero_obra,
      estado,
      fecha_inicio,
      direccion,
      created_at,
      modelos(id, nombre, superficie, slug),
      cliente:users!obras_cliente_id_fkey(id, nombre, email, telefono),
      creador:users!obras_creado_por_fkey(id, nombre),
      etapas_obra(id, numero, nombre, estado)
    `)
    .order('created_at', { ascending: false });

  // Clientes solo ven sus propias obras
  if (user.rol === 'cliente') {
    query = query.eq('cliente_id', user.id);
  }

  const { data: obras, error } = await query;

  if (error) return response(500, { error: error.message });

  return response(200, { obras });
}
