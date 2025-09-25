// src/components/ServiciosCarousel.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ServiciosCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Array de servicios actualizado con la nueva información investigada
  const servicios = [
    {
      id: 1,
      titulo: "Estructura con Paneles SIP",
      descripcion: "Construimos con Paneles SIP (Panel Estructural Aislado), un sistema de alta ingeniería que une placas de OSB a un núcleo de espuma rígida. El resultado es una estructura monolítica de resistencia superior y una eficiencia térmica inigualable, reduciendo tus costos de calefacción y refrigeración de por vida.",
      icon: "🧱",
      color: "from-gray-500 to-slate-600",
      features: ["Eficiencia Energética Superior", "Aislación Acústica", "Resistencia Estructural", "Construcción Eco-Sustentable"],
    },
    {
      id: 2,
      titulo: "Diseño y Revestimiento Exterior",
      descripcion: "Protegemos tu inversión con revestimientos exteriores de última generación que garantizan durabilidad frente al clima patagónico. Elige entre una amplia gama de acabados como chapa, siding o EIFS para lograr una estética moderna y de mínimo mantenimiento, 100% personalizada a tu gusto.",
      icon: "🏡",
      color: "from-amber-500 to-orange-600",
      features: ["Alta Durabilidad", "Mínimo Mantenimiento", "Estética Personalizable", "Protección Climática"],
    },
    {
      id: 3,
      titulo: "Construcción Modular Inteligente",
      descripcion: "Nuestro sistema modular permite una flexibilidad de diseño total. Adaptamos los espacios a tus necesidades, ya sea una vivienda, oficina o local. La fabricación en taller y el rápido montaje en sitio reducen drásticamente los tiempos de obra y aseguran un control de calidad superior.",
      icon: "⚙️",
      color: "from-blue-500 to-indigo-600",
      features: ["Rapidez de Montaje", "Diseño 100% Flexible", "Control de Calidad Superior", "Potencial de Ampliación"],
    },
    {
      id: 4,
      titulo: "Hecho en Neuquén: Adaptación Regional",
      descripcion: "Conocemos el clima y la geografía de la Patagonia. Cada proyecto está pensado y fabricado en Neuquén para resistir vientos fuertes, variaciones térmicas y nevadas. Al elegirnos, apoyas la industria local y garantizas una logística más rápida y eficiente para tu obra.",
      icon: "🏔️",
      color: "from-sky-400 to-cyan-500",
      features: ["Adaptado al Clima Patagónico", "Apoyo a la Economía Local", "Logística Eficiente", "Materiales Regionales"],
    },
    {
      id: 5,
      titulo: "Interiores a Medida",
      descripcion: "Creamos espacios interiores que reflejan tu estilo de vida o identidad de marca. Nos encargamos de todo: desde la distribución de ambientes hasta la selección de pisos, griferías, amoblamientos de cocina y placares, entregando un producto final listo para habitar.",
      icon: "🛋️",
      color: "from-lime-500 to-green-600",
      features: ["Diseño de Interiores", "Amoblamientos Incluidos", "Terminaciones de Calidad", "Proyectos 'Llave en Mano'"],
    },
    {
      id: 6,
      titulo: "Fundaciones y Obras Civiles",
      descripcion: "Ofrecemos una solución integral que incluye el diseño y construcción de las fundaciones. Realizamos plateas de hormigón armado y sistemas de pilotes adaptados a cada tipo de suelo, garantizando una base sólida y duradera para tu proyecto modular.",
      icon: "🏗️",
      color: "from-stone-500 to-neutral-600",
      features: ["Estudio de Suelos", "Plateas de Hormigón", "Sistemas de Pilotes", "Solución Integral"],
    }
  ];

  // El resto de la lógica del carrusel (no necesita cambios)
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === servicios.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, servicios.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };
  
  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? servicios.length - 1 : currentIndex - 1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === servicios.length - 1 ? 0 : currentIndex + 1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentService = servicios[currentIndex];

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
    if (newDirection === 1) {
      goToNext();
    } else {
      goToPrevious();
    }
  };

  return (
    <motion.section
      id="servicios"
      className="p-8 md:p-12 rounded-3xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl border border-gray-200 dark:border-gray-700 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">
          Nuestras Soluciones Modulares
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Tecnología y diseño para tu próximo espacio
        </p>
      </div>
      
      {/* El resto del JSX del carrusel (no necesita cambios) */}
      <div className="relative h-96 md:h-80 mb-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0"
          >
            {/* ... (resto del JSX interno del slide) ... */}
          </motion.div>
        </AnimatePresence>
        
        {/* ... (botones de navegación y dots) ... */}
      </div>
      
      {/* ... (miniaturas de servicios) ... */}
    </motion.section>
  );
}

export default ServiciosCarousel;z