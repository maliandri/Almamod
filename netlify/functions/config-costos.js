import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

// Config global de costeo (fila única id=1). Mismo patrón de auth que el módulo bom.
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });

  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno', 'deposito', 'fabricacion'].includes(user.rol))
    return response(403, { error: 'Sin permisos' });

  // GET — lectura para cualquier rol con acceso a bom
  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase
      .from('config_costos')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) return response(500, { error: error.message });
    return response(200, { config: data });
  }

  // PUT — solo dueño/superadmin
  if (event.httpMethod === 'PUT') {
    if (!['superadmin', 'dueno'].includes(user.rol)) return response(403, { error: 'Sin permisos' });
    const body = JSON.parse(event.body || '{}');
    const update = {};
    if (body.valor_hora     !== undefined) update.valor_hora     = Number(body.valor_hora)     || 0;
    if (body.pct_indirectos !== undefined) update.pct_indirectos = Number(body.pct_indirectos) || 0;
    if (body.pct_margen     !== undefined) update.pct_margen     = Number(body.pct_margen)     || 0;
    if (body.costo_m2_ref   !== undefined) update.costo_m2_ref   = Number(body.costo_m2_ref)   || 0;
    if (Object.keys(update).length === 0) return response(400, { error: 'nada para actualizar' });

    const { data, error } = await supabase
      .from('config_costos')
      .update(update)
      .eq('id', 1)
      .select().single();
    if (error) return response(500, { error: error.message });
    return response(200, { config: data });
  }

  return response(405, { error: 'Método no permitido' });
}
