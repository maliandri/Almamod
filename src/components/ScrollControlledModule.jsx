import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './ScrollControlledModule.css';

function ScrollControlledModule() {
  const targetRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'end end'],
  });

  const scale = useTransform(scrollYProgress, [0.1, 0.8], [0.6, 1.2]);
  const opacity = useTransform(scrollYProgress, [0.1, 0.6], [0.2, 1]);
  const x = useTransform(scrollYProgress, [0.1, 1], ['-50%', '0%']);

  return (
    <section ref={targetRef} className="animation-container">
      <div className="sticky-container">
        <motion.div
          className="module"
          style={{
            scale,
            opacity,
            x,
          }}
        >
          <p>Módulo Habitable</p>
          <span>Escalable y a tu medida</span>
        </motion.div>
      </div>
    </section>
  );
}

export default ScrollControlledModule;