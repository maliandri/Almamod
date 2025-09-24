// src/components/SocialButton.jsx
import React from 'react';
import { motion } from 'framer-motion';

// --- Definimos los SVG de cada red social ---
const FacebookIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
);
const InstagramIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const WhatsappIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.38 1.25 4.82l-1.38 5.02 5.14-1.35c1.4.74 3.01 1.18 4.71 1.18h.01c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.92-9.91zm5.22 12.42c-.25.42-.89.79-1.23.83-.34.04-.69.04-1.09-.06-.4-.1-.95-.36-1.81-1.1-1.28-1.1-2.12-2.38-2.22-2.64s-.08-.39.06-.54c.14-.15.31-.39.42-.52.1-.14.2-.25.3-.42.09-.17.04-.31-.02-.42s-.48-1.14-.66-1.56c-.18-.42-.36-.36-.48-.36h-.4c-.13 0-.31.04-.48.25s-.63.61-.79 1.48c-.17.86.13 1.81.25 2.06s.92 1.93 2.29 2.99c1.64 1.24 2.29 1.43 2.64 1.51.57.12 1.02.11 1.41-.02.43-.15.89-.66.89-1.23s0-.57-.02-.62c-.02-.04-.15-.08-.31-.14z"/></svg>
);

function SocialButton({ platform, url, label }) {
  // Función para elegir el ícono correcto
  const getIcon = () => {
    switch (platform) {
      case 'facebook':
        return <FacebookIcon />;
      case 'instagram':
        return <InstagramIcon />;
      case 'whatsapp':
        return <WhatsappIcon />;
      default:
        return null;
    }
  };

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="social-link">
        <motion.button
            className={`floating-button social-button ${platform}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {getIcon()}
            <span>{label}</span>
        </motion.button>
    </a>
  );
}

export default SocialButton;