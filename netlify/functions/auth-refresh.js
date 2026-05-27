import { supabase, response, corsHeaders } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return response(405, { error: 'Método no permitido' });

  const { refresh_token } = JSON.parse(event.body || '{}');
  if (!refresh_token) return response(400, { error: 'refresh_token requerido' });

  const { data, error } = await supabase.auth.refreshSession({ refresh_token });
  if (error || !data.session) return response(401, { error: 'Sesión inválida o expirada' });

  const { data: profile } = await supabase
    .from('users')
    .select('id, nombre, email, rol, activo')
    .eq('id', data.user.id)
    .single();

  if (!profile?.activo) return response(403, { error: 'Usuario inactivo' });

  return response(200, {
    token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    user: profile,
  });
}
