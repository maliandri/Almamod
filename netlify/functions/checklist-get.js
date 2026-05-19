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
  if (!obra_id) return response(400, { error: 'obra_id es requerido' });

  const { data: checklist, error } = await supabase
    .from('obra_checklist')
    .select(`
      id,
      cantidad_requerida,
      cantidad_entregada,
      completado,
      updated_at,
      partes(id, codigo, nombre, unidad, descripcion)
    `)
    .eq('obra_id', obra_id)
    .order('completado', { ascending: true });

  if (error) return response(500, { error: error.message });

  const total = checklist.length;
  const completados = checklist.filter(c => c.completado).length;

  return response(200, {
    checklist,
    resumen: { total, completados, pendientes: total - completados },
  });
}
