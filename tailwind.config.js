/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Habilita el modo oscuro con la clase 'dark'
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Colores personalizados de marca
        brand: {
          gold: '#d4a574',
          'gold-dark': '#b88a5f',
          'gold-light': '#e5c09d',
        },
        // Tema claro
        light: {
          bg: {
            primary: '#ffffff',
            secondary: '#f9fafb',
            tertiary: '#f3f4f6',
          },
          text: {
            primary: '#111827',
            secondary: '#4b5563',
            tertiary: '#6b7280',
          },
        },
        // Tema oscuro
        dark: {
          bg: {
            primary: '#0f172a',
            secondary: '#1e293b',
            tertiary: '#334155',
          },
          text: {
            primary: '#f1f5f9',
            secondary: '#cbd5e1',
            tertiary: '#94a3b8',
          },
        },
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #d4a574, #b88a5f)',
        'gradient-dark': 'linear-gradient(135deg, #1a1a2e, #16213e)',
        'gradient-purple': 'linear-gradient(135deg, #667eea, #764ba2)',
      },
      boxShadow: {
        'theme': '0 4px 6px var(--shadow)',
        'theme-lg': '0 10px 15px var(--shadow-lg)',
        'gold': '0 10px 20px rgba(212, 165, 116, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.3s ease',
        'fade-in-up': 'fadeInUp 0.6s ease',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionProperty: {
        'theme': 'background-color, color, border-color, box-shadow',
      },
    },
  },
  plugins: [],
}