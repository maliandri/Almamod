const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const CONTEXT = `Sos el community manager de AlmaMod, empresa de construcción modular con paneles SIP PROPANEL ubicada en Neuquén, Patagonia Argentina.
Vendemos viviendas modulares llave en mano. Los 6 modelos son:
- MiCasita: 12m², $17.900.000, monoambiente, ideal primera vivienda u oficina
- Alma 18: 18m², $39.850.000, monoambiente amplio
- Alma 27: 27m², $46.650.000, 2 dormitorios
- Alma Loft 28: 28m², $42.300.000, loft con entrepiso
- Alma 36: 36m², $58.720.000, 2-3 dormitorios
- Alma 36 Refugio: 36m², $61.200.000, versión premium

Ventajas clave: construcción en 30-60 días, ahorro energético 40% con SIP, transportable, ampliable, llave en mano.
Tono: cercano, aspiracional, argentino (no usar "vosotros"). Emojis moderados. Siempre incluir CTA.`;

function buildPrompt(tipo, datos) {
  if (tipo === 'reel') {
    return `${CONTEXT}

Generá el contenido para un REEL de Instagram/Facebook sobre: "${datos.tema}"
Modelo destacado: ${datos.modelo || 'AlmaMod en general'}
Tono: ${datos.tono || 'inspirador'}

Devolvé EXACTAMENTE este JSON (sin markdown, sin explicaciones):
{
  "hook": "Primera frase gancho para los primeros 3 segundos (máx 10 palabras)",
  "guion": "Guión del reel en 5-7 puntos cortos con emojis",
  "caption": "Caption completo para publicar (150-200 palabras)",
  "hashtags": "#hashtag1 #hashtag2 ... (15-20 hashtags relevantes)",
  "cta": "Call to action final"
}`;
  }

  if (tipo === 'post') {
    return `${CONTEXT}

Generá contenido para un POST de feed de Instagram/Facebook sobre: "${datos.tema}"
Modelo destacado: ${datos.modelo || 'AlmaMod en general'}
Tono: ${datos.tono || 'informativo'}
Formato: ${datos.formato || 'imagen única'}

Devolvé EXACTAMENTE este JSON (sin markdown, sin explicaciones):
{
  "titulo": "Título o primera línea impactante",
  "caption": "Caption completo para publicar (200-300 palabras con emojis)",
  "hashtags": "#hashtag1 #hashtag2 ... (15-20 hashtags relevantes)",
  "cta": "Call to action final",
  "sugerencia_visual": "Descripción breve de qué imagen/visual usar"
}`;
  }

  // libre
  return `${CONTEXT}

Generá el siguiente contenido para redes sociales de AlmaMod:
${datos.instruccion}

Devolvé EXACTAMENTE este JSON (sin markdown, sin explicaciones):
{
  "contenido": "El contenido generado completo con emojis",
  "hashtags": "#hashtag1 #hashtag2 ... (10-15 hashtags)",
  "cta": "Call to action sugerido"
}`;
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Método no permitido' }) };

  const apiKey = process.env.GEMINI_API_KEY_SECRET;
  if (!apiKey) return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'API key no configurada' }) };

  const { tipo, ...datos } = JSON.parse(event.body || '{}');
  if (!tipo) return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'tipo requerido' }) };

  const prompt = buildPrompt(tipo, datos);

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 4096 },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data.error?.message || `Gemini error ${res.status}`;
      return { statusCode: 502, headers: corsHeaders, body: JSON.stringify({ error: msg }) };
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!raw) {
      const razon = data.promptFeedback?.blockReason || data.candidates?.[0]?.finishReason || 'Gemini no devolvió contenido';
      return { statusCode: 502, headers: corsHeaders, body: JSON.stringify({ error: `Sin respuesta de Gemini: ${razon}` }) };
    }

    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const resultado = JSON.parse(clean);

    return { statusCode: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify(resultado) };
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
}
