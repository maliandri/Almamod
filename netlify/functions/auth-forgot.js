import { supabase, response, corsHeaders } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return response(405, { error: 'Método no permitido' });

  const { email } = JSON.parse(event.body || '{}');
  if (!email) return response(400, { error: 'Email requerido' });

  // Siempre responde OK para no revelar si el email existe
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://almamod.com.ar/app/reset-password',
  });

  return response(200, { ok: true });
}
