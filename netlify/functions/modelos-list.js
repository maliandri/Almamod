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

  // Lee de modelos (tabla unificada) — todos, publicados o no
  const { data: modelos, error } = await supabase
    .from('modelos')
    .select('id, nombre, superficie, precio, descripcion, ventajas, plazo, activo')
    .order('orden')
    .order('nombre');

  if (error) return response(500, { error: error.message });
  return response(200, { modelos });
}
