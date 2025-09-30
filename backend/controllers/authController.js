// controllers/authController.js - VERSIÓN MEJORADA
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
    console.log('Errores de validación:', errors.array());
    return res.status(400).json({ 
      msg: 'Error al registrar usuario. Por favor, verifica los datos.',
      errors: errors.array() 
    });
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

  // 3. Log para debugging
  console.log('Datos recibidos en backend:', {
    fullName,
    email,
    phone,
    docType,
    docNumber,
    birthDate: birthDate || 'No proporcionado',
    address: address || 'No proporcionado',
    location: location || 'No proporcionado'
  });

  try {
    // 4. Verificar si el usuario ya existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    // 5. Verificar si el documento ya existe
    const existingDoc = await User.findOne({ docNumber });
    if (existingDoc) {
      return res.status(400).json({ msg: 'El número de documento ya está registrado' });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');

    // 6. Preparar los datos del usuario con valores por defecto
    const userData = {
      fullName,
      email,
      password,
      phone,
      docType,
      docNumber,
      verificationToken
    };

    // 7. Agregar campos opcionales solo si existen
    if (birthDate) {
      userData.birthDate = birthDate;
    }

    if (address && typeof address === 'object') {
      userData.address = {
        street: address.street || '',
        city: address.city || 'Neuquén',
        department: address.department || 'Confluencia',
        province: address.province || 'Neuquén'
      };
    }

    if (location && location.coordinates && Array.isArray(location.coordinates)) {
      userData.location = {
        type: 'Point',
        coordinates: location.coordinates
      };
    } else {
      // Coordenadas por defecto de Neuquén Capital
      userData.location = {
        type: 'Point',
        coordinates: [-68.0591, -38.9516]
      };
    }

    // 8. Crear la nueva instancia de usuario
    user = new User(userData);

    await user.save();
    
    console.log('Usuario creado exitosamente:', user.email);
    
    // 9. Enviar email de verificación
    const verifyUrl = `https://almamod.netlify.app/verify-email?token=${verificationToken}`;
    const message = `
      <h1>Verificación de Email para Almamod</h1>
      <p>Gracias por registrarte, ${user.fullName}. Por favor, haz clic en el siguiente enlace para verificar tu cuenta:</p>
      <a href="${verifyUrl}" clicktracking=off>${verifyUrl}</a>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Verifica tu cuenta de Almamod',
        message,
      });
      console.log('Email de verificación enviado a:', user.email);
    } catch (emailError) {
      console.error('Error al enviar email:', emailError);
      // No fallamos el registro si falla el email
    }

    res.status(201).json({ 
      msg: 'Usuario registrado. Por favor, revisa tu email para verificar la cuenta.' 
    });
  } catch (error) {
    console.error('Error en registro:', error);
    
    // Manejo específico de errores de MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        msg: `El ${field} ya está registrado` 
      });
    }
    
    // Error de validación de Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        msg: 'Error de validación',
        errors: messages 
      });
    }
    
    res.status(500).json({ 
      msg: 'Error en el servidor al registrar usuario' 
    });
  }
};

// --- VERIFICACIÓN DE EMAIL ---
exports.verifyEmail = async (req, res) => {
    const { token } = req.query;
    
    console.log('Intentando verificar token:', token);
    
    try {
        const user = await User.findOne({ verificationToken: token });
        
        if (!user) {
            console.log('Token no encontrado o inválido');
            return res.status(400).json({ 
              msg: 'Token de verificación inválido o expirado.' 
            });
        }
        
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        
        console.log('Usuario verificado:', user.email);
        
        // Enviar email de bienvenida
        try {
          await sendEmail({
              email: user.email,
              subject: '¡Bienvenido a Almamod!',
              message: `<h1>¡Hola ${user.fullName}!</h1><p>Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión y explorar nuestras soluciones.</p>`
          });
        } catch (emailError) {
          console.error('Error al enviar email de bienvenida:', emailError);
        }

        res.status(200).json({ 
          msg: 'Email verificado correctamente. ¡Bienvenido!' 
        });
    } catch (error) {
        console.error('Error en verificación:', error);
        res.status(500).json({ 
          msg: 'Error en el servidor al verificar email' 
        });
    }
};

// --- LOGIN DE USUARIO ---
exports.loginUser = async (req, res) => {
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
      return res.status(401).json({ 
        msg: 'Por favor, verifica tu email antes de iniciar sesión.' 
      });
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
        if (err) {
          console.error('Error generando token:', err);
          return res.status(500).json({ msg: 'Error al generar token' });
        }
        
        console.log('Login exitoso:', user.email);
        
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
    console.error('Error en login:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};