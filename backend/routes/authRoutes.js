// backend/routes/authRoutes.js - VERSIÓN COMPLETA
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  registerUser, 
  verifyEmail, 
  loginUser, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/authController');

// @ruta   POST /api/auth/register
// @desc   Registrar un nuevo usuario
router.post(
  '/register',
  [
    check('fullName', 'El nombre es obligatorio').not().isEmpty(),
    check('email', 'Por favor, incluye un email válido').isEmail(),
    check('password', 'La contraseña debe tener 6 o más caracteres').isLength({ min: 6 }),
    check('phone', 'El número de teléfono es obligatorio').not().isEmpty(),
    check('docType', 'El tipo de documento es obligatorio').isIn(['DNI', 'CUIT']),
    check('docNumber', 'El número de documento es obligatorio').not().isEmpty(),
    // Validaciones opcionales para dirección
    check('address.street', 'La calle es opcional').optional(),
    check('address.city', 'La ciudad es opcional').optional(),
    check('address.department', 'El departamento es opcional').optional(),
    check('address.province', 'La provincia es opcional').optional(),
    // Validaciones para location
    check('location.type', 'El tipo de location debe ser Point').optional().equals('Point'),
    check('location.coordinates', 'Las coordenadas deben ser un array').optional().isArray(),
    check('location.coordinates.*', 'Las coordenadas deben ser números').optional().isFloat(),
    // Validación opcional para fecha de nacimiento
    check('birthDate', 'La fecha de nacimiento debe ser válida').optional().isISO8601(),
  ],
  registerUser
);

// @ruta   GET /api/auth/verify-email
// @desc   Verificar email
router.get('/verify-email', verifyEmail);

// @ruta   POST /api/auth/login
// @desc   Login de usuario
router.post(
  '/login',
  [
    check('email', 'Por favor, incluye un email válido').isEmail(),
    check('password', 'La contraseña es obligatoria').exists(),
  ],
  loginUser
);

// @ruta   POST /api/auth/forgot-password
// @desc   Solicitar recuperación de contraseña
router.post(
  '/forgot-password',
  [
    check('email', 'Por favor, incluye un email válido').isEmail()
  ],
  forgotPassword
);

// @ruta   POST /api/auth/reset-password
// @desc   Restablecer contraseña con token
router.post(
  '/reset-password',
  [
    check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 })
  ],
  resetPassword
);

module.exports = router;