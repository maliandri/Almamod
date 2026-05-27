import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });
  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno', 'deposito'].includes(user.rol))
    return response(403, { error: 'Sin permisos' });

  // GET — lista, detalle, o items de una etapa BOM
  if (event.httpMethod === 'GET') {
    const { id, action, etapa_id, modelo_id } = event.queryStringParameters || {};

    // Cargar componentes de una etapa BOM para pre-popular el REI
    if (action === 'items_from_etapa') {
      if (!etapa_id || !modelo_id) return response(400, { error: 'etapa_id y modelo_id requeridos' });
      const { data, error } = await supabase
        .from('modelo_partes')
        .select('parte_id, cantidad_necesaria, partes(id, codigo, nombre, unidad, stock_actual)')
        .eq('modelo_id', modelo_id)
        .eq('etapa_produccion_id', etapa_id);
      if (error) return response(500, { error: error.message });
      return response(200, { items: data || [] });
    }

    if (id) {
      const { data, error } = await supabase
        .from('rei')
        .select('*, rei_items(*, partes(id, codigo, nombre, unidad, stock_actual)), ot(id, numero, titulo)')
        .eq('id', id).single();
      if (error) return response(500, { error: error.message });
      return response(200, { rei: data });
    }

    const { data, error } = await supabase
      .from('rei')
      .select('*, rei_items(id), ot(numero, titulo)')
      .order('created_at', { ascending: false });
    if (error) return response(500, { error: error.message });
    return response(200, { reis: data || [] });
  }

  // POST — crear REI con ítems
  if (event.httpMethod === 'POST') {
    const { items, notas, ot_id, etapa_produccion_id } = JSON.parse(event.body || '{}');
    if (!items?.length) return response(400, { error: 'Se requiere al menos un ítem' });

    const { data: rei, error: reiError } = await supabase
      .from('rei')
      .insert({
        notas:               notas               || null,
        ot_id:               ot_id               || null,
        etapa_produccion_id: etapa_produccion_id || null,
        creado_por:          user.id,
      })
      .select().single();
    if (reiError) return response(500, { error: reiError.message });

    const rows = items.map(i => ({
      rei_id:   rei.id,
      parte_id: i.parte_id,
      cantidad: Number(i.cantidad) || 1,
      notas:    i.notas || null,
    }));
    const { error: itemsError } = await supabase.from('rei_items').insert(rows);
    if (itemsError) return response(500, { error: itemsError.message });

    return response(201, { rei });
  }

  // PUT — actualizar notas / entregar (descuenta stock)
  if (event.httpMethod === 'PUT') {
    const body = JSON.parse(event.body || '{}');
    const { id } = body;
    if (!id) return response(400, { error: 'id requerido' });

    // Acción entregar: marca como entregado y descuenta stock
    if (body.estado === 'entregado') {
      const { data: reiData, error: fetchError } = await supabase
        .from('rei')
        .select('estado, rei_items(parte_id, cantidad)')
        .eq('id', id).single();
      if (fetchError) return response(500, { error: fetchError.message });
      if (reiData.estado === 'entregado') return response(400, { error: 'Ya fue entregado' });

      const { error: updateError } = await supabase
        .from('rei')
        .update({ estado: 'entregado', entregado_en: new Date().toISOString() })
        .eq('id', id);
      if (updateError) return response(500, { error: updateError.message });

      // Descontar stock de cada ítem
      for (const item of (reiData.rei_items || [])) {
        const { data: parte } = await supabase
          .from('partes').select('stock_actual').eq('id', item.parte_id).single();
        if (parte !== null) {
          await supabase.from('partes')
            .update({ stock_actual: Math.max(0, (parte.stock_actual || 0) - Number(item.cantidad)) })
            .eq('id', item.parte_id);
        }
      }
      return response(200, { ok: true });
    }

    const allowed = ['notas', 'ot_id', 'etapa_produccion_id'];
    const update = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
    const { data, error } = await supabase.from('rei').update(update).eq('id', id).select().single();
    if (error) return response(500, { error: error.message });
    return response(200, { rei: data });
  }

  // DELETE
  if (event.httpMethod === 'DELETE') {
    const { id } = event.queryStringParameters || {};
    if (!id) return response(400, { error: 'id requerido' });
    const { error } = await supabase.from('rei').delete().eq('id', id);
    if (error) return response(500, { error: error.message });
    return response(200, { ok: true });
  }

  return response(405, { error: 'Método no permitido' });
}
