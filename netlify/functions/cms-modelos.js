import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });
  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno'].includes(user.rol))
    return response(403, { error: 'Sin permisos' });

  // GET — todos los modelos con campos CMS
  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase
      .from('modelos')
      .select('id, slug, nombre, superficie, precio, descripcion, plazo, ventajas, fotos, imagen_portada, orden, activo')
      .order('orden');
    if (error) return response(500, { error: error.message });
    return response(200, { modelos: data || [] });
  }

  // PUT — actualizar modelo
  if (event.httpMethod === 'PUT') {
    const body = JSON.parse(event.body || '{}');
    const { id } = body;
    if (!id) return response(400, { error: 'id requerido' });
    const allowed = ['precio', 'descripcion', 'plazo', 'ventajas', 'fotos', 'imagen_portada', 'activo'];
    const update = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
    const { data, error } = await supabase.from('modelos').update(update).eq('id', id).select().single();
    if (error) return response(500, { error: error.message });
    return response(200, { modelo: data });
  }

  return response(405, { error: 'Método no permitido' });
}
