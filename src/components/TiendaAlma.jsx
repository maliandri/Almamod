import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './TiendaAlma.css';

// ✅ IMPORTAR SEO
import SEO from './SEO';
import { PAGES, PRODUCTS, generateProductSchema, generateBreadcrumbSchema, combineSchemas } from '../seo';

// ✅ IMPORTAR CLOUDINARY
import { getCloudinaryUrl, getVideoUrl, IMG_CARD, IMG_DETAIL, IMG_THUMB } from '../config/cloudinary';

const StoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

// Generar slug para URLs
const generarSlug = (nombre) => {
  return nombre.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

// ✅ DATOS DE LOS MÓDULOS CON NOMBRES REALES DE CLOUDINARY + CASOS DE USO Y KEYWORDS
const modulosData = [
  {
    id: 'micasita',
    nombre: 'MiCasita',
    slug: 'micasita',
    superficie: '12 m²',
    dimensiones: '4.88m × 2.44m',
    habitaciones: 'Monoambiente',
    precio: 17900000,
    incluye: [
      'Inodoro con depósito y bidet: Italiana',
      'Griferías bidet, vanitory, ducha, bacha cocina: Hidromet',
      'Vanitory: en MDF',
      'Receptáculo de ducha: 70x70cm con mampara',
      'Mesada en mármol sintético y bajo mesada en MDF',
      'Puertas interior: placa con marco de aluminio',
      'Instalación eléctrica con cables normalizados 6mm a 1.5mm, plafones led o lámparas led a elección',
      'Instalación agua con caños de termofusión y termotanque eléctrico 40 lts',
      'Instalación cloacal con caños junta o-ring',
    ],
    plazo: '30 días',
    imagenPortada: 'ALMAMOD_MICASITA_PORTADA.webp',
    coloresVariantes: {
      negro: 'MI_CASITA_NEGRO.webp',
      gris:  'MI_CASITA_GRIS_REVEAR.webp',
    },
    imagenesDetalle: [
      'ALMAMOD_MICASITA_PORTADA.webp',
      'ALMAMOD_MICASITA_1.webp',
      'ALMAMOD_MICASITA_PLANIMETRIA.webp'
    ],
    video: 'VIDEO_MI_CASITA_VERTICAL.mp4',
    descripcion: 'Compacto, funcional y accesible. El MICASITA es un módulo monoambiente ideal para una persona sola o una pareja joven que busca independencia, practicidad y confort en pocos metros. Posee un valor muy accesible. Su diseño compacto lo convierte en una solución versátil y económica, ya sea como primera vivienda, espacio de trabajo o cabaña de descanso. Ampliable: puede crecer a futuro con nuevos módulos de 12 m² (4,88 x 2,44) o 6 m² (2,44 x 2,44).',
    
    // ✅ NUEVO: Casos de uso (Keywords long-tail)
    casosDeUso: [
      {
        titulo: 'Primera Vivienda para Jóvenes',
        descripcion: 'Solución habitacional económica perfecta para tu primera casa propia. A $17.900.000, es la vivienda modular más accesible de Neuquén.',
        keywords: ['primera vivienda joven', 'casa economica neuquen', 'vivienda accesible']
      },
      {
        titulo: 'Oficina Home Office',
        descripcion: 'Espacio independiente para trabajo remoto en tu terreno. Ideal para profesionales freelance, diseñadores, programadores o teletrabajo.',
        keywords: ['oficina modular', 'home office', 'espacio trabajo remoto']
      },
      {
        titulo: 'Habitación Adicional',
        descripcion: 'Ampliá tu vivienda existente sin obra. Perfecto como dormitorio de visitas, estudio o espacio independiente para adolescentes.',
        keywords: ['habitacion adicional', 'ampliacion vivienda', 'modulo independiente']
      },
      {
        titulo: 'Inversión para Alquiler',
        descripcion: 'ROI rápido con alquileres a estudiantes o turistas. Recuperá tu inversión en 3-4 años con alquileres temporarios.',
        keywords: ['inversion inmobiliaria', 'modulo alquiler', 'airbnb economico']
      }
    ],
    
    // ✅ NUEVO: Ventajas específicas con keywords
    ventajas: [
      'Precio más económico del mercado: $17.900.000',
      'Entrega garantizada en 30 días',
      'Construcción modular sin escombros',
      'Ahorro energético del 40% con Paneles SIP',
      'Transportable a cualquier terreno',
      'Ampliable con módulos adicionales'
    ],
    
    // ✅ NUEVO: Keywords para SEO
    keywordsPrincipales: [
      'modulo habitacional 12m2',
      'primera vivienda economica',
      'casa modular mas barata',
      'oficina prefabricada',
      'monoambiente modular precio'
    ],
    
    especificacionesTecnicas: {
      construccion: [
        { titulo: 'Estructura piso', detalle: 'Panel SIP PROPANEL 9cm, pintado en la cara inferior con pintura asfáltica.' },
        { titulo: 'Muros', detalle: 'Panel SIP PROPANEL 9cm.' },
        { titulo: 'Techo', detalle: 'Panel SIP Cielorraso PROPANEL 9cm sobre tirantes de pino y terminado en cubierta con chapa trapezoidal negra y zinguerías de cierre de chapa negra.' },
        { titulo: 'Revestimiento de muros exterior', detalle: 'Siding vertical 8mm, pintado látex exterior.' },
        { titulo: 'Revestimiento de muros interior', detalle: 'Osb o fenólico Machimplak achimbre barnizados.' },
        { titulo: 'Terminación piso interior', detalle: 'Osb impermeabilizado con Cétol.' },
        { titulo: 'Terminación cielorraso', detalle: 'Machinplak barnizado color madera o látex blanco.' },
        { titulo: 'Aberturas', detalle: 'Puerta en chapa inyectada y ventanas de aluminio negro, con vidrio simple.' },
        { titulo: 'Revestimientos de baño', detalle: 'Placas PVC símil mármol a elección.' },
        { titulo: 'Revestimientos de cocina', detalle: 'Placas PVC símil mármol a elección.' },
        { titulo: 'Instalación eléctrica', detalle: 'Instalación eléctrica con cables normalizados desde 6 mm a 1.5 mm.' },
        { titulo: 'Instalación de agua', detalle: 'Por cañería termofusión.' },
        { titulo: 'Instalación de desagüe', detalle: 'Sistema cloacal de cañerías con o-ring.' }
      ],
      equipamiento: [
        { titulo: 'Inodoro con depósito y bidet', detalle: 'Italiana.' },
        { titulo: 'Griferías bidet, vanitory, ducha, bacha cocina', detalle: 'Hidromet.' },
        { titulo: 'Vanitory', detalle: 'En MDF.' },
        { titulo: 'Receptáculo de ducha', detalle: '70x70cm con mampara.' },
        { titulo: 'Mesada y Bajo mesada', detalle: 'Mesada en mármol sintético y bajo mesada en MDF.' },
        { titulo: 'Puertas interior', detalle: 'Placa con marco de aluminio.' },
        { titulo: 'Instalación eléctrica', detalle: 'Cables normalizados desde 6 mm a 1.5 mm, plafones led o lámparas led a elección.' },
        { titulo: 'Instalación agua', detalle: 'Caños de termofusión y termotanque eléctrico de 40 lts.' },
        { titulo: 'Instalación cloacal', detalle: 'Caños junta o-ring.' }
      ]
    },
    
    // ✅ NUEVO: FAQ específico del producto
    faqProducto: [
      {
        pregunta: '¿Cuánto cuesta MiCasita?',
        respuesta: 'MiCasita cuesta $17.900.000 llave en mano, siendo la opción más económica de vivienda modular en Neuquén. Incluye todo lo necesario para habitar.'
      },
      {
        pregunta: '¿Se puede usar como primera vivienda?',
        respuesta: 'Sí, MiCasita es ideal como primera vivienda económica. Cumple con todos los requisitos habitacionales y municipales para vivienda permanente.'
      },
      {
        pregunta: '¿Sirve como oficina home office?',
        respuesta: 'Perfecta para home office. Espacio independiente, bien iluminado, con instalación eléctrica completa para computadoras y equipamiento de trabajo.'
      },
      {
        pregunta: '¿Cuánto tarda la construcción?',
        respuesta: 'Entrega garantizada en 30 días desde el inicio de obra. Es 5 veces más rápida que construcción tradicional.'
      },
      {
        pregunta: '¿Se puede ampliar después?',
        respuesta: 'Sí, MiCasita es ampliable. Podés agregar módulos adicionales en el futuro según tus necesidades.'
      }
    ]
  },
  {
    id: 'almamod18',
    nombre: 'Alma 18',
    slug: 'alma-18',
    superficie: '18 m²',
    dimensiones: '6m × 3m',
    habitaciones: 'Monoambiente',
    precio: 39850000,
    incluye: [
      'Cocina eléctrica o gas con extractor',
      'Aire acondicionado frío-calor inverter 3000w',
      'Termotanque 55 litros eléctrico o gas',
      'Inodoro con depósito: Ferrúm Bari',
      'Bidet: Ferrúm Bari',
      'Griferías bidet, vanitory, ducha, bacha cocina: Fv Puelo',
      'Vanitory: en MDF',
      'Receptáculo de ducha: 120x70cm con mampara',
      'Mesada en cuarzo o granito y bajo mesada en MDF',
      'Puertas interior: Oblak Practika',
    ],
    plazo: '30 días',
    imagenPortada: 'ALMAMOD_18_PORTADA.webp',
    coloresVariantes: {
      negro: 'ALMAMOD_18_NEGRO.webp',
      gris:  'ALMAMOD_18_GRIS_REVEAR.webp',
    },
    imagenesDetalle: [
      'ALMAMOD_18_PORTADA.webp',
      'ALMAMOD_18_RENDER_EXTERIOR.webp',
      'ALMAMOD_18_PLANIMETRÍA.webp',
      'ALMAMOD_18_PLANIMETRÍA_MOD.webp'
    ],
    descripcion: 'Casa modular compacta de 18m² tipo monoambiente. Ideal para parejas, personas solas o como cabaña turística rentable. Construcción rápida llave en mano.',
    
    casosDeUso: [
      {
        titulo: 'Vivienda para Parejas',
        descripcion: 'Casa completa con dormitorio independiente, baño y cocina-comedor. Perfecta para parejas jóvenes que buscan su primera vivienda.',
        keywords: ['casa para pareja', 'vivienda compacta', 'casa 1 dormitorio']
      },
      {
        titulo: 'Cabaña Turística / Airbnb',
        descripcion: 'Inversión rentable para alquiler turístico. ROI en 3-4 años con alquileres de temporada en zonas andinas.',
        keywords: ['cabaña turistica', 'airbnb modular', 'inversion turismo']
      },
      {
        titulo: 'Casa de Fin de Semana',
        descripcion: 'Refugio perfecto para escapadas al campo o montaña. Confort completo en espacio optimizado.',
        keywords: ['casa campo', 'casa fin de semana', 'refugio montaña']
      },
      {
        titulo: 'Vivienda Individual',
        descripcion: 'Solución ideal para personas solas que buscan independencia y comodidad en espacio eficiente.',
        keywords: ['vivienda individual', 'casa persona sola', 'vivienda independiente']
      }
    ],
    
    ventajas: [
      'Dormitorio separado del área social',
      'Cocina-comedor amplia',
      'Baño completo con ducha 120x70cm',
      'Diseño optimizado para confort',
      'Precio excelente: $39.850.000',
      'Llave en mano en 30 días'
    ],
    
    keywordsPrincipales: [
      'casa modular 18m2',
      'vivienda 1 dormitorio precio',
      'cabaña modular pareja',
      'casa compacta neuquen',
      'vivienda modular pequeña'
    ],
    
    especificacionesTecnicas: {
      construccion: [
        { titulo: 'Patín', detalle: 'Armado con perfil UPN 120mm y caño estructural, pintado con esmalte sintético 3 en 1 color negro.' },
        { titulo: 'Estructura piso', detalle: 'Panel SIP PROPANEL 9cm, pintado en la cara inferior con pintura asfáltica.' },
        { titulo: 'Muros', detalle: 'Panel SIP PROPANEL 9cm.' },
        { titulo: 'Techo', detalle: 'Panel SIP cielorraso PROPANEL 9cm sobre tirantes de pino y terminado en cubierta con chapa trapezoidal negra y zinguerías de cierre de chapa negra.' },
        { titulo: 'Revestimiento de muros exterior', detalle: 'machimbre de 1era calidad protegido contra rayos UV humedad y corrosión o siding horizontal/vertical 6mm, pintado símil madera o látex exterior.' },
        { titulo: 'Revestimiento de muros interior', detalle: 'machimbre de 1era calidad barnizado o placas de yeso con junta tomada y pintura látex lavable.' },
        { titulo: 'Terminación piso interior', detalle: 'Pisos vinílicos SPC de alto tránsito 5.5 mm.' },
        { titulo: 'Terminación interior techo', detalle: 'Panel de cielorraso laqueado color madera o sintético blanco.' },
        { titulo: 'Aberturas', detalle: 'Puerta y ventanas de aluminio negro, con vidrio DVH.' },
        { titulo: 'Revestimientos de baño', detalle: 'placas PVC símil mármol a elección' },
        { titulo: 'Revestimientos de cocina', detalle: 'placas PVC símil mármol a elección' },
        { titulo: 'Instalación eléctrica', detalle: 'Instalación eléctrica con cables normalizados desde 6 mm a 1.5 mm.' },
        { titulo: 'Instalación de agua', detalle: 'Por cañería termofusión.' },
        { titulo: 'Instalación de desagüe', detalle: 'sistema cloacal de cañerías con o-ring.' }
      ],
      equipamiento: [
        { titulo: 'Inodoro con depósito', detalle: 'Ferrúm Bari.' },
        { titulo: 'Bidet', detalle: 'Ferrúm Bari.' },
        { titulo: 'Griferías bidet, vanitory, ducha, bacha cocina', detalle: 'Fv Puelo.' },
        { titulo: 'Vanitory', detalle: 'en MDF.' },
        { titulo: 'Receptáculo de ducha', detalle: '120x70cm con mampara.' },
        { titulo: 'Mesada y Bajo mesada', detalle: 'Mesada en mármol sintético y bajo mesada en MDF.' },
        { titulo: 'Puertas interior', detalle: 'Oblak Practika' }
      ]
    },
    
    faqProducto: [
      {
        pregunta: '¿Cuánto cuesta Alma 18?',
        respuesta: 'Alma 18 cuesta $39.850.000 llave en mano. Incluye dormitorio separado, baño completo y cocina-comedor equipada.'
      },
      {
        pregunta: '¿Es suficiente para una pareja?',
        respuesta: 'Sí, Alma 18 es perfecta para parejas. Tiene dormitorio independiente, baño completo y área social integrada optimizada.'
      },
      {
        pregunta: '¿Sirve como cabaña turística?',
        respuesta: 'Excelente para inversión turística. Tamaño ideal para alquiler Airbnb en zonas cordilleranas. ROI en 3-4 años.'
      },
      {
        pregunta: '¿Tiene cocina completa?',
        respuesta: 'Sí, incluye mesada con bajomesada, bacha con grifería y espacio para cocina/anafe. Cocina-comedor integrada.'
      }
    ]
  },
  {
    id: 'almamod27',
    nombre: 'Alma 27',
    slug: 'alma-27',
    superficie: '27 m²',
    dimensiones: '9m × 3m',
    habitaciones: '1 dormitorio',
    precio: 52000000,
    incluye: [
      'Inodoro con depósito: Ferrúm Bari',
      'Bidet: Ferrúm Bari',
      'Griferías bidet, vanitory, ducha, bacha cocina: Fv Puelo',
      'Vanitory: en MDF',
      'Receptáculo de ducha: 120x70cm con mampara',
      'Mesada en mármol sintético y bajo mesada en MDF',
      'Puertas interior: Oblak Practika',
    ],
    plazo: '40 días',
    imagenPortada: 'ALMAMOD_27_PORTADA.webp',
    coloresVariantes: {
      negro: 'ALMAMOD_27_NEGRO.webp',
      gris:  'ALMAMOD_27_GRIS_REVEAR.webp',
    },
    imagenesDetalle: [
      'ALMAMOD_27_PORTADA.webp',
      'ALMAMOD_27_1.webp',
      'ALMAMOD_27_RENDER_EXTERIOR.webp',
      'ALMAMOD_27_PLANIMETRÍA.webp'
    ],
    descripcion: 'Vivienda modular de 27m² con ambientes separados. Dormitorio independiente, living-comedor amplio y cocina completa. Ideal para familias pequeñas o parejas que buscan mayor confort.',
    
    casosDeUso: [
      {
        titulo: 'Familia Pequeña (2-3 personas)',
        descripcion: 'Vivienda cómoda con ambientes bien definidos. Living-comedor separado permite vida familiar confortable.',
        keywords: ['casa familiar pequeña', 'vivienda 3 personas', 'casa familia compacta']
      },
      {
        titulo: 'Pareja con Hijo',
        descripcion: 'Distribución inteligente con dormitorio principal amplio y posibilidad de cuna o cama adicional.',
        keywords: ['casa pareja con hijo', 'vivienda familiar', 'casa 27 metros']
      },
      {
        titulo: 'Vivienda Permanente Cómoda',
        descripcion: 'Casa completa para uso diario. Ambientes independientes brindan privacidad y confort.',
        keywords: ['vivienda permanente', 'casa habitable', 'vivienda confortable']
      },
      {
        titulo: 'Casa de Campo Amplia',
        descripcion: 'Refugio espacioso para fines de semana. Mayor comodidad que modelos compactos.',
        keywords: ['casa campo amplia', 'casa fin semana', 'refugio confortable']
      }
    ],
    
    ventajas: [
      'Ambientes totalmente separados',
      'Living-comedor independiente',
      'Dormitorio amplio',
      'Cocina con espacio de guardado',
      'Mayor privacidad entre espacios',
      '40% más espacio que Alma 18'
    ],
    
    keywordsPrincipales: [
      'casa modular 27m2',
      'vivienda ambientes separados',
      'casa familiar compacta',
      'vivienda confortable precio',
      'casa 1 dormitorio amplio'
    ],
    
    especificacionesTecnicas: {
      construccion: [
        { titulo: 'Patín', detalle: 'Armado con perfil UPN 120mm y caño estructural, pintado con esmalte sintético 3 en 1 color negro.' },
        { titulo: 'Estructura piso', detalle: 'Panel SIP PROPANEL 9cm, pintado en la cara inferior con pintura asfáltica.' },
        { titulo: 'Muros', detalle: 'Panel SIP PROPANEL 9cm.' },
        { titulo: 'Techo', detalle: 'Panel SIP cielorraso PROPANEL 9cm sobre tirantes de pino y terminado en cubierta con chapa trapezoidal negra y zinguerías de cierre de chapa negra.' },
        { titulo: 'Revestimiento de muros exterior', detalle: 'machimbre de 1era calidad protegido contra rayos UV humedad y corrosión o siding horizontal/vertical 6mm, pintado símil madera o látex exterior.' },
        { titulo: 'Revestimiento de muros interior', detalle: 'machimbre de 1era calidad barnizado o placas de yeso con junta tomada y pintura látex lavable.' },
        { titulo: 'Terminación piso interior', detalle: 'Pisos vinílicos SPC de alto tránsito 5.5 mm.' },
        { titulo: 'Terminación interior techo', detalle: 'Panel de cielorraso laqueado color madera o sintético blanco.' },
        { titulo: 'Aberturas', detalle: 'Puerta y ventanas de aluminio negro, con vidrio DVH.' },
        { titulo: 'Revestimientos de baño', detalle: 'placas PVC símil mármol a elección' },
        { titulo: 'Revestimientos de cocina', detalle: 'placas PVC símil mármol a elección' },
        { titulo: 'Instalación eléctrica', detalle: 'Instalación eléctrica con cables normalizados desde 6 mm a 1.5 mm.' },
        { titulo: 'Instalación de agua', detalle: 'Por cañería termofusión.' },
        { titulo: 'Instalación de desagüe', detalle: 'sistema cloacal de cañerías con o-ring.' }
      ],
      equipamiento: [
        { titulo: 'Inodoro con depósito', detalle: 'Ferrúm Bari.' },
        { titulo: 'Bidet', detalle: 'Ferrúm Bari.' },
        { titulo: 'Griferías bidet, vanitory, ducha, bacha cocina', detalle: 'Fv Puelo.' },
        { titulo: 'Vanitory', detalle: 'en MDF.' },
        { titulo: 'Receptáculo de ducha', detalle: '120x70cm con mampara.' },
        { titulo: 'Mesada y Bajo mesada', detalle: 'Mesada en mármol sintético y bajo mesada en MDF.' },
        { titulo: 'Puertas interior', detalle: 'Oblak Practika' }
      ]
    },
    
    faqProducto: [
      {
        pregunta: '¿Cuánto cuesta Alma 27?',
        respuesta: 'Alma 27 cuesta $52.000.000 llave en mano. Incluye ambientes separados: dormitorio, living-comedor, cocina y baño.'
      },
      {
        pregunta: '¿Alcanza para una familia de 3 personas?',
        respuesta: 'Sí, Alma 27 es perfecta para familias pequeñas o pareja con un hijo. Los 27m² están muy bien distribuidos.'
      },
      {
        pregunta: '¿Cuál es la diferencia con Alma 18?',
        respuesta: 'Alma 27 tiene 9m² más (50% más grande), con living-comedor separado y dormitorio más amplio. Mayor confort para uso diario.'
      }
    ]
  },
  {
    id: 'almamodloft28',
    nombre: 'Alma Loft 28',
    slug: 'alma-loft-28',
    superficie: '28 m²',
    dimensiones: '7m × 3m (21m² planta baja + 7m² entrepiso)',
    habitaciones: 'Loft con entrepiso',
    precio: 52000000,
    incluye: [
      'Cocina eléctrica o gas con extractor',
      'Aire acondicionado frío-calor inverter 3000w',
      'Termotanque 55 litros eléctrico o gas',
      'Inodoro con depósito: Ferrúm Bari',
      'Bidet: Ferrúm Bari',
      'Griferías bidet, vanitory, ducha, bacha cocina: Fv Puelo',
      'Vanitory: en MDF',
      'Receptáculo de ducha: 120x70cm con mampara',
      'Mesada en cuarzo o granito y bajo mesada en MDF',
      'Puertas interior: Oblak Practika',
    ],
    plazo: '40 días',
    imagenPortada: 'ALMAMOD_28_LOFT_PORTADA.webp',
    imagenesDetalle: [
      'ALMAMOD_28_LOFT_PORTADA.webp',
      'ALMAMOD_28_LOFT_RENDER_EXTERIOR.webp',
      'ALMAMOD_28_LOFT_RENDER_INTERIOR.webp'
    ],
    descripcion: 'Vivienda modular tipo loft de 28m² con entrepiso para dormitorio. Diseño moderno y juvenil con doble altura. Perfecta para espacios creativos, estudios profesionales o vivienda contemporánea.',
    
    casosDeUso: [
      {
        titulo: 'Jóvenes con Estilo Contemporáneo',
        descripcion: 'Diseño loft moderno ideal para jóvenes que buscan un espacio diferente y con personalidad.',
        keywords: ['loft modular', 'casa estilo loft', 'vivienda juvenil moderna']
      },
      {
        titulo: 'Estudios Creativos / Arquitectura',
        descripcion: 'Espacio con doble altura perfecto para estudios de arquitectura, diseño, fotografía o creativos.',
        keywords: ['estudio diseño', 'oficina arquitectura', 'espacio creativo']
      },
      {
        titulo: 'Vivienda Urbana Moderna',
        descripcion: 'Estética industrial-moderna para quienes buscan un hogar con diseño vanguardista.',
        keywords: ['vivienda moderna', 'casa diseño contemporaneo', 'loft urbano']
      },
      {
        titulo: 'Oficina-Vivienda Combinada',
        descripcion: 'Planta baja para trabajo y entrepiso para descanso. Ideal para freelancers.',
        keywords: ['oficina vivienda', 'loft home office', 'vivienda trabajo']
      }
    ],
    
    ventajas: [
      'Diseño tipo loft con doble altura',
      'Entrepiso para dormitorio privado',
      'Estética moderna y juvenil',
      'Aprovechamiento vertical del espacio',
      'Precio competitivo: $52.000.000',
      'Sensación de amplitud'
    ],
    
    keywordsPrincipales: [
      'loft modular precio',
      'casa tipo loft',
      'vivienda entrepiso',
      'loft moderno neuquen',
      'casa doble altura'
    ],
    
    especificacionesTecnicas: {
      construccion: [
        { titulo: 'Patín', detalle: 'Armado con perfil UPN 120mm y caño estructural, pintado con esmalte sintético 3 en 1 color negro.' },
        { titulo: 'Estructura piso', detalle: 'Panel SIP PROPANEL 9cm, pintado en la cara inferior con pintura asfáltica.' },
        { titulo: 'Muros', detalle: 'Panel SIP PROPANEL 9cm.' },
        { titulo: 'Techo', detalle: 'Panel SIP cielorraso PROPANEL 9cm sobre tirantes de pino y terminado en cubierta con chapa trapezoidal negra y zinguerías de cierre de chapa negra.' },
        { titulo: 'Revestimiento de muros exterior', detalle: 'machimbre de 1era calidad protegido contra rayos UV humedad y corrosión o siding horizontal/vertical 6mm, pintado símil madera o látex exterior.' },
        { titulo: 'Revestimiento de muros interior', detalle: 'machimbre de 1era calidad barnizado o placas de yeso con junta tomada y pintura látex lavable.' },
        { titulo: 'Terminación piso interior', detalle: 'Pisos vinílicos SPC de alto tránsito 5.5 mm.' },
        { titulo: 'Terminación interior techo', detalle: 'Panel de cielorraso laqueado color madera o sintético blanco.' },
        { titulo: 'Aberturas', detalle: 'Puerta y ventanas de aluminio negro, con vidrio DVH.' },
        { titulo: 'Revestimientos de baño', detalle: 'placas PVC símil mármol a elección' },
        { titulo: 'Revestimientos de cocina', detalle: 'placas PVC símil mármol a elección' },
        { titulo: 'Instalación eléctrica', detalle: 'Instalación eléctrica con cables normalizados desde 6 mm a 1.5 mm.' },
        { titulo: 'Instalación de agua', detalle: 'Por cañería termofusión.' },
        { titulo: 'Instalación de desagüe', detalle: 'sistema cloacal de cañerías con o-ring.' }
      ],
      equipamiento: [
        { titulo: 'Inodoro con depósito', detalle: 'Ferrúm Bari.' },
        { titulo: 'Bidet', detalle: 'Ferrúm Bari.' },
        { titulo: 'Griferías bidet, vanitory, ducha, bacha cocina', detalle: 'Fv Puelo.' },
        { titulo: 'Vanitory', detalle: 'en MDF.' },
        { titulo: 'Receptáculo de ducha', detalle: '120x70cm con mampara.' },
        { titulo: 'Mesada y Bajo mesada', detalle: 'Mesada en mármol sintético y bajo mesada en MDF.' },
        { titulo: 'Puertas interior', detalle: 'Oblak Practika' }
      ]
    },
    
    faqProducto: [
      {
        pregunta: '¿Cuánto cuesta Alma Loft 28?',
        respuesta: 'Alma Loft 28 cuesta $52.000.000. Incluye diseño tipo loft con entrepiso, doble altura y terminaciones modernas.'
      },
      {
        pregunta: '¿Qué es un loft?',
        respuesta: 'Un loft es un espacio con diseño abierto y doble altura. En Alma Loft 28, la planta baja es un espacio integrado y el entrepiso funciona como dormitorio privado.'
      },
      {
        pregunta: '¿El entrepiso es seguro?',
        respuesta: 'Totalmente seguro. Estructura calculada con barandas de seguridad y escalera firme. Cumple todas las normativas de construcción.'
      },
      {
        pregunta: '¿Se puede usar como oficina-vivienda?',
        respuesta: 'Perfecto para eso. Planta baja como estudio/oficina con doble altura, y entrepiso como dormitorio separado.'
      }
    ]
  },
  {
    id: 'almamod36',
    nombre: 'Alma 36',
    slug: 'alma-36',
    superficie: '36 m²',
    dimensiones: '12m × 3m',
    habitaciones: '2 dormitorios',
    precio: 65600000,
    incluye: [
      'Cocina eléctrica o gas con extractor',
      'Aire acondicionado frío-calor inverter 3000w',
      'Termotanque 55 litros eléctrico o gas',
      'Inodoro con depósito: Ferrúm Bari',
      'Bidet: Ferrúm Bari',
      'Griferías bidet, vanitory, ducha, bacha cocina: Fv Puelo',
      'Vanitory: en MDF',
      'Receptáculo de ducha: 120x70cm con mampara',
      'Mesada en cuarzo o granito y bajo mesada en MDF',
      'Puertas interior: Oblak Practika',
    ],
    plazo: '60 días',
    imagenPortada: 'ALMAMOD_36_PORTADA.webp',
    coloresVariantes: {
      negro: 'ALMAMOD_36_NEGRO.webp',
      gris:  'ALMAMOD_36_REVEAR.webp',
    },
    imagenesDetalle: [
      'ALMAMOD_36_PORTADA.webp',
      'ALMAMOD_36_1.webp',
      'ALMAMOD_36_2.webp',
      'ALMAMOD_36_3.webp',
      'ALMAMOD_36_RENDER_EXT-INT.webp',
      'ALMAMOD_36_PLANIMETRIA.webp'
    ],
    descripcion: 'Casa modular familiar de 36m² con 2 dormitorios. Vivienda completa con living-comedor, cocina y baño. Ideal para familias de 3-4 personas. El modelo más elegido por su relación precio-espacio-funcionalidad.',
    
    casosDeUso: [
      {
        titulo: 'Familia de 3-4 Personas (MÁS POPULAR)',
        descripcion: 'La vivienda modular más vendida. Dos dormitorios, living-comedor espacioso y cocina completa. Perfecta para familias.',
        keywords: ['casa familiar 36m2', 'vivienda 2 dormitorios', 'casa familia 4 personas']
      },
      {
        titulo: 'Primera Vivienda Familiar',
        descripcion: 'Casa completa y funcional para comenzar tu vida familiar. Mejor relación precio-espacio del mercado.',
        keywords: ['primera casa familiar', 'vivienda familiar completa', 'casa dos dormitorios precio']
      },
      {
        titulo: 'Casa Permanente Confortable',
        descripcion: 'Vivienda para uso diario con todo lo necesario. Espacios bien distribuidos para vida cotidiana.',
        keywords: ['vivienda permanente', 'casa habitable familiar', 'vivienda confortable']
      },
      {
        titulo: 'Pareja con Hijos',
        descripcion: 'Dormitorio principal para padres y segundo dormitorio para 1-2 hijos. Distribución inteligente.',
        keywords: ['casa pareja hijos', 'vivienda familia pequeña', 'casa 2 habitaciones']
      }
    ],
    
    ventajas: [
      '✅ MODELO MÁS VENDIDO',
      'Dos dormitorios completos',
      'Living-comedor amplio',
      'Mejor relación precio-espacio',
      'Ideal familias 3-4 personas',
      'Distribución optimizada',
      'Precio: $65.600.000'
    ],
    
    keywordsPrincipales: [
      'casa modular 2 dormitorios',
      'vivienda familiar 36m2',
      'casa completa precio neuquen',
      'vivienda 2 habitaciones',
      'casa modular mas vendida'
    ],
    
    especificacionesTecnicas: {
      construccion: [
        { titulo: 'Patín', detalle: 'Armado con perfil UPN 120mm y caño estructural, pintado con esmalte sintético 3 en 1 color negro.' },
        { titulo: 'Estructura piso', detalle: 'Panel SIP PROPANEL 9cm, pintado en la cara inferior con pintura asfáltica.' },
        { titulo: 'Muros', detalle: 'Panel SIP PROPANEL 9cm.' },
        { titulo: 'Techo', detalle: 'Panel SIP cielorraso PROPANEL 9cm sobre tirantes de pino y terminado en cubierta con chapa trapezoidal negra y zinguerías de cierre de chapa negra.' },
        { titulo: 'Revestimiento de muros exterior', detalle: 'machimbre de 1era calidad protegido contra rayos UV humedad y corrosión o siding horizontal/vertical 6mm, pintado símil madera o látex exterior.' },
        { titulo: 'Revestimiento de muros interior', detalle: 'machimbre de 1era calidad barnizado o placas de yeso con junta tomada y pintura látex lavable.' },
        { titulo: 'Terminación piso interior', detalle: 'Pisos vinílicos SPC de alto tránsito 5.5 mm.' },
        { titulo: 'Terminación interior techo', detalle: 'Panel de cielorraso laqueado color madera o sintético blanco.' },
        { titulo: 'Aberturas', detalle: 'Puerta y ventanas de aluminio negro, con vidrio DVH.' },
        { titulo: 'Revestimientos de baño', detalle: 'placas PVC símil mármol a elección' },
        { titulo: 'Revestimientos de cocina', detalle: 'placas PVC símil mármol a elección' },
        { titulo: 'Instalación eléctrica', detalle: 'Instalación eléctrica con cables normalizados desde 6 mm a 1.5 mm.' },
        { titulo: 'Instalación de agua', detalle: 'Por cañería termofusión.' },
        { titulo: 'Instalación de desagüe', detalle: 'sistema cloacal de cañerías con o-ring.' }
      ],
      equipamiento: [
        { titulo: 'Inodoro con depósito', detalle: 'Ferrúm Bari.' },
        { titulo: 'Bidet', detalle: 'Ferrúm Bari.' },
        { titulo: 'Griferías bidet, vanitory, ducha, bacha cocina', detalle: 'Fv Puelo.' },
        { titulo: 'Vanitory', detalle: 'en MDF.' },
        { titulo: 'Receptáculo de ducha', detalle: '120x70cm con mampara.' },
        { titulo: 'Mesada y Bajo mesada', detalle: 'Mesada en mármol sintético y bajo mesada en MDF.' },
        { titulo: 'Puertas interior', detalle: 'Oblak Practika' }
      ]
    },
    
    faqProducto: [
      {
        pregunta: '¿Cuánto cuesta Alma 36?',
        respuesta: 'Alma 36 cuesta $65.600.000 llave en mano. Es nuestro modelo más vendido por su excelente relación precio-espacio-funcionalidad.'
      },
      {
        pregunta: '¿Alcanza para una familia de 4?',
        respuesta: 'Sí, Alma 36 es perfecta para familias de 3-4 personas. Dos dormitorios completos, living-comedor amplio y cocina equipada.'
      },
      {
        pregunta: '¿Por qué es el más vendido?',
        respuesta: 'Es el equilibrio perfecto: espacio suficiente para familia, precio accesible ($65.6M vs $90M construcción tradicional) y funcionalidad completa.'
      },
      {
        pregunta: '¿Cuánto miden los dormitorios?',
        respuesta: 'Los dos dormitorios tienen buen tamaño, permitiendo cama matrimonial en el principal y cama de plaza y media o dos camas simples en el segundo.'
      },
      {
        pregunta: '¿Se puede ampliar?',
        respuesta: 'Sí, Alma 36 es ampliable. Podés agregar módulos adicionales para más dormitorios o expandir el living.'
      }
    ]
  },
  {
    id: 'almamod36Refugio',
    nombre: 'Alma 36 Refugio',
    slug: 'alma-36-refugio',
    superficie: '36 m²',
    dimensiones: '12m × 3m',
    habitaciones: '2 dormitorios',
    precio: 68350000,
    incluye: [
      'Cocina eléctrica o gas con extractor',
      'Aire acondicionado frío-calor inverter 3000w',
      'Termotanque 55 litros eléctrico o gas',
      'Inodoro con depósito: Ferrúm Bari',
      'Bidet: Ferrúm Bari',
      'Griferías bidet, vanitory, ducha, bacha cocina: Fv Puelo',
      'Vanitory: en MDF',
      'Receptáculo de ducha: 120x70cm con mampara',
      'Mesada en cuarzo o granito y bajo mesada en MDF',
      'Puertas interior: Oblak Practika',
    ],
    plazo: '60 días',
    imagenPortada: 'ALMAMOD_36_REFUGIO_PORTADA.webp',
    coloresVariantes: {
      negro: 'ALMA_36_REFUGIO_NEGRO.webp',
      gris:  'ALMA_36_REFUGIO_GRIS.webp',
    },
    imagenesDetalle: [
      'ALMAMOD_36_REFUGIO_PORTADA.webp',
      'ALMAMOD_36_REFUGIO_PLANIMETRIA_2D.webp',
      'ALMAMOD_36_REFUGIO_PORTADA_dobleext1',
      'ALMAMOD_36_REFUGIO_PORTADA_dobleext2',
      'ALMAMOD_36_REFUGIO_PORTADA_dobleint1',
      'ALMAMOD_36_REFUGIO_PORTADA_dobleint2'
    ],
    video: 'VIDEO_CABAÑERO_HORIZONTAL.mp4',
    descripcion: 'Cabaña estilo patagónico de 36m² con 2 dormitorios y diseño tipo refugio de montaña. Estética rústica-moderna ideal para zonas turísticas, cordillera y bosque. Máxima integración con la naturaleza.',
    
    casosDeUso: [
      {
        titulo: 'Inversión Turística Cordillerana',
        descripcion: 'Cabaña premium para alquiler turístico en Villa La Angostura, Bariloche, San Martín de los Andes. ROI excelente.',
        keywords: ['cabaña turistica patagonica', 'inversion turismo cordillera', 'refugio alquiler']
      },
      {
        titulo: 'Cabaña de Alquiler Airbnb Premium',
        descripcion: 'Diseño único tipo refugio patagónico atrae turistas de alto valor. Tarifas premium por estética diferenciada.',
        keywords: ['cabaña airbnb', 'refugio turistico', 'cabaña premium patagonia']
      },
      {
        titulo: 'Vivienda en Bosque/Montaña',
        descripcion: 'Casa integrada al entorno natural. Perfecta para vivir en cordillera, bosques o zonas de alta montaña.',
        keywords: ['casa bosque', 'vivienda montaña', 'refugio cordillera']
      },
      {
        titulo: 'Casa de Fin de Semana en Naturaleza',
        descripcion: 'Refugio familiar para escapadas en zonas naturales. Diseño que conecta con el paisaje patagónico.',
        keywords: ['casa campo patagonia', 'refugio fin semana', 'cabaña naturaleza']
      }
    ],
    
    ventajas: [
      '✨ DISEÑO EXCLUSIVO PATAGÓNICO',
      'Estética tipo refugio de montaña',
      'Integración perfecta con naturaleza',
      'Ideal para inversión turística premium',
      'Atrae turistas de alto valor',
      'Diseño rústico-moderno único',
      'Precio: $68.350.000'
    ],
    
    keywordsPrincipales: [
      'cabaña patagonica modular',
      'refugio montaña precio',
      'cabaña turistica cordillera',
      'casa estilo patagónico',
      'cabaña diseño rustico moderno'
    ],
    
    especificacionesTecnicas: {
      construccion: [
        { titulo: 'Patín', detalle: 'Armado con perfil UPN 120mm y caño estructural, pintado con esmalte sintético 3 en 1 color negro.' },
        { titulo: 'Estructura piso', detalle: 'Panel SIP PROPANEL 9cm, pintado en la cara inferior con pintura asfáltica.' },
        { titulo: 'Muros', detalle: 'Panel SIP PROPANEL 9cm.' },
        { titulo: 'Techo', detalle: 'Panel SIP cielorraso PROPANEL 9cm sobre tirantes de pino y terminado en cubierta con chapa trapezoidal negra y zinguerías de cierre de chapa negra.' },
        { titulo: 'Revestimiento de muros exterior', detalle: 'machimbre de 1era calidad protegido contra rayos UV humedad y corrosión o siding horizontal/vertical 6mm, pintado símil madera o látex exterior.' },
        { titulo: 'Revestimiento de muros interior', detalle: 'machimbre de 1era calidad barnizado o placas de yeso con junta tomada y pintura látex lavable.' },
        { titulo: 'Terminación piso interior', detalle: 'Pisos vinílicos SPC de alto tránsito 5.5 mm.' },
        { titulo: 'Terminación interior techo', detalle: 'Panel de cielorraso laqueado color madera o sintético blanco.' },
        { titulo: 'Aberturas', detalle: 'Puerta y ventanas de aluminio negro, con vidrio DVH.' },
        { titulo: 'Revestimientos de baño', detalle: 'placas PVC símil mármol a elección' },
        { titulo: 'Revestimientos de cocina', detalle: 'placas PVC símil mármol a elección' },
        { titulo: 'Instalación eléctrica', detalle: 'Instalación eléctrica con cables normalizados desde 6 mm a 1.5 mm.' },
        { titulo: 'Instalación de agua', detalle: 'Por cañería termofusión.' },
        { titulo: 'Instalación de desagüe', detalle: 'sistema cloacal de cañerías con o-ring.' }
      ],
      equipamiento: [
        { titulo: 'Inodoro con depósito', detalle: 'Ferrúm Bari.' },
        { titulo: 'Bidet', detalle: 'Ferrúm Bari.' },
        { titulo: 'Griferías bidet, vanitory, ducha, bacha cocina', detalle: 'Fv Puelo.' },
        { titulo: 'Vanitory', detalle: 'en MDF.' },
        { titulo: 'Receptáculo de ducha', detalle: '120x70cm con mampara.' },
        { titulo: 'Mesada y Bajo mesada', detalle: 'Mesada en mármol sintético y bajo mesada en MDF.' },
        { titulo: 'Puertas interior', detalle: 'Oblak Practika' }
      ]
    },
    
    faqProducto: [
      {
        pregunta: '¿Cuánto cuesta Alma 36 Refugio?',
        respuesta: 'Alma 36 Refugio cuesta $68.350.000. Incluye diseño exclusivo estilo refugio patagónico con terminaciones premium.'
      },
      {
        pregunta: '¿Por qué cuesta más que Alma 36 estándar?',
        respuesta: 'El diseño tipo refugio patagónico incluye terminaciones especiales, estética diferenciada y adaptación al entorno natural. Ideal para inversión turística premium.'
      },
      {
        pregunta: '¿Es buena inversión para alquiler turístico?',
        respuesta: 'Excelente inversión. El diseño único atrae turistas de alto valor dispuestos a pagar tarifas premium. ROI en 3-4 años en zonas cordilleranas.'
      },
      {
        pregunta: '¿Funciona igual que Alma 36?',
        respuesta: 'Sí, misma superficie y distribución (36m², 2 dormitorios). La diferencia es el diseño exterior tipo refugio y terminaciones especiales.'
      },
      {
        pregunta: '¿Dónde se recomienda instalar?',
        respuesta: 'Ideal para Villa La Angostura, San Martín de los Andes, Bariloche, zona cordillera, bosques patagónicos o cualquier entorno natural.'
      }
    ]
  },
  {
    id: 'almatower',
    nombre: 'Alma Tower',
    slug: 'alma-tower',
    superficie: 'Consultar',
    dimensiones: 'Próximamente',
    habitaciones: 'Consultar',
    precio: 0,
    incluye: [],
    plazo: 'Consultar',
    imagenPortada: null,
    imagenesDetalle: [],
    descripcion: 'Nuevo modelo de 3 plantas (planta baja + 2 pisos) en desarrollo. Una propuesta vertical única que maximiza el espacio habitable sin ampliar la huella en el terreno. Próximamente disponible.',
    casosDeUso: [],
    ventajas: [],
    keywordsPrincipales: [],
    especificacionesTecnicas: { construccion: [], equipamiento: [] },
    faqProducto: [],
    proximamente: true,
  },
];

// Función para formatear precio
const formatearPrecio = (precio) => {
  if (precio === 0) return 'Consultar precio';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio);
};

