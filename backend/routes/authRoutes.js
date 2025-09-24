// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator'); // <-- Importa 'check'
const { registerUser, verifyEmail, loginUser } = require('../controllers/authController');

// @ruta   POST /api/auth/register
// @desc   Registrar un nuevo usuario
router.post(
  '/register',
  [ // <-- Array de validaciones
    check('fullName', 'El nombre es obligatorio').not().isEmpty(),
    check('email', 'Por favor, incluye un email válido').isEmail(),
    check('password', 'La contraseña debe tener 6 o más caracteres').isLength({ min: 6 }),
    check('phone', 'El número de teléfono es obligatorio').not().isEmpty(),
    check('docNumber', 'El número de documento es obligatorio').not().isEmpty(),
  ],
  registerUser
);

// ... (el resto de tus rutas)

module.exports = router;