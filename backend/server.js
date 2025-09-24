// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware
app.use(cors()); // Permite peticiones desde tu frontend
app.use(express.json()); // Permite recibir datos en formato JSON

// Rutas de la API
app.get('/', (req, res) => {
  res.send('API de Almamod funcionando!');
});

app.use('/api/auth', require('./routes/authRoutes'));

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));