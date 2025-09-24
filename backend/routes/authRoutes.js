// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, verifyEmail, loginUser } = require('../controllers/authController');

// @ruta   POST /api/auth/register
// @desc   Registrar un nuevo usuario
router.post('/register', registerUser);

// @ruta   GET /api/auth/verify-email
// @desc   Verificar el email del usuario con un token
router.get('/verify-email', verifyEmail);

// @ruta   POST /api/auth/login
// @desc   Iniciar sesión y obtener un token
router.post('/login', loginUser);

module.exports = router;