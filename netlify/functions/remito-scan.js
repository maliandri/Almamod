import { getUserFromToken, getAuthUser, response, corsHeaders } from './lib/supabase.js';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return response(405, { error: 'Método no permitido' });

  const token = getUserFromToken(event.headers.authorization);
  if (!token) return response(401, { error: 'No autorizado' });

  const user = await getAuthUser(token);
  if (!user || !['superadmin', 'dueno', 'deposito'].includes(user.rol)) {
    return response(403, { error: 'Sin permisos' });
  }

  const apiKey = process.env.GEMINI_API_KEY_SECRET;
  if (!apiKey) return response(500, { error: 'API key no configurada' });

  const { imagen_base64, mime_type } = JSON.parse(event.body || '{}');
  if (!imagen_base64) return response(400, { error: 'imagen_base64 requerida' });

  const prompt = `Analizá esta imagen de un remito, nota de entrega o factura de proveedor.
Extraé todos los ítems/productos listados con sus cantidades y unidades de medida.

Devolvé EXACTAMENTE este JSON (sin markdown, sin texto extra):
{
  "proveedor": "nombre del proveedor si está visible, sino null",
  "fecha": "fecha en formato YYYY-MM-DD si está visible, sino null",
  "numero_doc": "número de remito o factura si está visible, sino null",
  "items": [
    {
      "descripcion": "descripción del ítem tal como aparece en el documento",
      "cantidad": 1.0,
      "unidad": "unidad de medida (ml, kg, u, m, m2, m3, gl, etc.)",
      "codigo": "código del artículo si está visible, sino null"
    }
  ]
}`;

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mime_type || 'image/jpeg', data: imagen_base64 } },
          ],
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return response(502, { error: data.error?.message || 'Error de Gemini' });
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!raw) {
      const razon = data.promptFeedback?.blockReason || 'Sin respuesta';
      return response(502, { error: `Gemini no pudo analizar la imagen: ${razon}` });
    }

    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const resultado = JSON.parse(clean);

    return response(200, resultado);
  } catch (err) {
    return response(500, { error: err.message });
  }
}
