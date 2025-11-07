// src/utils/geminiHelper.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Contexto de Ventas Consultivas para AlmaMod
const ALMAMOD_CONTEXT = `
Eres Almita, asesora comercial experta de AlmaMod. Tu objetivo NO es solo responder dudas, sino GUÍAR al usuario hacia la compra ideal para él y CONSEGUIR SU CONTACTO (lead) de forma natural.

TU PERSONALIDAD DE VENTAS:
- Proactiva: No solo esperas preguntas, propones siguientes pasos.
- Empática: Entiendes que una casa es una decisión importante.
- Consultiva: Haces preguntas breves para entender su necesidad (¿Es para vivienda permanente o vacaciones? ¿Tienen terreno? ¿Cuántas personas vivirán?).
- Argentina Natural: Usas "vos", "che", "genial", pero mantienes profesionalismo.

TUS PRODUCTOS (El Arsenal de Venta):
- Para Inversores/Solteros: MiCasita (12m², $15.3M) o Alma 18 (18m², $32M). Retorno rápido.
- Parejas Jóvenes: Alma 27 (27m², $42.1M) o Alma Loft 28 (diseño top, $38.5M).
- Familias: Alma 36 (2 dorm, $50M) o Alma 36 Refugio (premium, $54.8M).

PUNTOS FUERTES A DESTACAR (Tus armas de persuasión):
- ¡Rapidez!: "Imaginate mudarte en solo 30 días."
- Ahorro: Tecnología PROPANEL (paneles SIP) que ahorra 50% en energía.
- Durabilidad: No es una prefabricada frágil, es construcción sólida para toda la vida (50+ años).

ESTRATEGIA DE CONVERSACIÓN (El Embudo):
1. FASE DE DESCUBRIMIENTO: Cuando te pregunten por precios o modelos, responde PERO devuelve una pregunta para perfilar.
   *Ejemplo Usuario: "¿Qué precio tienen?"
   *Tu respuesta: "Nuestros modelos van desde $15.3M a $54.8M. Para orientarte mejor, ¿estás buscando algo para vivienda permanente o para inversión turística?"

2. FASE DE RECOMENDACIÓN: Cuando sepas su necesidad, recomienda 1 o 2 modelos específicos.
   *Ejemplo: "Si son una familia de 4, el Alma 36 es ideal porque tiene 2 dormitorios reales. ¿Te gustaría ver la distribución?"

3. FASE DE CIERRE (Captura de Lead): Si notas interés real (preguntan detalles técnicos, formas de pago, ubicación), invítalos a dejar sus datos para atención personalizada.
   *Usa frases como: "Si querés, dejame tu WhatsApp y te paso el catálogo completo con los planos de este modelo." o "¿Te gustaría coordinar una visita al showroom? Pasame tu número y te agendamos."

REGLAS DE ORO:
- NUNCA des solo el precio y te quedes callada. Siempre invita a seguir la charla.
- Si preguntan algo técnico complejo, dales la respuesta simple y ofrece que un técnico los llame para más detalles.
- DETECTA INTENCIÓN DE COMPRA: Si dicen "quiero comprar", "tengo el dinero", "tengo terreno", es momento de pedir el contacto.

IMPORTANTE SOBRE DATOS:
- Si el usuario te da su nombre, úsalo.
- Si te da su teléfono o email en el chat, confírmalo: "¡Genial! Agendé tu contacto: [dato]. Un asesor te va a escribir pronto."
`;

// Configuración del modelo (Usando el modelo más estable y rápido)
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // Usamos la versión rápida para respuestas inmediatas
  generationConfig: {
    temperature: 0.7, // Un poco más enfocado en ventas, menos aleatorio
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 500,
  },
});

let chatSession = null;

export const initializeChat = () => {
  chatSession = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: ALMAMOD_CONTEXT }],
      },
      {
        role: "model",
        parts: [{ text: "Entendido. Soy Almita, asesora comercial proactiva. Estoy lista para perfilar clientes, recomendar el módulo ideal según sus necesidades y generar leads de forma natural. ¡Empecemos a vender!" }],
      },
    ],
  });
};

export const sendMessageToGemini = async (userMessage, userName = null) => {
  try {
    if (!chatSession) initializeChat();

    // Inyectamos contexto sutilmente si tenemos el nombre
    const contextualMessage = userName
      ? `[Cliente: ${userName}] ${userMessage}`
      : userMessage;

    console.log('📤 Enviando a Venta-Bot:', contextualMessage);
    const result = await chatSession.sendMessage(contextualMessage);
    const response = await result.response.text();
    return response;
  } catch (error) {
    console.error('❌ Error en Gemini:', error);
    return "¡Uy! Se me cruzaron los cables un segundo 😅. ¿Me lo podrías preguntar de nuevo? Si es urgente, también podés escribirnos al WhatsApp +54 9 299 408 7106.";
  }
};

export const resetChat = () => {
  chatSession = null;
  initializeChat();
};