import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // ========== CONFIGURACIÓN OPTIMIZADA PARA SEO ==========

  build: {
    // Optimizar tamaño de chunks
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['leaflet', 'react-leaflet'],
        }
      }
    },
    // Mejorar performance
    chunkSizeWarningLimit: 600,
    minify: 'esbuild', // Usar esbuild (más rápido y no requiere dependencia adicional)
  },

  // Configuración de servidor para desarrollo
  server: {
    port: 5173,
    strictPort: false,
  },

  // Mejorar resolución de módulos
  resolve: {
    alias: {
      '@': '/src',
    }
  }
})
