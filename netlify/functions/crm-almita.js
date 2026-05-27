import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });

  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno'].includes(user.rol))
    return response(403, { error: 'Sin permisos' });

  if (event.httpMethod === 'GET') {
    const { producto, contacto, dias, q } = event.queryStringParameters || {};

    let query = supabase
      .from('conversaciones')
      .select('id, session_id, nombre, email, telefono, producto_interes, mensajes, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(200);

    if (producto) query = query.eq('producto_interes', producto);

    if (contacto === 'si') {
      query = query.or('email.not.is.null,telefono.not.is.null');
    } else if (contacto === 'no') {
      query = query.is('email', null).is('telefono', null);
    }

    if (dias) {
      const desde = new Date();
      desde.setDate(desde.getDate() - parseInt(dias, 10));
      query = query.gte('created_at', desde.toISOString());
    }

    const { data, error } = await query;
    if (error) return response(500, { error: error.message });

    // Filtro por nombre/email en memoria (búsqueda de texto simple)
    let conversaciones = data || [];
    if (q) {
      const lower = q.toLowerCase();
      conversaciones = conversaciones.filter(c =>
        c.nombre?.toLowerCase().includes(lower) ||
        c.email?.toLowerCase().includes(lower) ||
        c.telefono?.includes(q)
      );
    }

    const total = conversaciones.length;
    const conContacto = conversaciones.filter(c => c.email || c.telefono).length;
    const hoy = new Date().toISOString().slice(0, 10);
    const deHoy = conversaciones.filter(c => c.updated_at?.slice(0, 10) === hoy).length;

    return response(200, { conversaciones, stats: { total, conContacto, deHoy } });
  }

  // DELETE — eliminar conversación individual
  if (event.httpMethod === 'DELETE') {
    const { id } = event.queryStringParameters || {};
    if (!id) return response(400, { error: 'id requerido' });
    const { error } = await supabase.from('conversaciones').delete().eq('id', id);
    if (error) return response(500, { error: error.message });
    return response(200, { ok: true });
  }

  return response(405, { error: 'Método no permitido' });
}
