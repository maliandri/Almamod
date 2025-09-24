const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // --- Campos Originales ---
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },

  // --- Campos Adicionales del Registro ---
  fullName: { type: String, required: true }, // Nombre y Apellido o Razón Social
  phone: { type: String, required: true },
  docType: { type: String, enum: ['DNI', 'CUIT'], required: true },
  docNumber: { type: String, required: true },
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
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Índice para búsquedas geoespaciales
UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);