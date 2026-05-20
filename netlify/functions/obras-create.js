import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return response(405, { error: 'Método no permitido' });

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });

  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno', 'deposito'].includes(user.rol))
    return response(403, { error: 'Sin permisos para crear obras' });

  const { modelo_id, nombre_contacto, fecha_inicio, direccion, notas } = JSON.parse(event.body || '{}');

  if (!modelo_id) return response(400, { error: 'modelo_id es requerido' });

  const { data: modelo } = await supabase.from('modelos').select('id, nombre').eq('id', modelo_id).single();
  if (!modelo) return response(400, { error: 'Modelo no encontrado' });

  const { data: obra, error } = await supabase
    .from('obras')
    .insert({
      modelo_id,
      nombre_contacto: nombre_contacto || null,
      creado_por: user.id,
      fecha_inicio: fecha_inicio || null,
      direccion: direccion || null,
      notas: notas || null,
    })
    .select('*, modelos(nombre, superficie)')
    .single();

  if (error) return response(500, { error: error.message });
  return response(201, { obra });
}
