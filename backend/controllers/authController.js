// backend/controllers/authController.js - VERSIÓN COMPLETA
const { validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// ============================================
// REGISTRO DE USUARIO
// ============================================
exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Errores de validación:', errors.array());
    return res.status(400).json({ 
      msg: 'Error al registrar usuario. Por favor, verifica los datos.',
      errors: errors.array() 
    });
  }

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
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    const existingDoc = await User.findOne({ docNumber });
    if (existingDoc) {
      return res.status(400).json({ msg: 'El número de documento ya está registrado' });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');

    const userData = {
      fullName,
      email: email.toLowerCase(),
      password,
      phone,
      docType,
      docNumber,
      verificationToken
    };

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
      userData.location = {
        type: 'Point',
        coordinates: [-68.0591, -38.9516]
      };
    }

    user = new User(userData);
    await user.save();
    
    console.log('Usuario creado exitosamente:', user.email);
    
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
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
    }

    res.status(201).json({ 
      msg: 'Usuario registrado. Por favor, revisa tu email para verificar la cuenta.' 
    });
  } catch (error) {
    console.error('Error en registro:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        msg: `El ${field} ya está registrado` 
      });
    }
    
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

// ============================================
// VERIFICACIÓN DE EMAIL
// ============================================
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

// ============================================
// LOGIN DE USUARIO
// ============================================
exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email: email.toLowerCase() });
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

// ============================================
// SOLICITAR RECUPERACIÓN DE CONTRASEÑA
// ============================================
exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return res.status(200).json({ 
        msg: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña.' 
      });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Guardar hash del token en la base de datos
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Token expira en 1 hora
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    
    await user.save();

    // URL de reset (frontend)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const message = `
      <h1>Recuperación de Contraseña - Almamod</h1>
      <p>Hola ${user.fullName},</p>
      <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
      <a href="${resetUrl}" clicktracking=off style="display: inline-block; padding: 12px 24px; background-color: #111827; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Restablecer Contraseña</a>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p>${resetUrl}</p>
      <p><strong>Este enlace expirará en 1 hora.</strong></p>
      <p>Si no solicitaste este cambio, ignora este email y tu contraseña permanecerá sin cambios.</p>
      <hr>
      <p style="color: #6b7280; font-size: 0.9rem;">Almamod - Neuquén, Argentina</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Recuperación de Contraseña - Almamod',
        message,
      });

      console.log('✅ Email de recuperación enviado a:', user.email);

      res.status(200).json({ 
        msg: 'Email de recuperación enviado correctamente. Revisa tu bandeja de entrada.' 
      });
    } catch (error) {
      console.error('❌ Error al enviar email de recuperación:', error);
      
      // Limpiar token si falla el envío
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({ 
        msg: 'Error al enviar el email. Por favor, intenta nuevamente más tarde.' 
      });
    }
  } catch (error) {
    console.error('❌ Error en forgot password:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// ============================================
// RESTABLECER CONTRASEÑA
// ============================================
exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token } = req.query;
  const { password } = req.body;

  try {
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        msg: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Hash del token recibido para comparar
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Buscar usuario con token válido y no expirado
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        msg: 'Token inválido o expirado. Solicita un nuevo enlace de recuperación.' 
      });
    }

    // Actualizar contraseña (el pre-save hook la encriptará)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.log('✅ Contraseña restablecida para:', user.email);

    // Enviar email de confirmación
    try {
      await sendEmail({
        email: user.email,
        subject: 'Contraseña Restablecida - Almamod',
        message: `
          <h1>Contraseña Restablecida</h1>
          <p>Hola ${user.fullName},</p>
          <p>Tu contraseña ha sido restablecida exitosamente.</p>
          <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
          <p>Si no realizaste este cambio, contacta con soporte inmediatamente.</p>
          <hr>
          <p style="color: #6b7280; font-size: 0.9rem;">Almamod - Neuquén, Argentina</p>
        `
      });
    } catch (emailError) {
      console.error('Error al enviar email de confirmación:', emailError);
    }

    res.status(200).json({ 
      msg: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.' 
    });
  } catch (error) {
    console.error('❌ Error en reset password:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};