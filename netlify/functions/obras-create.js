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
  if (!user || !['superadmin', 'dueno', 'deposito'].includes(user.rol)) {
    return response(403, { error: 'Sin permisos para crear obras' });
  }

  const { modelo_id, cliente_id, fecha_inicio, direccion, notas } = JSON.parse(event.body || '{}');

  if (!modelo_id || !cliente_id) {
    return response(400, { error: 'modelo_id y cliente_id son requeridos' });
  }

  // Verificar que el modelo existe
  const { data: modelo } = await supabase
    .from('modelos')
    .select('id, nombre')
    .eq('id', modelo_id)
    .single();

  if (!modelo) return response(400, { error: 'Modelo no encontrado' });

  // Verificar que el cliente existe y tiene rol cliente
  const { data: cliente } = await supabase
    .from('users')
    .select('id, nombre, email')
    .eq('id', cliente_id)
    .eq('rol', 'cliente')
    .single();

  if (!cliente) return response(400, { error: 'Cliente no encontrado' });

  // Verificar que el modelo tiene etapas definidas
  const { data: etapas } = await supabase
    .from('etapas_template')
    .select('id')
    .eq('modelo_id', modelo_id);

  if (!etapas || etapas.length === 0) {
    return response(400, {
      error: `El modelo "${modelo.nombre}" no tiene etapas definidas. El Dueño debe configurarlas primero.`,
    });
  }

  // Crear obra (los triggers crean etapas_obra y checklist automáticamente)
  const { data: obra, error } = await supabase
    .from('obras')
    .insert({
      modelo_id,
      cliente_id,
      creado_por: user.id,
      fecha_inicio: fecha_inicio || null,
      direccion: direccion || null,
      notas: notas || null,
    })
    .select(`
      *,
      modelos(nombre, superficie),
      cliente:users!obras_cliente_id_fkey(nombre, email)
    `)
    .single();

  if (error) return response(500, { error: error.message });

  return response(201, { obra });
}
