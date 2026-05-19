import { supabase, response, corsHeaders } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return response(405, { error: 'Método no permitido' });
  }

  const { token, nombre, email, password, telefono, dni, direccion } = JSON.parse(event.body || '{}');

  if (!token || !nombre || !email || !password) {
    return response(400, { error: 'Token, nombre, email y contraseña son requeridos' });
  }

  // Validar invitación
  const { data: invitacion, error: invError } = await supabase
    .from('invitaciones')
    .select('*')
    .eq('token', token)
    .is('usado_en', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (invError || !invitacion) {
    return response(400, { error: 'Token inválido o expirado' });
  }

  if (invitacion.email !== email) {
    return response(400, { error: 'El email no coincide con la invitación' });
  }

  // Crear usuario en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) return response(500, { error: authError.message });

  // Crear perfil en tabla users
  const { error: profileError } = await supabase.from('users').insert({
    id: authData.user.id,
    email,
    rol: invitacion.rol,
    nombre,
    telefono: telefono || null,
    dni: dni || null,
    direccion: direccion || null,
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    return response(500, { error: profileError.message });
  }

  // Marcar invitación como usada
  await supabase
    .from('invitaciones')
    .update({ usado_en: new Date().toISOString() })
    .eq('id', invitacion.id);

  return response(201, {
    message: 'Usuario registrado correctamente',
    rol: invitacion.rol,
  });
}
