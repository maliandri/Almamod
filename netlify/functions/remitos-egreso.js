import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

// Remitos de entrega de insumos (egreso). Roles depósito+.
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });

  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno', 'deposito'].includes(user.rol))
    return response(403, { error: 'Sin permisos' });

  // GET ?id= (detalle con ítems) o lista de los últimos
  if (event.httpMethod === 'GET') {
    const { id } = event.queryStringParameters || {};
    if (id) {
      const { data: remito, error } = await supabase
        .from('remitos_egreso').select('*').eq('id', id).single();
      if (error) return response(500, { error: error.message });
      const { data: items, error: e2 } = await supabase
        .from('remito_egreso_items')
        .select('id, cantidad, partes(id, codigo, nombre, unidad)')
        .eq('remito_id', id);
      if (e2) return response(500, { error: e2.message });
      return response(200, { remito, items: items || [] });
    }
    const { data, error } = await supabase
      .from('remitos_egreso')
      .select('id, numero, destino, estado, recibido_por, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) return response(500, { error: error.message });
    return response(200, { remitos: data || [] });
  }

  // POST — crear remito + ítems
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const { destino, notas, recibido_por, estado, items } = body;
    if (!Array.isArray(items) || items.length === 0) return response(400, { error: 'El remito no tiene ítems' });

    const { data: maxRow } = await supabase
      .from('remitos_egreso').select('numero').order('numero', { ascending: false }).limit(1).maybeSingle();
    const numero = (maxRow?.numero || 0) + 1;

    const est = estado === 'emitido' ? 'emitido' : 'borrador';
    const { data: remito, error } = await supabase
      .from('remitos_egreso')
      .insert({
        numero,
        destino: destino || null,
        notas: notas || null,
        recibido_por: recibido_por || null,
        estado: est,
        creado_por: user.id,
        emitido_at: est === 'emitido' ? new Date().toISOString() : null,
      })
      .select().single();
    if (error) return response(500, { error: error.message });

    const rows = items
      .filter(i => i.parte_id)
      .map(i => ({ remito_id: remito.id, parte_id: i.parte_id, cantidad: Number(i.cantidad) || 1 }));
    if (rows.length) {
      const { error: e2 } = await supabase.from('remito_egreso_items').insert(rows);
      if (e2) return response(500, { error: e2.message });
    }
    return response(201, { remito });
  }

  return response(405, { error: 'Método no permitido' });
}
