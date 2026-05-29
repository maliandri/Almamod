import { response, corsHeaders } from './lib/supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return response(405, { error: 'Método no permitido' });

  let payload;
  try {
    ({ payload } = JSON.parse(event.body || '{}'));
  } catch (e) {
    return response(400, { error: `JSON inválido en el body: ${e.message}` });
  }

  // Prioridad: variable de entorno → no se expone al cliente
  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  if (!webhookUrl) return response(500, { error: 'MAKE_WEBHOOK_URL no configurado en Netlify' });

  try {
    const res = await fetch(webhookUrl, {
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