function TiendaAlma() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSpecs, setShowSpecs] = useState(false);

  // Estados para filtros
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([17900000, 68350000]);
  const [surfaceRange, setSurfaceRange] = useState([12, 36]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedUses, setSelectedUses] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [coloresPortada, setColoresPortada] = useState({});
  const [cmsOverrides, setCmsOverrides] = useState({});

  // Carga precios y descripciones editadas desde el CMS (sin bloquear render inicial)
  useEffect(() => {
    fetch('/.netlify/functions/cms-content')
      .then(r => r.json())
      .then(data => {
        const map = {};
        (data.modelos || []).forEach(m => { if (m.slug) map[m.slug] = m; });
        setCmsOverrides(map);
      })
      .catch(() => {});
  }, []);

  const cmsLoaded = Object.keys(cmsOverrides).length > 0;

  const modulosConCms = modulosData
    .filter(m => {
      // Si el CMS está cargado y el modelo está marcado como inactivo, ocultarlo
      if (cmsLoaded && cmsOverrides[m.slug] && cmsOverrides[m.slug].activo === false) return false;
      return true;
    })
    .map(m => {
      const cms = cmsOverrides[m.slug];
      if (!cms) return m;
      return {
        ...m,
        nombre:        cms.nombre        || m.nombre,
        precio:        cms.precio        || m.precio,
        descripcion:   cms.descripcion   || m.descripcion,
        plazo:         cms.plazo         || m.plazo,
        ventajas:      cms.ventajas?.length ? cms.ventajas : m.ventajas,
        imagenPortada: cms.imagen_portada || m.imagenPortada,
        fotos:         cms.fotos?.length        ? cms.fotos          : m.imagenesDetalle,
      fotosPortada:  cms.fotos_portada?.length ? cms.fotos_portada  : null,
      };
    });

  const getImagenPortada = (modulo) => {
    const color = coloresPortada[modulo.id];
    if (!color || color === 'madera' || !modulo.coloresVariantes) return modulo.imagenPortada;
    return modulo.coloresVariantes[color] || modulo.imagenPortada;
  };

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getMediaItems = (modulo) => {
    if (!modulo) return [];
    
    const items = [];
    
    modulo.imagenesDetalle.forEach(imagen => {
      items.push({
        type: 'image',
        url: imagen
      });
    });
    
    if (modulo.video) {
      items.push({
        type: 'video',
        url: modulo.video
      });
    }
    
    return items;
  };

  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/tiendaalma') {
      setIsOpen(true);
      setSelectedModule(null);
    }
    else if (path.startsWith('/tiendaalma/')) {
      const slug = path.replace('/tiendaalma/', '');
      const modulo = modulosConCms.find(m => m.slug === slug);
      if (modulo) {
        setIsOpen(true);
        setSelectedModule(modulo);
        setCurrentImageIndex(0);
      }
    }
    else {
      setIsOpen(false);
      setSelectedModule(null);
    }
  }, [location.pathname]);

  const handleOpenStore = () => {
    navigate('/tiendaalma');
  };

  const handleCloseStore = () => {
    navigate('/');
  };

  const openDetails = (modulo) => {
    navigate(`/tiendaalma/${modulo.slug}`);
  };

  const closeDetails = () => {
    navigate('/tiendaalma');
  };

  // Función para resetear filtros
  const resetFilters = () => {
    setPriceRange([17900000, 68350000]);
    setSurfaceRange([12, 36]);
    setSelectedRooms([]);
    setSelectedUses([]);
    setSearchTerm('');
  };

  // Función para toggle de habitaciones
  const toggleRoom = (room) => {
    setSelectedRooms(prev =>
      prev.includes(room) ? prev.filter(r => r !== room) : [...prev, room]
    );
  };

  // Función para toggle de usos
  const toggleUse = (use) => {
    setSelectedUses(prev =>
      prev.includes(use) ? prev.filter(u => u !== use) : [...prev, use]
    );
  };

  // Extrae superficie numérica (ej: "12 m²" -> 12)
  const getSuperficieNumero = (superficie) => {
    return parseInt(superficie.match(/\d+/)[0]);
  };

  // Filtrado completo con todos los criterios
  const filteredModules = modulosConCms.filter(modulo => {
    // Filtro de búsqueda por texto
    const matchSearch =
      modulo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      modulo.superficie.toLowerCase().includes(searchTerm.toLowerCase()) ||
      modulo.habitaciones.toLowerCase().includes(searchTerm.toLowerCase());

    if (searchTerm && !matchSearch) return false;

    // Los productos PRÓXIMAMENTE siempre se muestran, sin importar filtros
    if (modulo.proximamente) return true;

    // Filtro de precio
    if (modulo.precio < priceRange[0] || modulo.precio > priceRange[1]) return false;

    // Filtro de superficie
    const superficieNum = getSuperficieNumero(modulo.superficie);
    if (superficieNum < surfaceRange[0] || superficieNum > surfaceRange[1]) return false;

    // Filtro de habitaciones
    if (selectedRooms.length > 0) {
      const hasMatch = selectedRooms.some(room => {
        if (room === 'monoambiente') return modulo.habitaciones.toLowerCase().includes('monoambiente');
        if (room === '1dorm') return modulo.habitaciones === '1 dormitorio' || modulo.habitaciones.toLowerCase().includes('loft');
        if (room === '2dorm') return modulo.habitaciones === '2 dormitorios';
        return false;
      });
      if (!hasMatch) return false;
    }

    // Filtro de uso (busca en casosDeUso)
    if (selectedUses.length > 0) {
      const hasMatch = selectedUses.some(use => {
        const keywords = modulo.casosDeUso.flatMap(caso => caso.keywords);
        if (use === 'vivienda') return keywords.some(k => k.includes('primera vivienda') || k.includes('vivienda'));
        if (use === 'oficina') return keywords.some(k => k.includes('oficina') || k.includes('home office'));
        if (use === 'turismo') return keywords.some(k => k.includes('turismo') || k.includes('cabaña') || k.includes('airbnb'));
        if (use === 'familiar') return keywords.some(k => k.includes('familia') || k.includes('pareja'));
        return false;
      });
      if (!hasMatch) return false;
    }

    return true;
  });

  const handleSearchSelect = (modulo) => {
    openDetails(modulo);
  };

  const handleWhatsAppClick = (modulo) => {
    const precioTexto = modulo.precio > 0 ? `Precio: ${formatearPrecio(modulo.precio)}` : '';
    const mensaje = `Hola! Estuve mirando productos en su web y me interesa el *${modulo.nombre}* (${modulo.superficie}, ${modulo.habitaciones}). ${precioTexto} ¿Podrían brindarme más información?`;
    const urlWhatsApp = `https://wa.me/5492994087106?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
  };

  const nextImage = () => {
    if (selectedModule) {
      const mediaItems = getMediaItems(selectedModule);
      setCurrentImageIndex((prev) => (prev + 1) % mediaItems.length);
    }
  };

  const prevImage = () => {
    if (selectedModule) {
      const mediaItems = getMediaItems(selectedModule);
      setCurrentImageIndex((prev) => 
        prev === 0 ? mediaItems.length - 1 : prev - 1
      );
    }
  };

  const openSpecs = () => {
    setShowSpecs(true);
  };

  const closeSpecs = () => {
    setShowSpecs(false);
  };

  return (
    <>
      {/* ✅ SEO OPTIMIZADO PARA CATÁLOGO */}
      {isOpen && !selectedModule && (
        <SEO
          title={PAGES.tiendaalma.title}
          description={PAGES.tiendaalma.description}
          canonical={PAGES.tiendaalma.canonical}
          image={PAGES.tiendaalma.image}
          type={PAGES.tiendaalma.type}
        />
      )}

      {/* ✅ SEO MEJORADO PARA PRODUCTO ESPECÍFICO */}
      {selectedModule && (() => {
        // Mapear slug del módulo a clave de PRODUCTS
        const productKey = selectedModule.slug.replace(/-/g, '');
        const productMeta = PRODUCTS[productKey];

        if (!productMeta) {
          // Fallback si no existe en PRODUCTS
          return (
            <SEO
              title={`${selectedModule.nombre} ${selectedModule.superficie}`}
              description={selectedModule.descripcion}
              canonical={`/tiendaalma/${selectedModule.slug}`}
              image={getCloudinaryUrl(selectedModule.imagenPortada, IMG_DETAIL)}
              type="product"
            />
          );
        }

        // Generar schemas usando helpers
        const productSchema = generateProductSchema(productMeta.productData, productMeta.slug);
        const breadcrumbSchema = generateBreadcrumbSchema([
          { name: 'Inicio', url: '/' },
          { name: 'Tienda Alma', url: '/tiendaalma' },
          { name: selectedModule.nombre, url: `/tiendaalma/${selectedModule.slug}` }
        ]);

        const schemas = [productSchema, breadcrumbSchema];

        return (
          <SEO
            title={productMeta.title}
            description={productMeta.description}
            canonical={productMeta.canonical}
            image={getCloudinaryUrl(selectedModule.imagenPortada, IMG_DETAIL)}
            type="product"
            schemas={schemas}
          />
        );
      })()}

      <motion.button 
        className="floating-button tienda-button"
        onClick={handleOpenStore}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <StoreIcon />
        <span>Tienda Alma</span>
      </motion.button>

      {isOpen && createPortal(
        <AnimatePresence>
          <motion.div 
            className="modal-overlay tienda-overlay"
            onClick={handleCloseStore}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content tienda-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="tienda-header">
                <button onClick={handleCloseStore} className="close-button" style={{ order: -1 }}>&times;</button>
                <h2>Tienda Alma - Nuestros Módulos</h2>
              </div>

              {/* ✅ NUEVO: Texto introductorio con keywords */}
              <div className="tienda-intro" style={{ 
                padding: '20px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '12px',
                margin: '0 20px 20px'
              }}>
                <h3 style={{ marginTop: 0, fontSize: '1.3rem' }}>
                  Viviendas Modulares Llave en Mano desde $17.900.000
                </h3>
                <p style={{ margin: '10px 0', fontSize: '0.95rem' }}>
                  ✅ <strong>Entrega según modelo desde 30 días</strong> •
                  ✅ Construcción modular certificada EDGE • 
                  ✅ Paneles SIP PROPANEL •
                  ✅ Ahorro energético del 40%
                </p>
                <p style={{ margin: '10px 0 0', fontSize: '0.9rem', opacity: 0.95 }}>
                  Desde monoambientes compactos hasta casas familiares de 2 dormitorios. 
                  Todos los modelos son <strong>ampliables</strong> y <strong>transportables</strong>.
                </p>
              </div>

              <div className="search-container">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="filter-toggle-button"
                    style={{
                      background: showFilters ? '#667eea' : '#f1f5f9',
                      color: showFilters ? 'white' : '#1e293b',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                      minWidth: isMobile ? '48px' : 'auto'
                    }}
                    title="Filtros"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="4" y1="21" x2="4" y2="14"></line>
                      <line x1="4" y1="10" x2="4" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12" y2="3"></line>
                      <line x1="20" y1="21" x2="20" y2="16"></line>
                      <line x1="20" y1="12" x2="20" y2="3"></line>
                      <line x1="1" y1="14" x2="7" y2="14"></line>
                      <line x1="9" y1="8" x2="15" y2="8"></line>
                      <line x1="17" y1="16" x2="23" y2="16"></line>
                    </svg>
                    {!isMobile && <span>{showFilters ? 'Ocultar' : 'Filtros'}</span>}
                  </button>

                  <div className="search-wrapper" style={{ flex: 1 }}>
                    <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Buscar por nombre, tamaño o habitaciones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    />
                    {searchTerm && (
                      <button
                        className="clear-search"
                        onClick={() => setSearchTerm('')}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {isSearchFocused && searchTerm && (
                  <div className="search-dropdown">
                    {filteredModules.length > 0 ? (
                      filteredModules.map((modulo) => (
                        <div
                          key={modulo.id}
                          className="search-result-item"
                          onClick={() => handleSearchSelect(modulo)}
                        >
                          <img 
                            src={getCloudinaryUrl(modulo.imagenPortada, IMG_THUMB)} 
                            alt={modulo.nombre}
                            loading="lazy"
                          />
                          <div className="search-result-info">
                            <strong>{modulo.nombre}</strong>
                            <span>{modulo.superficie} • {modulo.habitaciones}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-results">
                        No se encontraron módulos
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ✅ CONTENEDOR CON SIDEBAR + GRID */}
              <div className="tienda-content-container">
                {/* SIDEBAR DE FILTROS */}
                <AnimatePresence>
                  {showFilters && isMobile && (
                    <motion.div
                      className="filter-overlay-mobile"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowFilters(false)}
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1999
                      }}
                    />
                  )}
                  {showFilters && (
                    <motion.div
                      className="filters-sidebar"
                      initial={isMobile ? { y: 500, opacity: 0 } : { x: -300, opacity: 0 }}
                      animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
                      exit={isMobile ? { y: 500, opacity: 0 } : { x: -300, opacity: 0 }}
                      transition={{ type: 'spring', damping: 25 }}
                    >
                      <div className="filters-header">
                        <h3>🔍 Filtros</h3>
                        <button
                          onClick={resetFilters}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#667eea',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          Limpiar todo
                        </button>
                      </div>

                      <div className="filter-section">
                        <label className="filter-label">
                          💰 Precio
                          <span className="filter-value">
                            {formatearPrecio(priceRange[0])} - {formatearPrecio(priceRange[1])}
                          </span>
                        </label>
                        <div className="dual-range-container">
                          <input
                            type="range"
                            min="16500000"
                            max="58400000"
                            step="1000000"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                            className="range-input"
                          />
                          <input
                            type="range"
                            min="16500000"
                            max="58400000"
                            step="1000000"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                            className="range-input"
                          />
                        </div>
                      </div>

                      <div className="filter-section">
                        <label className="filter-label">
                          📐 Superficie
                          <span className="filter-value">
                            {surfaceRange[0]}m² - {surfaceRange[1]}m²
                          </span>
                        </label>
                        <div className="dual-range-container">
                          <input
                            type="range"
                            min="12"
                            max="36"
                            step="1"
                            value={surfaceRange[0]}
                            onChange={(e) => setSurfaceRange([parseInt(e.target.value), surfaceRange[1]])}
                            className="range-input"
                          />
                          <input
                            type="range"
                            min="12"
                            max="36"
                            step="1"
                            value={surfaceRange[1]}
                            onChange={(e) => setSurfaceRange([surfaceRange[0], parseInt(e.target.value)])}
                            className="range-input"
                          />
                        </div>
                      </div>

                      <div className="filter-section">
                        <label className="filter-label">🛏️ Dormitorios</label>
                        <div className="checkbox-group">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={selectedRooms.includes('monoambiente')}
                              onChange={() => toggleRoom('monoambiente')}
                            />
                            <span>Monoambiente</span>
                          </label>
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={selectedRooms.includes('1dorm')}
                              onChange={() => toggleRoom('1dorm')}
                            />
                            <span>1 Dormitorio</span>
                          </label>
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={selectedRooms.includes('2dorm')}
                              onChange={() => toggleRoom('2dorm')}
                            />
                            <span>2 Dormitorios</span>
                          </label>
                        </div>
                      </div>

                      <div className="filter-section">
                        <label className="filter-label">🏷️ Uso</label>
                        <div className="checkbox-group">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={selectedUses.includes('vivienda')}
                              onChange={() => toggleUse('vivienda')}
                            />
                            <span>Primera vivienda</span>
                          </label>
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={selectedUses.includes('oficina')}
                              onChange={() => toggleUse('oficina')}
                            />
                            <span>Oficina</span>
                          </label>
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={selectedUses.includes('turismo')}
                              onChange={() => toggleUse('turismo')}
                            />
                            <span>Turismo</span>
                          </label>
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={selectedUses.includes('familiar')}
                              onChange={() => toggleUse('familiar')}
                            />
                            <span>Familiar</span>
                          </label>
                        </div>
                      </div>

                      <div className="filter-results">
                        {filteredModules.length} {filteredModules.length === 1 ? 'resultado' : 'resultados'}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* GRID DE PRODUCTOS */}
                <div className="tienda-grid" style={{ flex: 1 }}>
                {filteredModules.map((modulo) => (
                  <motion.div
                    key={modulo.id}
                    className="modulo-card"
                    whileHover={{ y: -5 }}
                    style={modulo.proximamente ? { cursor: 'default' } : {}}
                  >
                    {modulo.proximamente ? (
                      <div style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <div className="modulo-image-container">
                          {/* Placeholder image for PRÓXIMAMENTE */}
                          <div style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #1a0a3c 0%, #2d1b69 50%, #1a0a3c 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <span style={{ fontSize: '3rem', opacity: 0.3 }}>🏢</span>
                          </div>
                          {/* Banda diagonal violeta estilo camiseta */}
                          <div style={{
                            position: 'absolute',
                            top: 0, left: 0,
                            width: '100%', height: '100%',
                            overflow: 'hidden',
                            pointerEvents: 'none',
                            zIndex: 2
                          }}>
                            <div style={{
                              position: 'absolute',
                              top: '70%',
                              left: '50%',
                              width: '200%',
                              height: '42px',
                              background: 'linear-gradient(90deg, #6d28d9, #7c3aed, #8b5cf6)',
                              transform: 'translate(-50%, -50%) rotate(-32deg)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '800',
                              fontSize: '0.8rem',
                              letterSpacing: '4px',
                              boxShadow: '0 3px 12px rgba(109,40,217,0.6)',
                              textShadow: '0 1px 3px rgba(0,0,0,0.4)'
                            }}>
                              PRÓXIMAMENTE
                            </div>
                          </div>
                        </div>
                        <div className="modulo-info">
                          <h3>{modulo.nombre}</h3>
                          <div className="modulo-specs">
                          </div>
                          <p className="modulo-description">{modulo.descripcion}</p>
                          <div className="modulo-price" style={{ color: '#a78bfa' }}>
                            Próximamente
                          </div>
                        </div>
                      </div>
                    ) : (
                    <Link to={`/tiendaalma/${modulo.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                      <div className="modulo-image-container">
                        <img
                          key={getImagenPortada(modulo)}
                          src={getCloudinaryUrl(getImagenPortada(modulo), IMG_CARD)}
                          alt={`${modulo.nombre} - ${modulo.superficie} - ${modulo.habitaciones} - Precio ${formatearPrecio(modulo.precio)}`}
                          className="modulo-image modulo-image-fade"
                          loading="lazy"
                        />
                        {/* ✅ Badge especial para Alma 27 (más vendido) */}
                        {modulo.id === 'almamod27' && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: '#10b981',
                            color: 'white',
                            padding: '5px 12px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                          }}>
                            MÁS VENDIDO
                          </div>
                        )}
                      </div>
                      {/* ✅ Color swatches debajo de la imagen */}
                      {modulo.coloresVariantes && (
                        <div
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            background: 'rgba(0,0,0,0.25)',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.06em', fontWeight: '600' }}>REVESTIMIENTO</span>
                          {[
                            { key: 'madera', label: 'Madera',      bg: '#c4956a', border: '#e8b98a' },
                            { key: 'negro',  label: 'Negro',       bg: '#1c1c1c', border: '#555' },
                            { key: 'gris',   label: 'Gris Revear', bg: '#7a8a99', border: '#a0b0be' },
                          ].map(({ key, label, bg, border }) => {
                            const active = (coloresPortada[modulo.id] || 'madera') === key;
                            return (
                              <button
                                key={key}
                                title={label}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setColoresPortada(prev => ({ ...prev, [modulo.id]: key }));
                                }}
                                style={{
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '50%',
                                  background: bg,
                                  border: active ? `3px solid white` : `2px solid ${border}`,
                                  boxShadow: active ? `0 0 0 2px ${bg}, 0 2px 6px rgba(0,0,0,0.4)` : '0 1px 3px rgba(0,0,0,0.3)',
                                  cursor: 'pointer',
                                  padding: 0,
                                  transform: active ? 'scale(1.2)' : 'scale(1)',
                                  transition: 'all 0.15s ease',
                                  flexShrink: 0,
                                }}
                                aria-label={`Ver en ${label}`}
                              />
                            );
                          })}
                        </div>
                      )}
                      <div className="modulo-info">
                        <h3>{modulo.nombre}</h3>
                        <div className="modulo-specs">
                          <span className="spec-badge">{modulo.superficie}</span>
                          <span className="spec-badge">{modulo.habitaciones}</span>
                        </div>
                        <p className="modulo-description">{modulo.descripcion}</p>
                        <div className="modulo-price">
                          {formatearPrecio(modulo.precio)}
                        </div>
                        {/* ✅ Mostrar badge de plazo */}
                        <div style={{
                          marginTop: '8px',
                          fontSize: '0.85rem',
                          color: '#10b981',
                          fontWeight: '600'
                        }}>
                          🚀 Entrega en {modulo.plazo}
                        </div>
                      </div>
                    </Link>
                    )}
                  </motion.div>
                ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.getElementById('modal-portal')
      )}

      {/* ✅ MODAL DE DETALLE DE PRODUCTO OPTIMIZADO CON NUEVAS SECCIONES */}
      {selectedModule && createPortal(
        <AnimatePresence>
          <motion.div
            className="modal-overlay tienda-overlay"
            onClick={closeDetails}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content tienda-detail-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{ maxHeight: '90vh', overflowY: 'auto' }}
            >
              <button onClick={closeDetails} className="close-button">&times;</button>
              
              <div className="detail-content">
                <div className="detail-image-section">
                  <div className="image-carousel">
                    <AnimatePresence mode="wait">
                      {(() => {
                        const mediaItems = getMediaItems(selectedModule);
                        const currentItem = mediaItems[currentImageIndex];
                        
                        if (currentItem.type === 'image') {
                          return (
                            <motion.img 
                              key={`image-${currentImageIndex}`}
                              src={getCloudinaryUrl(currentItem.url, IMG_DETAIL)} 
                              alt={`${selectedModule.nombre} - ${selectedModule.superficie} - Media ${currentImageIndex + 1}`}
                              style={{ objectFit: 'contain' }}
                              initial={{ opacity: 0, x: 100 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -100 }}
                              transition={{ duration: 0.3 }}
                            />
                          );
                        } else {
                          return (
                            <motion.video 
                              key={`video-${currentImageIndex}`}
                              controls 
                              style={{ 
                                width: '100%', 
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                backgroundColor: '#0f172a'
                              }}
                              preload="metadata"
                              initial={{ opacity: 0, x: 100 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -100 }}
                              transition={{ duration: 0.3 }}
                            >
                              <source src={getVideoUrl(currentItem.url, 800)} type="video/mp4" />
                              Tu navegador no soporta el tag de video.
                            </motion.video>
                          );
                        }
                      })()}
                    </AnimatePresence>
                    
                    {getMediaItems(selectedModule).length > 1 && (
                      <>
                        <button className="carousel-button prev" onClick={prevImage}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                          </svg>
                        </button>
                        <button className="carousel-button next" onClick={nextImage}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </button>
                        
                        <div className="carousel-indicators">
                          {getMediaItems(selectedModule).map((item, index) => (
                            <button
                              key={index}
                              className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                              onClick={() => setCurrentImageIndex(index)}
                              title={item.type === 'video' ? '📹 Video' : '🖼️ Imagen'}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="detail-info-section">
                  <h2>{selectedModule.nombre}</h2>
                  <p className="detail-description">{selectedModule.descripcion}</p>
                  
                  <div className="detail-specs">
                    <div className="spec-item">
                      <strong>Precio Llave en Mano:</strong>
                      <span className="spec-price">{formatearPrecio(selectedModule.precio)}</span>
                    </div>
                    <div className="spec-item">
                      <strong>Superficie:</strong>
                      <span>{selectedModule.superficie}</span>
                    </div>
                    <div className="spec-item">
                      <strong>Dimensiones:</strong>
                      <span>{selectedModule.dimensiones}</span>
                    </div>
                    <div className="spec-item">
                      <strong>Distribución:</strong>
                      <span>{selectedModule.habitaciones}</span>
                    </div>
                    <div className="spec-item">
                      <strong>Plazo de entrega:</strong>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>{selectedModule.plazo}</span>
                    </div>
                  </div>

                  <div className="detail-includes">
                    <h3>Incluye:</h3>
                    <ul>
                      {selectedModule.incluye.map((item, index) => (
                        <li key={index}>✓ {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-features">
                    <h3>Características Generales:</h3>
                    <ul>
                      <li>✓ Estructura con Paneles SIP PROPANEL certificados</li>
                      <li>✓ Certificación EDGE Advanced - Ahorro energético 40%</li>
                      <li>✓ Sismo-resistente y preparado para clima patagónico</li>
                      <li>✓ Ampliable con módulos adicionales</li>
                      <li>✓ Transportable a cualquier terreno</li>
                      <li>✓ Construcción en taller - Sin escombros en sitio</li>
                    </ul>
                  </div>

                  <div className="detail-actions">
                    <button 
                      className="contact-button"
                      onClick={() => handleWhatsAppClick(selectedModule)}
                      style={{
                        background: '#25D366',
                        color: 'white',
                        border: 'none',
                        padding: '15px 25px',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flex: 1
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                      </svg>
                      Consultar por WhatsApp
                    </button>
                    <button 
                      className="specs-button"
                      onClick={openSpecs}
                      style={{
                        background: '#f1f5f9',
                        color: '#1e293b',
                        border: 'none',
                        padding: '15px 25px',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flex: 1
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      Especificaciones Técnicas
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.getElementById('modal-portal')
      )}

      {/* MODAL DE ESPECIFICACIONES (sin cambios) */}
      {showSpecs && selectedModule && createPortal(
        <AnimatePresence>
          <motion.div
            className="modal-overlay tienda-overlay"
            onClick={closeSpecs}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 10001 }}
          >
            <motion.div
              className="modal-content specs-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="specs-header">
                <h2>Especificaciones Técnicas - {selectedModule.nombre}</h2>
                <button onClick={closeSpecs} className="close-button">&times;</button>
              </div>

              <div className="specs-content">
                <div className="specs-section">
                  <h3>ESPECIFICACIONES DE CONSTRUCCIÓN</h3>
                  {selectedModule.especificacionesTecnicas.construccion.map((item, index) => (
                    <div 
                      key={index} 
                      className="spec-detail-item"
                    >
                      <strong>{item.titulo}:</strong> {item.detalle}
                    </div>
                  ))}
                </div>

                <div className="specs-section">
                  <h3>EQUIPAMIENTO INCLUIDO</h3>
                  {selectedModule.especificacionesTecnicas.equipamiento.map((item, index) => (
                    <div 
                      key={index} 
                      className="spec-detail-item"
                    >
                      <strong>{item.titulo}:</strong> {item.detalle}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.getElementById('modal-portal')
      )}
    </>
  );
}

export default TiendaAlma;