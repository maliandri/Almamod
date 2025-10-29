import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Cargar el tema guardado al iniciar
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Función para cambiar el tema
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Evitar flash de contenido sin estilo
  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-button"
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        border: '1px solid var(--border-color, #e5e7eb)',
        backgroundColor: 'var(--bg-secondary, #f9fafb)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      aria-label={darkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={darkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      {darkMode ? (
        <Moon 
          size={24} 
          color="#fbbf24"
          style={{ transition: 'all 0.3s ease' }}
        />
      ) : (
        <Sun 
          size={24} 
          color="#f59e0b"
          style={{ transition: 'all 0.3s ease' }}
        />
      )}
    </button>
  );
}

export default ThemeToggle;