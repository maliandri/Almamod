import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './aichatbot.css';
import { sendMessageToGemini, initializeChat, resetChat } from '../utils/geminiHelper';

function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  
  // Estado simplificado de usuario
  const [userData, setUserData] = useState({ name: '', email: '', phone: '' });
  const [hasGreeted, setHasGreeted] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Respuestas rápidas orientadas a la acción/venta
  const quickReplies = [
    { text: "🏠 Ver Modelos y Precios", key: "modelos" },
    { text: "📅 Tiempo de entrega", key: "tiempos" },
    { text: "💰 Financiación", key: "financiacion" },
    { text: "📍 Quiero visitar el showroom", key: "visita" } // High intent trigger
  ];

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Inicialización rápida
  useEffect(() => {
    initializeChat();
    const savedData = localStorage.getItem('almamod_user_data');
    if (savedData) setUserData(JSON.parse(savedData));
  }, []);

  // Saludo inicial SOLO cuando se abre por primera vez
  useEffect(() => {
    if (isOpen && !hasGreeted && messages.length === 0) {
      setHasGreeted(true);
      simulateTyping(1000).then(() => {
        const greeting = userData.name 
          ? `¡Hola de nuevo ${userData.name}! 👋 ¿Seguimos viendo tu futura casa?`
          : "¡Hola! Soy Almita de AlmaMod 🏠\n\nEstoy acá para ayudarte a encontrar tu módulo ideal. ¿Buscás algo para vivienda permanente, inversión o vacaciones?";
        
        addBotMessage(greeting, false); // False para no tipear lento el saludo inicial
        setShowQuickReplies(true);
      });
    }
  }, [isOpen]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Función auxiliar para añadir mensajes
  const addBotMessage = (text, useTypingEffect = true) => {
    setMessages(prev => [...prev, { id: Date.now(), text, isBot: true, timestamp: new Date() }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { id: Date.now(), text, isBot: false, timestamp: new Date() }]);
  };

  const simulateTyping = (ms = 1500) => new Promise(resolve => setTimeout(resolve, ms));

  // --- CEREBRO DE CAPTURA DE LEADS ---
  const detectContactInfo = (text) => {
    // Detectar si el usuario soltó voluntariamente sus datos
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(\+?54|0)?\s?(\d{2,4})[\s.-]?(\d{6,8})/); // Regex mejorado para Argentina
    const nameMatch = text.match(/(me llamo|mi nombre es|soy) ([a-zA-ZáéíóúÁÉÍÓÚñÑ ]+)/i);

    let newData = { ...userData };
    let captured = false;

    if (emailMatch) { newData.email = emailMatch[0]; captured = true; }
    if (phoneMatch && phoneMatch[0].length > 7) { newData.phone = phoneMatch[0].trim(); captured = true; }
    if (nameMatch && nameMatch[2]) { newData.name = nameMatch[2].trim(); captured = true; }

    if (captured) {
      setUserData(newData);
      localStorage.setItem('almamod_user_data', JSON.stringify(newData));
      
      // Si tenemos al menos un contacto, lo enviamos silenciosamente al backend
      if (newData.email || newData.phone) {
        sendLeadToBackend(newData);
      }
      return true;
    }
    return false;
  };

  const sendLeadToBackend = async (data) => {
    console.log("🚀 ¡LEAD CAPTURADO! Enviando al CRM/Backend...", data);
    // Aquí iría tu llamada real a Netlify Functions o tu backend
    // try { await fetch('/.netlify/functions/saveLead', { method: 'POST', body: JSON.stringify(data) }); } catch (e) { ... }
  };

  // Manejo principal del chat
  const handleSendMessage = async (textOverride = null) => {
    const text = textOverride || inputValue.trim();
    if (!text) return;

    addUserMessage(text);
    setInputValue('');
    setShowQuickReplies(false);
    setIsTyping(true);

    // 1. Detectar si el usuario nos dio datos en este mensaje
    const capturedData = detectContactInfo(text);

    try {
      // 2. Obtener respuesta de la IA Vendedora
      const response = await sendMessageToGemini(text, userData.name);
      setIsTyping(false);
      addBotMessage(response);
      
      // 3. Si capturamos datos recién, quizás queramos mostrar una confirmación visual sutil
      if (capturedData && !response.includes("Agendé tu contacto")) {
         // Opcional: la IA ya debería confirmarlo si sigue el prompt, 
         // pero esto asegura feedback si la IA falla en notarlo.
      }

    } catch (error) {
      setIsTyping(false);
      addBotMessage("Tuve un pequeño lapsus. ¿Me lo repetís?");
    }

    setShowQuickReplies(true); // Siempre mostrar opciones rápidas para mantener el flujo
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Botón flotante (Mismo estilo) */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`almamod-chat-button almamod-chat-button-icon ${isOpen ? 'open' : ''}`}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
           <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
           <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </motion.button>

      {/* Ventana del Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="almamod-chat-window almamod-chat-window-bg"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header de Venta */}
            <div className="almamod-chat-header" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="almamod-avatar-bot" style={{ width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>A</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'white' }}>Almita</h3>
                  <p style={{ margin: 0, fontSize: '11px', opacity: 0.9, color: 'rgba(255,255,255,0.8)' }}>● En línea | Asesora Comercial</p>
                </div>
              </div>
              {/* Botón de llamada a la acción directa */}
              <button 
                onClick={() => handleSendMessage("Quiero que me contacte un asesor humano por favor")}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '12px', padding: '6px 10px', color: 'white', fontSize: '11px', cursor: 'pointer' }}
              >
                📞 Solicitar Asesor
              </button>
            </div>

            {/* Área de Mensajes */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} 
                  style={{ alignSelf: msg.isBot ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                  <div className={msg.isBot ? 'almamod-message-bot' : 'almamod-message-user'}
                    style={{ padding: '10px 14px', borderRadius: '16px', fontSize: '14px', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </div>
                  {msg.isBot && <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px', marginLeft: '8px' }}>Almita</div>}
                </motion.div>
              ))}

              {isTyping && (
                 <div className="almamod-message-bot" style={{ alignSelf: 'flex-start', padding: '10px 15px', borderRadius: '16px', width: 'fit-content' }}>
                   <div className="almamod-typing-indicator" style={{ display: 'flex', gap: '4px' }}>
                     <div className="almamod-typing-dot" style={{animation: 'bounce 1s infinite'}}></div>
                     <div className="almamod-typing-dot" style={{animation: 'bounce 1s infinite 0.2s'}}></div>
                     <div className="almamod-typing-dot" style={{animation: 'bounce 1s infinite 0.4s'}}></div>
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Respuestas Rápidas & Input */}
            <div style={{ padding: '10px 15px', borderTop: '1px solid rgba(0,0,0,0.05)', background: 'var(--chat-bg-secondary)' }}>
              <AnimatePresence>
                {showQuickReplies && !isTyping && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    style={{ display: 'flex', gap: '8px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {quickReplies.map(reply => (
                      <button key={reply.key} onClick={() => handleSendMessage(reply.text)}
                        className="almamod-quick-reply-btn"
                        style={{ whiteSpace: 'nowrap', flexShrink: 0, padding: '8px 12px', borderRadius: '20px', fontSize: '12px', border: '1px solid var(--chat-accent)', background: 'transparent' }}>
                        {reply.text}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Escribe tu consulta..."
                  className="almamod-chat-input"
                  style={{ flex: 1, padding: '12px', borderRadius: '24px', border: '1px solid var(--chat-border)', outline: 'none', fontSize: '14px' }}
                />
                <button onClick={() => handleSendMessage()} disabled={!inputValue.trim()}
                   className="almamod-chat-send-btn"
                   style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: inputValue.trim() ? 1 : 0.7 }}>
                  <svg style={{ width: '18px', height: '18px', transform: 'rotate(90deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AIChatBot;