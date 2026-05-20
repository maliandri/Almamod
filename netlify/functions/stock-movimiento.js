import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });

  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno', 'deposito'].includes(user.rol))
    return response(403, { error: 'Sin permisos' });

  // GET ?parte_id=xxx — historial de movimientos
  if (event.httpMethod === 'GET') {
    const { parte_id } = event.queryStringParameters || {};
    if (!parte_id) return response(400, { error: 'parte_id requerido' });
    const { data, error } = await supabase
      .from('stock_movimientos')
      .select('id, tipo, cantidad, notas, documento_url, created_at, creado_por:users!stock_movimientos_creado_por_fkey(nombre)')
      .eq('parte_id', parte_id)
      .order('created_at', { ascending: false });
    if (error) return response(500, { error: error.message });
    return response(200, { movimientos: data });
  }

  // POST — registrar movimiento y actualizar stock
  if (event.httpMethod === 'POST') {
    const { parte_id, tipo, cantidad, notas, documento_url } = JSON.parse(event.body || '{}');
    if (!parte_id || !tipo || !cantidad) return response(400, { error: 'parte_id, tipo y cantidad requeridos' });
    if (!['ingreso', 'egreso', 'ajuste'].includes(tipo)) return response(400, { error: 'tipo inválido' });

    // Insertar movimiento
    const { error: errMov } = await supabase.from('stock_movimientos').insert({
      parte_id, tipo, cantidad, notas, documento_url, creado_por: user.id,
    });
    if (errMov) return response(500, { error: errMov.message });

    // Actualizar stock_actual
    const { data: parte } = await supabase.from('partes').select('stock_actual').eq('id', parte_id).single();
    const stockActual = Number(parte?.stock_actual || 0);
    let nuevoStock;
    if (tipo === 'ingreso')  nuevoStock = stockActual + Number(cantidad);
    if (tipo === 'egreso')   nuevoStock = Math.max(0, stockActual - Number(cantidad));
    if (tipo === 'ajuste')   nuevoStock = Number(cantidad);

    const { data: updated, error: errUpd } = await supabase
      .from('partes').update({ stock_actual: nuevoStock }).eq('id', parte_id).select().single();
    if (errUpd) return response(500, { error: errUpd.message });

    return response(200, { ok: true, stock_actual: updated.stock_actual });
  }

  return response(405, { error: 'Método no permitido' });
}
