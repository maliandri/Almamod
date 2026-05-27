import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });
  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno', 'deposito'].includes(user.rol))
    return response(403, { error: 'Sin permisos' });

  const canApprove = ['superadmin', 'dueno'].includes(user.rol);

  // GET — lista o detalle con ítems
  if (event.httpMethod === 'GET') {
    const { id } = event.queryStringParameters || {};
    if (id) {
      const { data, error } = await supabase
        .from('pic')
        .select('*, pic_items(*, partes(id, codigo, nombre, unidad, stock_actual))')
        .eq('id', id).single();
      if (error) return response(500, { error: error.message });
      return response(200, { pic: data });
    }
    const { data, error } = await supabase
      .from('pic')
      .select('*, pic_items(id)')
      .order('created_at', { ascending: false });
    if (error) return response(500, { error: error.message });
    return response(200, { pics: data || [] });
  }

  // POST — crear PIC con ítems
  if (event.httpMethod === 'POST') {
    const { items, notas } = JSON.parse(event.body || '{}');
    if (!items?.length) return response(400, { error: 'Se requiere al menos un ítem' });

    const { data: pic, error: picError } = await supabase
      .from('pic')
      .insert({ notas: notas || null, creado_por: user.id })
      .select().single();
    if (picError) return response(500, { error: picError.message });

    const rows = items.map(i => ({
      pic_id: pic.id,
      parte_id: i.parte_id || null,
      descripcion: i.descripcion || null,
      cantidad: Number(i.cantidad) || 1,
      notas: i.notas || null,
    }));
    const { error: itemsError } = await supabase.from('pic_items').insert(rows);
    if (itemsError) return response(500, { error: itemsError.message });

    return response(201, { pic });
  }

  // PUT — cambiar estado (aprobar, comprado, cancelado)
  if (event.httpMethod === 'PUT') {
    const { id, estado, notas } = JSON.parse(event.body || '{}');
    if (!id) return response(400, { error: 'id requerido' });

    const update = {};
    if (notas !== undefined) update.notas = notas;

    if (estado === 'aprobado') {
      if (!canApprove) return response(403, { error: 'Solo el dueño puede aprobar' });
      update.estado = 'aprobado';
      update.aprobado_por = user.id;
      update.fecha_aprobacion = new Date().toISOString();
    } else if (estado === 'comprado' || estado === 'cancelado') {
      update.estado = estado;
    }

    const { data, error } = await supabase.from('pic').update(update).eq('id', id).select().single();
    if (error) return response(500, { error: error.message });
    return response(200, { pic: data });
  }

  // DELETE
  if (event.httpMethod === 'DELETE') {
    const { id } = event.queryStringParameters || {};
    if (!id) return response(400, { error: 'id requerido' });
    const { error } = await supabase.from('pic').delete().eq('id', id);
    if (error) return response(500, { error: error.message });
    return response(200, { ok: true });
  }

  return response(405, { error: 'Método no permitido' });
}
