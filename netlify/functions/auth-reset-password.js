import { supabase, response, corsHeaders } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return response(405, { error: 'Método no permitido' });

  const { access_token, password } = JSON.parse(event.body || '{}');
  if (!access_token || !password) return response(400, { error: 'Faltan datos' });
  if (password.length < 8) return response(400, { error: 'La contraseña debe tener al menos 8 caracteres' });

  // Validar el token de recuperación
  const { data: { user }, error: userError } = await supabase.auth.getUser(access_token);
  if (userError || !user) return response(401, { error: 'El link expiró o es inválido. Solicitá uno nuevo.' });

  // Actualizar contraseña
  const { error } = await supabase.auth.admin.updateUserById(user.id, { password });
  if (error) return response(500, { error: error.message });

  return response(200, { ok: true });
}
