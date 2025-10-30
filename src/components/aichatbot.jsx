import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './aichatbot.css';

function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  
  // Estados del flujo de conversación
  const [conversationStep, setConversationStep] = useState('initial'); // initial, name, contact, chat
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [typingText, setTypingText] = useState(''); // Para el efecto de escritura
  const [isWriting, setIsWriting] = useState(false); // Indica si está escribiendo
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Base de conocimientos de Almita
  const knowledgeBase = {
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
    
    // Cargar datos guardados
    const savedName = localStorage.getItem('almamod_user_name');
    const savedEmail = localStorage.getItem('almamod_user_email');
    const savedPhone = localStorage.getItem('almamod_user_phone');
    
    if (savedName) {
      setUserName(savedName);
      setConversationStep('chat');
    }
    if (savedEmail) setUserEmail(savedEmail);
    if (savedPhone) setUserPhone(savedPhone);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0 && !currentConversationId) {
      // Mensaje de bienvenida según el paso
      setTimeout(async () => {
        if (conversationStep === 'chat' && userName) {
          // Usuario que regresa
          await addBotMessage(`¡Hola de nuevo, ${userName}! 😊 ¿En qué puedo ayudarte hoy?`);
          setShowQuickReplies(true);
        } else {
          // Primera vez - mensaje unificado más natural
          await addBotMessage('¡Hola! Soy Almita, tu asistente virtual de AlmaMod 🏠\n\nAntes de empezar, me encantaría saber tu nombre para poder atenderte mejor. ¿Cómo te llamas?');
          setConversationStep('name');
        }
      }, 500);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const typeWriterEffect = (text, callback) => {
    setIsWriting(true);
    setTypingText('');
    let index = 0;
    
    const typeNextChar = () => {
      if (index < text.length) {
        setTypingText(prev => prev + text.charAt(index));
        index++;
        typingTimeoutRef.current = setTimeout(typeNextChar, 30); // 30ms por carácter
      } else {
        setIsWriting(false);
        setTypingText('');
        if (callback) callback();
      }
    };
    
    typeNextChar();
  };

  const addBotMessage = (text, useTyping = true) => {
    if (useTyping) {
      return new Promise((resolve) => {
        typeWriterEffect(text, () => {
          setMessages(prev => [...prev, {
            id: Date.now(),
            text,
            isBot: true,
            timestamp: new Date()
          }]);
          resolve();
        });
      });
    } else {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text,
        isBot: true,
        timestamp: new Date()
      }]);
      return Promise.resolve();
    }
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

  const handleNameResponse = async (name) => {
    // Guardar nombre
    const cleanName = name.trim();
    setUserName(cleanName);
    localStorage.setItem('almamod_user_name', cleanName);

    await simulateTyping(1200);
    await addBotMessage(`¡Encantada de conocerte, ${cleanName}! 😊\n\n¿Te gustaría que un vendedor de AlmaMod te contacte para brindarte asesoramiento personalizado? Si te interesa, solo necesito tu email y número de teléfono para que puedan comunicarse contigo.\n\n¿Querés dejarnos tus datos?`);

    setConversationStep('contact');
  };

  const handleContactResponse = async (response) => {
    const input = response.toLowerCase();

    // Verificar si es una respuesta afirmativa
    if (input.match(/(sí|si|yes|dale|ok|bueno|claro|por supuesto|quiero|me gustaría)/)) {
      await simulateTyping(1000);
      await addBotMessage('¡Perfecto! 🎉\n\nPor favor, compartíme tu email y número de teléfono. Podés escribirlos juntos, por ejemplo:\n"juan@email.com, 299-1234567"');
      setConversationStep('collecting_contact');
    } else if (input.match(/(no|nope|después|luego|más tarde|ahora no)/)) {
      await simulateTyping(1000);
      await addBotMessage(`¡No hay problema, ${userName}! Podés pedirme que te contacten cuando quieras. Mientras tanto, ¿en qué puedo ayudarte hoy?`);
      setConversationStep('chat');
      setShowQuickReplies(true);
    } else {
      // Si no está claro, asumir que quiere continuar pero volver a preguntar
      await simulateTyping(800);
      await addBotMessage('Perdón, no te entendí bien 😅\n\n¿Querés que un vendedor te contacte? Respondeme "sí" o "no" por favor.');
    }
  };

  const handleCollectingContact = async (contactInfo) => {
    // Intentar extraer email y teléfono
    const emailMatch = contactInfo.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = contactInfo.match(/[\d\s\-\+\(\)]{8,}/);
    
    if (emailMatch || phoneMatch) {
      const email = emailMatch ? emailMatch[0] : '';
      const phone = phoneMatch ? phoneMatch[0].trim() : '';
      
      if (email) {
        setUserEmail(email);
        localStorage.setItem('almamod_user_email', email);
      }
      if (phone) {
        setUserPhone(phone);
        localStorage.setItem('almamod_user_phone', phone);
      }
      
      await simulateTyping(1000);
      const datosRegistrados = [];
      if (email) datosRegistrados.push(`📧 Email: ${email}`);
      if (phone) datosRegistrados.push(`📱 Teléfono: ${phone}`);

      addBotMessage(`¡Excelente, ${userName}! Ya registré tus datos:\n\n${datosRegistrados.join('\n')}`);
      
      // Enviar datos al backend
      const leadData = {
        userName: userName,
        userEmail: email,
        userPhone: phone,
        conversationId: currentConversationId
      };
      
      // Intentar enviar a Netlify Function
      try {
        const response = await fetch('/.netlify/functions/saveLead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(leadData)
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Lead enviado al backend exitosamente:', result);
        } else {
          console.error('❌ Error al enviar lead:', result.message);
          // Guardar localmente como backup
          const localLeads = JSON.parse(localStorage.getItem('almamod_pending_leads') || '[]');
          localLeads.push({ ...leadData, savedAt: new Date().toISOString(), synced: false });
          localStorage.setItem('almamod_pending_leads', JSON.stringify(localLeads));
        }
      } catch (error) {
        console.error('❌ Error de conexión con el backend:', error);
        // Guardar localmente como backup
        const localLeads = JSON.parse(localStorage.getItem('almamod_pending_leads') || '[]');
        localLeads.push({ ...leadData, savedAt: new Date().toISOString(), synced: false });
        localStorage.setItem('almamod_pending_leads', JSON.stringify(localLeads));
        console.log('💾 Lead guardado localmente como backup');
      }
      
      await simulateTyping(1500);
      addBotMessage('¡Listo! 🎉 Un vendedor de AlmaMod se va a contactar con vos muy pronto.\n\nMientras tanto, ¿querés que te cuente algo sobre nuestros módulos?');
      
      setConversationStep('chat');
      setShowQuickReplies(true);
    } else {
      await simulateTyping(800);
      addBotMessage('Mmm, no pude detectar un email o teléfono válido 😅\n\nPor favor, intentá de nuevo siguiendo este formato:\n"mimail@ejemplo.com, 299-1234567"');
    }
  };

  const getResponse = (userInput) => {
    const input = userInput.toLowerCase();

    // Saludos
    if (input.match(/(hola|hello|hi|buenos días|buenas tardes|buenas noches|hey)/)) {
      return userName
        ? `¡Hola ${userName}! 😊 ¿En qué más te puedo ayudar?`
        : '¡Hola! ¿En qué te puedo ayudar?';
    }
    
    // Productos específicos
    for (const [key, response] of Object.entries(knowledgeBase.products)) {
      if (input.includes(key) || input.includes(key.replace(' ', ''))) {
        return userName
          ? `Mirá ${userName}, ${response.toLowerCase().replace(/^./, response[0])}`
          : response;
      }
    }

    // Catálogo
    if (input.match(/(catálogo|catalogo|módulos|modulos|productos|viviendas|casas)/)) {
      const intro = userName ? `Perfecto ${userName}, ` : '¡Dale! ';
      return `${intro}te muestro nuestros 6 modelos:\n\n🏠 MiCasita (12m²) - $15.300.000\n🏠 Alma 18 (18m²) - $32.050.000\n🏠 Alma 27 (27m²) - $42.120.000\n🏠 Alma Loft 28 (28m²) - $38.500.000\n🏠 Alma 36 (36m²) - $50.075.000\n🏠 Alma 36 Refugio (36m²) - $54.800.000\n\nTodos se entregan en 30 días. ¿Te interesa alguno en particular?`;
    }
    
    // Panel SIP
    if (input.match(/(panel|sip|tecnología|tecnologia|construcción|construccion)/)) {
      const intro = userName ? `${userName}, te cuento que ` : '¡Te cuento! ';
      return `${intro}los Paneles SIP (Structural Insulated Panel) son el corazón de nuestra tecnología. Son paneles estructurales térmicos con núcleo aislante de poliestireno expandido y revestimiento OSB.\n\nLas ventajas son increíbles:\n• 50% de ahorro energético\n• 70% menos tiempo de construcción\n• 90% menos residuos\n• Vida útil de 50+ años\n\n¿Querés saber más sobre PROPANEL®?`;
    }

    // PROPANEL
    if (input.match(/(propanel)/)) {
      return `PROPANEL® es nuestro sistema constructivo certificado. Es lo mejor que vas a encontrar en Argentina:\n\n✓ Espesor 9cm\n✓ Transmitancia térmica K=0.28 W/m²K\n✓ Resistencia al fuego Clase B\n✓ Certificación CAT (Ministerio de Desarrollo Territorial)\n✓ Certificación CAS sismorresistente (INPRES)\n\nEs el sistema más avanzado del país. ¿Te interesa conocer más sobre las certificaciones?`;
    }

    // Certificaciones
    if (input.match(/(certificación|certificacion|certificaciones|certificado)/)) {
      return `Tenemos todas las certificaciones oficiales que importan:\n\n🏆 CAT: Certificado de Aptitud Técnica del Ministerio de Desarrollo Territorial. Garantiza calidad estructural y térmica.\n\n🏆 CAS: Certificado Sismorresistente del INPRES. Resistimos movimientos sísmicos de zona 2-4 (fundamental para la Patagonia).\n\n🏆 EDGE Advanced: Certificación internacional del Banco Mundial. Garantizamos más del 40% de reducción energética.\n\n🏆 CACMI: Cámara Argentina de Construcción Modular. Certificación de excelencia en procesos y ética profesional.\n\n¿Querés profundizar en alguna?`;
    }

    // Servicios
    if (input.match(/(servicio|servicios|qué ofrecen|que ofrecen)/)) {
      return `En AlmaMod te ofrecemos soluciones integrales:\n\n1️⃣ Estructura con Paneles SIP PROPANEL®\n2️⃣ Diseño y revestimiento exterior (chapa, siding, EIFS)\n3️⃣ Construcción modular inteligente\n4️⃣ Fabricación en Neuquén adaptada al clima patagónico\n5️⃣ Interiores a medida y llave en mano\n6️⃣ Fundaciones y obras civiles\n\n¿Cuál te interesa conocer más?`;
    }

    // Ventajas
    if (input.match(/(ventaja|ventajas|beneficio|beneficios|por qué|porque)/)) {
      return `Las principales ventajas de construir con AlmaMod son:\n\n⚡ Eficiencia energética superior (50% ahorro en climatización)\n⏱️ Construcción rápida (70% más rápida que tradicional)\n🌱 Sustentabilidad (90% menos residuos)\n💪 Durabilidad (50+ años de vida útil)\n📜 Certificaciones oficiales\n🏔️ Resistencia climática patagónica\n🌬️ Calidad de aire interior superior\n\n¿Querés que te cuente más sobre alguna?`;
    }

    // Precios
    if (input.match(/(precio|precios|costo|costos|cuánto|cuanto|valor)/)) {
      return `Nuestros módulos van desde $15.300.000 (MiCasita 12m²) hasta $54.800.000 (Alma 36 Refugio).\n\nTodos incluyen:\n✓ Estructura completa\n✓ Paneles SIP PROPANEL®\n✓ Aberturas con DVH\n✓ Instalaciones completas\n✓ Baño equipado\n✓ Cocina amoblada\n✓ Pisos vinílicos\n\nEntrega en 30 días. ¿Te interesa algún modelo específico?`;
    }

    // Financiación
    if (input.match(/(financiación|financiacion|cuota|cuotas|pago|pagos|crédito|credito)/)) {
      return `Trabajamos con diferentes opciones de financiación y también aceptamos permuta por terrenos o vehículos.\n\n¿Querés que te contactemos para analizar tu caso particular y ver qué opciones tenés disponibles?`;
    }

    // Proceso
    if (input.match(/(proceso|cómo funciona|como funciona|paso|pasos|etapa|etapas)/)) {
      return `Nuestro proceso es súper simple:\n\n1️⃣ Consulta inicial gratuita\n2️⃣ Diseño personalizado según tus necesidades\n3️⃣ Presupuesto detallado\n4️⃣ Fabricación en nuestro taller en Neuquén (30 días)\n5️⃣ Transporte e instalación\n6️⃣ Entrega llave en mano\n\nTodo con seguimiento constante. ¿En qué etapa te gustaría empezar?`;
    }

    // Ubicación
    if (input.match(/(ubicación|ubicacion|dónde|donde|dirección|direccion)/)) {
      return `Estamos en Neuquén, Argentina. Fabricamos localmente para adaptarnos al clima patagónico.\n\nEntregamos en toda la Patagonia: Neuquén, Río Negro, Chubut, Santa Cruz y Tierra del Fuego. También vendemos a otras provincias.\n\n¿En qué zona estás vos?`;
    }

    // Sustentabilidad
    if (input.match(/(sustentable|sustentabilidad|ecológico|ecologico|verde|medio ambiente)/)) {
      return `La sustentabilidad es nuestro ADN 💚\n\n🌍 Certificación EDGE Advanced (Banco Mundial)\n♻️ Reducción 90% residuos de obra\n⚡ Ahorro 50% energía climatización\n🌱 Materiales reciclables\n👣 Menor huella de carbono\n💧 Construcción en seco (ahorro de agua)\n\nSomos construcción verde certificada. ¿Te importa el medio ambiente?`;
    }

    // Contacto
    if (input.match(/(contacto|contactar|teléfono|telefono|email|mail|whatsapp)/)) {
      return `Podés contactarnos por:\n\n📱 WhatsApp: +54 9 299 408 7106\n📧 Email: info@almamod.com.ar\n📍 Ubicación: Neuquén, Argentina\n🌐 Web: www.almamod.com.ar\n\nO directamente desde este chat. ¿Cómo preferís que te contactemos?`;
    }

    // Visita
    if (input.match(/(visita|visitar|ver|conocer|taller|showroom)/)) {
      return `¡Nos encantaría que vengas! Podés agendar una visita a nuestro taller en Neuquén para ver los módulos en vivo y conocer todo el proceso de fabricación.\n\nTambién hacemos videollamadas para mostrarte todo virtualmente si preferís. ¿Qué te resulta mejor, presencial o virtual?`;
    }

    // Respuesta por defecto
    const intro = userName ? `${userName}, ` : '';
    return `${intro}perdón, no estoy segura de haber entendido tu pregunta 😅\n\n¿Podrías reformularla? También podés usar las respuestas rápidas de abajo para navegar por los temas principales.`;
  };

  const handleSendMessage = async (customMessage = null) => {
    const messageText = customMessage || inputValue.trim();
    if (!messageText) return;

    addUserMessage(messageText);
    setInputValue('');
    setShowQuickReplies(false);

    await simulateTyping();

    // Manejar según el paso de la conversación
    if (conversationStep === 'name') {
      await handleNameResponse(messageText);
    } else if (conversationStep === 'contact') {
      await handleContactResponse(messageText);
    } else if (conversationStep === 'collecting_contact') {
      await handleCollectingContact(messageText);
    } else {
      // Conversación normal
      const response = getResponse(messageText);
      await addBotMessage(response);

      // Mostrar respuestas rápidas después de responder
      setTimeout(() => {
        setShowQuickReplies(true);
      }, 500);
    }

    // Auto-guardar conversación
    saveCurrentConversation();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickReply = async (reply) => {
    addUserMessage(reply.text);
    setShowQuickReplies(false);

    await simulateTyping();

    const response = getResponse(reply.text);
    await addBotMessage(response);

    // Mostrar respuestas rápidas después de responder
    setTimeout(() => {
      setShowQuickReplies(true);
    }, 500);

    saveCurrentConversation();
  };

  const saveCurrentConversation = () => {
    if (messages.length === 0) return;

    const conversationData = {
      id: currentConversationId || Date.now(),
      title: userName ? `Chat con ${userName}` : messages[1]?.text.substring(0, 30) + '...' || 'Nueva conversación',
      messages: messages,
      lastUpdate: new Date(),
      userName: userName,
      userEmail: userEmail,
      userPhone: userPhone
    };

    const updatedConversations = currentConversationId
      ? conversations.map(conv => conv.id === currentConversationId ? conversationData : conv)
      : [...conversations, conversationData];

    setConversations(updatedConversations);
    localStorage.setItem('almamod_conversations', JSON.stringify(updatedConversations));
    
    if (!currentConversationId) {
      setCurrentConversationId(conversationData.id);
    }
  };

  const loadConversation = (conversation) => {
    setMessages(conversation.messages);
    setCurrentConversationId(conversation.id);
    setUserName(conversation.userName || '');
    setUserEmail(conversation.userEmail || '');
    setUserPhone(conversation.userPhone || '');
    setConversationStep('chat');
    setShowConversations(false);
    setShowQuickReplies(false);
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setShowConversations(false);
    setShowQuickReplies(false);
    setConversationStep('initial');
    
    // Iniciar nueva conversación
    setTimeout(() => {
      addBotMessage('¡Hola! Soy Almita, tu asistente virtual de AlmaMod 🏠\n\nAntes de empezar, me encantaría saber tu nombre para poder atenderte mejor. ¿Cómo te llamas?');
      setConversationStep('name');
    }, 300);
  };

  const deleteConversation = (conversationId) => {
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);
    localStorage.setItem('almamod_conversations', JSON.stringify(updatedConversations));
    
    if (currentConversationId === conversationId) {
      startNewConversation();
    }
  };

  const closeChat = () => {
    saveCurrentConversation();
    setIsOpen(false);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Botón flotante del chat - Reposicionado debajo del logo */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`almamod-chat-button almamod-chat-button-icon ${isOpen ? 'open' : ''}`}
        style={{
          // Posicionamiento controlado por CSS (aichatbot.css)
          borderRadius: '50%',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              style={{ width: '24px', height: '24px' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              style={{ width: '24px', height: '24px' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Ventana del chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="almamod-chat-window almamod-chat-window-bg"
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            drag                     // 👈 permite arrastrar
            dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }} // 👈 limita al viewport
            dragElastic={0.2}        // 👈 da un poco de "rebote" al mover
            style={{
              // Posicionamiento controlado por CSS (aichatbot.css)
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              cursor: 'move' // 👈 cambia el cursor al arrastrar
            }}
          >
            {/* Header */}
            <div className="almamod-chat-header" style={{
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="almamod-avatar-bot" style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}>
                  A
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Almita</h3>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Asistente Virtual AlmaMod</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <motion.button
                  onClick={() => setShowConversations(!showConversations)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px',
                    cursor: 'pointer',
                    color: '#1a1a2e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </motion.button>
                <motion.button
                  onClick={startNewConversation}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px',
                    cursor: 'pointer',
                    color: '#1a1a2e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Panel de conversaciones */}
            <AnimatePresence>
              {showConversations && (
                <motion.div
                  style={{
                    position: 'absolute',
                    top: '72px',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#16213e',
                    zIndex: 10,
                    padding: '16px',
                    overflowY: 'auto'
                  }}
                  initial={{ x: -400 }}
                  animate={{ x: 0 }}
                  exit={{ x: -400 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <h3 style={{ color: '#e5e7eb', marginBottom: '16px', fontSize: '16px' }}>
                    Conversaciones guardadas
                  </h3>
                  {conversations.length === 0 ? (
                    <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                      No hay conversaciones guardadas
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {conversations.map(conv => (
                        <motion.div
                          key={conv.id}
                          style={{
                            backgroundColor: currentConversationId === conv.id ? 'rgba(212, 165, 116, 0.2)' : 'rgba(255,255,255,0.05)',
                            padding: '12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            border: currentConversationId === conv.id ? '1px solid #d4a574' : '1px solid transparent',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          whileHover={{ backgroundColor: 'rgba(212, 165, 116, 0.15)' }}
                          onClick={() => loadConversation(conv)}
                        >
                          <div style={{ flex: 1 }}>
                            <p style={{ color: '#e5e7eb', fontSize: '14px', margin: 0, fontWeight: 500 }}>
                              {conv.title}
                            </p>
                            <p style={{ color: '#9ca3af', fontSize: '12px', margin: '4px 0 0 0' }}>
                              {new Date(conv.lastUpdate).toLocaleDateString('es-AR')}
                            </p>
                          </div>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv.id);
                            }}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#dc2626',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mensajes */}
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
                    justifyContent: message.isBot ? 'flex-start' : 'flex-end',
                    alignItems: 'flex-end',
                    gap: '8px'
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {message.isBot && (
                    <div className="almamod-avatar-bot" style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      flexShrink: 0
                    }}>
                      A
                    </div>
                  )}
                  <div style={{
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div className={message.isBot ? 'almamod-message-bot' : 'almamod-message-user'} style={{
                      padding: '12px 16px',
                      borderRadius: message.isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {message.text}
                    </div>
                    <span className="almamod-message-timestamp" style={{
                      fontSize: '10px',
                      alignSelf: message.isBot ? 'flex-start' : 'flex-end'
                    }}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-end',
                    gap: '8px'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="almamod-avatar-bot" style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    A
                  </div>
                  <div className="almamod-typing-indicator" style={{
                    padding: '12px 16px',
                    borderRadius: '16px 16px 16px 4px',
                    display: 'flex',
                    gap: '4px'
                  }}>
                    <div className="almamod-typing-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', animation: 'bounce 1.4s infinite' }}></div>
                    <div className="almamod-typing-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', animation: 'bounce 1.4s infinite 0.2s' }}></div>
                    <div className="almamod-typing-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', animation: 'bounce 1.4s infinite 0.4s' }}></div>
                  </div>
                </motion.div>
              )}

              {/* Quick replies */}
              {showQuickReplies && (
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
                        className="almamod-quick-reply-btn"
                        style={{
                          padding: '8px',
                          fontSize: '12px',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
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
                  className="almamod-chat-input"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <motion.button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  className="almamod-chat-send-btn"
                  style={{
                    padding: '12px 16px',
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