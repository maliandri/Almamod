import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return response(405, { error: 'Método no permitido' });
  }

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });

  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'deposito'].includes(user.rol)) {
    return response(403, { error: 'Solo Depósito puede crear remitos' });
  }

  const { obra_id, items, notas } = JSON.parse(event.body || '{}');

  if (!obra_id || !items || items.length === 0) {
    return response(400, { error: 'obra_id e items son requeridos' });
  }

  // Verificar obra activa
  const { data: obra } = await supabase
    .from('obras')
    .select('id, estado, numero_obra')
    .eq('id', obra_id)
    .single();

  if (!obra) return response(404, { error: 'Obra no encontrada' });
  if (obra.estado !== 'activa') {
    return response(400, { error: 'Solo se pueden crear remitos para obras activas' });
  }

  // Crear remito con token único para firma QR
  const token_firma = crypto.randomUUID();
  const { data: remito, error: remitoError } = await supabase
    .from('remitos')
    .insert({ obra_id, creado_por: user.id, notas: notas || null, token_firma })
    .select()
    .single();

  if (remitoError) return response(500, { error: remitoError.message });

  // Insertar ítems
  const itemsData = items.map(item => ({
    remito_id: remito.id,
    parte_id: item.parte_id,
    cantidad: item.cantidad,
  }));

  const { error: itemsError } = await supabase.from('remito_items').insert(itemsData);
  if (itemsError) return response(500, { error: itemsError.message });

  return response(201, { remito_id: remito.id, numero: remito.numero, token_firma: remito.token_firma });
}
