import { supabase, response, corsHeaders } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return response(405, { error: 'Método no permitido' });
  }

  const { email, password } = JSON.parse(event.body || '{}');

  if (!email || !password) {
    return response(400, { error: 'Email y contraseña son requeridos' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return response(401, { error: 'Email o contraseña incorrectos' });

  const { data: profile } = await supabase
    .from('users')
    .select('id, nombre, email, rol, activo, permisos')
    .eq('id', data.user.id)
    .single();

  if (!profile?.activo) {
    return response(403, { error: 'Usuario inactivo. Contactá al administrador.' });
  }

  return response(200, {
    token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    user: profile,
  });
}
