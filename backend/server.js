require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Conectar a la base de datos
connectDB();

const app = express();

// ===================================
// CONFIGURACIÓN DE CORS UNIFICADA
// ===================================

const allowedOrigins = [
  'https://almamod.netlify.app',
  'https://almamod.com.ar',
  'https://www.almamod.com.ar',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (como Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `El origen ${origin} no está permitido por CORS`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-auth-token',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  optionsSuccessStatus: 200
}));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));

// Middleware de logging (útil para debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

// ===================================
// RUTAS
// ===================================

app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Almamod funcionando correctamente',
    version: '1.0.0',
    cors: 'enabled',
    allowedOrigins: allowedOrigins,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Rutas de autenticación
app.use('/api/auth', require('./routes/authRoutes'));

// ===================================
// MANEJO DE ERRORES
// ===================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Error de CORS
  if (err.message.includes('CORS')) {
    return res.status(403).json({ 
      error: 'CORS Error',
      message: err.message 
    });
  }
  
  // Otros errores
  res.status(err.status || 500).json({ 
    error: 'Error del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// ===================================
// INICIAR SERVIDOR
// ===================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📅 ${new Date().toISOString()}`);
  console.log('🌐 CORS habilitado para:');
  allowedOrigins.forEach(origin => console.log(`   - ${origin}`));
  console.log('=================================');
});