import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AIChatbot.css';
import { sendMessageToGemini, initializeChat } from '../utils/geminiHelper';

function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [userData, setUserData] = useState({ name: '', email: '', phone: '' });
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef(null);

  const quickReplies = [
    { text: "🏠 Ver Modelos y Precios", key: "modelos" },
    { text: "📅 Tiempo de entrega", key: "tiempos" },
    { text: "💰 Financiación", key: "financiacion" },
    { text: "📍 Quiero visitar el showroom", key: "visita" }
  ];

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    initializeChat();
    const savedData = localStorage.getItem('almamod_user_data');
    if (savedData) setUserData(JSON.parse(savedData));
  }, []);

  useEffect(() => {
    if (isOpen && !hasGreeted && messages.length === 0) {
      setHasGreeted(true);
      simulateTyping(1000).then(() => {
        const greeting = userData.name 
          ? `¡Hola de nuevo ${userData.name}! 👋 ¿Seguimos viendo tu futura casa?`
          : "¡Hola! Soy Almita de AlmaMod 🏠\n\nEstoy acá para ayudarte a encontrar tu módulo ideal. ¿Buscás algo para vivienda permanente, inversión o vacaciones?";
        addBotMessage(greeting, false);
        setShowQuickReplies(true);
      });
    }
  }, [isOpen]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const addBotMessage = (text, useTypingEffect = true) => {
    setMessages(prev => [...prev, { id: Date.now(), text, isBot: true, timestamp: new Date() }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { id: Date.now(), text, isBot: false, timestamp: new Date() }]);
  };

  const simulateTyping = (ms = 1500) => new Promise(resolve => setTimeout(resolve, ms));

  const detectContactInfo = (text) => {
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(\+?54|0)?\s?(\d{2,4})[\s.-]?(\d{6,8})/);
    const nameMatch = text.match(/(me llamo|mi nombre es|soy) ([a-zA-ZáéíóúÁÉÍÓÚñÑ ]+)/i);
    let newData = { ...userData };
    let captured = false;
    if (emailMatch) { newData.email = emailMatch[0]; captured = true; }
    if (phoneMatch && phoneMatch[0].length > 7) { newData.phone = phoneMatch[0].trim(); captured = true; }
    if (nameMatch && nameMatch[2]) { newData.name = nameMatch[2].trim(); captured = true; }
    if (captured) {
      setUserData(newData);
      localStorage.setItem('almamod_user_data', JSON.stringify(newData));
      return true;
    }
    return false;
  };

  const sendLeadToServer = async () => {
    try {
      const response = await fetch('/.netlify/functions/saveLead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userData.name,
          userEmail: userData.email,
          userPhone: userData.phone
        })
      });

      if (response.ok) {
        console.log('✅ Lead enviado correctamente a info@almamod.com.ar');
      }
    } catch (error) {
      console.error('❌ Error enviando lead:', error);
    }
  };

  const detectContactRequest = (text) => {
    const contactKeywords = [
      'contactar', 'contacto', 'llamar', 'llamame', 'llámame',
      'escribir', 'enviar', 'comunicar', 'asesor', 'humano',
      'whatsapp', 'telefono', 'teléfono', 'mail', 'email'
    ];
    const lowerText = text.toLowerCase();
    return contactKeywords.some(keyword => lowerText.includes(keyword));
  };

  const handleSendMessage = async (textOverride = null) => {
    const text = textOverride || inputValue.trim();
    if (!text) return;
    addUserMessage(text);
    setInputValue('');
    setShowQuickReplies(false);
    setIsTyping(true);
    detectContactInfo(text);

    // Detectar si el usuario pide ser contactado
    const wantsContact = detectContactRequest(text);

    try {
      // ✅ FIX: Pasar el historial de mensajes formateado correctamente
      const history = messages.map(msg => ({
        sender: msg.isBot ? 'model' : 'user',
        text: msg.text
      }));
      const response = await sendMessageToGemini(text, history);
      setIsTyping(false);
      addBotMessage(response);

      // Si el usuario pide contacto y tenemos al menos un dato, enviar lead
      if (wantsContact && (userData.name || userData.email || userData.phone)) {
        setTimeout(() => sendLeadToServer(), 500);
      }
    } catch (error) {
      setIsTyping(false);
      addBotMessage("Tuve un pequeño lapsus. ¿Me lo repetís?");
    }
    setShowQuickReplies(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`almamod-chat-button almamod-chat-button-icon ${isOpen ? 'open' : ''}`}
        style={{ zIndex: 99999999 }}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
           <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
           <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="almamod-chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* HEADER */}
            <div className="almamod-chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="almamod-avatar-bot">A</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'white' }}>Almita</h3>
                  <p style={{ margin: 0, fontSize: '11px', opacity: 0.9, color: 'rgba(255,255,255,0.8)' }}>● En línea | Asesora Comercial</p>
                </div>
              </div>
              <button onClick={() => handleSendMessage("Quiero contactar a un humano")} className="almamod-human-btn">
                📞 Asesor Humano
              </button>
            </div>

            {/* BODY (MENSAJES) - Clases nuevas aquí */}
            <div className="almamod-chat-body">
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} 
                  style={{ alignSelf: msg.isBot ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                  <div className={msg.isBot ? 'almamod-message-bot' : 'almamod-message-user'}>
                    {msg.text}
                  </div>
                  {msg.isBot && <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px', marginLeft: '8px' }}>Almita</div>}
                </motion.div>
              ))}
              {isTyping && (
                 <div className="almamod-message-bot" style={{ alignSelf: 'flex-start', width: 'fit-content' }}>
                   <div className="almamod-typing-indicator">
                     <div className="almamod-typing-dot" style={{animationDelay: '0s'}}></div>
                     <div className="almamod-typing-dot" style={{animationDelay: '0.2s'}}></div>
                     <div className="almamod-typing-dot" style={{animationDelay: '0.4s'}}></div>
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* FOOTER (INPUT) - Clases nuevas aquí */}
            <div className="almamod-chat-footer">
              <AnimatePresence>
                {showQuickReplies && !isTyping && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="almamod-quick-replies-container">
                    {quickReplies.map(reply => (
                      <button key={reply.key} onClick={() => handleSendMessage(reply.text)} className="almamod-quick-reply-btn">
                        {reply.text}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyPress}
                  placeholder="Escribe tu consulta..." className="almamod-chat-input" />
                <button onClick={() => handleSendMessage()} disabled={!inputValue.trim()} className="almamod-chat-send-btn">
                  ➤
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