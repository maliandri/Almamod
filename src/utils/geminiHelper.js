export const initializeChat = () => {
  console.log("🔌 Chat conectado al servidor seguro.");
};

export const sendMessageToGemini = async (userMessage, currentHistory = []) => {
  try {
    const formattedHistory = currentHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

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