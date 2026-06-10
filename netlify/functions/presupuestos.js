import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });
  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno'].includes(user.rol))
    return response(403, { error: 'Sin permisos' });

  // GET ?id=xxx — detalle con items | GET — lista
  if (event.httpMethod === 'GET') {
    const { id } = event.queryStringParameters || {};

    if (id) {
      const { data: presupuesto, error } = await supabase
        .from('presupuestos')
        .select('*, modelos(id, nombre, slug)')
        .eq('id', id)
        .single();
      if (error) return response(500, { error: error.message });

      const { data: items, error: itemsError } = await supabase
        .from('presupuesto_items')
        .select('*, partes(id, codigo, nombre, unidad)')
        .eq('presupuesto_id', id)
        .order('orden', { ascending: true });
      if (itemsError) return response(500, { error: itemsError.message });

      return response(200, { presupuesto: { ...presupuesto, items: items || [] } });
    }

    const { data, error } = await supabase
      .from('presupuestos')
      .select('id, numero, modelo_id, modelo_nombre, cliente_nombre, margen_pct, costo_total, precio_total, estado, created_at, modelos(nombre)')
      .order('created_at', { ascending: false });
    if (error) return response(500, { error: error.message });
    return response(200, { presupuestos: data });
  }

  // POST — crear presupuesto + items
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const { modelo_id, modelo_nombre, modelo_descripcion, cliente_nombre, cliente_contacto, cliente_direccion,
      margen_pct, costo_total, precio_total, notas, estado, items } = body;

    if (!modelo_nombre) return response(400, { error: 'modelo_nombre requerido' });

    const { data: presupuesto, error } = await supabase
      .from('presupuestos')
      .insert({
        modelo_id: modelo_id || null,
        modelo_nombre,
        modelo_descripcion: modelo_descripcion || null,
        cliente_nombre: cliente_nombre || null,
        cliente_contacto: cliente_contacto || null,
        cliente_direccion: cliente_direccion || null,
        margen_pct: margen_pct ?? 30,
        costo_total: costo_total ?? 0,
        precio_total: precio_total ?? 0,
        notas: notas || null,
        estado: estado || 'borrador',
        creado_por: user.id,
      })
      .select().single();
    if (error) return response(500, { error: error.message });

    if (Array.isArray(items) && items.length) {
      const rows = items.map((it, idx) => ({
        presupuesto_id: presupuesto.id,
        parte_id: it.parte_id || null,
        descripcion: it.descripcion,
        unidad: it.unidad || null,
        cantidad: it.cantidad ?? 1,
        costo_unitario: it.costo_unitario ?? 0,
        orden: it.orden ?? idx,
      }));
      const { error: itemsError } = await supabase.from('presupuesto_items').insert(rows);
      if (itemsError) return response(500, { error: itemsError.message });
    }

    return response(201, { presupuesto });
  }

  // PUT — actualizar cabecera + reemplazar items
  if (event.httpMethod === 'PUT') {
    const body = JSON.parse(event.body || '{}');
    const { id, items, ...fields } = body;
    if (!id) return response(400, { error: 'id requerido' });

    const allowed = ['modelo_id', 'modelo_nombre', 'modelo_descripcion', 'cliente_nombre', 'cliente_contacto',
      'cliente_direccion', 'margen_pct', 'costo_total', 'precio_total', 'notas', 'estado'];
    const update = Object.fromEntries(Object.entries(fields).filter(([k]) => allowed.includes(k)));

    const { data: presupuesto, error } = await supabase
      .from('presupuestos')
      .update(update)
      .eq('id', id)
      .select().single();
    if (error) return response(500, { error: error.message });

    if (Array.isArray(items)) {
      const { error: delError } = await supabase.from('presupuesto_items').delete().eq('presupuesto_id', id);
      if (delError) return response(500, { error: delError.message });

      if (items.length) {
        const rows = items.map((it, idx) => ({
          presupuesto_id: id,
          parte_id: it.parte_id || null,
          descripcion: it.descripcion,
          unidad: it.unidad || null,
          cantidad: it.cantidad ?? 1,
          costo_unitario: it.costo_unitario ?? 0,
          orden: it.orden ?? idx,
        }));
        const { error: itemsError } = await supabase.from('presupuesto_items').insert(rows);
        if (itemsError) return response(500, { error: itemsError.message });
      }
    }

    return response(200, { presupuesto });
  }

  // DELETE ?id=xxx
  if (event.httpMethod === 'DELETE') {
    const { id } = event.queryStringParameters || {};
    if (!id) return response(400, { error: 'id requerido' });
    const { error } = await supabase.from('presupuestos').delete().eq('id', id);
    if (error) return response(500, { error: error.message });
    return response(200, { ok: true });
  }

  return response(405, { error: 'Método no permitido' });
}
