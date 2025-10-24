import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AIChatbot.css';

function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [showConversations, setShowConversations] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [userName, setUserName] = useState('');
  const [waitingForName, setWaitingForName] = useState(false);
  const messagesEndRef = useRef(null);

  // Base de conocimientos de Almita
  const knowledgeBase = {
    greetings: "¡Hola! Soy Almita, tu asistente virtual de AlmaMod 🏠. Antes de empezar, ¿cuál es tu nombre?",
    products: {
      'micasita': 'MiCasita es nuestro módulo más compacto de 12m² (4.88m × 2.44m). Perfecto para primera vivienda, oficina o espacio de trabajo. Incluye baño completo y cocina-dormitorio integrado. Precio: $15.300.000. Plazo de entrega: 30 días. ¿Te gustaría saber más detalles?',
      'alma 18': 'Alma 18 tiene 18m² (6m × 3m) con 1 dormitorio independiente. Incluye baño completo, cocina-comedor y un dormitorio. Precio: $32.050.000. Ideal para parejas o personas solas. ¿Quieres conocer las especificaciones técnicas?',
      'alma 27': 'Alma 27 ofrece 27m² (9m × 3m) con distribución más amplia. Incluye baño completo, cocina, estar-comedor y un dormitorio. Precio: $42.120.000. Perfecto equilibrio entre espacio y eficiencia. ¿Te interesa ver planos?',
      'alma loft 28': 'Alma Loft 28 es nuestro diseño tipo loft con 28m² (21m² en planta baja + 7m² en entrepiso). Incluye baño, cocina, estar-comedor y dormitorio en altillo. Precio: $38.500.000. Un diseño moderno y funcional. ¿Quieres más información?',
      'alma 36': 'Alma 36 es nuestro módulo de 36m² (12m × 3m) con 2 dormitorios. Incluye baño completo, cocina, estar-comedor y dos dormitorios. Precio: $50.075.000. Ideal para familias pequeñas. ¿Te gustaría agendar una visita?',
      'alma 36 refugio': 'Alma 36 Refugio tiene 36m² (12m × 3m) con diseño especial tipo refugio patagónico. Incluye baño completo, cocina, estar-comedor y dos dormitorios. Precio: $54.800.000. Perfecto para zonas de montaña. ¿Quieres ver el video 360°?'
    },
    panelSIP: 'Los Paneles SIP (Structural Insulated Panel) son el corazón de nuestra tecnología. Son paneles estructurales térmicos con núcleo aislante de poliestireno expandido y revestimiento OSB. Ofrecen: 50% de ahorro energético, 70% menos tiempo de construcción, 90% menos residuos, y vida útil de 50+ años. ¿Quieres saber más sobre PROPANEL®?',
    propanel: 'PROPANEL® es nuestro sistema constructivo certificado. Características: Espesor 9cm, Transmitancia térmica K=0.28 W/m²K, Resistencia al fuego Clase B, Certificación CAT (Ministerio de Desarrollo Territorial), Certificación CAS sismorresistente (INPRES). Es el sistema más avanzado de Argentina. ¿Te interesa conocer las certificaciones?',
    certificaciones: {
      'cat': 'El CAT (Certificado de Aptitud Técnica) es otorgado por el Ministerio de Desarrollo Territorial. Certifica que PROPANEL® cumple con todos los estándares de sistemas constructivos no tradicionales. Garantiza calidad estructural y térmica.',
      'cas': 'El CAS (Certificado de Aptitud Sismorresistente) es otorgado por INPRES. Certifica que nuestras construcciones resisten movimientos sísmicos de zona 2-4. Fundamental para la Patagonia.',
      'edge': 'EDGE Advanced es certificación internacional del Banco Mundial. Garantiza: 40%+ reducción energética, 20%+ ahorro de agua, 20%+ reducción de energía incorporada. Somos líderes en construcción verde en Argentina.',
      'cacmi': 'CACMI (Cámara Argentina de Construcción Modular) nos certifica como empresa de excelencia en construcción modular. Garantiza procesos, calidad y ética profesional.'
    },
    servicios: 'En AlmaMod ofrecemos soluciones integrales: 1) Estructura con Paneles SIP PROPANEL®, 2) Diseño y revestimiento exterior (chapa, siding, EIFS), 3) Construcción modular inteligente, 4) Fabricación en Neuquén adaptada al clima patagónico, 5) Interiores a medida y llave en mano, 6) Fundaciones y obras civiles. ¿Cuál te interesa conocer más?',
    ventajas: 'Las principales ventajas de construir con AlmaMod son: Eficiencia energética superior (50% ahorro en climatización), Construcción rápida (70% más rápida que tradicional), Sustentabilidad (90% menos residuos), Durabilidad (50+ años), Certificaciones oficiales, Resistencia climática patagónica, Calidad de aire interior superior. ¿Quieres profundizar en alguna?',
    precios: 'Nuestros módulos van desde $15.300.000 (MiCasita 12m²) hasta $54.800.000 (Alma 36 Refugio). Todos incluyen: Estructura completa, Paneles SIP PROPANEL®, Aberturas con DVH, Instalaciones completas, Baño equipado, Cocina amoblada, Pisos vinílicos. Entrega en 30 días. ¿Te interesa algún modelo específico?',
    financiacion: 'Trabajamos con diferentes opciones de financiación. Podemos coordinar una reunión para analizar tu caso particular. También aceptamos permuta por terrenos o vehículos. ¿Quieres que te contactemos para hablar de financiación?',
    proceso: 'Nuestro proceso es: 1) Consulta inicial gratuita, 2) Diseño personalizado según tus necesidades, 3) Presupuesto detallado, 4) Fabricación en nuestro taller en Neuquén (30 días), 5) Transporte e instalación, 6) Entrega llave en mano. Todo con seguimiento constante. ¿En qué etapa te gustaría empezar?',
    ubicacion: 'Estamos en Neuquén, Argentina. Fabricamos localmente para adaptarnos al clima patagónico. Entregamos en toda la Patagonia argentina: Neuquén, Río Negro, Chubut, Santa Cruz y Tierra del Fuego. También vendemos a otras provincias. ¿En qué zona estás?',
    sustentabilidad: 'La sustentabilidad es nuestro ADN. Certificación EDGE Advanced (Banco Mundial), Reducción 90% residuos de obra, Ahorro 50% energía climatización, Materiales reciclables, Menor huella de carbono, Construcción en seco (ahorro de agua). Somos construcción verde certificada. ¿Te importa el medio ambiente?',
    contacto: 'Puedes contactarnos por: 📱 WhatsApp: +54 9 299 408 7106, 📧 Email: info@almamod.com.ar, 📍 Ubicación: Neuquén, Argentina, 🌐 Web: www.almamod.com.ar, o directamente desde este chat. ¿Cómo prefieres que te contactemos?',
    visita: 'Puedes agendar una visita a nuestro taller en Neuquén para ver los módulos en vivo y conocer el proceso de fabricación. También hacemos videollamadas para mostrarte todo virtualmente. ¿Prefieres visita presencial o virtual?'
  };

  const quickReplies = [
    { text: "Ver catálogo de módulos", key: "catalogo" },
    { text: "Sistema PROPANEL®", key: "propanel" },
    { text: "Precios y financiación", key: "precios" },
    { text: "Certificaciones", key: "certificaciones" },
    { text: "Proceso de construcción", key: "proceso" },
    { text: "Contacto y visitas", key: "contacto" }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Cargar conversaciones guardadas
    const savedConversations = localStorage.getItem('almamod_conversations');
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }
    
    // Cargar nombre guardado
    const savedName = localStorage.getItem('almamod_user_name');
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0 && !currentConversationId) {
      // Mensaje de bienvenida
      setTimeout(() => {
        if (userName) {
          // Si ya tenemos el nombre, saludar personalizadamente
          addBotMessage(`¡Hola de nuevo, ${userName}! 😊 ¿En qué puedo ayudarte hoy?`);
        } else {
          // Si no tenemos el nombre, pedirlo
          addBotMessage(knowledgeBase.greetings);
          setWaitingForName(true);
        }
      }, 500);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text,
      isBot: true,
      timestamp: new Date()
    }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text,
      isBot: false,
      timestamp: new Date()
    }]);
  };

  const simulateTyping = (duration = 1500) => {
    setIsTyping(true);
    return new Promise(resolve => {
      setTimeout(() => {
        setIsTyping(false);
        resolve();
      }, duration);
    });
  };

  const getResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Saludos (ahora personalizados)
    if (input.match(/(hola|hello|hi|buenos días|buenas tardes|buenas noches|hey)/)) {
      return userName 
        ? `¡Hola ${userName}! 😊 ¿En qué más puedo ayudarte?`
        : knowledgeBase.greetings;
    }
    
    // Productos específicos
    for (const [key, response] of Object.entries(knowledgeBase.products)) {
      if (input.includes(key) || input.includes(key.replace(' ', ''))) {
        return userName 
          ? `${userName}, ${response}`
          : response;
      }
    }
    
    // Catálogo
    if (input.match(/(catálogo|catalogo|módulos|modulos|productos|viviendas|casas)/)) {
      const response = 'Tenemos 6 modelos disponibles:\n\n🏠 MiCasita (12m²) - $15.300.000\n🏠 Alma 18 (18m²) - $32.050.000\n🏠 Alma 27 (27m²) - $42.120.000\n🏠 Alma Loft 28 (28m²) - $38.500.000\n🏠 Alma 36 (36m²) - $50.075.000\n🏠 Alma 36 Refugio (36m²) - $54.800.000\n\nTodos con entrega en 30 días. ¿Cuál te interesa?';
      return userName 
        ? `${userName}, ${response.charAt(0).toLowerCase() + response.slice(1)}`
        : response;
    }
    
    // Panel SIP
    if (input.match(/(panel|sip|estructura|construcción|construccion)/)) {
      return userName 
        ? `${userName}, ${knowledgeBase.panelSIP}`
        : knowledgeBase.panelSIP;
    }
    
    // PROPANEL
    if (input.match(/(propanel|sistema|tecnología|tecnologia)/)) {
      return userName 
        ? `${userName}, ${knowledgeBase.propanel}`
        : knowledgeBase.propanel;
    }
    
    // Certificaciones
    if (input.match(/(certificación|certificacion|certificado|cat|cas|edge|cacmi)/)) {
      if (input.includes('cat')) return userName ? `${userName}, ${knowledgeBase.certificaciones.cat}` : knowledgeBase.certificaciones.cat;
      if (input.includes('cas')) return userName ? `${userName}, ${knowledgeBase.certificaciones.cas}` : knowledgeBase.certificaciones.cas;
      if (input.includes('edge')) return userName ? `${userName}, ${knowledgeBase.certificaciones.edge}` : knowledgeBase.certificaciones.edge;
      if (input.includes('cacmi')) return userName ? `${userName}, ${knowledgeBase.certificaciones.cacmi}` : knowledgeBase.certificaciones.cacmi;
      const response = 'Contamos con 4 certificaciones oficiales:\n\n✓ CAT - Certificado de Aptitud Técnica\n✓ CAS - Certificado Sismorresistente\n✓ EDGE Advanced - Certificación Internacional\n✓ CACMI - Cámara Argentina Construcción Modular\n\n¿Sobre cuál quieres saber más?';
      return userName 
        ? `${userName}, ${response.charAt(0).toLowerCase() + response.slice(1)}`
        : response;
    }
    
    // Servicios
    if (input.match(/(servicio|servicios|qué hacen|que hacen|ofrecen)/)) {
      return userName 
        ? `${userName}, ${knowledgeBase.servicios}`
        : knowledgeBase.servicios;
    }
    
    // Ventajas
    if (input.match(/(ventaja|ventajas|beneficio|beneficios|por qué|porque|razón|razon)/)) {
      return userName 
        ? `${userName}, ${knowledgeBase.ventajas}`
        : knowledgeBase.ventajas;
    }
    
    // Precios
    if (input.match(/(precio|precios|costo|costos|cuánto|cuanto|valor|valores)/)) {
      return userName 
        ? `${userName}, ${knowledgeBase.precios}`
        : knowledgeBase.precios;
    }
    
    // Financiación
    if (input.match(/(financiación|financiacion|cuotas|pago|crédito|credito)/)) {
      return userName 
        ? `${userName}, ${knowledgeBase.financiacion}`
        : knowledgeBase.financiacion;
    }
    
    // Proceso
    if (input.match(/(proceso|cómo|como|pasos|etapas|tiempo|plazo)/)) {
      return userName 
        ? `${userName}, ${knowledgeBase.proceso}`
        : knowledgeBase.proceso;
    }
    
    // Ubicación
    if (input.match(/(ubicación|ubicacion|dónde|donde|dirección|direccion|neuquén|neuquen)/)) {
      return userName 
        ? `${userName}, ${knowledgeBase.ubicacion}`
        : knowledgeBase.ubicacion;
    }
    
    // Sustentabilidad
    if (input.match(/(sustentable|sustentabilidad|ecológico|ecologico|verde|medio ambiente)/)) {
      return userName 
        ? `${userName}, ${knowledgeBase.sustentabilidad}`
        : knowledgeBase.sustentabilidad;
    }
    
    // Contacto
    if (input.match(/(contacto|teléfono|telefono|email|mail|whatsapp|llamar)/)) {
      return userName 
        ? `${userName}, ${knowledgeBase.contacto}`
        : knowledgeBase.contacto;
    }
    
    // Visita
    if (input.match(/(visita|visitar|ver|conocer|mostrar|taller)/)) {
      return userName 
        ? `${userName}, ${knowledgeBase.visita}`
        : knowledgeBase.visita;
    }
    
    // Agradecimientos
    if (input.match(/(gracias|thank you|perfecto|excelente|genial|bárbaro|barbaro)/)) {
      return userName 
        ? `¡De nada, ${userName}! Estoy aquí para ayudarte con todo lo que necesites sobre AlmaMod. ¿Hay algo más que quieras saber sobre nuestros módulos?`
        : '¡De nada! Estoy aquí para ayudarte con todo lo que necesites sobre AlmaMod. ¿Hay algo más que quieras saber sobre nuestros módulos?';
    }
    
    // Despedidas
    if (input.match(/(adiós|adios|bye|nos vemos|hasta luego|chau|chao)/)) {
      return userName 
        ? `¡Hasta luego, ${userName}! Fue un placer ayudarte. Cuando quieras hablar sobre tu próximo proyecto modular, aquí estaré. ¡Que tengas un excelente día! 🏠`
        : '¡Hasta luego! Fue un placer ayudarte. Cuando quieras hablar sobre tu próximo proyecto modular, aquí estaré. ¡Que tengas un excelente día! 🏠';
    }
    
    // Respuesta por defecto con sugerencias
    const defaultResponse = `Entiendo que preguntas sobre "${userInput}". Te puedo ayudar con:\n\n🏠 Catálogo de módulos (MiCasita, Alma 18, 27, 36)\n🔧 Sistema PROPANEL® y Paneles SIP\n📜 Certificaciones (CAT, CAS, EDGE, CACMI)\n💰 Precios y financiación\n⚙️ Proceso de construcción\n🌱 Sustentabilidad y eficiencia energética\n📍 Ubicación y visitas\n\n¿Sobre cuál te gustaría saber más?`;
    return userName 
      ? `${userName}, ${defaultResponse.charAt(0).toLowerCase() + defaultResponse.slice(1)}`
      : defaultResponse;
  };

  const handleSendMessage = async (message = inputValue) => {
    if (!message.trim()) return;

    // Agregar mensaje del usuario
    addUserMessage(message);
    setInputValue('');
    setShowQuickReplies(false);

    // Si estamos esperando el nombre, guardarlo
    if (waitingForName) {
      const name = message.trim();
      setUserName(name);
      localStorage.setItem('almamod_user_name', name);
      setWaitingForName(false);
      
      // Simular escritura del bot
      await simulateTyping(1000);
      
      // Responder con nombre guardado
      addBotMessage(`¡Mucho gusto, ${name}! 😊 Es un placer ayudarte. ¿En qué puedo asistirte hoy con respecto a nuestros módulos AlmaMod?`);
      return;
    }

    // Simular escritura del bot
    await simulateTyping();

    // Obtener y enviar respuesta
    const response = getResponse(message);
    addBotMessage(response);

    // Guardar conversación
    saveConversation();
  };

  const handleQuickReply = (reply) => {
    handleSendMessage(reply.text);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent('Hola! Vengo del chat de la web de AlmaMod y me gustaría obtener más información sobre los módulos habitacionales.');
    window.open(`https://wa.me/5492994087106?text=${message}`, '_blank');
  };

  const openTiendaAlma = () => {
    // Disparar evento para abrir Tienda Alma
    window.location.href = '/tiendaalma';
  };

  const saveConversation = () => {
    if (messages.length > 0) {
      const conversationData = {
        id: currentConversationId || Date.now(),
        title: messages[1]?.text.substring(0, 50) || 'Nueva conversación',
        messages: messages,
        timestamp: new Date(),
        lastMessage: messages[messages.length - 1]?.text.substring(0, 100)
      };

      const savedConversations = localStorage.getItem('almamod_conversations');
      let allConversations = savedConversations ? JSON.parse(savedConversations) : [];
      
      // Actualizar o agregar conversación
      const existingIndex = allConversations.findIndex(conv => conv.id === conversationData.id);
      if (existingIndex !== -1) {
        allConversations[existingIndex] = conversationData;
      } else {
        allConversations.unshift(conversationData);
      }

      // Mantener solo las últimas 20 conversaciones
      allConversations = allConversations.slice(0, 20);

      localStorage.setItem('almamod_conversations', JSON.stringify(allConversations));
      setConversations(allConversations);
      setCurrentConversationId(conversationData.id);
    }
  };

  const loadConversation = (conversation) => {
    setMessages(conversation.messages);
    setCurrentConversationId(conversation.id);
    setShowConversations(false);
    setShowQuickReplies(false);
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setShowQuickReplies(true);
    setShowConversations(false);
    setTimeout(() => {
      if (userName) {
        addBotMessage(`¡Hola de nuevo, ${userName}! 😊 ¿En qué puedo ayudarte hoy?`);
      } else {
        addBotMessage(knowledgeBase.greetings);
        setWaitingForName(true);
      }
    }, 300);
  };

  const resetUserName = () => {
    setUserName('');
    localStorage.removeItem('almamod_user_name');
    setWaitingForName(true);
    setMessages([]);
    setTimeout(() => {
      addBotMessage(knowledgeBase.greetings);
    }, 300);
  };

  const deleteConversation = (id) => {
    const updated = conversations.filter(conv => conv.id !== id);
    localStorage.setItem('almamod_conversations', JSON.stringify(updated));
    setConversations(updated);
    if (currentConversationId === id) {
      startNewConversation();
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    saveConversation();
  };

  return (
    <>
{/* Botón flotante del chat - Reposicionado debajo del logo */}
<motion.button
  onClick={() => setIsOpen(!isOpen)}
  className="almamod-chat-button"
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  initial={{ opacity: 0, scale: 0 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5, delay: 2 }}
  style={{
    position: 'fixed',
    top: '15px',        // 🔧 ajustá según la altura de tu header (más grande = más abajo)
    left: '250px',       // 🔧 movelo a la derecha si querés alinearlo con el logo
    zIndex: 9999,        // queda sobre todos los elementos
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: isOpen ? '#dc2626' : '#d4a574',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.3s ease'
  }}
>
  <motion.div
    animate={{ rotate: isOpen ? 180 : 0 }}
    transition={{ duration: 0.3 }}
  >
    {isOpen ? (
      <svg
        style={{ width: '24px', height: '24px', color: 'white' }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ) : (
      <svg
        style={{ width: '24px', height: '24px', color: 'white' }}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )}
  </motion.div>

  {!isOpen && (
    <motion.div
      style={{
        position: 'absolute',
        top: '-4px',
        right: '-4px',
        width: '16px',
        height: '16px',
        backgroundColor: '#dc2626',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 3 }}
    >
      <span
        style={{
          fontSize: '10px',
          color: 'white',
          fontWeight: 'bold'
        }}
      >
        !
      </span>
    </motion.div>
  )}
</motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
         <motion.div
  className="almamod-chat-window"
  initial={{ opacity: 0, y: 100, scale: 0.8 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: 100, scale: 0.8 }}
  transition={{ duration: 0.3 }}
  drag                     // 👈 permite arrastrar
  dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }} // 👈 limita al viewport
  dragElastic={0.2}        // 👈 da un poco de “rebote” al mover
  style={{
    position: 'fixed',
    top: '0px',   // posición inicial
    left: '310px',
    zIndex: 9999,
    width: '384px',
    height: '500px',
    backgroundColor: '#1a1a2e',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    border: '1px solid rgba(212, 165, 116, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    cursor: 'move' // 👈 cambia el cursor al arrastrar
  }}
>

            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #d4a574 0%, #b88a5f 100%)',
              color: 'white',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '24px', height: '24px' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 600, fontSize: '16px', margin: 0 }}>
                  Almita {userName && `• ${userName}`}
                </h3>
                <p style={{ fontSize: '12px', margin: 0, opacity: 0.9 }}>
                  {isTyping ? 'Escribiendo...' : 'En línea • Tu asistente AlmaMod'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <motion.button
                  onClick={() => setShowConversations(!showConversations)}
                  style={{
                    padding: '8px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  title="Conversaciones anteriores"
                >
                  <svg style={{ width: '16px', height: '16px', color: 'white' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                </motion.button>
                <motion.button
                  onClick={openWhatsApp}
                  style={{
                    padding: '8px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  title="WhatsApp"
                >
                  <svg style={{ width: '16px', height: '16px', color: 'white' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"/>
                  </svg>
                </motion.button>
                <motion.button
                  onClick={closeChat}
                  style={{
                    padding: '8px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  whileHover={{ backgroundColor: 'rgba(220, 38, 38, 0.8)' }}
                  whileTap={{ scale: 0.95 }}
                  title="Cerrar chat"
                >
                  <svg style={{ width: '16px', height: '16px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Panel de conversaciones */}
            {showConversations && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                style={{
                  position: 'absolute',
                  top: '72px',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: '#1a1a2e',
                  zIndex: 10,
                  overflowY: 'auto',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ color: '#d4a574', margin: 0 }}>Conversaciones</h4>
                  <motion.button
                    onClick={startNewConversation}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#d4a574',
                      color: '#1a1a2e',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    + Nueva
                  </motion.button>
                </div>

                {userName && (
                  <div style={{ 
                    marginBottom: '16px', 
                    padding: '12px', 
                    backgroundColor: 'rgba(212, 165, 116, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(212, 165, 116, 0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <p style={{ margin: 0, color: '#d4a574', fontSize: '12px', fontWeight: 600 }}>
                        Usuario actual
                      </p>
                      <p style={{ margin: 0, color: '#e5e7eb', fontSize: '14px' }}>
                        {userName}
                      </p>
                    </div>
                    <motion.button
                      onClick={resetUserName}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: 'transparent',
                        color: '#d4a574',
                        border: '1px solid #d4a574',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                      whileHover={{ backgroundColor: 'rgba(212, 165, 116, 0.1)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cambiar
                    </motion.button>
                  </div>
                )}

                {conversations.length === 0 ? (
                  <p style={{ color: '#6b7280', textAlign: 'center', marginTop: '32px' }}>
                    No hay conversaciones guardadas
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {conversations.map(conv => (
                      <motion.div
                        key={conv.id}
                        style={{
                          padding: '12px',
                          backgroundColor: currentConversationId === conv.id ? 'rgba(212, 165, 116, 0.1)' : 'rgba(255,255,255,0.05)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: '1px solid rgba(212, 165, 116, 0.2)',
                          position: 'relative'
                        }}
                        whileHover={{ backgroundColor: 'rgba(212, 165, 116, 0.15)' }}
                        onClick={() => loadConversation(conv)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div style={{ flex: 1 }}>
                            <h5 style={{ color: '#d4a574', margin: '0 0 4px 0', fontSize: '14px' }}>
                              {conv.title}
                            </h5>
                            <p style={{ color: '#9ca3af', margin: 0, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {conv.lastMessage}
                            </p>
                            <span style={{ color: '#6b7280', fontSize: '10px' }}>
                              {new Date(conv.timestamp).toLocaleDateString('es-AR')}
                            </span>
                          </div>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv.id);
                            }}
                            style={{
                              padding: '4px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#dc2626'
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: message.isBot ? 'flex-start' : 'flex-end'
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={{
                    maxWidth: '80%',
                    padding: '12px',
                    borderRadius: '16px',
                    backgroundColor: message.isBot ? 'rgba(212, 165, 116, 0.1)' : '#d4a574',
                    border: message.isBot ? '1px solid rgba(212, 165, 116, 0.3)' : 'none'
                  }}>
                    <p style={{
                      fontSize: '14px',
                      margin: 0,
                      whiteSpace: 'pre-line',
                      color: message.isBot ? '#e5e7eb' : '#1a1a2e'
                    }}>
                      {message.text}
                    </p>
                    <span style={{
                      fontSize: '10px',
                      marginTop: '4px',
                      display: 'block',
                      color: message.isBot ? '#9ca3af' : 'rgba(26, 26, 46, 0.7)'
                    }}>
                      {message.timestamp.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  style={{ display: 'flex', justifyContent: 'flex-start' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div style={{
                    backgroundColor: 'rgba(212, 165, 116, 0.1)',
                    padding: '12px',
                    borderRadius: '16px',
                    border: '1px solid rgba(212, 165, 116, 0.3)'
                  }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div style={{ width: '8px', height: '8px', backgroundColor: '#d4a574', borderRadius: '50%', animation: 'bounce 1.4s infinite' }}></div>
                      <div style={{ width: '8px', height: '8px', backgroundColor: '#d4a574', borderRadius: '50%', animation: 'bounce 1.4s infinite 0.2s' }}></div>
                      <div style={{ width: '8px', height: '8px', backgroundColor: '#d4a574', borderRadius: '50%', animation: 'bounce 1.4s infinite 0.4s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick replies */}
              {showQuickReplies && messages.length <= 1 && (
                <motion.div
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <p style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    textAlign: 'center',
                    margin: 0
                  }}>
                    Respuestas rápidas:
                  </p>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px'
                  }}>
                    {quickReplies.map((reply, index) => (
                      <motion.button
                        key={reply.key}
                        onClick={() => handleQuickReply(reply)}
                        style={{
                          padding: '8px',
                          fontSize: '12px',
                          backgroundColor: 'rgba(212, 165, 116, 0.1)',
                          color: '#d4a574',
                          borderRadius: '8px',
                          border: '1px solid rgba(212, 165, 116, 0.3)',
                          cursor: 'pointer'
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                        whileHover={{ backgroundColor: 'rgba(212, 165, 116, 0.2)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {reply.text}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '16px',
              borderTop: '1px solid rgba(212, 165, 116, 0.2)'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  disabled={isTyping}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid rgba(212, 165, 116, 0.3)',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: '#e5e7eb',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <motion.button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#d4a574',
                    color: '#1a1a2e',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: inputValue.trim() && !isTyping ? 'pointer' : 'not-allowed',
                    opacity: inputValue.trim() && !isTyping ? 1 : 0.5
                  }}
                  whileHover={{ scale: inputValue.trim() && !isTyping ? 1.05 : 1 }}
                  whileTap={{ scale: inputValue.trim() && !isTyping ? 0.95 : 1 }}
                >
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </motion.button>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '8px'
              }}>
                <p style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Presiona Enter para enviar • Powered by Almita IA
                </p>
                <motion.button
                  onClick={closeChat}
                  style={{
                    fontSize: '10px',
                    color: '#6b7280',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  whileHover={{ color: '#dc2626' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cerrar
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AIChatBot;