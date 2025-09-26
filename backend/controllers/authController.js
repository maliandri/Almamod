// controllers/authController.js
const { validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// --- REGISTRO DE USUARIO ---
exports.registerUser = async (req, res) => {
  // 1. Validar los datos de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // 2. Extraer todos los datos del body
  const {
    fullName,
    email,
    password,
    phone,
    docType,
    docNumber,
    birthDate,
    address,
    location
  } = req.body;

  try {
    // 3. Verificar si el usuario ya existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');

    // 4. Crear la nueva instancia de usuario con todos los datos
    user = new User({
      fullName,
      email,
      password,
      phone,
      docType,
      docNumber,
      birthDate,
      address,
      location,
      verificationToken
    });

    await user.save();
    
    // 5. Enviar email de verificación - URL ACTUALIZADA para producción
    const verifyUrl = `https://almamod.netlify.app/verify-email?token=${verificationToken}`;
    const message = `
      <h1>Verificación de Email para Almamod</h1>
      <p>Gracias por registrarte, ${user.fullName}. Por favor, haz clic en el siguiente enlace para verificar tu cuenta:</p>
      <a href="${verifyUrl}" clicktracking=off>${verifyUrl}</a>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Verifica tu cuenta de Almamod',
      message,
    });

    res.status(201).json({ msg: 'Usuario registrado. Por favor, revisa tu email para verificar la cuenta.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

// --- VERIFICACIÓN DE EMAIL ---
exports.verifyEmail = async (req, res) => {
    const { token } = req.query;
    try {
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ msg: 'Token de verificación inválido o expirado.' });
        }
        
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        
        // Enviar email de bienvenida
        await sendEmail({
            email: user.email,
            subject: '¡Bienvenido a Almamod!',
            message: `<h1>¡Hola ${user.fullName}!</h1><p>Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión y explorar nuestras soluciones.</p>`
        });

        res.status(200).json({ msg: 'Email verificado correctamente. ¡Bienvenido!' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
};

// --- LOGIN DE USUARIO ---
exports.loginUser = async (req, res) => {
  // 1. Validar los datos de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ msg: 'Por favor, verifica tu email antes de iniciar sesión.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const payload = { user: { id: user.id } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        // Enviamos el token y algunos datos del usuario al frontend
        res.json({
          token,
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email
          }
        });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};