import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

export function response(statusCode, body) {
  return {
    statusCode,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export function getUserFromToken(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.replace('Bearer ', '');
}

function getTokenIat(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return payload.iat; // segundos desde epoch
  } catch { return null; }
}

export async function getAuthUser(token) {
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();
  if (!profile) return null;
  // Si el admin cerró la sesión, rechazar tokens emitidos antes del corte
  if (profile.session_invalidated_at) {
    const iat = getTokenIat(token);
    const corte = Math.floor(new Date(profile.session_invalidated_at).getTime() / 1000);
    if (iat && iat < corte) return null;
  }
  return profile;
}
