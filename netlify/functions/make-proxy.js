import { response, corsHeaders } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return response(405, { error: 'Método no permitido' });

  const { webhook_url, payload } = JSON.parse(event.body || '{}');

  if (!webhook_url) return response(400, { error: 'webhook_url requerido' });

  // Solo permite dominios de Make
  const allowed = ['hook.eu1.make.com', 'hook.eu2.make.com', 'hook.us1.make.com', 'hook.make.com'];
  let urlHost;
  try {
    urlHost = new URL(webhook_url).hostname;
  } catch {
    return response(400, { error: 'URL inválida' });
  }
  if (!allowed.includes(urlHost)) return response(400, { error: 'URL no permitida' });

  try {
    const res = await fetch(webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    if (!res.ok) return response(502, { error: `Make respondió ${res.status}: ${text}` });
    return response(200, { ok: true });
  } catch (err) {
    return response(502, { error: `Error al contactar Make: ${err.message}` });
  }
}
