require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware CORS corregido y mejorado
app.use(cors({
  origin: [
    'https://almamod.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173'  // Para Vite en desarrollo
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Middleware adicional para headers CORS (por si acaso)
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://almamod.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send();
    return;
  }
  
  next();
});

app.use(express.json());

// Rutas
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Almamod funcionando!',
    status: 'active',
    cors: 'configured'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

app.use('/api/auth', require('./routes/authRoutes'));

// Manejo de errores
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log('CORS configurado para:', [
    'https://almamod.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ]);
});