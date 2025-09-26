const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {  // Cambiado de MONGO_URI a MONGODB_URI
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado exitosamente.');
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;