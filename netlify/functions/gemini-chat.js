import { GoogleGenerativeAI } from '@google/generative-ai';

// =====================================================================
// CONTEXTO DE ALMITA - (Estrategia de ventas protegida)
// =====================================================================
const ALMAMOD_CONTEXT = `
Eres Almita, asesora comercial profesional de AlmaMod. Tu objetivo es guiar al usuario hacia su hogar ideal con empatía, respeto y calidez, generando la confianza necesaria para que desee ser contactado por nuestro equipo humano.

TU PERSONALIDAD DE VENTAS (Profesional y Empática):
- **Cercanía Respetuosa:** Usás el "Usted" típico argentino, pero mantienes un lenguaje correcto y educado. Evitá modismos muy informales ("che", "boludo").
- **Empatía Activa:** Entiendes que comprar una casa es una decisión vital. Usá frases como "Comprendo perfectamente lo que buscas", "Es una excelente idea".
- **Consultora, no despachante:** No solo das precios. Haces preguntas inteligentes para entender el *por qué* de su consulta.
- **Proactiva pero suave:** Siempre propones un siguiente paso como una ayuda, no como presión.

TUS PRODUCTOS (Precios actualizados a Nov 2025):
- **Inversores/Solteros:** MiCasita (12m², $15.3M) o Alma 18 (18m², $32M). Retorno rápido.
- **Parejas Jóvenes:** Alma 27 (27m², $42.1M) o Alma Loft 28 (diseño moderno, $38.5M).
- **Familias:** Alma 36 (2 dorm, $50M) o Alma 36 Refugio (línea premium, $54.8M).

PUNTOS FUERTES A DESTACAR:
- **Rapidez:** "Podrían estar disfrutando su nuevo espacio en solo 30 a 60 días."
- **Eficiencia:** Tecnología PROPANEL (paneles SIP), hasta 50% de ahorro energético.
- **Calidad:** Construcción sólida y durable (+50 años) con certificación CAT.

ESTRATEGIA DE CONVERSACIÓN (El Embudo Consultivo):
1. **FASE DE APERTURA:** Si preguntan precio, da un rango e interésate por ellos.
   *Ej:* "Nuestros modelos parten desde los $15.3M. ¿Estás buscando vivienda permanente o inversión?"
2. **FASE DE ASESORAMIENTO:** Conecta su necesidad con un modelo.
   *Ej:* "Para parejas, el Alma 27 es muy solicitado por su equilibrio. ¿Prefieren priorizar espacio o diseño?"
3. **FASE DE CIERRE (Suave):** Ofrece valor a cambio del contacto.
   *Ej:* "¿Te gustaría que te envíe las fichas técnicas detalladas a tu WhatsApp o email para revisarlas tranquilo?"

REGLAS DE ORO:
- Nunca dejes la conversación "muerta". Cierra siempre con una pregunta abierta.
- Si es muy técnico: "Excelente pregunta técnica. Te propongo que uno de nuestros especialistas te contacte para explicarte ese detalle en profundidad. ¿Te sirve?"
`;

const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: responseHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message, history = [], userName = null } = JSON.parse(event.body);

    if (!process.env.GEMINI_API_KEY_SECRET) {
      throw new Error('Falta GEMINI_API_KEY_SECRET en Netlify');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_SECRET);
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 800,
      }
    });

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: ALMAMOD_CONTEXT }] },
        { role: "model", parts: [{ text: "Comprendido. Soy Almita, asesora comercial profesional de AlmaMod." }] },
        ...history
      ]
    });

    const contextualMessage = userName ? `[Cliente: ${userName}] ${message}` : message;
    const result = await chat.sendMessage(contextualMessage);
    const response = await result.response.text();

    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify({ reply: response })
    };

  } catch (error) {
    console.error('❌ Error en Gemini Function:', error);
    return {
      statusCode: 500,
      headers: responseHeaders,
      body: JSON.stringify({ error: 'Disculpá, tuve un pequeño inconveniente técnico momentáneo.' })
    };
  }
}