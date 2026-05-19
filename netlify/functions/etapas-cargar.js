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
  if (!user || !['superadmin', 'fabricacion'].includes(user.rol)) {
    return response(403, { error: 'Solo Fabricación puede cargar avances' });
  }

  const { etapa_obra_id, descripcion, fotos } = JSON.parse(event.body || '{}');

  if (!etapa_obra_id || !descripcion) {
    return response(400, { error: 'etapa_obra_id y descripcion son requeridos' });
  }

  // Verificar que la etapa existe y está pendiente
  const { data: etapa } = await supabase
    .from('etapas_obra')
    .select('*, obras(cliente_id)')
    .eq('id', etapa_obra_id)
    .single();

  if (!etapa) return response(404, { error: 'Etapa no encontrada' });
  if (etapa.estado === 'firmada') {
    return response(400, { error: 'Esta etapa ya fue firmada y no se puede modificar' });
  }

  // Verificar orden: la etapa anterior debe estar firmada (excepto la primera)
  if (etapa.numero > 1) {
    const { data: anterior } = await supabase
      .from('etapas_obra')
      .select('estado')
      .eq('obra_id', etapa.obra_id)
      .eq('numero', etapa.numero - 1)
      .single();

    if (anterior?.estado !== 'firmada') {
      return response(400, { error: `Debés completar la etapa ${etapa.numero - 1} antes de cargar esta` });
    }
  }

  // Crear registro del avance
  const { data: registro, error: regError } = await supabase
    .from('etapa_registros')
    .insert({ etapa_obra_id, cargada_por: user.id, descripcion })
    .select()
    .single();

  if (regError) return response(500, { error: regError.message });

  // Guardar fotos si las hay
  if (fotos && fotos.length > 0) {
    const fotosData = fotos.map(url => ({ etapa_registro_id: registro.id, url }));
    await supabase.from('etapa_fotos').insert(fotosData);
  }

  // Actualizar estado de la etapa a 'cargada'
  await supabase
    .from('etapas_obra')
    .update({ estado: 'cargada', fecha_carga: new Date().toISOString() })
    .eq('id', etapa_obra_id);

  return response(201, { message: 'Avance cargado correctamente', registro_id: registro.id });
}
