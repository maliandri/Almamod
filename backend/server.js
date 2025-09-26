require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware CORS específico
app.use(cors({
  origin: [
    'https://almamod.netlify.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());

// Rutas
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Almamod funcionando!',
    status: 'active'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/authRoutes'));

// Manejo de errores
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});