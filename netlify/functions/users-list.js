import { supabase, response, corsHeaders, getUserFromToken, getAuthUser } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });

  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno'].includes(user.rol))
    return response(403, { error: 'Sin permisos' });

  // GET — listar usuarios
  if (event.httpMethod === 'GET') {
    const rol = event.queryStringParameters?.rol;
    let query = supabase
      .from('users')
      .select('id, nombre, email, telefono, rol, activo')
      .eq('activo', true)
      .order('nombre');
    if (rol) query = query.eq('rol', rol);
    const { data: users, error } = await query;
    if (error) return response(500, { error: error.message });
    return response(200, { users });
  }

  // PUT — editar usuario
  if (event.httpMethod === 'PUT') {
    const { id, nombre, rol, telefono, activo } = JSON.parse(event.body || '{}');
    if (!id) return response(400, { error: 'id requerido' });
    if (id === user.id) return response(400, { error: 'No podés editarte a vos mismo' });

    const allowed = ['dueno', 'deposito', 'fabricacion', 'marketing', 'arquitectura', 'cliente'];
    const update = {};
    if (nombre !== undefined) update.nombre = nombre;
    if (telefono !== undefined) update.telefono = telefono;
    if (activo !== undefined) update.activo = activo;
    if (rol !== undefined) {
      if (!allowed.includes(rol)) return response(400, { error: 'Rol inválido' });
      update.rol = rol;
    }

    const { data, error } = await supabase.from('users').update(update).eq('id', id).select().single();
    if (error) return response(500, { error: error.message });
    return response(200, { user: data });
  }

  // DELETE — desactivar usuario (soft delete)
  if (event.httpMethod === 'DELETE') {
    const { id } = event.queryStringParameters || {};
    if (!id) return response(400, { error: 'id requerido' });
    if (id === user.id) return response(400, { error: 'No podés eliminarte a vos mismo' });

    const { error } = await supabase.from('users').update({ activo: false }).eq('id', id);
    if (error) return response(500, { error: error.message });
    return response(200, { ok: true });
  }

  return response(405, { error: 'Método no permitido' });
}
