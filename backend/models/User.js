// backend/models/User.js - VERSIÓN COMPLETA
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // --- Campos Originales ---
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },

  // --- Campos para Recuperación de Contraseña ---
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },

  // --- Campos Adicionales del Registro ---
  fullName: { type: String, required: true }, // Nombre y Apellido o Razón Social
  phone: { type: String, required: true },
  docType: { type: String, enum: ['DNI', 'CUIT'], required: true },
  docNumber: { type: String, required: true, unique: true }, // Agregado unique para evitar duplicados
  birthDate: { type: Date }, // Opcional, puede no aplicar a empresas
  
  address: {
    street: { type: String },
    city: { type: String },
    department: { type: String },
    province: { type: String, default: 'Neuquén' }
  },
  
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitud, latitud]
      default: [-68.0591, -38.9516] // Coordenadas de Neuquén Capital por defecto
    }
  }

}, { timestamps: true });

// Antes de guardar, encriptamos la contraseña
UserSchema.pre('save', async function (next) {
  // Solo encriptar si la contraseña fue modificada (o es nueva)
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Índice para búsquedas geoespaciales
UserSchema.index({ location: '2dsphere' });

// Índice compuesto para búsquedas por email (mejora performance)
UserSchema.index({ email: 1 });

// Índice para búsquedas por documento
UserSchema.index({ docNumber: 1 });

module.exports = mongoose.model('User', UserSchema);