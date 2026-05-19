import { supabase, response, corsHeaders } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return response(405, { error: 'Método no permitido' });
  }

  const token = event.queryStringParameters?.token;
  if (!token) return response(400, { error: 'token requerido' });

  const { data: inv } = await supabase
    .from('invitaciones')
    .select('email, rol')
    .eq('token', token)
    .is('usado_en', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (!inv) return response(400, { error: 'Invitación inválida o expirada' });

  return response(200, { email: inv.email, rol: inv.rol });
}
