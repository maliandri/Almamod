export const initializeChat = () => {
  console.log("🔌 Chat conectado al servidor seguro.");
};

export const sendMessageToGemini = async (userMessage, currentHistory = []) => {
  try {
    // ✅ FIX: Verificar que currentHistory sea un array antes de usar .map()
    const formattedHistory = Array.isArray(currentHistory)
      ? currentHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }))
      : []; // Si no es array, usar array vacío

    // 🔧 DETECCIÓN DE ENTORNO
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

    if (!isProduction) {
      // ⚠️ DESARROLLO LOCAL: Simular respuesta (sin API key expuesta)
      console.warn('⚠️ Modo desarrollo: Usando respuestas simuladas');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay de red
      return `Hola! 👋 Soy Almita (modo desarrollo).

En producción me conecto a Gemini AI para darte información real sobre nuestros módulos.

Para probar en local con Gemini real, usá:
\`\`\`
netlify dev
\`\`\`

¿Querés saber sobre nuestros modelos? Te puedo contar sobre:
- MiCasita ($15.3M)
- Alma 18 ($32M)
- Alma 27 ($42.1M)
- Alma 36 ($50M)`;
    }

    // ✅ PRODUCCIÓN: Usar Netlify Function
    const response = await fetch('/.netlify/functions/gemini-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        history: formattedHistory
      })
    });

    if (!response.ok) throw new Error(`Error servidor: ${response.status}`);
    const data = await response.json();
    return data.reply;

  } catch (error) {
    console.error('❌ Error comunicando con Almita:', error);
    return "Disculpe, estoy teniendo un breve lapso de conexión. ¿Podría repetirme su consulta en unos instantes?";
  }
};