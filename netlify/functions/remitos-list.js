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
  if (!user || !['superadmin', 'dueno', 'deposito', 'fabricacion'].includes(user.rol)) {
    return response(403, { error: 'Sin permisos' });
  }

  const obra_id = event.queryStringParameters?.obra_id;
  if (!obra_id) return response(400, { error: 'obra_id requerido' });

  const { data: remitos, error } = await supabase
    .from('remitos')
    .select(`
      id,
      numero,
      estado,
      notas,
      created_at,
      fecha_firma,
      creador:users!remitos_creado_por_fkey(nombre),
      firmado_por_user:users!remitos_firmado_por_fkey(nombre),
      remito_items(
        id,
        cantidad,
        partes(codigo, nombre, unidad)
      )
    `)
    .eq('obra_id', obra_id)
    .order('created_at', { ascending: false });

  if (error) return response(500, { error: error.message });
  return response(200, { remitos });
}
