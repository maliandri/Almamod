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
  if (!user || !['superadmin', 'dueno', 'deposito'].includes(user.rol)) {
    return response(403, { error: 'Sin permisos' });
  }

  const rol = event.queryStringParameters?.rol;

  let query = supabase
    .from('users')
    .select('id, nombre, email, telefono, rol, activo')
    .eq('activo', true)
    .order('nombre');

  if (rol) query = query.eq('rol', rol);

  const { data: users, error } = await query;
  if (error) return response(500, { error: error.message });
  return response(200, { users });
}
