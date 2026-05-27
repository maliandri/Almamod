import { supabase, response, corsHeaders } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };

  const token = event.queryStringParameters?.token;
  if (!token) return response(400, { error: 'token requerido' });

  if (event.httpMethod === 'GET') {
    const { data: remito, error } = await supabase
      .from('remitos')
      .select(`
        id, numero, estado, notas, created_at,
        obras(numero_obra, modelos(nombre)),
        remito_items(cantidad, partes(nombre, unidad, codigo))
      `)
      .eq('token_firma', token)
      .single();

    if (error || !remito) return response(404, { error: 'Remito no encontrado' });
    return response(200, { remito });
  }

  if (event.httpMethod === 'POST') {
    const { nombre, dni, firma_imagen } = JSON.parse(event.body || '{}');
    if (!nombre || !dni) return response(400, { error: 'Nombre y DNI son requeridos' });

    const { data: remito } = await supabase
      .from('remitos')
      .select('id, estado')
      .eq('token_firma', token)
      .single();

    if (!remito) return response(404, { error: 'Remito no encontrado' });
    if (remito.estado !== 'pendiente') return response(400, { error: 'Este remito ya fue firmado' });

    const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || '';

    const { error } = await supabase
      .from('remitos')
      .update({
        estado: 'firmado',
        fecha_firma: new Date().toISOString(),
        firmado_nombre: nombre,
        firmado_dni: dni,
        firma_imagen: firma_imagen || null,
        firmado_ip: ip,
      })
      .eq('id', remito.id);

    if (error) return response(500, { error: error.message });
    return response(200, { ok: true });
  }

  return response(405, { error: 'Método no permitido' });
}
